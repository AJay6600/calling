import { Router } from 'express';
import type { OrgScopedRequestType } from '../middleware/ensure-organization.middleware';
import { queryHasuraAdmin } from '../lib/hasuraClient';
import { getOrganizationActiveSubscription } from '../services/subscription.service';

export const subscriptionsRouter = Router();

// GET /api/subscriptions/active - Current Organization Subscription & Usage
subscriptionsRouter.get('/active', async (req: OrgScopedRequestType, res) => {
  const organizationId = req.organization?.id;
  if (!organizationId) {
    res.status(400).json({ message: 'Organization context missing' });
    return;
  }

  try {
    const activeSub = await getOrganizationActiveSubscription(organizationId);

    // Check if free trial has been claimed before (or if organization has any free/trial subscription)
    const trialCheckData = await queryHasuraAdmin<{
      organization_subscriptions_aggregate: {
        aggregate: {
          count: number;
        };
      };
    }>(
      `
      query CheckFreeTrialClaimed($organizationId: uuid!) {
        organization_subscriptions_aggregate(
          where: {
            organization_id: { _eq: $organizationId }
            _or: [
              { package_id: { _eq: "11111111-1111-1111-1111-111111111111" } },
              { package: { price_usd: { _eq: 0 } } },
              { allocated_seconds: { _lte: 6000 } }
            ]
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
      { organizationId },
    );

    const hasClaimedFreeTrial =
      (trialCheckData?.organization_subscriptions_aggregate?.aggregate?.count ?? 0) > 0 ||
      (activeSub && (activeSub.allocated_seconds <= 6000 || !activeSub.package_id));

    // Get usage logs history
    const usageLogsData = await queryHasuraAdmin<{
      subscription_usage_logs: Array<{
        id: string;
        seconds_deducted: number;
        balance_after: number;
        description: string;
        created_at: string;
      }>;
    }>(
      `
      query GetSubscriptionUsageLogs($organizationId: uuid!) {
        subscription_usage_logs(
          where: { organization_id: { _eq: $organizationId } }
          order_by: { created_at: desc }
          limit: 10
        ) {
          id
          seconds_deducted
          balance_after
          description
          created_at
        }
      }
    `,
      { organizationId },
    );

    res.json({
      subscription: activeSub,
      hasClaimedFreeTrial,
      usageLogs: usageLogsData?.subscription_usage_logs || [],
    });
  } catch (err: any) {
    console.error('[subscriptions] Failed to fetch active subscription:', err);
    res.status(500).json({ message: err?.message || 'Failed to fetch active subscription' });
  }
});

// GET /api/subscriptions/packages - List Available Subscription Packages
subscriptionsRouter.get('/packages', async (_req, res) => {
  try {
    const packagesData = await queryHasuraAdmin<{
      subscription_packages: Array<{
        id: string;
        name: string;
        description: string;
        allocated_seconds: number;
        price_usd: number;
        validity_days: number;
        is_active: boolean;
      }>;
    }>(`
      query GetSubscriptionPackages {
        subscription_packages(
          where: { is_active: { _eq: true } }
          order_by: { price_usd: asc }
        ) {
          id
          name
          description
          allocated_seconds
          price_usd
          validity_days
          is_active
        }
      }
    `);

    res.json({ packages: packagesData?.subscription_packages || [] });
  } catch (err: any) {
    console.error('[subscriptions] Failed to fetch packages:', err);
    res.status(500).json({ message: err?.message || 'Failed to fetch packages' });
  }
});

// POST /api/subscriptions/subscribe - Upgrade or Select Package
subscriptionsRouter.post('/subscribe', async (req: OrgScopedRequestType, res) => {
  const organizationId = req.organization?.id;
  const packageId: unknown = req.body?.packageId;

  if (!organizationId) {
    res.status(400).json({ message: 'Organization context missing' });
    return;
  }

  if (typeof packageId !== 'string' || !packageId) {
    res.status(400).json({ message: 'packageId is required' });
    return;
  }

  try {
    // 1. Fetch target package
    const pkgData = await queryHasuraAdmin<{
      subscription_packages_by_pk: {
        id: string;
        name: string;
        allocated_seconds: number;
        price_usd: number;
        validity_days: number;
      } | null;
    }>(
      `
      query GetPackage($id: uuid!) {
        subscription_packages_by_pk(id: $id) {
          id
          name
          allocated_seconds
          price_usd
          validity_days
        }
      }
    `,
      { id: packageId },
    );

    const pkg = pkgData?.subscription_packages_by_pk;
    if (!pkg) {
      res.status(404).json({ message: 'Subscription package not found' });
      return;
    }

    // Guard: Free Trial can only be claimed ONCE per organization
    if (pkg.price_usd === 0 || pkg.id === '11111111-1111-1111-1111-111111111111') {
      const trialCheck = await queryHasuraAdmin<{
        organization_subscriptions_aggregate: { aggregate: { count: number } };
      }>(
        `
        query CheckTrialUsed($organizationId: uuid!) {
          organization_subscriptions_aggregate(
            where: {
              organization_id: { _eq: $organizationId }
              package_id: { _eq: "11111111-1111-1111-1111-111111111111" }
            }
          ) {
            aggregate { count }
          }
        }
      `,
        { organizationId },
      );

      if ((trialCheck?.organization_subscriptions_aggregate?.aggregate?.count ?? 0) > 0) {
        res.status(400).json({
          message:
            'The Free Trial package can only be claimed once per organization. Please select a paid subscription plan (Starter, Growth, Enterprise) to continue calling.',
        });
        return;
      }
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (pkg.validity_days || 30));

    // 2. Create or update organization subscription
    const subResult = await queryHasuraAdmin<{
      insert_organization_subscriptions_one: {
        id: string;
        organization_id: string;
        package_id: string;
        allocated_seconds: number;
        remaining_seconds: number;
        status: string;
        start_date: string;
        end_date: string;
      };
    }>(
      `
      mutation SubscribeOrganization(
        $organizationId: uuid!
        $packageId: uuid!
        $allocatedSeconds: Int!
        $startDate: timestamptz!
        $endDate: timestamptz!
      ) {
        insert_organization_subscriptions_one(
          object: {
            organization_id: $organizationId
            package_id: $packageId
            allocated_seconds: $allocatedSeconds
            remaining_seconds: $allocatedSeconds
            status: "active"
            start_date: $startDate
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
        }
      }
    `,
      {
        organizationId,
        packageId: pkg.id,
        allocatedSeconds: pkg.allocated_seconds,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    );

    const newSub = subResult?.insert_organization_subscriptions_one;

    // Log subscription credit addition
    await queryHasuraAdmin(
      `
      mutation LogSubscriptionCredit(
        $subscriptionId: uuid!
        $organizationId: uuid!
        $balanceAfter: Int!
        $description: String
      ) {
        insert_subscription_usage_logs_one(
          object: {
            organization_subscription_id: $subscriptionId
            organization_id: $organizationId
            seconds_deducted: 0
            balance_after: $balanceAfter
            description: $description
          }
        ) {
          id
        }
      }
    `,
      {
        subscriptionId: newSub.id,
        organizationId,
        balanceAfter: pkg.allocated_seconds,
        description: `Subscribed to ${pkg.name} (${pkg.allocated_seconds}s allocated)`,
      },
    );

    res.json({
      success: true,
      message: `Successfully subscribed to ${pkg.name}`,
      subscription: newSub,
    });
  } catch (err: any) {
    console.error('[subscriptions] Failed to process subscription:', err);
    res.status(500).json({ message: err?.message || 'Failed to process subscription' });
  }
});
