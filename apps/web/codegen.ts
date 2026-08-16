import type { CodegenConfig } from '@graphql-codegen/cli';

const HASURA_GRAPHQL_ENDPOINT =
  process.env['HASURA_GRAPHQL_ENDPOINT'] || 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET =
  process.env['HASURA_GRAPHQL_ADMIN_SECRET'] || 'myadminsecretkey';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [HASURA_GRAPHQL_ENDPOINT]: {
        headers: {
          'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        },
      },
    },
  ],
  documents: ['apps/web/src/graphql/**/*.{ts,tsx,graphql}'],
  generates: {
    'apps/web/src/graphql/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        apolloReactHooksImportFrom: '@apollo/client/react',
        apolloReactCommonImportFrom: '@apollo/client/react',
        apolloImportFrom: '@apollo/client/react',
      },
    },
  },
};

export default config;
