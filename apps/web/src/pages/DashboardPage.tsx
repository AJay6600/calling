import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  FiGrid,
  FiPhoneCall,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiDollarSign,
  FiLayers,
  FiPlus,
  FiPlay,
  FiUsers,
  FiCpu,
  FiArrowRight,
  FiPieChart,
} from 'react-icons/fi';
import {
  getCallLogsDocument,
  getCampaignsDocument,
  getAgentsDocument,
  getLeadsDocument,
} from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import { CallLogRecordType } from '../utils';

const { Title, Text } = Typography;

const formatSeconds = (totalSec: number) => {
  if (!totalSec || totalSec <= 0) return '0s';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

export const DashboardPage = () => {
  const navigate = useNavigate();

  const {
    data: callLogsData,
    loading: logsLoading,
    error: logsError,
  } = useQuery(getCallLogsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: campaignsData } = useQuery(getCampaignsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: agentsData } = useQuery(getAgentsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: leadsData } = useQuery(getLeadsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const callLogs = (callLogsData?.call_logs || []) as CallLogRecordType[];
  const campaigns = campaignsData?.campaigns || [];
  const agents = agentsData?.agents || [];
  const leads = leadsData?.leads || [];

  // Metrics
  const totalCalls = callLogs.length;
  const completedCalls = callLogs.filter((c) => c.status === 'completed').length;
  const failedCalls = callLogs.filter((c) =>
    ['failed', 'error', 'cancelled'].includes(c.status),
  ).length;
  const inProgressCalls = callLogs.filter((c) =>
    ['queued', 'initiated', 'ringing', 'in_progress'].includes(c.status),
  ).length;

  const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
  const totalDuration = callLogs.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
  const totalCost = callLogs.reduce((acc, c) => {
    const val = typeof c.total_cost === 'number' ? c.total_cost : parseFloat(c.total_cost as any) || 0;
    return acc + val;
  }, 0);

  const activeCampaigns = campaigns.filter((c) => c.status === 'running');
  const recentCalls = callLogs.slice(0, 5);

  // Disposition Breakdown
  const dispositionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    callLogs.forEach((log) => {
      const disp = log.disposition_enum?.label || log.disposition || 'Unspecified';
      counts[disp] = (counts[disp] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percent: totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [callLogs, totalCalls]);

  if (logsLoading && !callLogsData) return <QueryLoading />;
  if (logsError && !callLogsData) return <QueryError error={logsError} />;

  const recentCallColumns = [
    {
      title: 'Recipient',
      dataIndex: 'recipient_phone_number',
      key: 'recipient_phone_number',
      render: (phone: string, record: any) => (
        <div>
          <span className="font-semibold text-foreground! text-xs block">
            {record.lead?.name || 'Lead'}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground!">{phone}</span>
        </div>
      ),
    },
    {
      title: 'Voice Agent',
      key: 'agent',
      render: (_: unknown, record: any) => (
        <span className="text-xs text-foreground! font-medium">
          {record.agent?.name || 'Agent'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'completed') color = 'success';
        if (['failed', 'error'].includes(status)) color = 'error';
        if (['queued', 'in_progress', 'ringing'].includes(status)) color = 'processing';
        return <Tag color={color} className="capitalize text-[11px]">{status}</Tag>;
      },
    },
    {
      title: 'Disposition',
      key: 'disposition',
      render: (_: unknown, record: any) => {
        const disp = record.disposition_enum?.label || record.disposition;
        return disp ? (
          <Tag color="purple" className="text-[11px] font-medium m-0">{disp}</Tag>
        ) : (
          <span className="text-muted-foreground! text-xs font-mono">-</span>
        );
      },
    },
    {
      title: 'Duration',
      dataIndex: 'duration_seconds',
      key: 'duration_seconds',
      align: 'right' as const,
      render: (sec: number) => (
        <span className="font-mono text-xs text-foreground!">{formatSeconds(sec)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-2 sm:p-4">
      {/* Welcome Banner */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full animate-card-fade-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shadow-inner">
              <FiGrid />
            </div>
            <div>
              <Title level={3} className="m-0! text-foreground!">
                Command Center
              </Title>
              <Text className="text-xs text-muted-foreground! block mt-1">
                Real-time operational summary of outbound voice calls, active campaigns, and agent readiness.
              </Text>
            </div>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => navigate('/campaigns/new')}
              className="bg-primary! text-primary-foreground! border-primary!"
            >
              New Campaign
            </Button>
            <Button
              type="default"
              icon={<FiPhoneCall />}
              onClick={() => navigate('/calls/single')}
            >
              Single Call
            </Button>
          </Space>
        </div>
      </Card>

      {/* Primary KPI Summary Cards */}
      <Row gutter={[16, 16]} className="animate-card-fade-1">
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <Text className="text-xs font-semibold text-muted-foreground! block">Total Calls Placed</Text>
                <div className="text-2xl font-bold text-foreground! mt-1">{totalCalls}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg">
                <FiPhoneCall />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] border-t border-sidebar-border pt-2">
              <span className="text-muted-foreground">Active in Progress:</span>
              <span className="font-bold text-blue-400">{inProgressCalls}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <Text className="text-xs font-semibold text-muted-foreground! block">Success Rate</Text>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{successRate}%</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
                <FiTrendingUp />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] border-t border-sidebar-border pt-2">
              <span className="text-emerald-400 font-medium">{completedCalls} Completed</span>
              <span className="text-rose-400 font-medium">{failedCalls} Failed</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <Text className="text-xs font-semibold text-muted-foreground! block">Total Airtime</Text>
                <div className="text-2xl font-bold text-purple-400 mt-1">{formatSeconds(totalDuration)}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg">
                <FiClock />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground! border-t border-sidebar-border pt-2">
              Avg. Duration: <span className="font-semibold text-foreground!">{completedCalls > 0 ? formatSeconds(Math.round(totalDuration / completedCalls)) : '0s'}</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <Text className="text-xs font-semibold text-muted-foreground! block">Telephony Cost</Text>
                <div className="text-2xl font-bold text-amber-400 mt-1">${totalCost.toFixed(2)}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">
                <FiDollarSign />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground! border-t border-sidebar-border pt-2">
              Active Voice Engine: <span className="font-semibold text-foreground!">Bolna AI</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Middle Section: Outbound Campaigns & Call Dispositions Breakdown */}
      <Row gutter={[16, 16]} align="top" className="animate-card-fade-2">
        <Col xs={24} lg={12}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                <FiLayers className="text-primary" /> Outbound Campaigns Overview ({campaigns.length})
              </Title>
              <Button
                type="link"
                size="small"
                onClick={() => navigate('/campaigns')}
                className="text-xs text-primary p-0 flex items-center gap-1 font-semibold"
              >
                View All <FiArrowRight />
              </Button>
            </div>

            <div className="space-y-3">
              {campaigns.slice(0, 3).map((camp) => {
                const targetLeads = camp.campaign_leads_aggregate?.aggregate?.count || 0;
                const placedCalls = camp.call_logs_aggregate?.aggregate?.count || 0;
                const percent = targetLeads > 0 ? Math.min(100, Math.round((placedCalls / targetLeads) * 100)) : 0;

                let tagColor = 'default';
                if (camp.status === 'running') tagColor = 'success';
                if (camp.status === 'completed') tagColor = 'purple';
                if (camp.status === 'scheduled') tagColor = 'processing';
                if (camp.status === 'stopped') tagColor = 'error';

                return (
                  <div
                    key={camp.id}
                    onClick={() => navigate(`/campaigns/${camp.id}`)}
                    className="p-3 rounded-xl bg-secondary/60! border border-sidebar-border hover:border-primary/50 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Tag color={tagColor} className={`m-0 capitalize ${camp.status === 'running' ? 'animate-pulse' : ''}`}>
                          {camp.status}
                        </Tag>
                        <span className="font-bold text-foreground! text-xs">{camp.name}</span>
                      </div>
                      <Text className="text-xs text-muted-foreground!">
                        Agent: <span className="font-semibold text-foreground!">{camp.agent?.name || 'Unassigned'}</span>
                      </Text>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground!">Outbound Progress:</span>
                      <span className="font-semibold text-primary!">{placedCalls} / {targetLeads} calls ({percent}%)</span>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      status={camp.status === 'running' ? 'active' : undefined}
                      strokeColor={{ '0%': '#10b981', '100%': '#6366f1' }}
                      trailColor="rgba(255, 255, 255, 0.08)"
                      className="m-0!"
                    />
                  </div>
                );
              })}

              {campaigns.length === 0 && (
                <div className="text-center py-6 text-muted-foreground! text-xs space-y-2">
                  <FiLayers className="text-2xl text-muted-foreground mx-auto" />
                  <p className="m-0">No campaigns created yet.</p>
                  <Button
                    type="primary"
                    size="small"
                    icon={<FiPlay />}
                    onClick={() => navigate('/campaigns/new')}
                    className="bg-primary! text-primary-foreground! border-primary! text-xs mt-1"
                  >
                    Create Your First Campaign
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Dedicated Separate Card for Call Dispositions Breakdown with Progress Bars */}
        <Col xs={24} lg={12}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                <FiPieChart className="text-primary" /> Call Dispositions Breakdown
              </Title>
              <Tag color="purple" className="m-0 text-xs font-semibold">
                {totalCalls} Total Calls
              </Tag>
            </div>

            <div className="space-y-3.5 pt-1">
              {dispositionStats.slice(0, 4).map((disp) => (
                <div key={disp.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground!">{disp.label}</span>
                    <div className="flex items-center gap-2">
                      <Tag color="purple" className="m-0 text-[11px] font-semibold py-0 px-1.5">
                        {disp.count} call(s)
                      </Tag>
                      <span className="font-mono text-primary! font-bold text-xs">{disp.percent}%</span>
                    </div>
                  </div>
                  <Progress
                    percent={disp.percent}
                    showInfo={false}
                    strokeColor={{ '0%': '#818cf8', '100%': '#00c391' }}
                    trailColor="rgba(255, 255, 255, 0.08)"
                    className="m-0!"
                  />
                </div>
              ))}

              {dispositionStats.length === 0 && (
                <div className="text-center py-6 text-muted-foreground! text-xs">
                  No call dispositions recorded yet.
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bottom Section: Recent Logs & System Readiness */}
      <Row gutter={[16, 16]} align="top" className="animate-card-fade-3">
        <Col xs={24} lg={16}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                <FiPhoneCall className="text-primary" /> Recent Call Execution Logs
              </Title>
              <Button
                type="link"
                size="small"
                onClick={() => navigate('/calls/logs')}
                className="text-xs text-primary p-0 flex items-center gap-1 font-semibold"
              >
                View Call Logs <FiArrowRight />
              </Button>
            </div>

            <Table
              dataSource={recentCalls}
              columns={recentCallColumns}
              rowKey="id"
              pagination={false}
              size="small"
              className="text-foreground!"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm">
            <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
              <FiCpu className="text-primary" /> System Readiness & Quick Stats
            </Title>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-secondary/50! border border-sidebar-border flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold">
                    <FiUsers />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground! block">Total Audience Contacts</span>
                    <span className="text-[11px] text-muted-foreground!">Leads stored in database</span>
                  </div>
                </div>
                <span className="font-bold text-foreground! text-base">{leads.length}</span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50! border border-sidebar-border flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold">
                    <FiCpu />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground! block">AI Voice Agents Ready</span>
                    <span className="text-[11px] text-muted-foreground!">Configured Bolna Voice Agents</span>
                  </div>
                </div>
                <span className="font-bold text-foreground! text-base">{agents.length}</span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50! border border-sidebar-border flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">
                    <FiLayers />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground! block">Total Outbound Campaigns</span>
                    <span className="text-[11px] text-muted-foreground!">Created across draft, running, done</span>
                  </div>
                </div>
                <span className="font-bold text-foreground! text-base">{campaigns.length}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
