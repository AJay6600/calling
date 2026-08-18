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
    `
      type FileUploadS3UrlResponse {
        url: String
        key: String
        policy: String
        algorithm: String
        credential: String
        date: String
        signature: String
        contentType: String
        contentDisposition: String
      }
      extend type query_root {
        fileUploadS3Url(fileName: String!, contentType: String!): FileUploadS3UrlResponse
      }
      extend type Query {
        fileUploadS3Url(fileName: String!, contentType: String!): FileUploadS3UrlResponse
      }
      type PlaceSingleCallOutput {
        success: Boolean!
        executionId: String
        message: String
      }
      input BulkLeadInput {
        phoneNumber: String!
        name: String
        email: String
        companyName: String
      }
      type PlaceBulkCallOutput {
        success: Boolean!
        totalRequested: Int!
        totalPlaced: Int!
        totalSkipped: Int!
        message: String
      }
      extend type mutation_root {
        placeSingleCall(agentId: String!, leadId: String!): PlaceSingleCallOutput
        placeBulkCall(agentId: String!, leads: [BulkLeadInput!]!): PlaceBulkCallOutput
      }
      extend type Mutation {
        placeSingleCall(agentId: String!, leadId: String!): PlaceSingleCallOutput
        placeBulkCall(agentId: String!, leads: [BulkLeadInput!]!): PlaceBulkCallOutput
      }
      extend type call_logs {
        lead: leads
      }
    `,
  ],
  documents: ['apps/web/src/graphql/**/*.{ts,tsx,graphql}'],
  generates: {
    'apps/web/src/graphql/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        allowPartialOutputs: true,
        scalars: {
          uuid: 'string',
          timestamptz: 'string',
          timestamp: 'string',
          jsonb: 'any',
        },
      },
    },
  },
};

export default config;
