import { graphql } from '../gql/gql';

export const runCampaignDocument = graphql(`
  mutation runCampaign($campaignId: String!, $scheduledAt: String) {
    runCampaign(campaignId: $campaignId, scheduledAt: $scheduledAt) {
      success
      status
      totalPlaced
      message
    }
  }
`);
