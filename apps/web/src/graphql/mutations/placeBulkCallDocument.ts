import { graphql } from '../gql/gql';

export const placeBulkCallDocument = graphql(`
  mutation placeBulkCall($agentId: String!, $leads: [BulkLeadInput!]!) {
    placeBulkCall(agentId: $agentId, leads: $leads) {
      success
      totalRequested
      totalPlaced
      totalSkipped
      message
    }
  }
`);
