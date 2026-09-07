import { graphql } from '../gql/gql';

export const getCampaignsDocument = graphql(`
  query getCampaigns {
    campaigns(order_by: { created_at: desc }) {
      id
      name
      status
      lead_source_type
      auto_retry_enabled
      auto_retry_conditions
      auto_retry_max_attempts
      auto_retry_gap_minutes
      calling_window_start
      calling_window_end
      calling_window_timezone
      scheduled_at
      started_at
      completed_at
      stopped_at
      created_at
      updated_at
      agent {
        id
        name
        language_id
      }
      campaign_leads_aggregate {
        aggregate {
          count
        }
      }
      call_logs_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`);
