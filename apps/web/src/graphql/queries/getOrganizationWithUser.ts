import { gql } from '@apollo/client';

export const GET_ORGANIZATION_WITH_USER = gql`
  query GetOrganizationWithUser(
    $zitadel_org_id: String!
    $zitadel_user_id: String!
  ) {
    organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }, limit: 1) {
      id
      zitadel_org_id
      name
      created_at
      updated_at
      users(where: { zitadel_user_id: { _eq: $zitadel_user_id } }, limit: 1) {
        id
        zitadel_user_id
        email
        organization_id
      }
    }
  }
`;
