import { graphql } from '../gql/gql';

export const updateCampaignDocument = graphql(`
  mutation UpdateCampaign($campaignId: uuid!, $changes: campaigns_set_input!) {
    update_campaigns_by_pk(pk_columns: { id: $campaignId }, _set: $changes) {
      id
      name
      agent_id
      auto_retry_enabled
      auto_retry_conditions
      auto_retry_max_attempts
      auto_retry_gap_minutes
      calling_window_start
      calling_window_end
      calling_window_timezone
      updated_at
    }
  }
`);
