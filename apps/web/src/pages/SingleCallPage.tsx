import { Card, Col, Row, message } from 'antd';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { getAgentsDocument, placeSingleCallDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import SingleCallForm, { SingleCallFormValues } from '../forms/SingleCallForm';
import { OptionsDataType, getLanguageLabel } from '../utils';

export const SingleCallPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(getAgentsDocument);
  const [placeSingleCall, { loading: mutationLoading }] = useMutation(
    placeSingleCallDocument,
  );

  if (loading) {
    return <QueryLoading />;
  }

  if (error) {
    return <QueryError error={error} />;
  }

  const agentData: OptionsDataType[] =
    data && Array.isArray(data.agents) && data.agents.length > 0
      ? data.agents.map((agent) => ({
          label: `${agent.name} · ${getLanguageLabel(agent.language_id)}`,
          value: agent.id,
        }))
      : [];

  const handlePlaceCall = async (values: SingleCallFormValues) => {
    try {
      const response = await placeSingleCall({
        variables: {
          agentId: values.agentId,
          receiverPhoneNumber: values.receiverPhoneNumber,
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
    } catch (err: any) {
      const errorMsg =
        err?.message || 'An error occurred while placing the call';
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
            onSubmit={handlePlaceCall}
            loading={mutationLoading}
          />
        </Card>
      </Col>
    </Row>
  );
};
