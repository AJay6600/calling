import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Button,
  Card,
  Col,
  Modal,
  Progress,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  FiArrowLeft,
  FiDownload,
  FiPlay,
  FiRefreshCw,
  FiSquare,
  FiPhoneCall,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUsers,
  FiSettings,
  FiRepeat,
  FiCalendar,
  FiList,
  FiLayers,
  FiUserPlus,
  FiEdit3,
  FiAlertTriangle,
  FiCreditCard,
} from 'react-icons/fi';
import {
  getCampaignByIdDocument,
  runCampaignDocument,
  stopCampaignDocument,
  getAgentsDocument,
  getLeadsDocument,
  updateCampaignDocument,
  addCampaignLeadsDocument,
} from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import CallLogsTable from '../component/CallLogsTable';
import CampaignExecutionTimeline from '../component/CampaignExecutionTimeline';
import RunCampaignModal from '../component/RunCampaignModal';
import AddLeadsModal from '../component/AddLeadsModal';
import EditCampaignModal, { EditCampaignFormValues } from '../component/EditCampaignModal';
import { SubscriptionRequiredModal } from '../component';
import { CallLogRecordType, LeadRecordType, apiClient } from '../utils';

const { Title, Text } = Typography;

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

export const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isAddLeadsModalOpen, setIsAddLeadsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      .catch((err) => console.error('Error fetching subscription in CampaignDetailPage:', err));
  }, []);

  const isSubPaused =
    activeSub?.status === 'expired' ||
    activeSub?.status === 'exhausted' ||
    (activeSub?.remaining_seconds ?? 1) <= 0;

  const [activeTab, setActiveTab] = useState('call_logs');
  const [callLogsViewMode, setCallLogsViewMode] = useState<'timeline' | 'table'>('timeline');

  const { data, loading, error, refetch } = useQuery(getCampaignByIdDocument, {
    variables: { id: id ?? '' },
    skip: !id,
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
  });

  const { data: agentsData } = useQuery(getAgentsDocument);
  const { data: leadsData } = useQuery(getLeadsDocument);

  const [runCampaign, { loading: runLoading }] = useMutation(runCampaignDocument, {
    onCompleted: () => refetch(),
  });

  const [stopCampaign, { loading: stopLoading }] = useMutation(stopCampaignDocument, {
    onCompleted: () => refetch(),
  });

  const [updateCampaign, { loading: updateLoading }] = useMutation(updateCampaignDocument, {
    onCompleted: () => {
      message.success('Campaign details updated successfully');
      refetch();
      setIsEditModalOpen(false);
    },
  });

  const [addCampaignLeads, { loading: addLeadsLoading }] = useMutation(addCampaignLeadsDocument, {
    onCompleted: () => {
      message.success('Leads added to campaign successfully');
      refetch();
      setIsAddLeadsModalOpen(false);
    },
  });

  if (loading && !data) return <QueryLoading />;
  if (error && !data) return <QueryError error={error} />;

  const campaign = data?.campaigns_by_pk;
  if (!campaign) {
    return (
      <div className="p-6">
        <Card className="bg-card border-sidebar-border text-center py-12">
          <Text type="danger">Campaign not found</Text>
        </Card>
      </div>
    );
  }

  const agentOptions = (agentsData?.agents || []).map((a) => ({
    label: `${a.name} (${a.language_id || 'en'})`,
    value: a.id,
  }));

  const existingLeads = (leadsData?.leads || []) as LeadRecordType[];

  const currentCampaignLeadIds = new Set(
    (campaign.campaign_leads || []).map((cl) => cl.lead_id),
  );

  const callLogs: CallLogRecordType[] =
    (campaign.call_logs as CallLogRecordType[]) || [];

  const campaignLeads = campaign.campaign_leads || [];
  const totalLeads = campaignLeads.length;
  const totalCalls = callLogs.length;

  const completedCalls = callLogs.filter((c) => c.status === 'completed').length;
  const failedCalls = callLogs.filter((c) =>
    ['failed', 'busy', 'no_answer', 'cancelled', 'error'].includes(c.status),
  ).length;
  const inProgressCalls = callLogs.filter((c) =>
    ['queued', 'initiated', 'ringing', 'in_progress'].includes(c.status),
  ).length;

  const progressPercent =
    totalLeads > 0 ? Math.min(100, Math.round((totalCalls / totalLeads) * 100)) : 0;

  const handleStopCampaign = () => {
    Modal.confirm({
      title: 'Stop Campaign',
      content: `Are you sure you want to stop "${campaign.name}"? Remaining queued calls will be halted.`,
      okText: 'Stop Campaign',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await stopCampaign({
            variables: { campaignId: campaign.id },
          });
          if (res.data?.stopCampaign?.success) {
            message.success('Campaign stopped');
          }
        } catch (err: unknown) {
          message.error(err instanceof Error ? err.message : 'Error stopping campaign');
        }
      },
    });
  };

  const handleExecuteRun = async (scheduledAt?: string) => {
    try {
      const res = await runCampaign({
        variables: {
          campaignId: campaign.id,
          scheduledAt: scheduledAt || null,
        },
      });

      if (res.data?.runCampaign?.success) {
        message.success(res.data.runCampaign.message);
        setIsRunModalOpen(false);
      }
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Error launching run');
    }
  };

  const handleExportCsv = () => {
    if (callLogs.length === 0) {
      message.error('No call logs to export for this campaign.');
      return;
    }

    const headers = 'Call Log ID,Lead ID,Phone Number,Status,Duration (sec),Disposition,Created At\n';
    const rows = callLogs
      .map(
        (log) =>
          `"${log.id}","${log.lead_id || ''}","${log.recipient_phone_number}","${log.status}","${log.duration_seconds}","${log.disposition || ''}","${log.created_at}"`,
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${campaign.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewLogDetails = (record: CallLogRecordType) => {
    navigate(`/calls/logs/${record.id}`, { state: { from: location.pathname } });
  };

  const handleEditSubmit = async (values: EditCampaignFormValues) => {
    try {
      await updateCampaign({
        variables: {
          campaignId: campaign.id,
          changes: {
            name: values.name.trim(),
            agent_id: values.agentId,
            auto_retry_enabled: values.autoRetryEnabled,
            auto_retry_conditions: values.autoRetryConditions,
            auto_retry_max_attempts: values.autoRetryMaxAttempts,
            auto_retry_gap_minutes: values.autoRetryGapMinutes,
            calling_window_start: values.callingWindowStart || null,
            calling_window_end: values.callingWindowEnd || null,
            calling_window_timezone: values.callingWindowTimezone || null,
            updated_at: new Date().toISOString(),
          },
        },
      });
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to update campaign');
    }
  };

  const handleAddExistingLeads = async (leadIds: string[]) => {
    try {
      const objects = leadIds.map((lId) => ({
        campaign_id: campaign.id,
        lead_id: lId,
        status: 'pending',
      }));
      await addCampaignLeads({ variables: { objects } });
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to add leads');
    }
  };

  const handleAddCsvLeads = async (parsedLeads: any[]) => {
    try {
      const formatted = parsedLeads.map((l) => ({
        phoneNumber: l.phone_number,
        name: l.name || null,
        email: l.email || null,
        companyName: l.company_name || null,
        customFields: l.custom_fields ? JSON.stringify(l.custom_fields) : null,
      }));

      const res = await fetch('/actions/add-campaign-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            campaignId: campaign.id,
            leads: formatted,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        message.success(data.message || 'Leads added successfully');
        refetch();
        setIsAddLeadsModalOpen(false);
      } else {
        throw new Error(data.message || 'Failed to add leads');
      }
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Error uploading CSV leads');
    }
  };

  const leadColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-muted-foreground!">{index + 1}</span>
      ),
    },
    {
      title: 'Lead Name',
      key: 'name',
      render: (_: unknown, record: any) =>
        record.lead?.id ? (
          <span
            className="font-medium text-foreground! hover:text-primary! cursor-pointer"
            onClick={() => navigate(`/leads/${record.lead.id}`, { state: { from: location.pathname } })}
          >
            {record.lead.name || 'Unnamed Lead'}
          </span>
        ) : (
          <span className="text-foreground! font-medium">
            {record.lead?.name || 'Unnamed Lead'}
          </span>
        ),
    },
    {
      title: 'Phone Number',
      key: 'phone_number',
      render: (_: unknown, record: any) => (
        <span className="font-mono text-foreground!">{record.lead?.phone_number || '-'}</span>
      ),
    },
    {
      title: 'Company',
      key: 'company',
      render: (_: unknown, record: any) => (
        <span className="text-foreground!">{record.lead?.company_name || '-'}</span>
      ),
    },
    {
      title: 'Call Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag className="capitalize">{status || 'pending'}</Tag>,
    },
    {
      title: 'Attempts',
      dataIndex: 'attempts_count',
      key: 'attempts_count',
      width: 110,
      render: (attempts: number) => (
        <Text className="text-foreground! font-medium">
          {attempts ?? 0} / {campaign.auto_retry_max_attempts || 1}
        </Text>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'call_logs',
      label: (
        <span className="flex items-center gap-2">
          <FiPhoneCall /> Call Logs ({totalCalls})
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-sidebar-border">
            <div>
              <span className="text-sm font-bold text-foreground! flex items-center gap-2">
                <FiLayers className="text-primary text-base" />
                {callLogsViewMode === 'timeline'
                  ? 'Campaign Execution Timeline'
                  : 'All Call Records Table'}
              </span>
              <span className="text-xs text-foreground/80! block mt-0.5">
                {callLogsViewMode === 'timeline'
                  ? 'Chronological breakdown grouped by execution run batches'
                  : 'Flat listing of all call records across all execution runs'}
              </span>
            </div>

            <div className="flex items-center bg-card! p-1 rounded-xl border! border-sidebar-border! shadow-inner">
              <button
                type="button"
                onClick={() => setCallLogsViewMode('timeline')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  callLogsViewMode === 'timeline'
                    ? 'bg-primary! text-primary-foreground! shadow-md'
                    : 'bg-transparent text-foreground! hover:bg-secondary! hover:text-primary!'
                }`}
              >
                <FiLayers className="text-sm" /> Timeline View
              </button>
              <button
                type="button"
                onClick={() => setCallLogsViewMode('table')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  callLogsViewMode === 'table'
                    ? 'bg-primary! text-primary-foreground! shadow-md'
                    : 'bg-transparent text-foreground! hover:bg-secondary! hover:text-primary!'
                }`}
              >
                <FiList className="text-sm" /> Table View
              </button>
            </div>
          </div>

          {callLogsViewMode === 'timeline' ? (
            <CampaignExecutionTimeline
              callLogs={callLogs}
              loading={loading}
              onViewDetails={handleViewLogDetails}
            />
          ) : (
            <CallLogsTable
              data={callLogs}
              loading={loading}
              onViewDetails={handleViewLogDetails}
            />
          )}
        </div>
      ),
    },
    {
      key: 'audience_leads',
      label: (
        <span className="flex items-center gap-2">
          <FiUsers /> Audience Leads ({totalLeads})
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-sidebar-border">
            <div>
              <span className="text-sm font-bold text-foreground! flex items-center gap-2">
                <FiUsers className="text-primary text-base" />
                Target Audience Leads ({totalLeads})
              </span>
              <span className="text-xs text-foreground/80! block mt-0.5">
                Leads configured for outbound call delivery in this campaign
              </span>
            </div>

            <Button
              type="primary"
              icon={<FiUserPlus />}
              onClick={() => setIsAddLeadsModalOpen(true)}
              className="bg-primary! text-primary-foreground! border-primary!"
            >
              Add Leads
            </Button>
          </div>

          <Table
            dataSource={campaignLeads}
            columns={leadColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="rounded-xl overflow-hidden border border-sidebar-border"
          />
        </div>
      ),
    },
    {
      key: 'configuration',
      label: (
        <span className="flex items-center gap-2">
          <FiSettings /> Campaign Configuration
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-sidebar-border">
            <span className="text-sm font-bold text-foreground! flex items-center gap-2">
              <FiSettings className="text-primary text-base" />
              Campaign Parameters & Schedule Configuration
            </span>
            <Button
              type="default"
              icon={<FiEdit3 />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Configuration
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card className="bg-card! border! border-sidebar-border! rounded-2xl! h-full">
                <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
                  <FiList className="text-primary" /> General & Audience Info
                </Title>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Lead Source Type:</Text>
                    <Text className="font-semibold text-foreground! capitalize">
                      {campaign.lead_source_type === 'csv' ? 'Uploaded CSV' : 'Existing Database Leads'}
                    </Text>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">AI Voice Agent:</Text>
                    <Text className="font-semibold text-foreground!">
                      {campaign.agent?.name || 'Unassigned'}
                    </Text>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Target Audience Leads:</Text>
                    <Text className="font-semibold text-foreground!">{totalLeads} lead(s)</Text>
                  </div>
                  <div className="flex justify-between py-1">
                    <Text className="text-muted-foreground!">Total Calls Generated:</Text>
                    <Text className="font-semibold text-foreground!">{totalCalls} call(s)</Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="bg-card! border! border-sidebar-border! rounded-2xl! h-full">
                <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
                  <FiRepeat className="text-primary" /> Auto-Retry Configuration
                </Title>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Auto-Retry Enabled:</Text>
                    <Tag color={campaign.auto_retry_enabled ? 'success' : 'default'}>
                      {campaign.auto_retry_enabled ? 'Enabled' : 'Disabled'}
                    </Tag>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Retry Triggers:</Text>
                    <Text className="font-semibold text-foreground! capitalize">
                      {(campaign.auto_retry_conditions || []).join(', ').replace(/_/g, ' ') || 'None'}
                    </Text>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Max Retry Attempts:</Text>
                    <Text className="font-semibold text-foreground!">
                      {campaign.auto_retry_max_attempts || 1} attempt(s)
                    </Text>
                  </div>
                  <div className="flex justify-between py-1">
                    <Text className="text-muted-foreground!">Retry Gap Duration:</Text>
                    <Text className="font-semibold text-foreground!">
                      {campaign.auto_retry_gap_minutes || 15} minutes
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="bg-card! border! border-sidebar-border! rounded-2xl! h-full">
                <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
                  <FiClock className="text-primary" /> Calling Window Settings
                </Title>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Calling Hours Window:</Text>
                    <Text className="font-semibold text-foreground!">
                      {campaign.calling_window_start && campaign.calling_window_end
                        ? `${campaign.calling_window_start} - ${campaign.calling_window_end}`
                        : 'Unrestricted / All Hours'}
                    </Text>
                  </div>
                  <div className="flex justify-between py-1">
                    <Text className="text-muted-foreground!">Target Timezone:</Text>
                    <Text className="font-semibold text-foreground!">
                      {campaign.calling_window_timezone || 'Asia/Kolkata'}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className="bg-card! border! border-sidebar-border! rounded-2xl! h-full">
                <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
                  <FiCalendar className="text-primary" /> Lifecycle & Timestamps
                </Title>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Created At:</Text>
                    <Text className="font-mono text-foreground!">{new Date(campaign.created_at).toLocaleString()}</Text>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Scheduled At:</Text>
                    <Text className="font-mono text-foreground!">
                      {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : 'Not scheduled'}
                    </Text>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sidebar-border">
                    <Text className="text-muted-foreground!">Started At:</Text>
                    <Text className="font-mono text-foreground!">
                      {campaign.started_at ? new Date(campaign.started_at).toLocaleString() : 'Not started'}
                    </Text>
                  </div>
                  <div className="flex justify-between py-1">
                    <Text className="text-muted-foreground!">Ended / Completed At:</Text>
                    <Text className="font-mono text-foreground!">
                      {campaign.completed_at
                        ? new Date(campaign.completed_at).toLocaleString()
                        : campaign.stopped_at
                        ? `${new Date(campaign.stopped_at).toLocaleString()} (Stopped)`
                        : 'In Progress'}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-2 sm:p-4">
      {/* Header Card */}
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
                <span>Upgrade subscription to run campaign calls.</span>
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<FiArrowLeft />}
              onClick={() => navigate('/campaigns')}
              className="text-foreground!"
            />
            <div>
              <div className="flex items-center gap-3">
                <Title level={3} className="m-0! text-foreground!">
                  {campaign.name}
                </Title>
                {getStatusTag(campaign.status)}
              </div>
              <Text className="text-xs text-muted-foreground! block mt-1">
                AI Agent: <span className="font-medium text-foreground!">{campaign.agent?.name || 'Unassigned'}</span> · Created: {new Date(campaign.created_at).toLocaleDateString()}
              </Text>
            </div>
          </div>

          <Space wrap>
            <Button
              type="default"
              icon={<FiEdit3 />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Campaign
            </Button>

            <Button
              type="default"
              icon={<FiRefreshCw />}
              onClick={() => refetch()}
              loading={loading}
            >
              Refresh
            </Button>

            <Button
              type="default"
              icon={<FiDownload />}
              onClick={handleExportCsv}
              disabled={callLogs.length === 0}
            >
              Export Results CSV
            </Button>

            {(campaign.status === 'draft' || campaign.status === 'stopped' || campaign.status === 'completed') && (
              <Button
                type="primary"
                icon={<FiPlay />}
                onClick={() => setIsRunModalOpen(true)}
                className="bg-primary! text-primary-foreground! border-primary!"
              >
                Run Campaign
              </Button>
            )}

            {campaign.status === 'running' && (
              <Button
                danger
                icon={<FiSquare />}
                onClick={handleStopCampaign}
                loading={stopLoading}
              >
                Stop Campaign
              </Button>
            )}
          </Space>
        </div>

        {/* Progress Bar */}
        <div className="pt-3 border-t border-sidebar-border mt-3">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-foreground!">Campaign Outbound Completion</span>
            <span className="font-semibold text-primary! text-xs">
              {totalCalls} / {totalLeads} calls placed ({progressPercent}%)
            </span>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            status={campaign.status === 'running' ? 'active' : undefined}
            strokeColor={{ '0%': 'var(--primary, #10b981)', '100%': '#6366f1' }}
            trailColor="rgba(255, 255, 255, 0.08)"
            className="m-0!"
          />
        </div>
      </Card>

      {/* Live Counter KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Total Audience Leads</Text>
            <div className="text-2xl font-bold text-foreground! mt-1 flex items-center justify-center gap-2">
              <FiPhoneCall className="text-primary text-lg" /> {totalLeads}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Queued / In Progress</Text>
            <div className="text-2xl font-bold text-blue-500! mt-1 flex items-center justify-center gap-2">
              <FiClock className="text-lg" /> {inProgressCalls}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Completed Calls</Text>
            <div className="text-2xl font-bold text-emerald-500! mt-1 flex items-center justify-center gap-2">
              <FiCheckCircle className="text-lg" /> {completedCalls}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Failed / Unreachable</Text>
            <div className="text-2xl font-bold text-rose-500! mt-1 flex items-center justify-center gap-2">
              <FiXCircle className="text-lg" /> {failedCalls}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Comprehensive Campaign Details Tabs */}
      <Card
        className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full"
        bodyStyle={{ padding: 24 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="campaign-details-tabs"
        />
      </Card>

      {/* Modals */}
      {isRunModalOpen && (
        <RunCampaignModal
          open={isRunModalOpen}
          campaignName={campaign.name}
          agentName={campaign.agent?.name || 'Assigned Agent'}
          leadCount={totalLeads}
          loading={runLoading}
          onCancel={() => setIsRunModalOpen(false)}
          onRun={handleExecuteRun}
        />
      )}

      {isAddLeadsModalOpen && (
        <AddLeadsModal
          open={isAddLeadsModalOpen}
          campaignName={campaign.name}
          existingLeads={existingLeads}
          currentCampaignLeadIds={currentCampaignLeadIds}
          loading={addLeadsLoading}
          onCancel={() => setIsAddLeadsModalOpen(false)}
          onAddExistingLeads={handleAddExistingLeads}
          onAddCsvLeads={handleAddCsvLeads}
        />
      )}

      {isEditModalOpen && (
        <EditCampaignModal
          open={isEditModalOpen}
          initialValues={{
            name: campaign.name,
            agentId: campaign.agent?.id || '',
            autoRetryEnabled: campaign.auto_retry_enabled ?? false,
            autoRetryConditions: campaign.auto_retry_conditions || ['busy', 'no_answer'],
            autoRetryMaxAttempts: campaign.auto_retry_max_attempts || 1,
            autoRetryGapMinutes: campaign.auto_retry_gap_minutes || 15,
            callingWindowStart: campaign.calling_window_start || '',
            callingWindowEnd: campaign.calling_window_end || '',
            callingWindowTimezone: campaign.calling_window_timezone || 'Asia/Kolkata',
          }}
          agentOptions={agentOptions}
          loading={updateLoading}
          onCancel={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
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

export default CampaignDetailPage;
