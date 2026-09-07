import { graphql } from '../gql/gql';

export const createCampaignDocument = graphql(`
  mutation createCampaign(
    $name: String!
    $agentId: String!
    $leadSourceType: String!
    $leads: [CampaignLeadInput!]
    $leadIds: [String!]
    $autoRetryEnabled: Boolean
    $autoRetryConditions: [String!]
    $autoRetryMaxAttempts: Int
    $autoRetryGapMinutes: Int
    $callingWindowStart: String
    $callingWindowEnd: String
    $callingWindowTimezone: String
  ) {
    createCampaign(
      name: $name
      agentId: $agentId
      leadSourceType: $leadSourceType
      leads: $leads
      leadIds: $leadIds
      autoRetryEnabled: $autoRetryEnabled
      autoRetryConditions: $autoRetryConditions
      autoRetryMaxAttempts: $autoRetryMaxAttempts
      autoRetryGapMinutes: $autoRetryGapMinutes
      callingWindowStart: $callingWindowStart
      callingWindowEnd: $callingWindowEnd
      callingWindowTimezone: $callingWindowTimezone
    ) {
      success
      campaignId
      message
    }
  }
`);
