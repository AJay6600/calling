import { Card, Col, Row, message } from 'antd';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import {
  getAgentsDocument,
  getLeadsDocument,
  placeSingleCallDocument,
} from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import SingleCallForm, { SingleCallFormValues } from '../forms/SingleCallForm';
import { OptionsDataType, getLanguageLabel } from '../utils';

const formatLeadLabel = (name?: string | null, phoneNumber?: string) => {
  const displayName = name?.trim() || 'Unknown';
  return `${displayName} · ${phoneNumber ?? ''}`;
};

export const SingleCallPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(getAgentsDocument);
  const {
    data: leadsData,
    loading: leadsLoading,
    error: leadsError,
  } = useQuery(getLeadsDocument);
  const [placeSingleCall, { loading: mutationLoading }] = useMutation(
    placeSingleCallDocument,
  );

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

  return (
    <Row className="w-full h-full" justify="center" align="middle">
      <Col span={12}>
        <Card className="bg-card! border border-sidebar-border! rounded-3xl! p-2 sm:p-4 shadow-xl w-full">
          <SingleCallForm
            agentData={agentData}
            leadData={leadData}
            onSubmit={handlePlaceCall}
            loading={mutationLoading}
          />
        </Card>
      </Col>
    </Row>
  );
};
