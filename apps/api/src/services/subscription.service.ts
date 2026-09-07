import { queryHasuraAdmin } from '../lib/hasuraClient';

export class SubscriptionError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 402) {
    super(message);
    this.name = 'SubscriptionError';
    this.statusCode = statusCode;
  }
}

export class SubscriptionExpiredError extends SubscriptionError {
  constructor(message = 'Organization subscription has expired. Please renew your plan.') {
    super(message, 402);
    this.name = 'SubscriptionExpiredError';
  }
}

export class InsufficientCallSecondsError extends SubscriptionError {
  constructor(message = 'No remaining call seconds available in subscription. Please top up or upgrade plan.') {
    super(message, 402);
    this.name = 'InsufficientCallSecondsError';
  }
}

export interface OrganizationSubscriptionType {
  id: string;
  organization_id: string;
  package_id: string | null;
  allocated_seconds: number;
  remaining_seconds: number;
  status: string;
  start_date: string;
  end_date: string;
  package?: {
    name: string;
  };
}

const GET_ACTIVE_SUBSCRIPTION_QUERY = `
  query GetActiveSubscription($organizationId: uuid!) {
    organization_subscriptions(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      organization_id
      package_id
      allocated_seconds
      remaining_seconds
      status
      start_date
      end_date
      package {
        name
      }
    }
  }
`;

const UPDATE_SUBSCRIPTION_STATUS_MUTATION = `
  mutation UpdateSubscriptionStatus($id: uuid!, $status: String!, $remainingSeconds: Int) {
    update_organization_subscriptions_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status, remaining_seconds: $remainingSeconds, updated_at: "now()" }
    ) {
      id
      remaining_seconds
      status
    }
  }
`;

const DEDUCT_USAGE_LOG_MUTATION = `
  mutation DeductSubscriptionUsage(
    $subscriptionId: uuid!
    $organizationId: uuid!
    $callLogId: uuid
    $secondsDeducted: Int!
    $balanceAfter: Int!
    $description: String
  ) {
    insert_subscription_usage_logs_one(
      object: {
        organization_subscription_id: $subscriptionId
        organization_id: $organizationId
        call_log_id: $callLogId
        seconds_deducted: $secondsDeducted
        balance_after: $balanceAfter
        description: $description
      }
    ) {
      id
      seconds_deducted
      balance_after
    }
  }
`;

const PROVISION_INITIAL_TRIAL_MUTATION = `
  mutation ProvisionInitialTrialSubscription($organizationId: uuid!, $endDate: timestamptz!) {
    insert_organization_subscriptions_one(
      object: {
        organization_id: $organizationId
        package_id: "11111111-1111-1111-1111-111111111111"
        allocated_seconds: 6000
        remaining_seconds: 6000
        status: "active"
        start_date: "now()"
        end_date: $endDate
      }
    ) {
      id
      organization_id
      package_id
      allocated_seconds
      remaining_seconds
      status
      start_date
      end_date
      package {
        name
      }
    }
  }
`;

export async function getOrganizationActiveSubscription(
  organizationId: string,
): Promise<OrganizationSubscriptionType> {
  const data = await queryHasuraAdmin<{
    organization_subscriptions: OrganizationSubscriptionType[];
  }>(GET_ACTIVE_SUBSCRIPTION_QUERY, { organizationId });

  let sub = data?.organization_subscriptions?.[0];

  // If no subscription exists for this organization, auto-provision initial free trial (6,000s = 100 mins)
  if (!sub) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const provisionResult = await queryHasuraAdmin<{
      insert_organization_subscriptions_one: OrganizationSubscriptionType;
    }>(PROVISION_INITIAL_TRIAL_MUTATION, {
      organizationId,
      endDate: trialEndDate.toISOString(),
    });
    sub = provisionResult?.insert_organization_subscriptions_one;
  }

  if (!sub) {
    throw new SubscriptionError('Failed to retrieve organization subscription');
  }

  // Check Expiry Date
  const now = new Date().getTime();
  const endDateMs = new Date(sub.end_date).getTime();

  if (endDateMs < now && sub.status === 'active') {
    // Mark as expired in DB
    await queryHasuraAdmin(UPDATE_SUBSCRIPTION_STATUS_MUTATION, {
      id: sub.id,
      status: 'expired',
      remainingSeconds: sub.remaining_seconds,
    });
    sub.status = 'expired';
  }

  // Check if balance empty
  if (sub.remaining_seconds <= 0 && sub.status === 'active') {
    await queryHasuraAdmin(UPDATE_SUBSCRIPTION_STATUS_MUTATION, {
      id: sub.id,
      status: 'exhausted',
      remainingSeconds: 0,
    });
    sub.status = 'exhausted';
  }

  return sub;
}

export async function checkSubscriptionPreflightGuard(
  organizationId: string,
): Promise<OrganizationSubscriptionType> {
  const sub = await getOrganizationActiveSubscription(organizationId);

  if (sub.status === 'expired') {
    throw new SubscriptionExpiredError(
      `Organization subscription expired on ${new Date(sub.end_date).toLocaleDateString()}. Please renew your plan to continue placing calls.`,
    );
  }

  if (sub.status === 'exhausted' || sub.remaining_seconds <= 0) {
    throw new InsufficientCallSecondsError(
      'Insufficient call seconds remaining in organization subscription (0s remaining). Please upgrade or top up your subscription package.',
    );
  }

  return sub;
}

export async function deductCallDurationFromSubscription(
  organizationId: string,
  callLogId: string | null,
  durationSeconds: number,
  description?: string,
): Promise<{ remainingSeconds: number; secondsDeducted: number }> {
  if (!durationSeconds || durationSeconds <= 0) {
    const sub = await getOrganizationActiveSubscription(organizationId);
    return { remainingSeconds: sub.remaining_seconds, secondsDeducted: 0 };
  }

  const sub = await getOrganizationActiveSubscription(organizationId);
  const secondsDeducted = Math.min(sub.remaining_seconds, durationSeconds);
  const newRemaining = Math.max(0, sub.remaining_seconds - secondsDeducted);
  const newStatus = newRemaining <= 0 ? 'exhausted' : sub.status === 'expired' ? 'expired' : 'active';

  await queryHasuraAdmin(UPDATE_SUBSCRIPTION_STATUS_MUTATION, {
    id: sub.id,
    status: newStatus,
    remainingSeconds: newRemaining,
  });

  try {
    await queryHasuraAdmin(DEDUCT_USAGE_LOG_MUTATION, {
      subscriptionId: sub.id,
      organizationId,
      callLogId,
      secondsDeducted,
      balanceAfter: newRemaining,
      description: description || `Call duration consumed ${secondsDeducted}s`,
    });
  } catch (err) {
    console.error('[subscription] Failed to log usage audit:', err);
  }

  return { remainingSeconds: newRemaining, secondsDeducted };
}
