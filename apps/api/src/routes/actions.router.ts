import { Router, Request, Response } from 'express';
import { queryHasuraAdmin } from '../lib/hasuraClient';
import { makeCall } from '../services/bolna.client';
import { updateLeadOnCallPlaced } from '../services/lead.service';

export const actionsRouter = Router();

type PlaceSingleCallInput = {
  agentId: string;
  leadId: string;
};

type HasuraActionPayload<T> = {
  action: {
    name: string;
  };
  input: T;
  session_variables?: Record<string, string>;
};

type AgentAndLeadQueryResult = {
  agents_by_pk: {
    id: string;
    bolna_agent_id: string;
    zitadel_org_id: string;
    organization_id: string;
    organization: {
      id: string;
      zitadel_org_id: string;
      bolna_api_key: string | null;
    } | null;
  } | null;
  leads_by_pk: {
    id: string;
    phone_number: string;
    organization_id: string;
    zitadel_org_id: string;
  } | null;
};

const GET_AGENT_AND_LEAD_QUERY = `
  query GetAgentAndLeadDetails($agentId: uuid!, $leadId: uuid!) {
    agents_by_pk(id: $agentId) {
      id
      bolna_agent_id
      zitadel_org_id
      organization_id
      organization {
        id
        zitadel_org_id
        bolna_api_key
      }
    }
    leads_by_pk(id: $leadId) {
      id
      phone_number
      organization_id
      zitadel_org_id
    }
  }
`;

const INSERT_CALL_LOG_MUTATION = `
  mutation InsertCallLog($object: call_logs_insert_input!) {
    insert_call_logs_one(object: $object) {
      id
    }
  }
`;

actionsRouter.post('/place-single-call', async (req: Request, res: Response) => {
  try {
    const payload = req.body as HasuraActionPayload<PlaceSingleCallInput>;
    const { agentId, leadId } = payload.input || {};

    if (!agentId || !leadId) {
      res.status(400).json({
        message: 'agentId and leadId are required',
      });
      return;
    }

    const data = await queryHasuraAdmin<AgentAndLeadQueryResult>(
      GET_AGENT_AND_LEAD_QUERY,
      { agentId, leadId },
    );

    const agent = data.agents_by_pk;
    const lead = data.leads_by_pk;

    if (!agent) {
      res.status(400).json({
        message: `Agent with id '${agentId}' not found`,
      });
      return;
    }

    if (!lead) {
      res.status(400).json({
        message: `Lead with id '${leadId}' not found`,
      });
      return;
    }

    if (lead.organization_id !== agent.organization_id) {
      res.status(400).json({
        message: 'Lead does not belong to the same organization as the agent',
      });
      return;
    }

    const recipientPhoneNumber = lead.phone_number;
    const bolnaAgentId = agent.bolna_agent_id;
    const bolnaApiKey =
      agent.organization?.bolna_api_key ?? process.env['BOLNA_API_KEY'];

    if (!recipientPhoneNumber) {
      res.status(400).json({
        message: 'Lead is missing phone_number',
      });
      return;
    }

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

    const result = await makeCall({
      recipientPhoneNumber,
      bolnaAgentId,
      bolnaApiKey,
    });

    const organizationId = agent.organization?.id ?? agent.organization_id;
    const zitadelOrgId =
      agent.zitadel_org_id || agent.organization?.zitadel_org_id;

    if (organizationId && zitadelOrgId) {
      try {
        await queryHasuraAdmin(INSERT_CALL_LOG_MUTATION, {
          object: {
            organization_id: organizationId,
            zitadel_org_id: zitadelOrgId,
            agent_id: agent.id,
            lead_id: lead.id,
            bolna_agent_id: bolnaAgentId,
            bolna_execution_id: result.executionId,
            recipient_phone_number: recipientPhoneNumber,
            status: 'queued',
          },
        });
      } catch (insertErr) {
        console.error('Error inserting initial call_log entry:', insertErr);
      }
    }

    try {
      await updateLeadOnCallPlaced(lead.id);
    } catch (leadErr) {
      console.error('Error updating lead on call placement:', leadErr);
    }

    res.json({
      success: true,
      executionId: result.executionId,
      message: 'Call placed successfully',
    });
  } catch (error: unknown) {
    console.error('Error in placeSingleCall action:', error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Failed to place call',
    });
  }
});
