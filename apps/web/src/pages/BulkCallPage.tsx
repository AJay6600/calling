import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { Card, message, Button } from 'antd';
import { FiAlertTriangle, FiCreditCard } from 'react-icons/fi';
import { getAgentsDocument, placeBulkCallDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import BulkCallForm, { BulkCallFormValues } from '../forms/BulkCallForm';
import { SubscriptionRequiredModal } from '../component';
import { OptionsDataType, ParsedCsvLead, getLanguageLabel, apiClient } from '../utils';

export const BulkCallPage = () => {
  const navigate = useNavigate();
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
      .catch((err) => console.error('Error fetching subscription in BulkCallPage:', err));
  }, []);

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

  const isSubPaused =
    activeSub?.status === 'expired' ||
    activeSub?.status === 'exhausted' ||
    (activeSub?.remaining_seconds ?? 1) <= 0;

  const handlePlaceBulkCall = async (
    values: BulkCallFormValues,
    validLeads: ParsedCsvLead[],
  ) => {
    if (isSubPaused) {
      setSubErrorMessage(
        `Your subscription is ${activeSub?.status || 'exhausted'} with 0 remaining call seconds. Please upgrade to place bulk calls.`,
      );
      setSubModalOpen(true);
      return;
    }

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
      }
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        'An error occurred while placing bulk calls';

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
    }
  };

  return (
    <div className="space-y-6 w-full p-2 sm:p-4">
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full">
        {/* Subscription Warning Banner */}
        {isSubPaused && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-rose-300">
              <FiAlertTriangle className="text-rose-400 text-lg shrink-0" />
              <div>
                <strong className="block text-rose-200">Subscription Expired or Balance 0s</strong>
                <span>Upgrade subscription to place bulk calls.</span>
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

        <BulkCallForm
          agentData={agentData}
          onSubmit={handlePlaceBulkCall}
          loading={mutationLoading}
        />
      </Card>

      <SubscriptionRequiredModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title="Subscription Required for Bulk Calls"
        errorMessage={subErrorMessage || 'Your organization subscription has expired or has 0 remaining call seconds.'}
      />
    </div>
  );
};

export default BulkCallPage;
