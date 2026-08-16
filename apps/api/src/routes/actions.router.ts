import { Router, Request, Response } from 'express';
import { queryHasuraAdmin } from '../lib/hasuraClient';
import { makeCall } from '../services/bolna.client';

export const actionsRouter = Router();

type PlaceSingleCallInput = {
  agentId: string;
  receiverPhoneNumber: string;
};

type HasuraActionPayload<T> = {
  action: {
    name: string;
  };
  input: T;
  session_variables?: Record<string, string>;
};

type AgentAndOrgQueryResult = {
  agents_by_pk: {
    id: string;
    bolna_agent_id: string;
    organization: {
      id: string;
      bolna_api_key: string | null;
    } | null;
  } | null;
};

const GET_AGENT_AND_ORG_QUERY = `
  query GetAgentAndOrgDetails($agentId: uuid!) {
    agents_by_pk(id: $agentId) {
      id
      bolna_agent_id
      organization {
        id
        bolna_api_key
      }
    }
  }
`;

actionsRouter.post('/place-single-call', async (req: Request, res: Response) => {
  try {
    const payload = req.body as HasuraActionPayload<PlaceSingleCallInput>;
    const { agentId, receiverPhoneNumber } = payload.input || {};

    if (!agentId || !receiverPhoneNumber) {
      res.status(400).json({
        message: 'agentId and receiverPhoneNumber are required',
      });
      return;
    }

    // 1. Fetch agent & organization details from Hasura using admin query
    const data = await queryHasuraAdmin<AgentAndOrgQueryResult>(
      GET_AGENT_AND_ORG_QUERY,
      { agentId }
    );

    const agent = data.agents_by_pk;

    if (!agent) {
      res.status(400).json({
        message: `Agent with id '${agentId}' not found`,
      });
      return;
    }

    const bolnaAgentId = agent.bolna_agent_id;
    const bolnaApiKey = agent.organization?.bolna_api_key ?? process.env['BOLNA_API_KEY'];

    if (!bolnaAgentId) {
      res.status(400).json({
        message: 'Agent is missing bolna_agent_id configuration',
      });
      return;
    }

    if (!bolnaApiKey) {
      res.status(400).json({
        message: 'Organization is missing bolna_api_key configuration',
      });
      return;
    }

    // 2. Call Bolna API to place the call
    const result = await makeCall({
      recipientPhoneNumber: receiverPhoneNumber,
      bolnaAgentId,
      bolnaApiKey,
    });

    res.json({
      success: true,
      executionId: result.executionId,
      message: 'Call placed successfully',
    });
  } catch (error: any) {
    console.error('Error in placeSingleCall action:', error);
    res.status(400).json({
      message: error?.message || 'Failed to place call',
    });
  }
});
