import { graphql } from '../gql/gql';

export const updateLeadDocument = graphql(`
  mutation UpdateLead($id: uuid!, $changes: leads_set_input!) {
    update_leads_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      phone_number
      name
      email
      company_name
      status
      updated_at
    }
  }
`);
