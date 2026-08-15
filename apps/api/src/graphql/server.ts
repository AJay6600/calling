import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';

import type { Express } from 'express';
import { zitadelAuthMiddleware } from '../middleware/zitadel-auth.middleware';
import {
  ensureOrganizationMiddleware,
  type OrgScopedRequestType,
} from '../middleware/ensure-organization.middleware';
import {
  makeCall,
  BolnaConfigError,
  BolnaRequestError,
} from '../services/bolna.client';

export interface GraphQLContext {
  userId?: string;
  orgId?: string;
  orgName?: string;
}

// 1. GraphQL Type Definitions (Schema)
export const typeDefs = `#graphql
  type Query {
    graphqlHealth: GraphQLHealthStatus!
    me: UserProfile
  }

  type Mutation {
    triggerOutboundCall(input: TriggerCallInput!): CallResult!
    syncAgentConfig(agentId: String!): AgentSyncResult!
  }

  type GraphQLHealthStatus {
    status: String!
    timestamp: String!
    version: String!
  }

  type UserProfile {
    userId: String
    orgId: String
    orgName: String
  }

  input TriggerCallInput {
    phoneNumber: String!
    leadId: String
    campaignId: String
    agentId: String
  }

  type CallResult {
    success: Boolean!
    callId: String
    message: String!
  }

  type AgentSyncResult {
    success: Boolean!
    agentId: String!
    status: String!
  }
`;

// 2. GraphQL Resolvers
export const resolvers = {
  Query: {
    graphqlHealth: () => ({
      status: 'UP',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      return {
        userId: context.userId || null,
        orgId: context.orgId || null,
        orgName: context.orgName || null,
      };
    },
  },
  Mutation: {
    triggerOutboundCall: async (
      _parent: unknown,
      args: {
        input: {
          phoneNumber: string;
          leadId?: string;
          campaignId?: string;
          agentId?: string;
        };
      },
      context: GraphQLContext
    ) => {
      const e164Pattern = /^\+[1-9]\d{7,14}$/;
      const { phoneNumber } = args.input;

      if (!e164Pattern.test(phoneNumber)) {
        return {
          success: false,
          callId: null,
          message:
            'phoneNumber must be in E.164 format, e.g. +919876543210',
        };
      }

      try {
        const result = await makeCall({ recipientPhoneNumber: phoneNumber });
        console.log(
          `[GraphQL Mutation] org=${context.orgId} triggered call, executionId=${result.executionId}`,
        );
        return {
          success: true,
          callId: result.executionId,
          message: `Call successfully initiated to ${phoneNumber}`,
        };
      } catch (error) {
        if (error instanceof BolnaConfigError) {
          return {
            success: false,
            callId: null,
            message: 'Calling service is misconfigured',
          };
        }
        if (error instanceof BolnaRequestError) {
          return {
            success: false,
            callId: null,
            message: 'Failed to trigger call via provider',
          };
        }
        throw error;
      }
    },
    syncAgentConfig: (
      _parent: unknown,
      args: { agentId: string }
    ) => {

      console.log(`[GraphQL Mutation] Syncing agent ${args.agentId}`);
      return {
        success: true,
        agentId: args.agentId,
        status: 'SYNCED',
      };
    },
  },
};

// 3. Initialize and mount Apollo Server on Express
export async function setupApolloServer(app: Express): Promise<ApolloServer> {
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Mount Apollo Server at /graphql with Auth middleware
  app.use(
    '/graphql',
    zitadelAuthMiddleware,
    ensureOrganizationMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => {
        const orgReq = req as OrgScopedRequestType;
        return {
          userId: orgReq.auth?.userId,
          orgId: orgReq.auth?.orgId,
          orgName: orgReq.auth?.orgName,
        };
      },
    })
  );

  console.log('🚀 Apollo Server ready at /graphql');
  return server;
}
