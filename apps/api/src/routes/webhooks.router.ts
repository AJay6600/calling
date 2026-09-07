import { Router, Request, Response } from 'express';
import { queryHasuraAdmin } from '../lib/hasuraClient';
import {
  normalizeDisposition,
  updateLeadOnCallEnded,
} from '../services/lead.service';
import { deductCallDurationFromSubscription } from '../services/subscription.service';

export const webhooksRouter = Router();

const UPDATE_CALL_LOG_MUTATION = `
  mutation UpdateCallLog($executionId: String!, $changes: call_logs_set_input!) {
    update_call_logs(
      where: { bolna_execution_id: { _eq: $executionId } },
      _set: $changes
    ) {
      affected_rows
      returning {
        id
        organization_id
        lead_id
        campaign_id
      }
    }
  }
`;

webhooksRouter.post('/bolna', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const executionId = payload.id || payload.execution_id;

    if (!executionId) {
      res.status(400).json({ message: 'Missing execution ID in webhook payload' });
      return;
    }

    const normalizeStatus = (rawStatus: string | null | undefined): string => {
      if (!rawStatus) return 'queued';
      const norm = rawStatus.toLowerCase().trim();
      if (norm === 'in-progress' || norm === 'in_progress') return 'in_progress';
      if (norm === 'canceled' || norm === 'cancelled') return 'cancelled';
      if (norm === 'no-answer' || norm === 'no_answer') return 'no_answer';
      if (norm === 'call-disconnected' || norm === 'call_disconnected') return 'call_disconnected';
      if (norm === 'balance-low' || norm === 'balance_low') return 'balance_low';
      if ([
        'queued', 'initiated', 'ringing', 'completed', 'failed', 'busy',
        'scheduled', 'rescheduled', 'stopped', 'error'
      ].includes(norm)) {
        return norm;
      }
      return 'queued';
    };

    const status = normalizeStatus(payload.status);
    const duration =
      payload.conversation_duration ?? payload.telephony_data?.duration ?? 0;
    const recordingUrl = payload.telephony_data?.recording_url ?? null;
    const hangupBy = payload.telephony_data?.hangup_by ?? null;
    const hangupReason = payload.telephony_data?.hangup_reason ?? null;
    const telephonyProvider = payload.provider ?? payload.telephony_data?.provider ?? null;
    const agentPhoneNumber = payload.agent_number ?? payload.telephony_data?.from_number ?? null;
    const totalCost = payload.total_cost ?? 0;

    const transcriptText =
      typeof payload.transcript === 'string'
        ? payload.transcript
        : Array.isArray(payload.transcript)
        ? JSON.stringify(payload.transcript)
        : null;

    const rawDisposition =
      payload.extracted_data?.['Call Outcome']?.Disposition?.objective?.trim() ||
      payload.extracted_data?.Disposition?.objective?.trim() ||
      payload.extracted_data?.disposition ||
      payload.disposition ||
      null;

    const disposition = normalizeDisposition(rawDisposition);

    const summary =
      payload.extracted_data?.General?.['Call Summary']?.subjective ||
      payload.summary ||
      null;

    const changes: Record<string, any> = {
      status,
      duration_seconds: duration,
      recording_url: recordingUrl,
      hangup_by: hangupBy,
      hangup_reason: hangupReason,
      telephony_provider: telephonyProvider,
      agent_phone_number: agentPhoneNumber,
      total_cost: totalCost,
      transcript: transcriptText,
      disposition,
      summary,
      extracted_data: payload.extracted_data ?? null,
      latency_data: payload.latency_data ?? null,
      raw_response: payload,
      updated_at: new Date().toISOString(),
    };

    if (payload.initiated_at) {
      changes['initiated_at'] = payload.initiated_at;
    }

    const result = await queryHasuraAdmin<{
      update_call_logs: {
        affected_rows: number;
        returning: Array<{
          id: string;
          organization_id: string;
          lead_id: string | null;
          campaign_id: string | null;
        }>;
      };
    }>(UPDATE_CALL_LOG_MUTATION, {
      executionId,
      changes,
    });

    const returningItem = result.update_call_logs?.returning?.[0];
    const callLogId = returningItem?.id;
    const organizationId = returningItem?.organization_id;
    const leadId = returningItem?.lead_id;
    const campaignId = returningItem?.campaign_id;

    // Deduct Call Duration Seconds from Organization Subscription
    if (organizationId && duration > 0) {
      try {
        await deductCallDurationFromSubscription(
          organizationId,
          callLogId || null,
          duration,
          `Call execution duration deduction (${duration}s)`,
        );
      } catch (subErr) {
        console.error('Error deducting call duration from subscription:', subErr);
      }
    }

    if (leadId) {
      try {
        await updateLeadOnCallEnded(leadId, disposition, status);
      } catch (leadErr) {
        console.error('Error updating lead on call end:', leadErr);
      }
    }

    if (campaignId) {
      try {
        const checkLogsData = await queryHasuraAdmin<{
          call_logs_aggregate: {
            aggregate: {
              count: number;
            };
          };
        }>(
          `
          query CheckPendingCampaignCalls($campaignId: uuid!) {
            call_logs_aggregate(
              where: {
                campaign_id: { _eq: $campaignId }
                status: { _in: ["queued", "initiated", "ringing", "in_progress"] }
              }
            ) {
              aggregate {
                count
              }
            }
          }
        `,
          { campaignId },
        );

        const pendingCount =
          checkLogsData.call_logs_aggregate?.aggregate?.count ?? 0;
        if (pendingCount === 0) {
          await queryHasuraAdmin(
            `
            mutation CompleteCampaign($campaignId: uuid!, $completedAt: timestamptz!) {
              update_campaigns_by_pk(
                pk_columns: { id: $campaignId }
                _set: { status: "completed", completed_at: $completedAt }
              ) {
                id
              }
            }
          `,
            { campaignId, completedAt: new Date().toISOString() },
          );
        }
      } catch (cErr) {
        console.error('Error auto-completing campaign:', cErr);
      }
    }

    res.json({
      success: true,
      affectedRows: result.update_call_logs?.affected_rows ?? 0,
    });
  } catch (error: any) {
    console.error('Error handling Bolna webhook:', error);
    res.status(500).json({ message: error?.message || 'Internal Server Error' });
  }
});
