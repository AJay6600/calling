import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Button,
  Card,
  Modal,
  Progress,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  FiPlus,
  FiPlay,
  FiSquare,
  FiTrash2,
  FiEye,
  FiRadio,
  FiRefreshCw,
  FiAlertTriangle,
  FiCreditCard,
} from 'react-icons/fi';
import {
  getCampaignsDocument,
  runCampaignDocument,
  stopCampaignDocument,
  deleteCampaignDocument,
} from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import RunCampaignModal from '../component/RunCampaignModal';
import { SubscriptionRequiredModal } from '../component';
import { apiClient } from '../utils';

const { Title, Text } = Typography;

export type CampaignRecordType = {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'stopped';
  lead_source_type: string;
  auto_retry_enabled: boolean;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  stopped_at?: string | null;
  created_at: string;
  agent?: {
    id: string;
    name: string;
  } | null;
  campaign_leads_aggregate?: {
    aggregate?: {
      count: number;
    };
  };
  call_logs_aggregate?: {
    aggregate?: {
      count: number;
    };
  };
};

const getStatusTag = (status: string) => {
  switch (status) {
    case 'draft':
      return <Tag color="default">Draft</Tag>;
    case 'scheduled':
      return <Tag color="processing">Scheduled</Tag>;
    case 'running':
      return <Tag color="success" className="animate-pulse">Running</Tag>;
    case 'completed':
      return <Tag color="purple">Completed</Tag>;
    case 'stopped':
      return <Tag color="error">Stopped</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

export const CampaignsPage = () => {
  const navigate = useNavigate();
  const [selectedCampaignForRun, setSelectedCampaignForRun] = useState<CampaignRecordType | null>(null);
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
      .catch((err) => console.error('Error fetching subscription in CampaignsPage:', err));
  }, []);

  const isSubPaused =
    activeSub?.status === 'expired' ||
    activeSub?.status === 'exhausted' ||
    (activeSub?.remaining_seconds ?? 1) <= 0;

  const { data, loading, error, refetch } = useQuery(getCampaignsDocument, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
  });

  const [runCampaign, { loading: runLoading }] = useMutation(runCampaignDocument, {
    onCompleted: () => refetch(),
  });

  const [stopCampaign, { loading: stopLoading }] = useMutation(stopCampaignDocument, {
    onCompleted: () => refetch(),
  });

  const [deleteCampaign] = useMutation(deleteCampaignDocument, {
    onCompleted: () => refetch(),
  });

  if (loading && !data) return <QueryLoading />;
  if (error && !data) return <QueryError error={error} />;

  const campaigns: CampaignRecordType[] =
    (data?.campaigns as CampaignRecordType[]) || [];

  const handleOpenRunModal = (campaign: CampaignRecordType) => {
    if (isSubPaused) {
      setSubErrorMessage(
        `Your subscription is ${activeSub?.status || 'exhausted'} with 0 remaining call seconds. Please upgrade to run campaigns.`,
      );
      setSubModalOpen(true);
      return;
    }
    setSelectedCampaignForRun(campaign);
  };

  const handleCloseRunModal = () => {
    setSelectedCampaignForRun(null);
  };

  const handleExecuteRun = async (scheduledAt?: string) => {
    if (!selectedCampaignForRun) return;

    if (isSubPaused) {
      setSubErrorMessage(
        `Your subscription is ${activeSub?.status || 'exhausted'} with 0 remaining call seconds. Please upgrade to run campaigns.`,
      );
      setSubModalOpen(true);
      return;
    }

    try {
      const response = await runCampaign({
        variables: {
          campaignId: selectedCampaignForRun.id,
          scheduledAt: scheduledAt || null,
        },
      });

      const res = response.data?.runCampaign;
      if (res?.success) {
        message.success(res.message);
        handleCloseRunModal();
        navigate(`/campaigns/${selectedCampaignForRun.id}`);
      } else {
        const errorMsg = res?.message || 'Failed to run campaign';
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
      const errorMsg = err?.message || 'Error executing run';
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
  };

  const handleStopCampaign = (campaign: CampaignRecordType) => {
    Modal.confirm({
      title: 'Stop Campaign',
      content: `Are you sure you want to stop campaign "${campaign.name}"? This is a terminal action and remaining calls will be halted.`,
      okText: 'Stop Campaign',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await stopCampaign({
            variables: { campaignId: campaign.id },
          });
          if (res.data?.stopCampaign?.success) {
            message.success('Campaign stopped successfully');
          }
        } catch (err: unknown) {
          message.error(err instanceof Error ? err.message : 'Failed to stop campaign');
        }
      },
    });
  };

  const handleDeleteCampaign = (campaign: CampaignRecordType) => {
    if (campaign.status === 'running') {
      message.error('Cannot delete a running campaign. Please stop it first.');
      return;
    }

    Modal.confirm({
      title: 'Delete Campaign',
      content: `Are you sure you want to delete campaign "${campaign.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteCampaign({
            variables: { id: campaign.id },
          });
          message.success('Campaign deleted successfully');
        } catch (err: unknown) {
          message.error(err instanceof Error ? err.message : 'Failed to delete campaign');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name',
      width: '26%',
      render: (name: string, record: CampaignRecordType) => (
        <div>
          <span
            className="font-semibold text-foreground cursor-pointer hover:text-primary block text-sm"
            onClick={() => navigate(`/campaigns/${record.id}`)}
          >
            {name}
          </span>
          <div className="text-xs text-muted-foreground mt-0.5">
            Created: {new Date(record.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'AI Agent',
      key: 'agent',
      width: '24%',
      render: (_: unknown, record: CampaignRecordType) =>
        record.agent?.name ? (
          <span className="text-foreground! font-medium">{record.agent.name}</span>
        ) : (
          <span className="text-muted-foreground! italic font-normal">Unassigned</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '14%',
      align: 'center' as const,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: '22%',
      render: (_: unknown, record: CampaignRecordType) => {
        const total = record.campaign_leads_aggregate?.aggregate?.count ?? 0;
        const placed = record.call_logs_aggregate?.aggregate?.count ?? 0;
        const percent = total > 0 ? Math.min(100, Math.round((placed / total) * 100)) : 0;
        return (
          <div className="w-full pr-2">
            <Progress percent={percent} size="small" status={record.status === 'running' ? 'active' : undefined} />
            <span className="text-xs text-muted-foreground">
              {placed} / {total} calls
            </span>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '14%',
      align: 'right' as const,
      render: (_: unknown, record: CampaignRecordType) => (
        <Space size="small" className="justify-end">
          <Button
            type="default"
            size="small"
            icon={<FiEye className="text-primary!" />}
            onClick={() => navigate(`/campaigns/${record.id}`)}
            title="View Details & Progress"
            className="bg-surface-2! text-foreground! border-sidebar-border! hover:border-primary! hover:text-primary!"
          >
            View
          </Button>

          {(record.status === 'draft' || record.status === 'stopped' || record.status === 'completed') && (
            <Button
              type="primary"
              size="small"
              icon={<FiPlay />}
              onClick={() => handleOpenRunModal(record)}
              className="bg-primary! text-primary-foreground! border-primary!"
            >
              Run
            </Button>
          )}

          {record.status === 'running' && (
            <Button
              type="default"
              danger
              size="small"
              icon={<FiSquare />}
              onClick={() => handleStopCampaign(record)}
              title="Stop Campaign"
            >
              Stop
            </Button>
          )}

          {record.status !== 'running' && (
            <Button
              type="text"
              danger
              size="small"
              icon={<FiTrash2 className="text-destructive!" />}
              onClick={() => handleDeleteCampaign(record)}
              title="Delete Campaign"
              className="text-destructive! hover:text-rose-400!"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full p-2 sm:p-4">
      {/* Subscription Warning Banner */}
      {isSubPaused && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-rose-300">
            <FiAlertTriangle className="text-rose-400 text-lg shrink-0" />
            <div>
              <strong className="block text-rose-200">Subscription Expired or Balance 0s</strong>
              <span>Upgrade subscription to run campaigns or dispatch calls.</span>
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

      <div className="flex justify-end items-center gap-3">
        <Button
          type="default"
          icon={<FiRefreshCw />}
          onClick={() => refetch()}
          loading={loading}
        >
          Refresh
        </Button>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => navigate('/campaigns/new')}
          className="bg-primary! text-primary-foreground! border-primary!"
        >
          Create Campaign
        </Button>
      </div>

      <Table
        dataSource={campaigns}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        loading={loading}
        className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-xl overflow-hidden"
      />

      {selectedCampaignForRun && (
        <RunCampaignModal
          open={!!selectedCampaignForRun}
          campaignName={selectedCampaignForRun.name}
          agentName={selectedCampaignForRun.agent?.name || 'Assigned Agent'}
          leadCount={selectedCampaignForRun.campaign_leads_aggregate?.aggregate?.count ?? 0}
          loading={runLoading}
          onCancel={handleCloseRunModal}
          onRun={handleExecuteRun}
        />
      )}

      <SubscriptionRequiredModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title="Subscription Required to Run Campaign"
        errorMessage={subErrorMessage || 'Your organization subscription has expired or has 0 remaining call seconds.'}
      />
    </div>
  );
};

export default CampaignsPage;
