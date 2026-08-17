import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Table,
  Tag,
  Button,
  Drawer,
  Card,
  Space,
  Tooltip,
  Typography,
  Descriptions,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FiRefreshCw,
  FiFileText,
  FiPhoneCall,
  FiClock,
  FiPlay,
  FiDollarSign,
  FiUser,
} from 'react-icons/fi';
import { getCallLogsDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';

const { Text, Title, Paragraph } = Typography;

export type CallLogRecordType = {
  id: string;
  organization_id: string;
  zitadel_org_id: string;
  agent_id?: string | null;
  bolna_agent_id: string;
  bolna_execution_id: string;
  recipient_phone_number: string;
  agent_phone_number?: string | null;
  call_type?: string | null;
  telephony_provider?: string | null;
  status: string;
  call_status_enum?: {
    id: string;
    label: string;
  } | null;
  hangup_by?: string | null;
  hangup_reason?: string | null;
  duration_seconds?: number | null;
  recording_url?: string | null;
  total_cost?: number | null;
  disposition?: string | null;
  disposition_enum?: {
    id: string;
    label: string;
    description?: string | null;
  } | null;
  summary?: string | null;
  transcript?: string | null;
  extracted_data?: any;
  latency_data?: any;
  raw_response?: any;
  initiated_at?: string | null;
  created_at: string;
  updated_at: string;
  agent?: {
    id: string;
    name: string;
    language_id?: string | null;
  } | null;
};

export const CallLogsPage = () => {
  const { data, loading, error, refetch } = useQuery(getCallLogsDocument, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
  });

  const [selectedRecord, setSelectedRecord] = useState<CallLogRecordType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading && !data) {
    return <QueryLoading />;
  }

  if (error && !data) {
    return <QueryError error={error} />;
  }

  const callLogs: CallLogRecordType[] = (data?.call_logs as CallLogRecordType[]) || [];

  const formatDuration = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusTag = (status: string, statusEnum?: { label: string } | null) => {
    const s = status ? status.toLowerCase().trim() : 'queued';
    const label = statusEnum?.label || status;
    switch (s) {
      case 'queued':
      case 'scheduled':
      case 'rescheduled':
      case 'busy':
        return <Tag color="gold">🟡 {label}</Tag>;
      case 'initiated':
      case 'ringing':
      case 'no_answer':
      case 'no-answer':
        return <Tag color="processing">🔵 {label}</Tag>;
      case 'in-progress':
      case 'in_progress':
        return <Tag color="purple">🟣 {label}</Tag>;
      case 'completed':
        return <Tag color="success">🟢 {label}</Tag>;
      case 'failed':
      case 'cancelled':
      case 'canceled':
      case 'call_disconnected':
      case 'call-disconnected':
      case 'stopped':
      case 'balance_low':
      case 'balance-low':
      case 'error':
        return <Tag color="error">🔴 {label}</Tag>;
      default:
        return <Tag color="default">{label}</Tag>;
    }
  };

  const renderDispositionTag = (record: CallLogRecordType) => {
    if (!record.disposition && !record.disposition_enum) {
      return <Text className="text-muted-foreground text-xs">-</Text>;
    }
    const label = record.disposition_enum?.label || record.disposition || '';
    const norm = (record.disposition_enum?.id || record.disposition || '').toLowerCase().trim();

    let color = 'default';
    if (norm === 'interested' || (norm.includes('interested') && !norm.includes('not'))) {
      color = 'success';
    } else if (norm === 'not_interested' || norm === 'do_not_call' || norm.includes('not interested') || norm.includes('do not call')) {
      color = 'error';
    } else if (norm === 'callback_requested' || norm.includes('callback')) {
      color = 'warning';
    } else if (norm === 'voicemail' || norm === 'no_answer' || norm.includes('voicemail') || norm.includes('no answer')) {
      color = 'cyan';
    }

    const tag = (
      <Tag color={color} className="rounded-full px-2.5 py-0.5 font-medium">
        {label}
      </Tag>
    );

    return record.disposition_enum?.description ? (
      <Tooltip title={record.disposition_enum.description}>{tag}</Tooltip>
    ) : (
      tag
    );
  };

  const columns: ColumnsType<CallLogRecordType> = [
    {
      title: 'Date & Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => <Text className="text-xs sm:text-sm">{formatDate(val)}</Text>,
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient_phone_number',
      key: 'recipient_phone_number',
      render: (phone) => (
        <Space size="small">
          <FiPhoneCall className="text-primary" />
          <Text className="font-medium text-xs sm:text-sm">{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'Agent',
      key: 'agent',
      render: (_, record) => (
        <Space size="small">
          <FiUser className="text-muted-foreground" />
          <Text className="text-xs sm:text-sm">{record.agent?.name || record.bolna_agent_id}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => renderStatusTag(record.status, record.call_status_enum),
    },
    {
      title: 'Duration',
      dataIndex: 'duration_seconds',
      key: 'duration_seconds',
      render: (sec) => (
        <Space size="small">
          <FiClock className="text-muted-foreground text-xs" />
          <Text className="text-xs font-mono">{formatDuration(sec)}</Text>
        </Space>
      ),
    },
    {
      title: 'Disposition',
      key: 'disposition',
      render: (_, record) => renderDispositionTag(record),
    },
    {
      title: 'Audio',
      dataIndex: 'recording_url',
      key: 'recording_url',
      render: (url) =>
        url ? (
          <Button
            type="link"
            size="small"
            icon={<FiPlay className="text-primary" />}
            onClick={() => window.open(url, '_blank')}
          >
            Play Audio
          </Button>
        ) : (
          <Text className="text-muted-foreground text-xs">-</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<FiFileText />}
          onClick={() => {
            setSelectedRecord(record);
            setDrawerOpen(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full p-2 sm:p-4">
      <Card className="bg-card border border-sidebar-border rounded-3xl p-4 sm:p-6 shadow-xl w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Title level={3} className="m-0 text-foreground">
              Call Logs & Recording History
            </Title>
            <Text className="text-muted-foreground text-sm">
              Real-time monitoring of calls, transcripts, audio recordings, and AI disposition tags.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<FiRefreshCw />}
            onClick={() => refetch()}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={callLogs}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="w-full overflow-x-auto"
        />
      </Card>

      {/* Details Drawer */}
      <Drawer
        title={
          <Space>
            <FiFileText />
            <span>Call Execution Details</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRecord(null);
        }}
        open={drawerOpen}
      >
        {selectedRecord && (
          <div className="space-y-6">
            <Descriptions title="Call Summary & Info" bordered column={1} size="small">
              <Descriptions.Item label="Execution ID">
                <Text code copyable={{ text: selectedRecord.bolna_execution_id }}>
                  {selectedRecord.bolna_execution_id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Recipient">
                {selectedRecord.recipient_phone_number}
              </Descriptions.Item>
              <Descriptions.Item label="Agent">
                {selectedRecord.agent?.name || selectedRecord.bolna_agent_id}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {renderStatusTag(selectedRecord.status, selectedRecord.call_status_enum)}
              </Descriptions.Item>
              <Descriptions.Item label="Disposition">
                {renderDispositionTag(selectedRecord)}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {formatDuration(selectedRecord.duration_seconds)}
              </Descriptions.Item>
              <Descriptions.Item label="Hangup Reason">
                {selectedRecord.hangup_reason || '-'} ({selectedRecord.hangup_by || 'System'})
              </Descriptions.Item>
              <Descriptions.Item label="Total Cost">
                ${selectedRecord.total_cost ?? 0}
              </Descriptions.Item>
            </Descriptions>

            {selectedRecord.recording_url && (
              <Card size="small" title="Call Recording" className="bg-surface-2 border-sidebar-border">
                <audio controls src={selectedRecord.recording_url} className="w-full">
                  Your browser does not support audio playback.
                </audio>
              </Card>
            )}

            {selectedRecord.summary && (
              <Card size="small" title="AI Summary" className="bg-surface-2 border-sidebar-border">
                <Paragraph className="m-0 text-sm text-foreground">
                  {selectedRecord.summary}
                </Paragraph>
              </Card>
            )}

            {selectedRecord.transcript && (
              <Card size="small" title="Transcript" className="bg-surface-2 border-sidebar-border">
                <div className="whitespace-pre-wrap font-mono text-xs p-3 bg-background rounded-lg max-h-60 overflow-y-auto">
                  {selectedRecord.transcript}
                </div>
              </Card>
            )}

            {selectedRecord.extracted_data && (
              <Card size="small" title="Extracted Data" className="bg-surface-2 border-sidebar-border">
                <pre className="text-xs font-mono p-3 bg-background rounded-lg max-h-60 overflow-y-auto m-0">
                  {JSON.stringify(selectedRecord.extracted_data, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
