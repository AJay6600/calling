import { graphql } from '../gql/gql';

export const getCampaignByIdDocument = graphql(`
  query getCampaignById($id: uuid!) {
    campaigns_by_pk(id: $id) {
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
      campaign_leads {
        id
        lead_id
        variables
        status
        attempts_count
        lead {
          id
          name
          phone_number
          email
          company_name
        }
      }
      call_logs(order_by: { created_at: desc }) {
        id
        organization_id
        zitadel_org_id
        agent_id
        lead_id
        campaign_id
        bolna_agent_id
        bolna_execution_id
        recipient_phone_number
        agent_phone_number
        call_type
        telephony_provider
        status
        hangup_by
        hangup_reason
        duration_seconds
        recording_url
        total_cost
        disposition
        summary
        transcript
        extracted_data
        latency_data
        raw_response
        initiated_at
        created_at
        updated_at
        call_status_enum {
          id
          label
        }
        disposition_enum {
          id
          label
        }
        agent {
          id
          name
          language_id
        }
        lead {
          id
          name
          phone_number
        }
      }
    }
  }
`);
