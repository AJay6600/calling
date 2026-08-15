import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ZITADEL_ORG_ID_HEADER } from '../utils/helper/zitadelClaims';

const HASURA_GRAPHQL_HTTP_URL =
  import.meta.env.VITE_HASURA_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';
const HASURA_GRAPHQL_WS_URL =
  import.meta.env.VITE_HASURA_WS_URL || 'ws://localhost:8080/v1/graphql';

const httpLink = new HttpLink({
  uri: HASURA_GRAPHQL_HTTP_URL,
});

let getAccessToken: () => string | undefined = () => undefined;
let getZitadelOrgId: () => string | undefined = () => undefined;

export const registerApolloAuthToken = (
  tokenGetter: () => string | undefined,
) => {
  getAccessToken = tokenGetter;
};

export const registerApolloZitadelOrgId = (
  orgIdGetter: () => string | undefined,
) => {
  getZitadelOrgId = orgIdGetter;
};

const authLink = new ApolloLink((operation, forward) => {
  const token = getAccessToken();
  const zitadelOrgId = getZitadelOrgId();
  const requestHeaders: Record<string, string> = {};

  if (token !== undefined && token !== '') {
    requestHeaders.authorization = `Bearer ${token}`;
  }

  if (zitadelOrgId !== undefined && zitadelOrgId !== '') {
    requestHeaders[ZITADEL_ORG_ID_HEADER] = zitadelOrgId;
  }

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...requestHeaders,
    },
  }));

  return forward(operation);
});

const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: HASURA_GRAPHQL_WS_URL,
          connectionParams: () => {
            const token = getAccessToken();
            const zitadelOrgId = getZitadelOrgId();
            const headers: Record<string, string> = {};

            if (token !== undefined && token !== '') {
              headers.authorization = `Bearer ${token}`;
            }

            if (zitadelOrgId !== undefined && zitadelOrgId !== '') {
              headers[ZITADEL_ORG_ID_HEADER] = zitadelOrgId;
            }

            return { headers };
          },
        }),
      )
    : null;

const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink),
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
