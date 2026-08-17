import React, { useMemo } from 'react';
import { Table, Tag, Button, Space, Typography, Empty, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    FiFileText,
    FiPhoneCall,
    FiClock,
    FiPlay,
    FiUser,
    FiChevronRight,
} from 'react-icons/fi';
import { CallLogRecordType } from '../utils';

const { Text, Paragraph } = Typography;

/**
 * CallLogTable — presentational only.
 *
 * Everything this component needs (rows, loading state, callbacks) is handed
 * to it via props. It does not fetch data, filter data, or hold business
 * state — that all lives in the parent page. This component only decides
 * *how* a given set of call logs is rendered: columns, tag colors,
 * formatting, sorting/filtering UI, and the expandable "AI summary" row.
 *
 * Styling is Tailwind only. Structural theming (header bg, row hover,
 * pagination, filter dropdown) comes from the antd ThemeConfig in
 * antd-theme.ts, which the app's ConfigProvider already applies globally —
 * this component doesn't need its own stylesheet.
 */
export interface CallLogTableProps {
    /** Rows to render — already fetched + filtered by the parent page. */
    data: CallLogRecordType[];
    /** Table loading state, driven by the parent's query. */
    loading: boolean;
    /** Called when the user wants to open the full details drawer for a row. */
    onViewDetails: (record: CallLogRecordType) => void;
    /** Rows per page. Defaults to 10. */
    pageSize?: number;
}

// ---------------------------------------------------------------------------
// Presentation helpers — pure formatting, no business logic.
// ---------------------------------------------------------------------------

const formatDuration = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
};

// Semantic color tokens (success/warning/info/destructive/accent) come
// straight from the app's @theme block, so bg-success/10, text-warning,
// border-info/30 etc. are already valid Tailwind utilities — no arbitrary
// emerald-400 / rose-400 style hardcoding needed.
type TagVisual = { label: string; classes: string };

const STATUS_VISUALS: Record<string, TagVisual> = {
    queued: { label: 'Queued', classes: 'bg-warning/10 text-warning border-warning/30' },
    scheduled: { label: 'Scheduled', classes: 'bg-warning/10 text-warning border-warning/30' },
    rescheduled: { label: 'Rescheduled', classes: 'bg-warning/10 text-warning border-warning/30' },
    initiated: { label: 'Initiated', classes: 'bg-info/10 text-info border-info/30' },
    ringing: { label: 'Ringing', classes: 'bg-info/10 text-info border-info/30' },
    'in-progress': { label: 'In Progress', classes: 'bg-accent/10 text-accent border-accent/30' },
    in_progress: { label: 'In Progress', classes: 'bg-accent/10 text-accent border-accent/30' },
    completed: { label: 'Completed', classes: 'bg-success/10 text-success border-success/30' },
    failed: { label: 'Failed', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    cancelled: { label: 'Cancelled', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    canceled: { label: 'Cancelled', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    busy: { label: 'Busy', classes: 'bg-warning/10 text-warning border-warning/30' },
    'no-answer': { label: 'No Answer', classes: 'bg-info/10 text-info border-info/30' },
    no_answer: { label: 'No Answer', classes: 'bg-info/10 text-info border-info/30' },
    'call-disconnected': { label: 'Disconnected', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    call_disconnected: { label: 'Disconnected', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    stopped: { label: 'Stopped', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    'balance-low': { label: 'Balance Low', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    balance_low: { label: 'Balance Low', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
    error: { label: 'Error', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const getStatusVisual = (status: string, statusEnum?: { label: string } | null): TagVisual => {
    const key = (status || 'queued').toLowerCase().trim();
    const visual = STATUS_VISUALS[key] ?? {
        label: statusEnum?.label || status,
        classes: 'bg-muted/40 text-muted-foreground border-border',
    };
    if (statusEnum?.label) {
        return { ...visual, label: statusEnum.label };
    }
    return visual;
};

const getDispositionVisual = (
    disposition?: string | null,
    dispositionEnum?: { id: string; label: string; description?: string | null } | null
): TagVisual | null => {
    if (!disposition && !dispositionEnum) return null;
    const label = dispositionEnum?.label || disposition || '';
    const norm = (dispositionEnum?.id || disposition || '').toLowerCase().trim();

    if (norm === 'interested' || (norm.includes('interested') && !norm.includes('not'))) {
        return { label: label || 'Interested', classes: 'bg-success/10 text-success border-success/30' };
    }
    if (
        norm === 'not_interested' ||
        norm === 'do_not_call' ||
        norm.includes('not interested') ||
        norm.includes('do not call') ||
        norm.includes('rejected')
    ) {
        return { label: label || disposition || '', classes: 'bg-destructive/10 text-destructive border-destructive/30' };
    }
    if (
        norm === 'callback_requested' ||
        norm.includes('callback') ||
        norm.includes('follow') ||
        norm.includes('reschedule')
    ) {
        return { label: label || 'Callback Requested', classes: 'bg-warning/10 text-warning border-warning/30' };
    }
    if (norm === 'voicemail' || norm === 'no_answer' || norm.includes('voicemail') || norm.includes('no answer')) {
        return { label: label || disposition || '', classes: 'bg-info/10 text-info border-info/30' };
    }
    return { label: label || disposition || '', classes: 'bg-accent/10 text-accent border-accent/30' };
};

/** Pill tag — color comes entirely from Tailwind classes tied to theme tokens. */
const ThemedTag: React.FC<{ visual: TagVisual; tooltip?: string | null }> = ({ visual, tooltip }) => {
    const tagContent = (
        <Tag
            bordered
            className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${visual.classes}`}
        >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle" />
            {visual.label}
        </Tag>
    );

    return tooltip ? <Tooltip title={tooltip}>{tagContent}</Tooltip> : tagContent;
};

export const CallLogTable: React.FC<CallLogTableProps> = ({
    data,
    loading,
    onViewDetails,
    pageSize = 10,
}) => {
    // Filter option lists are *derived from the rows already on screen* — this
    // is presentation (what values does antd's filter dropdown offer), not
    // business logic (that lives in the parent's query/search/filter state).
    const statusFilters = useMemo(() => {
        const unique = Array.from(new Set(data.map((d) => (d.status || 'queued').toLowerCase())));
        return unique.map((s) => ({ text: getStatusVisual(s).label, value: s }));
    }, [data]);

    const dispositionFilters = useMemo(() => {
        const unique = Array.from(
            new Set(data.map((d) => d.disposition).filter((d): d is string => !!d))
        );
        return unique.map((d) => ({ text: d, value: d }));
    }, [data]);

    const columns: ColumnsType<CallLogRecordType> = [
        {
            title: 'Date & Time',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            defaultSortOrder: 'descend',
            render: (val) => (
                <Space size={6}>
                    <FiClock className="text-xs text-muted-foreground" />
                    <Text className="text-xs sm:text-sm font-medium text-foreground">{formatDate(val)}</Text>
                </Space>
            ),
        },
        {
            title: 'Recipient',
            dataIndex: 'recipient_phone_number',
            key: 'recipient_phone_number',
            render: (phone) => (
                <Space size={6}>
                    <FiPhoneCall className="text-sm text-primary" />
                    <Text className="text-xs sm:text-sm font-semibold tracking-wide text-foreground">
                        {phone}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Agent',
            key: 'agent',
            render: (_, record) => (
                <Space size={6}>
                    <FiUser className="text-xs text-accent" />
                    <Text className="text-xs sm:text-sm font-medium text-foreground">
                        {record.agent?.name || record.bolna_agent_id}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: statusFilters,
            onFilter: (value, record) => (record.status || 'queued').toLowerCase() === value,
            render: (status, record) => <ThemedTag visual={getStatusVisual(status, record.call_status_enum)} />,
        },
        {
            title: 'Disposition',
            key: 'disposition',
            filters: dispositionFilters,
            onFilter: (value, record) => record.disposition === value || record.disposition_enum?.id === value,
            render: (_, record) => {
                const visual = getDispositionVisual(record.disposition, record.disposition_enum);
                return visual ? (
                    <ThemedTag visual={visual} tooltip={record.disposition_enum?.description} />
                ) : (
                    <Text className="text-xs text-muted-foreground">—</Text>
                );
            },
        },
        {
            title: 'Duration',
            dataIndex: 'duration_seconds',
            key: 'duration_seconds',
            sorter: (a, b) => (a.duration_seconds ?? 0) - (b.duration_seconds ?? 0),
            render: (sec) => (
                <Text className="font-mono text-xs font-medium text-muted-foreground">
                    {formatDuration(sec)}
                </Text>
            ),
        },
        {
            title: 'Recording',
            dataIndex: 'recording_url',
            key: 'recording_url',
            render: (url) =>
                url ? (
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        icon={<FiPlay className="text-primary" />}
                        onClick={() => window.open(url, '_blank')}
                        className="rounded-lg border-primary/40 text-xs text-primary hover:border-primary"
                    >
                        Audio
                    </Button>
                ) : (
                    <Text className="text-xs text-muted-foreground">—</Text>
                ),
        },
        {
            title: '',
            key: 'actions',
            width: 56,
            render: (_, record) => (
                <Tooltip title="View full details">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<FiChevronRight className="text-muted-foreground" />}
                        onClick={() => onViewDetails(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <Table<CallLogRecordType>
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            sticky
            scroll={{ x: 980 }}
            pagination={{ pageSize, showSizeChanger: true, showTotal: (t) => `${t} calls` }}
            onRow={(record) => ({
                onClick: () => onViewDetails(record),
                className: 'cursor-pointer',
            })}
            locale={{
                emptyText: (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<Text className="text-muted-foreground">No calls match your filters</Text>}
                    />
                ),
            }}
            expandable={{
                rowExpandable: (record) => !!record.summary,
                expandIcon: () => null,
                expandedRowRender: (record) => (
                    <div className="flex gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3">
                        <FiFileText className="mt-0.5 shrink-0 text-primary" />
                        <div>
                            <Text className="text-xs font-bold text-primary">AI summary</Text>
                            <Paragraph className="m-0 mt-0.5 text-sm text-foreground">{record.summary}</Paragraph>
                        </div>
                    </div>
                ),
            }}
        />
    );
};

export default CallLogTable;