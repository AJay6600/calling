import { graphql } from '../gql/gql';

export const deleteCampaignDocument = graphql(`
  mutation deleteCampaign($id: uuid!) {
    delete_campaigns_by_pk(id: $id) {
      id
    }
  }
`);
