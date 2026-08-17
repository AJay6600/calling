import { graphql } from '../gql/gql';

export const placeSingleCallDocument = graphql(`
  mutation placeSingleCall($agentId: String!, $leadId: String!) {
    placeSingleCall(agentId: $agentId, leadId: $leadId) {
      success
      executionId
      message
    }
  }
`);
