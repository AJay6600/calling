import { graphql } from '../gql/gql';

export const placeSingleCallDocument = graphql(`
  mutation placeSingleCall(
    $agentId: String!
    $receiverPhoneNumber: String!
  ) {
    placeSingleCall(
      agentId: $agentId
      receiverPhoneNumber: $receiverPhoneNumber
    ) {
      success
      executionId
      message
    }
  }
`);
