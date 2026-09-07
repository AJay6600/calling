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

type CampaignLeadInput = {
  phoneNumber: string;
  name?: string | null;
  email?: string | null;
  companyName?: string | null;
  customFields?: string | null;
};

type CreateCampaignInput = {
  name: string;
  agentId: string;
  leadSourceType: string;
  leads?: CampaignLeadInput[];
  leadIds?: string[];
  autoRetryEnabled?: boolean;
  autoRetryConditions?: string[];
  autoRetryMaxAttempts?: number;
  autoRetryGapMinutes?: number;
  callingWindowStart?: string;
  callingWindowEnd?: string;
  callingWindowTimezone?: string;
};

type RunCampaignInput = {
  campaignId: string;
  scheduledAt?: string | null;
};

type StopCampaignInput = {
  campaignId: string;
};

const INSERT_CAMPAIGN_MUTATION = `
  mutation InsertCampaign($object: campaigns_insert_input!) {
    insert_campaigns_one(object: $object) {
      id
    }
  }
`;

const INSERT_CAMPAIGN_LEADS_MUTATION = `
  mutation InsertCampaignLeads($objects: [campaign_leads_insert_input!]!) {
    insert_campaign_leads(objects: $objects) {
      affected_rows
    }
  }
`;

const GET_CAMPAIGN_DETAILS_QUERY = `
  query GetCampaignDetails($campaignId: uuid!) {
    campaigns_by_pk(id: $campaignId) {
      id
      name
      status
      organization_id
      zitadel_org_id
      agent_id
      agent {
        id
        bolna_agent_id
        organization {
          id
          zitadel_org_id
          bolna_api_key
        }
      }
      campaign_leads {
        id
        lead_id
        variables
        lead {
          id
          phone_number
        }
      }
    }
  }
`;

const UPDATE_CAMPAIGN_STATUS_MUTATION = `
  mutation UpdateCampaignStatus($campaignId: uuid!, $changes: campaigns_set_input!) {
    update_campaigns_by_pk(pk_columns: { id: $campaignId }, _set: $changes) {
      id
      status
    }
  }
`;

actionsRouter.post('/create-campaign', async (req: Request, res: Response) => {
  try {
    const payload = req.body as HasuraActionPayload<CreateCampaignInput>;
    const input = (payload.input || {}) as CreateCampaignInput;

    if (!input.name || !input.agentId) {
      res.status(400).json({
        message: 'name and agentId are required',
      });
      return;
    }

    const agentData = await queryHasuraAdmin<AgentQueryResult>(
      GET_AGENT_QUERY,
      { agentId: input.agentId },
    );

    const agent = agentData.agents_by_pk;
    if (!agent) {
      res.status(400).json({
        message: `Agent with id '${input.agentId}' not found`,
      });
      return;
    }

    const organizationId = agent.organization?.id ?? agent.organization_id;
    const zitadelOrgId =
      agent.zitadel_org_id || agent.organization?.zitadel_org_id;

    const campaignInsertResult = await queryHasuraAdmin<{
      insert_campaigns_one: { id: string } | null;
    }>(INSERT_CAMPAIGN_MUTATION, {
      object: {
        organization_id: organizationId,
        zitadel_org_id: zitadelOrgId,
        name: input.name.trim(),
        agent_id: agent.id,
        status: 'draft',
        lead_source_type: input.leadSourceType || 'csv',
        auto_retry_enabled: !!input.autoRetryEnabled,
        auto_retry_conditions: input.autoRetryConditions || [],
        auto_retry_max_attempts: input.autoRetryMaxAttempts || 1,
        auto_retry_gap_minutes: input.autoRetryGapMinutes || 15,
        calling_window_start: input.callingWindowStart || null,
        calling_window_end: input.callingWindowEnd || null,
        calling_window_timezone: input.callingWindowTimezone || null,
      },
    });

    const campaignId = campaignInsertResult.insert_campaigns_one?.id;
    if (!campaignId) {
      throw new Error('Failed to insert campaign record');
    }

    const targetLeadIds: Array<{ leadId: string; variables?: Record<string, unknown> }> = [];

    if (Array.isArray(input.leads) && input.leads.length > 0) {
      const phoneNumbers = Array.from(
        new Set(input.leads.map((l) => l.phoneNumber.trim()).filter(Boolean)),
      );

      if (phoneNumbers.length > 0) {
        const existingLeadsData = await queryHasuraAdmin<ExistingLeadsQueryResult>(
          GET_EXISTING_LEADS_QUERY,
          { organizationId, phoneNumbers },
        );

        const leadMap = new Map<string, string>();
        (existingLeadsData.leads || []).forEach((l) => {
          leadMap.set(l.phone_number, l.id);
        });

        const newLeadObjects = input.leads
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

          (insertedResult.insert_leads?.returning || []).forEach((l) => {
            leadMap.set(l.phone_number, l.id);
          });
        }

        input.leads.forEach((l) => {
          const lId = leadMap.get(l.phoneNumber.trim());
          if (lId) {
            targetLeadIds.push({
              leadId: lId,
              variables: {
                name: l.name || null,
                company_name: l.companyName || null,
                email: l.email || null,
                custom_fields: l.customFields || null,
              },
            });
          }
        });
      }
    } else if (Array.isArray(input.leadIds) && input.leadIds.length > 0) {
      input.leadIds.forEach((lId) => {
        targetLeadIds.push({ leadId: lId });
      });
    }

    if (targetLeadIds.length > 0) {
      const campaignLeadsObjects = targetLeadIds.map((item) => ({
        campaign_id: campaignId,
        lead_id: item.leadId,
        variables: item.variables || null,
        status: 'pending',
      }));

      await queryHasuraAdmin(INSERT_CAMPAIGN_LEADS_MUTATION, {
        objects: campaignLeadsObjects,
      });
    }

    res.json({
      success: true,
      campaignId,
      message: 'Campaign draft created successfully',
    });
  } catch (error: unknown) {
    console.error('Error in createCampaign action:', error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Failed to create campaign',
    });
  }
});

actionsRouter.post('/run-campaign', async (req: Request, res: Response) => {
  try {
    const payload = req.body as HasuraActionPayload<RunCampaignInput>;
    const { campaignId, scheduledAt } = payload.input || {};

    if (!campaignId) {
      res.status(400).json({ message: 'campaignId is required' });
      return;
    }

    const campaignData = await queryHasuraAdmin<{
      campaigns_by_pk: {
        id: string;
        name: string;
        status: string;
        organization_id: string;
        zitadel_org_id: string;
        agent_id: string;
        agent: {
          id: string;
          bolna_agent_id: string;
          organization: {
            id: string;
            zitadel_org_id: string;
            bolna_api_key: string | null;
          } | null;
        } | null;
        campaign_leads: Array<{
          id: string;
          lead_id: string;
          variables: Record<string, unknown> | null;
          lead: {
            id: string;
            phone_number: string;
          };
        }>;
      } | null;
    }>(GET_CAMPAIGN_DETAILS_QUERY, { campaignId });

    const campaign = campaignData.campaigns_by_pk;
    if (!campaign) {
      res.status(400).json({ message: `Campaign '${campaignId}' not found` });
      return;
    }

    if (scheduledAt && new Date(scheduledAt).getTime() > Date.now()) {
      await queryHasuraAdmin(UPDATE_CAMPAIGN_STATUS_MUTATION, {
        campaignId,
        changes: {
          status: 'scheduled',
          scheduled_at: new Date(scheduledAt).toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      res.json({
        success: true,
        status: 'scheduled',
        totalPlaced: 0,
        message: `Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      });
      return;
    }

    const bolnaAgentId = campaign.agent?.bolna_agent_id;
    const bolnaApiKey =
      campaign.agent?.organization?.bolna_api_key ?? process.env['BOLNA_API_KEY'];

    if (!bolnaAgentId || !bolnaApiKey) {
      res.status(400).json({
        message: 'Campaign agent is missing Bolna API credentials',
      });
      return;
    }

    await queryHasuraAdmin(UPDATE_CAMPAIGN_STATUS_MUTATION, {
      campaignId,
      changes: {
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    let totalPlaced = 0;
    const campaignLeads = campaign.campaign_leads || [];

    for (const item of campaignLeads) {
      const recipientPhoneNumber = item.lead?.phone_number;
      if (!recipientPhoneNumber) continue;

      try {
        const result = await makeCall({
          recipientPhoneNumber,
          bolnaAgentId,
          bolnaApiKey,
        });

        await queryHasuraAdmin(INSERT_CALL_LOG_MUTATION, {
          object: {
            organization_id: campaign.organization_id,
            zitadel_org_id: campaign.zitadel_org_id,
            agent_id: campaign.agent_id,
            lead_id: item.lead_id,
            campaign_id: campaign.id,
            bolna_agent_id: bolnaAgentId,
            bolna_execution_id: result.executionId,
            recipient_phone_number: recipientPhoneNumber,
            status: 'queued',
          },
        });

        try {
          await updateLeadOnCallPlaced(item.lead_id);
        } catch (lErr) {
          console.error('Error updating lead status:', lErr);
        }

        totalPlaced++;
      } catch (callErr) {
        console.error(`Campaign call failed for ${recipientPhoneNumber}:`, callErr);
      }
    }

    res.json({
      success: true,
      status: 'running',
      totalPlaced,
      message: `Campaign run launched. Placed ${totalPlaced} calls.`,
    });
  } catch (error: unknown) {
    console.error('Error in runCampaign action:', error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Failed to run campaign',
    });
  }
});

actionsRouter.post('/stop-campaign', async (req: Request, res: Response) => {
  try {
    const payload = req.body as HasuraActionPayload<StopCampaignInput>;
    const { campaignId } = payload.input || {};

    if (!campaignId) {
      res.status(400).json({ message: 'campaignId is required' });
      return;
    }

    await queryHasuraAdmin(UPDATE_CAMPAIGN_STATUS_MUTATION, {
      campaignId,
      changes: {
        status: 'stopped',
        stopped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    res.json({
      success: true,
      message: 'Campaign stopped successfully',
    });
  } catch (error: unknown) {
    console.error('Error in stopCampaign action:', error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Failed to stop campaign',
    });
  }
});

type AddCampaignLeadsInput = {
  campaignId: string;
  leads?: CampaignLeadInput[];
  leadIds?: string[];
};

actionsRouter.post('/add-campaign-leads', async (req: Request, res: Response) => {
  try {
    const payload = req.body as HasuraActionPayload<AddCampaignLeadsInput>;
    const { campaignId, leads, leadIds } = payload.input || {};

    if (!campaignId) {
      res.status(400).json({ message: 'campaignId is required' });
      return;
    }

    const campaignData = await queryHasuraAdmin<{
      campaigns_by_pk: {
        id: string;
        organization_id: string;
        zitadel_org_id: string;
      } | null;
    }>(
      `query GetCampaignOrg($campaignId: uuid!) {
        campaigns_by_pk(id: $campaignId) {
          id
          organization_id
          zitadel_org_id
        }
      }`,
      { campaignId },
    );

    const campaign = campaignData.campaigns_by_pk;
    if (!campaign) {
      res.status(400).json({ message: `Campaign '${campaignId}' not found` });
      return;
    }

    const organizationId = campaign.organization_id;
    const zitadelOrgId = campaign.zitadel_org_id;

    const targetLeadIds: Array<{ leadId: string; variables?: Record<string, unknown> }> = [];

    if (Array.isArray(leads) && leads.length > 0) {
      const phoneNumbers = Array.from(
        new Set(leads.map((l) => l.phoneNumber.trim()).filter(Boolean)),
      );

      if (phoneNumbers.length > 0) {
        const existingLeadsData = await queryHasuraAdmin<ExistingLeadsQueryResult>(
          GET_EXISTING_LEADS_QUERY,
          { organizationId, phoneNumbers },
        );

        const leadMap = new Map<string, string>();
        (existingLeadsData.leads || []).forEach((l) => {
          leadMap.set(l.phone_number, l.id);
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

          (insertedResult.insert_leads?.returning || []).forEach((l) => {
            leadMap.set(l.phone_number, l.id);
          });
        }

        leads.forEach((l) => {
          const lId = leadMap.get(l.phoneNumber.trim());
          if (lId) {
            targetLeadIds.push({
              leadId: lId,
              variables: {
                name: l.name || null,
                company_name: l.companyName || null,
                email: l.email || null,
                custom_fields: l.customFields || null,
              },
            });
          }
        });
      }
    } else if (Array.isArray(leadIds) && leadIds.length > 0) {
      leadIds.forEach((lId) => {
        targetLeadIds.push({ leadId: lId });
      });
    }

    let addedCount = 0;
    if (targetLeadIds.length > 0) {
      const campaignLeadsObjects = targetLeadIds.map((item) => ({
        campaign_id: campaignId,
        lead_id: item.leadId,
        variables: item.variables || null,
        status: 'pending',
      }));

      const resInsert = await queryHasuraAdmin<{
        insert_campaign_leads: { affected_rows: number };
      }>(
        `mutation AddCampaignLeadsBulk($objects: [campaign_leads_insert_input!]!) {
          insert_campaign_leads(
            objects: $objects,
            on_conflict: { constraint: uq_campaign_leads_campaign_lead, update_columns: [] }
          ) {
            affected_rows
          }
        }`,
        { objects: campaignLeadsObjects },
      );

      addedCount = resInsert.insert_campaign_leads?.affected_rows ?? 0;
    }

    res.json({
      success: true,
      addedCount,
      message: `Added ${addedCount} lead(s) to campaign`,
    });
  } catch (error: unknown) {
    console.error('Error in addCampaignLeads action:', error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Failed to add leads to campaign',
    });
  }
});

