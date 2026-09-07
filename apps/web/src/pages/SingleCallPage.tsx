import { useState, useEffect } from 'react';
import { Card, Col, Row, message, Tag, Button } from 'antd';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { FiAlertTriangle, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import {
  getAgentsDocument,
  getLeadsDocument,
  getOrganizationWithUserDocument,
  insertLeadDocument,
  placeSingleCallDocument,
  Lead_Status_Enum_Enum,
} from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import SingleCallForm, { SingleCallFormValues } from '../forms/SingleCallForm';
import LeadForm, { LeadFormValues } from '../forms/LeadForm';
import { SubscriptionRequiredModal } from '../component';
import {
  getZitadelOrgIdFromProfile,
  getZitadelUserIdFromProfile,
  OptionsDataType,
  getLanguageLabel,
  apiClient,
} from '../utils';

const formatLeadLabel = (name?: string | null, phoneNumber?: string) => {
  const displayName = name?.trim() || 'Unknown';
  return `${displayName} · ${phoneNumber ?? ''}`;
};

const toLeadChanges = (values: LeadFormValues) => ({
  phone_number: values.phoneNumber,
  name: values.fullName.trim() || null,
  email: values.email.trim() || null,
  company_name: values.companyName.trim() || null,
  status: (values.status || 'new') as Lead_Status_Enum_Enum,
});

export const SingleCallPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [pendingLeadId, setPendingLeadId] = useState<string | undefined>();
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subErrorMessage, setSubErrorMessage] = useState('');
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
      .catch((err) => console.error('Error fetching subscription in SingleCallPage:', err));
  }, []);

  const zitadelOrgId = getZitadelOrgIdFromProfile(auth.user?.profile);
  const zitadelUserId = getZitadelUserIdFromProfile(auth.user?.profile);

  const { data: orgData } = useQuery(getOrganizationWithUserDocument, {
    variables: {
      zitadel_org_id: zitadelOrgId ?? '',
      zitadel_user_id: zitadelUserId ?? '',
    },
    skip: zitadelOrgId === undefined || zitadelUserId === undefined,
    fetchPolicy: 'cache-only',
  });

  const { data, loading, error } = useQuery(getAgentsDocument);

  const {
    data: leadsData,
    loading: leadsLoading,
    error: leadsError,
  } = useQuery(getLeadsDocument);

  const [placeSingleCall, { loading: mutationLoading }] = useMutation(
    placeSingleCallDocument,
  );

  const [insertLead, { loading: insertLeadLoading }] = useMutation(
    insertLeadDocument,
    {
      refetchQueries: [{ query: getLeadsDocument }],
      awaitRefetchQueries: true,
    },
  );

  const organization = orgData?.organizations?.[0];

  if (loading || leadsLoading) {
    return <QueryLoading />;
  }

  if (error) {
    return <QueryError error={error} />;
  }

  if (leadsError) {
    return <QueryError error={leadsError} />;
  }

  const agentData: OptionsDataType[] =
    data && Array.isArray(data.agents) && data.agents.length > 0
      ? data.agents.map((agent) => ({
          label: `${agent.name} · ${getLanguageLabel(agent.language_id)}`,
          value: agent.id,
        }))
      : [];

  const leadData: OptionsDataType[] =
    leadsData && Array.isArray(leadsData.leads) && leadsData.leads.length > 0
      ? leadsData.leads.map((lead) => ({
          label: formatLeadLabel(lead.name, lead.phone_number),
          value: lead.id,
        }))
      : [];

  const isSubPaused =
    activeSub?.status === 'expired' ||
    activeSub?.status === 'exhausted' ||
    (activeSub?.remaining_seconds ?? 1) <= 0;

  const handlePlaceCall = async (values: SingleCallFormValues) => {
    if (isSubPaused) {
      setSubErrorMessage(
        `Your subscription is ${activeSub?.status || 'exhausted'} with 0 remaining call seconds. Please upgrade to place calls.`,
      );
      setSubModalOpen(true);
      return;
    }

    try {
      const response = await placeSingleCall({
        variables: {
          agentId: values.agentId,
          leadId: values.leadId,
        },
      });

      const result = response.data?.placeSingleCall;
      if (result?.success) {
        message.success(result.message || 'Call placed successfully');
        navigate('/calls/logs');
      } else {
        const errorMsg = result?.message || 'Failed to place call';
        if (
          errorMsg.toLowerCase().includes('subscription') ||
          errorMsg.toLowerCase().includes('expired') ||
          errorMsg.toLowerCase().includes('second')
        ) {
          setSubErrorMessage(errorMsg);
          setSubModalOpen(true);
        } else {
          message.error(errorMsg);
        }
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        'An error occurred while placing the call';

      if (
        errorMsg.toLowerCase().includes('subscription') ||
        errorMsg.toLowerCase().includes('expired') ||
        errorMsg.toLowerCase().includes('second') ||
        err?.response?.status === 402
      ) {
        setSubErrorMessage(errorMsg);
        setSubModalOpen(true);
      } else {
        message.error(errorMsg);
      }
      throw err;
    }
  };

  const handleOpenLeadForm = () => setIsLeadFormOpen(true);

  const handleCloseLeadForm = () => setIsLeadFormOpen(false);

  const handleCreateLead = async (values: LeadFormValues) => {
    if (!organization) {
      message.error('Organization context is missing. Please sign in again.');
      throw new Error('Organization context is missing');
    }

    try {
      const response = await insertLead({
        variables: {
          object: {
            organization_id: organization.id,
            zitadel_org_id: organization.zitadel_org_id,
            ...toLeadChanges(values),
          },
        },
      });

      const newLeadId = response.data?.insert_leads_one?.id;

      message.success('Lead created successfully');
      setIsLeadFormOpen(false);
      setPendingLeadId(newLeadId);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to create lead';
      message.error(errorMsg);
      throw err;
    }
  };

  return (
    <Row className="w-full h-full" justify="center" align="middle">
      <Col span={14}>
        <Card className="bg-card! border border-sidebar-border! rounded-3xl! p-2 sm:p-4 shadow-xl w-full">
          {/* Subscription Warning Banner */}
          {isSubPaused && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-rose-300">
                <FiAlertTriangle className="text-rose-400 text-lg shrink-0" />
                <div>
                  <strong className="block text-rose-200">Subscription Expired or Balance 0s</strong>
                  <span>Upgrade subscription to resume single calls.</span>
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

          <SingleCallForm
            agentData={agentData}
            leadData={leadData}
            onSubmit={handlePlaceCall}
            onAddLeadClick={handleOpenLeadForm}
            loading={mutationLoading}
          />
        </Card>
      </Col>

      <LeadForm
        open={isLeadFormOpen}
        mode="create"
        statusOptions={[]}
        loading={insertLeadLoading}
        onCancel={handleCloseLeadForm}
        onSubmit={handleCreateLead}
      />

      <SubscriptionRequiredModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title="Subscription Required to Place Calls"
        errorMessage={subErrorMessage || 'Your organization subscription has expired or has 0 remaining call seconds.'}
      />
    </Row>
  );
};

export default SingleCallPage;
