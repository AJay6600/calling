// SingleCallPage.tsx
import { useState } from 'react';
import { Card, Col, Row, message } from 'antd';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
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
import {
  getZitadelOrgIdFromProfile,
  getZitadelUserIdFromProfile,
  OptionsDataType,
  getLanguageLabel,
} from '../utils';

const formatLeadLabel = (name?: string | null, phoneNumber?: string) => {
  const displayName = name?.trim() || 'Unknown';
  return `${displayName} · ${phoneNumber ?? ''}`;
};

/**
 * Maps the standalone lead-creation form's values into the shape the
 * insertLead mutation expects. Mirrors LeadsPage's toLeadChanges — if you
 * touch this mapping, update both, or better, move this into a shared
 * utils helper both pages import.
 */
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

  const handlePlaceCall = async (values: SingleCallFormValues) => {
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
        message.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'An error occurred while placing the call';
      message.error(errorMsg);
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
      <Col span={12}>
        <Card className="bg-card! border border-sidebar-border! rounded-3xl! p-2 sm:p-4 shadow-xl w-full">
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
    </Row>
  );
};

export default SingleCallPage;
