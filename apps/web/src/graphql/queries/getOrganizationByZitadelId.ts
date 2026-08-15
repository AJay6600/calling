import { gql } from '@apollo/client';

export const GET_ORGANIZATION_BY_ZITADEL_ID = gql`
  query GetOrganizationByZitadelId($zitadel_org_id: String!) {
    organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }, limit: 1) {
      id
      zitadel_org_id
      name
      created_at
      updated_at
    }
  }
`;
