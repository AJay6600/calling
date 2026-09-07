import { graphql } from '../gql/gql';

export const stopCampaignDocument = graphql(`
  mutation stopCampaign($campaignId: String!) {
    stopCampaign(campaignId: $campaignId) {
      success
      message
    }
  }
`);
