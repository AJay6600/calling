import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button, Card, Typography, message } from 'antd';
import { FiArrowLeft, FiRadio, FiAlertTriangle, FiCreditCard } from 'react-icons/fi';
import {
  getAgentsDocument,
  getLeadsDocument,
  createCampaignDocument,
  getCampaignsDocument,
} from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import CreateCampaignForm, {
  CreateCampaignFormValues,
} from '../forms/CreateCampaignForm';
import {
  OptionsDataType,
  ParsedCsvLead,
  LeadRecordType,
  getLanguageLabel,
  apiClient,
} from '../utils';

const { Title, Text } = Typography;

export const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const [activeSub, setActiveSub] = useState<{
    remaining_seconds: number;
    status: string;
    end_date: string;
  } | null>(null);

  useEffect(() => {
    apiClient
      .get('/api/subscriptions/active')
      .then((res) => {
        if (res.data?.subscription) {
          setActiveSub(res.data.subscription);
        }
      })
      .catch((err) => console.error('Error fetching subscription in CreateCampaignPage:', err));
  }, []);

  const isSubPaused =
    activeSub?.status === 'expired' ||
    activeSub?.status === 'exhausted' ||
    (activeSub?.remaining_seconds ?? 1) <= 0;

  const { data: agentsData, loading: agentsLoading, error: agentsError } =
    useQuery(getAgentsDocument);

  const { data: leadsData, loading: leadsLoading, error: leadsError } =
    useQuery(getLeadsDocument);

  const [createCampaign, { loading: createLoading }] = useMutation(
    createCampaignDocument,
    {
      refetchQueries: [{ query: getCampaignsDocument }],
    },
  );

  if (agentsLoading || leadsLoading) return <QueryLoading />;
  if (agentsError) return <QueryError error={agentsError} />;
  if (leadsError) return <QueryError error={leadsError} />;

  const agentOptions: OptionsDataType[] =
    agentsData && Array.isArray(agentsData.agents) && agentsData.agents.length > 0
      ? agentsData.agents.map((agent) => ({
          label: `${agent.name} · ${getLanguageLabel(agent.language_id)}`,
          value: agent.id,
        }))
      : [];

  const existingLeads: LeadRecordType[] =
    (leadsData?.leads as LeadRecordType[]) || [];

  const handleCreateCampaignSubmit = async (
    values: CreateCampaignFormValues,
    parsedLeads: ParsedCsvLead[],
  ) => {
    try {
      const response = await createCampaign({
        variables: {
          name: values.name.trim(),
          agentId: values.agentId,
          leadSourceType: values.leadSourceType,
          leads:
            values.leadSourceType === 'csv'
              ? parsedLeads.map((l) => ({
                  phoneNumber: l.phoneNumber,
                  name: l.fullName || null,
                  email: l.email || null,
                  companyName: l.companyName || null,
                }))
              : null,
          leadIds:
            values.leadSourceType === 'existing' ? values.selectedLeadIds : null,
          autoRetryEnabled: values.autoRetryEnabled,
          autoRetryConditions: values.autoRetryConditions,
          autoRetryMaxAttempts: values.autoRetryMaxAttempts,
          autoRetryGapMinutes: values.autoRetryGapMinutes,
          callingWindowStart: values.callingWindowEnabled
            ? values.callingWindowStart || null
            : null,
          callingWindowEnd: values.callingWindowEnabled
            ? values.callingWindowEnd || null
            : null,
          callingWindowTimezone: values.callingWindowEnabled
            ? values.callingWindowTimezone || null
            : null,
        },
      });

      const res = response.data?.createCampaign;
      if (res?.success) {
        message.success(res.message || 'Campaign draft created successfully');
        navigate('/campaigns');
      } else {
        message.error(res?.message || 'Failed to create campaign');
      }
    } catch (err: unknown) {
      message.error(
        err instanceof Error ? err.message : 'Error creating campaign',
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full p-2 sm:p-4">
      <Card
        className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full"
        bodyStyle={{ padding: 24 }}
      >
        {isSubPaused && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-rose-300">
              <FiAlertTriangle className="text-rose-400 text-lg shrink-0" />
              <div>
                <strong className="block text-rose-200">Subscription Expired or Balance 0s</strong>
                <span>You can create draft campaigns, but active subscription is required to run them.</span>
              </div>
            </div>
            <Button
              type="primary"
              size="small"
              icon={<FiCreditCard />}
              onClick={() => navigate('/billing')}
              className="bg-rose-500! text-white! border-rose-500! text-xs font-bold"
            >
              Upgrade Plan
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6 border-b border-sidebar-border pb-4">
          <Button
            type="text"
            icon={<FiArrowLeft />}
            onClick={() => navigate('/campaigns')}
            className="text-foreground!"
          />
          <div>
            <Title level={3} className="m-0! text-foreground! flex items-center gap-2">
              <FiRadio className="text-primary" /> Create Outbound Voice Campaign
            </Title>
            <Text className="text-muted-foreground! text-sm!">
              Configure your campaign settings, audience leads, auto-retry logic, and calling window. Saves as Draft.
            </Text>
          </div>
        </div>

        <CreateCampaignForm
          agentOptions={agentOptions}
          existingLeads={existingLeads}
          onSubmit={handleCreateCampaignSubmit}
          loading={createLoading}
        />
      </Card>
    </div>
  );
};

export default CreateCampaignPage;
