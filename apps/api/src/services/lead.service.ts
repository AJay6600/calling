import { queryHasuraAdmin } from '../lib/hasuraClient';

const TERMINAL_CALL_STATUSES = new Set([
  'completed',
  'failed',
  'busy',
  'no_answer',
  'cancelled',
  'call_disconnected',
  'stopped',
  'error',
]);

const UPDATE_LEAD_ON_CALL_PLACED_MUTATION = `
  mutation UpdateLeadOnCallPlaced(
    $leadId: uuid!
    $changes: leads_set_input!
    $inc: leads_inc_input!
  ) {
    update_leads_by_pk(
      pk_columns: { id: $leadId }
      _inc: $inc
      _set: $changes
    ) {
      id
    }
  }
`;

const UPDATE_LEAD_ON_CALL_ENDED_MUTATION = `
  mutation UpdateLeadOnCallEnded($leadId: uuid!, $changes: leads_set_input!) {
    update_leads_by_pk(pk_columns: { id: $leadId }, _set: $changes) {
      id
    }
  }
`;

export const normalizeDisposition = (raw: string | null): string | null => {
  if (!raw) return null;
  const norm = raw.toLowerCase().trim();
  if (norm === 'interested') return 'interested';
  if (norm === 'not interested' || norm === 'not_interested') return 'not_interested';
  if (
    norm === 'callback requested' ||
    norm === 'callback_requested' ||
    norm === 'callback'
  ) {
    return 'callback_requested';
  }
  if (norm === 'voicemail') return 'voicemail';
  if (norm === 'no answer' || norm === 'no_answer') return 'no_answer';
  if (norm === 'do not call' || norm === 'do_not_call') return 'do_not_call';

  if (norm.includes('not interested')) return 'not_interested';
  if (norm.includes('do not call')) return 'do_not_call';
  if (norm.includes('callback') || norm.includes('reschedule')) {
    return 'callback_requested';
  }
  if (norm.includes('voicemail')) return 'voicemail';
  if (norm.includes('no answer') || norm.includes('busy')) return 'no_answer';
  if (norm.includes('interested')) return 'interested';
  return null;
};

export const isTerminalCallStatus = (status: string): boolean =>
  TERMINAL_CALL_STATUSES.has(status);

export const mapDispositionToLeadStatus = (
  disposition: string | null,
  callStatus: string,
): string | null => {
  if (disposition) {
    switch (disposition) {
      case 'interested':
        return 'qualified';
      case 'not_interested':
        return 'not_interested';
      case 'callback_requested':
        return 'callback_requested';
      case 'voicemail':
      case 'no_answer':
        return 'unreachable';
      case 'do_not_call':
        return 'do_not_call';
      default:
        return null;
    }
  }

  if (callStatus === 'no_answer' || callStatus === 'busy') {
    return 'unreachable';
  }

  return null;
};

export const updateLeadOnCallPlaced = async (leadId: string): Promise<void> => {
  const lastCallAt = new Date().toISOString();
  await queryHasuraAdmin(UPDATE_LEAD_ON_CALL_PLACED_MUTATION, {
    leadId,
    inc: { total_calls_count: 1 },
    changes: {
      last_call_at: lastCallAt,
      status: 'contacting',
      updated_at: lastCallAt,
    },
  });
};

export const updateLeadOnCallEnded = async (
  leadId: string,
  disposition: string | null,
  callStatus: string,
): Promise<void> => {
  if (!isTerminalCallStatus(callStatus)) {
    return;
  }

  const status = mapDispositionToLeadStatus(disposition, callStatus);
  const changes: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (disposition) {
    changes['last_disposition_id'] = disposition;
  }

  if (status) {
    changes['status'] = status;
  }

  if (!disposition && !status) {
    return;
  }

  await queryHasuraAdmin(UPDATE_LEAD_ON_CALL_ENDED_MUTATION, {
    leadId,
    changes,
  });
};
