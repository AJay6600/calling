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

type BulkLeadInput = {
  phoneNumber: string;
  name?: string | null;
  email?: string | null;
  companyName?: string | null;
};

type PlaceBulkCallInput = {
  agentId: string;
  leads: BulkLeadInput[];
};

type AgentQueryResult = {
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
};

type ExistingLeadsQueryResult = {
  leads: Array<{
    id: string;
    phone_number: string;
  }>;
};

type InsertLeadsMutationResult = {
  insert_leads: {
    returning: Array<{
      id: string;
      phone_number: string;
    }>;
  };
};

const GET_AGENT_QUERY = `
  query GetAgentDetails($agentId: uuid!) {
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
  }
`;

const GET_EXISTING_LEADS_QUERY = `
  query GetExistingLeadsByPhone($organizationId: uuid!, $phoneNumbers: [String!]!) {
    leads(where: { organization_id: { _eq: $organizationId }, phone_number: { _in: $phoneNumbers } }) {
      id
      phone_number
    }
  }
`;

const INSERT_LEADS_BULK_MUTATION = `
  mutation InsertLeadsBulk($objects: [leads_insert_input!]!) {
    insert_leads(
      objects: $objects,
      on_conflict: { constraint: uq_leads_org_phone, update_columns: [] }
    ) {
      returning {
        id
        phone_number
      }
    }
  }
`;

actionsRouter.post('/place-bulk-call', async (req: Request, res: Response) => {
  try {
    const payload = req.body as HasuraActionPayload<PlaceBulkCallInput>;
    const { agentId, leads } = payload.input || {};

    if (!agentId || !Array.isArray(leads) || leads.length === 0) {
      res.status(400).json({
        message: 'agentId and a non-empty leads array are required',
      });
      return;
    }

    const agentData = await queryHasuraAdmin<AgentQueryResult>(
      GET_AGENT_QUERY,
      { agentId },
    );

    const agent = agentData.agents_by_pk;
    if (!agent) {
      res.status(400).json({
        message: `Agent with id '${agentId}' not found`,
      });
      return;
    }

    const organizationId = agent.organization?.id ?? agent.organization_id;
    const zitadelOrgId =
      agent.zitadel_org_id || agent.organization?.zitadel_org_id;
    const bolnaAgentId = agent.bolna_agent_id;
    const bolnaApiKey =
      agent.organization?.bolna_api_key ?? process.env['BOLNA_API_KEY'];

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

    const phoneNumbers = Array.from(
      new Set(leads.map((l) => l.phoneNumber.trim()).filter(Boolean)),
    );

    if (phoneNumbers.length === 0) {
      res.status(400).json({
        message: 'No valid phone numbers found in input leads',
      });
      return;
    }

    const existingLeadsData = await queryHasuraAdmin<ExistingLeadsQueryResult>(
      GET_EXISTING_LEADS_QUERY,
      {
        organizationId,
        phoneNumbers,
      },
    );

    const leadMap = new Map<string, string>();
    (existingLeadsData.leads || []).forEach((lead) => {
      leadMap.set(lead.phone_number, lead.id);
    });

    const newLeadObjects = leads
      .filter((l) => !leadMap.has(l.phoneNumber.trim()))
      .map((l) => ({
        organization_id: organizationId,
        zitadel_org_id: zitadelOrgId,
        phone_number: l.phoneNumber.trim(),
        name: l.name?.trim() || null,
        email: l.email?.trim() || null,
        company_name: l.companyName?.trim() || null,
        status: 'new',
      }));

    if (newLeadObjects.length > 0) {
      const insertedResult = await queryHasuraAdmin<InsertLeadsMutationResult>(
        INSERT_LEADS_BULK_MUTATION,
        { objects: newLeadObjects },
      );

      (insertedResult.insert_leads?.returning || []).forEach((lead) => {
        leadMap.set(lead.phone_number, lead.id);
      });
    }

    let totalPlaced = 0;
    let totalSkipped = 0;

    for (const leadInput of leads) {
      const recipientPhoneNumber = leadInput.phoneNumber.trim();
      const leadId = leadMap.get(recipientPhoneNumber);

      if (!leadId) {
        totalSkipped++;
        continue;
      }

      try {
        const result = await makeCall({
          recipientPhoneNumber,
          bolnaAgentId,
          bolnaApiKey,
        });

        if (organizationId && zitadelOrgId) {
          try {
            await queryHasuraAdmin(INSERT_CALL_LOG_MUTATION, {
              object: {
                organization_id: organizationId,
                zitadel_org_id: zitadelOrgId,
                agent_id: agent.id,
                lead_id: leadId,
                bolna_agent_id: bolnaAgentId,
                bolna_execution_id: result.executionId,
                recipient_phone_number: recipientPhoneNumber,
                status: 'queued',
              },
            });
          } catch (insertErr) {
            console.error('Error inserting call log entry in bulk:', insertErr);
          }
        }

        try {
          await updateLeadOnCallPlaced(leadId);
        } catch (leadErr) {
          console.error('Error updating lead status in bulk:', leadErr);
        }

        totalPlaced++;
      } catch (callErr) {
        console.error(`Failed to place call to ${recipientPhoneNumber}:`, callErr);
        totalSkipped++;
      }
    }

    res.json({
      success: true,
      totalRequested: leads.length,
      totalPlaced,
      totalSkipped,
      message: `Bulk calls dispatched. Placed: ${totalPlaced}, Skipped/Failed: ${totalSkipped}`,
    });
  } catch (error: unknown) {
    console.error('Error in placeBulkCall action:', error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Failed to place bulk calls',
    });
  }
});
