import { graphql } from '../gql/gql';

export const getAgentsDocument = graphql(`
  query GetAgents {
    agents {
      id
      bolna_agent_id
      name
      language_id
      zitadel_org_id
    }
  }
`);
