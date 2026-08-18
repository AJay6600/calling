import { graphql } from '../gql/gql';

export const getLeadByIdDocument = graphql(`
  query GetLeadById($id: uuid!) {
    leads_by_pk(id: $id) {
      id
      organization_id
      zitadel_org_id
      name
      phone_number
      email
      company_name
      status
      lead_status_enum {
        id
        label
      }
      total_calls_count
      last_call_at
      last_disposition_id
      disposition_enum {
        id
        label
      }
      created_at
      updated_at
      call_logs(order_by: { created_at: desc }) {
        id
        organization_id
        zitadel_org_id
        agent_id
        bolna_agent_id
        bolna_execution_id
        recipient_phone_number
        agent_phone_number
        call_type
        telephony_provider
        status
        call_status_enum {
          id
          label
        }
        hangup_by
        hangup_reason
        duration_seconds
        recording_url
        total_cost
        disposition
        disposition_enum {
          id
          label
        }
        summary
        transcript
        extracted_data
        latency_data
        raw_response
        initiated_at
        created_at
        updated_at
        agent {
          id
          name
          language_id
        }
      }
    }
  }
`);
