import { graphql } from '../gql/gql';

export const deleteLeadDocument = graphql(`
  mutation DeleteLead($id: uuid!) {
    delete_leads_by_pk(id: $id) {
      id
    }
  }
`);
