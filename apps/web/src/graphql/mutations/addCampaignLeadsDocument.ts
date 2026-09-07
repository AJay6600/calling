import { graphql } from '../gql/gql';

export const addCampaignLeadsDocument = graphql(`
  mutation AddCampaignLeads($objects: [campaign_leads_insert_input!]!) {
    insert_campaign_leads(
      objects: $objects,
      on_conflict: { constraint: uq_campaign_leads, update_columns: [] }
    ) {
      affected_rows
    }
  }
`);
