import { graphql } from '../gql/gql';

export const getLeadsDocument = graphql(`
  query GetLeads {
    leads(order_by: { created_at: desc }) {
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
    }
  }
`);
