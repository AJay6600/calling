import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { Card, message } from 'antd';
import { getAgentsDocument, placeBulkCallDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import BulkCallForm, { BulkCallFormValues } from '../forms/BulkCallForm';
import { OptionsDataType, ParsedCsvLead, getLanguageLabel } from '../utils';

export const BulkCallPage = () => {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(getAgentsDocument);

  const [placeBulkCall, { loading: mutationLoading }] = useMutation(
    placeBulkCallDocument,
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

  const handlePlaceBulkCall = async (
    values: BulkCallFormValues,
    validLeads: ParsedCsvLead[],
  ) => {
    try {
      const response = await placeBulkCall({
        variables: {
          agentId: values.agentId,
          leads: validLeads.map((lead) => ({
            phoneNumber: lead.phoneNumber,
            name: lead.fullName || null,
            email: lead.email || null,
            companyName: lead.companyName || null,
          })),
        },
      });

      const result = response.data?.placeBulkCall;
      if (result?.success) {
        const successMsg =
          result.message ||
          `Successfully dispatched ${result.totalPlaced} bulk calls!`;

        message.success(successMsg);

        navigate('/calls/logs', {
          state: {
            bulkCallNotice: successMsg,
            totalPlaced: result.totalPlaced,
          },
        });
      } else {
        const errorMsg = result?.message || 'Failed to place bulk calls';
        message.error(errorMsg);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'An error occurred while placing bulk calls';
      message.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6 w-full p-2 sm:p-4">
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full">
        <BulkCallForm
          agentData={agentData}
          onSubmit={handlePlaceBulkCall}
          loading={mutationLoading}
        />
      </Card>
    </div>
  );
};

export default BulkCallPage;
