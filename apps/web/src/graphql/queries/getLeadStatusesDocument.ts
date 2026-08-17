import { graphql } from '../gql/gql';

export const getLeadStatusesDocument = graphql(`
  query GetLeadStatuses {
    lead_status_enum(order_by: { id: asc }) {
      id
      label
    }
  }
`);
