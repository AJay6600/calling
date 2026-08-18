import React, { useRef, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Typography,
  DatePicker,
  Input,
} from 'antd';
import type { InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs, { Dayjs } from 'dayjs';
import {
  FiPhoneCall,
  FiClock,
  FiPlay,
  FiFileText,
  FiUser,
  FiCalendar,
  FiSearch,
} from 'react-icons/fi';
import { CallLogRecordType } from '../utils';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface CallLogsTableProps {
  data: CallLogRecordType[];
  loading: boolean;
  onViewDetails: (record: CallLogRecordType) => void;
}

type TagVisual = {
  label: string;
  colorClass: string;
  dotClass?: string;
  showDot?: boolean;
};

// colorClass drives both text + border color together via Tailwind's arbitrary
// value + important suffix, so it wins over antd's injected Tag styles.
const STATUS_VISUALS: Record<string, TagVisual> = {
  completed: {
    label: 'Completed',
    colorClass: 'text-success! border-success!',
    dotClass: 'bg-success!',
    showDot: true,
  },
  'in-progress': {
    label: 'In Progress',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
    showDot: true,
  },
  in_progress: {
    label: 'In Progress',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
    showDot: true,
  },
  queued: {
    label: 'Queued',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
    showDot: true,
  },
  scheduled: {
    label: 'Scheduled',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
    showDot: true,
  },
  rescheduled: {
    label: 'Rescheduled',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
    showDot: true,
  },
  busy: {
    label: 'Busy',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
    showDot: true,
  },
  initiated: {
    label: 'Initiated',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
    showDot: true,
  },
  ringing: {
    label: 'Ringing',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
    showDot: true,
  },
  'no-answer': {
    label: 'No Answer',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
    showDot: true,
  },
  no_answer: {
    label: 'No Answer',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
    showDot: true,
  },
  failed: {
    label: 'Failed',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  error: {
    label: 'Error',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  cancelled: {
    label: 'Cancelled',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  canceled: {
    label: 'Cancelled',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  'call-disconnected': {
    label: 'Disconnected',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  call_disconnected: {
    label: 'Disconnected',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  stopped: {
    label: 'Stopped',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  'balance-low': {
    label: 'Balance Low',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
  balance_low: {
    label: 'Balance Low',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
    showDot: true,
  },
};

const DISPOSITION_VISUALS: Record<string, TagVisual> = {
  interested: {
    label: 'Interested',
    colorClass: 'text-success! border-success!',
  },
  callback_requested: {
    label: 'Callback',
    colorClass: 'text-info! border-info!',
  },
  callback: { label: 'Callback', colorClass: 'text-info! border-info!' },
  voicemail: { label: 'Voicemail', colorClass: 'text-accent! border-accent!' },
  not_interested: {
    label: 'Not Interested',
    colorClass: 'text-muted-foreground! border-border!',
  },
  do_not_call: {
    label: 'Do Not Call',
    colorClass: 'text-muted-foreground! border-border!',
  },
};

const DEFAULT_STATUS_VISUAL: TagVisual = {
  label: '',
  colorClass: 'text-muted-foreground! border-border!',
  dotClass: 'bg-muted-foreground!',
  showDot: true,
};

const DEFAULT_DISPOSITION_VISUAL: TagVisual = {
  label: '',
  colorClass: 'text-muted-foreground! border-border!',
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return '00:00';
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

const renderStatusTag = (
  status: string,
  statusEnum?: { label: string } | null,
) => {
  const key = (status || 'queued').toLowerCase().trim();
  const visual = STATUS_VISUALS[key] ?? {
    ...DEFAULT_STATUS_VISUAL,
    label: statusEnum?.label || status,
  };
  const label = statusEnum?.label || visual.label;

  return (
    <Tag
      className={`bg-transparent! rounded-full! px-3! py-0.5! text-xs! font-medium! inline-flex! items-center! ${visual.colorClass}`}
    >
      {visual.showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full! inline-block mr-1.5 ${visual.dotClass}`}
        />
      )}
      {label}
    </Tag>
  );
};

const renderDispositionTag = (record: CallLogRecordType) => {
  if (!record.disposition && !record.disposition_enum) {
    return <Text className="text-muted-foreground! text-xs">-</Text>;
  }
  const key = (record.disposition_enum?.id || record.disposition || '')
    .toLowerCase()
    .trim();
  const visual = DISPOSITION_VISUALS[key] ?? {
    ...DEFAULT_DISPOSITION_VISUAL,
    label: record.disposition_enum?.label || record.disposition || '',
  };
  const label = record.disposition_enum?.label || visual.label;

  const tag = (
    <Tag
      className={`bg-transparent! rounded-full! px-3! py-0.5! text-xs! font-medium! ${visual.colorClass}`}
    >
      {label}
    </Tag>
  );

  return record.disposition_enum?.description ? (
    <Tooltip title={record.disposition_enum.description}>{tag}</Tooltip>
  ) : (
    tag
  );
};

// Encodes a [start, end] Dayjs range as a single filter "key" string, since
// antd's onFilter uses OR-logic across multiple selected keys — encoding
// both bounds into one key lets us apply proper AND (>= start && <= end)
// range logic in a single onFilter call instead.
const encodeRange = (start: Dayjs | null, end: Dayjs | null) =>
  `${start ? start.startOf('day').toISOString() : ''}__${
    end ? end.endOf('day').toISOString() : ''
  }`;

const decodeRange = (key: string): [Dayjs | null, Dayjs | null] => {
  const [startIso, endIso] = key.split('__');
  return [startIso ? dayjs(startIso) : null, endIso ? dayjs(endIso) : null];
};

// Custom filter dropdown for the Date & Time column: a RangePicker plus
// Filter / Reset actions, following antd's controlled filterDropdown
// pattern. The [start, end] pair is encoded into a single selectedKeys
// entry (see encodeRange) so onFilter can apply proper range logic.
const DateRangeFilterDropdown: React.FC<FilterDropdownProps> = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
}) => {
  const currentRange: [Dayjs | null, Dayjs | null] = selectedKeys[0]
    ? decodeRange(selectedKeys[0] as string)
    : [null, null];

  const handleChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (!values || (!values[0] && !values[1])) {
      setSelectedKeys([]);
      return;
    }
    setSelectedKeys([encodeRange(values[0], values[1])]);
  };

  return (
    <div
      className="p-3 flex flex-col gap-2"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <RangePicker
        value={currentRange}
        onChange={handleChange}
        allowClear
        className="w-full!"
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button
          size="small"
          onClick={() => {
            clearFilters?.();
            setSelectedKeys([]);
            confirm();
          }}
        >
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => confirm()}
          className="bg-primary! text-primary-foreground! border-primary!"
        >
          Filter
        </Button>
      </div>
    </div>
  );
};

// Generic text-search filter dropdown (antd's standard "column search" pattern):
// an Input box plus Search / Reset actions. `placeholder` is customizable per
// column. Auto-focuses the input on open via `inputRef` + Table's filterDropdown
// `visible`-driven re-mount, matching antd's own recommended approach.
const SearchFilterDropdown: React.FC<
  FilterDropdownProps & { placeholder: string }
> = ({ setSelectedKeys, selectedKeys, confirm, clearFilters, placeholder }) => {
  const inputRef = useRef<InputRef>(null);

  const handleSearch = () => confirm();

  const handleReset = () => {
    clearFilters?.();
    setSelectedKeys([]);
    confirm();
  };

  return (
    <div
      className="p-3 flex flex-col gap-2"
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={selectedKeys[0] as string | undefined}
        onChange={(e) => {
          const val = e.target.value;
          setSelectedKeys(val ? [val] : []);
          // Apply on every keystroke without closing the dropdown, so
          // results update live as the user types.
          confirm({ closeDropdown: false });
        }}
        onPressEnter={handleSearch}
        allowClear
        autoFocus
        className="w-56!"
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleSearch}
          className="bg-primary! text-primary-foreground! border-primary!"
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export const CallLogsTable: React.FC<CallLogsTableProps> = ({
  data,
  loading,
  onViewDetails,
}) => {
  // Build the Agent filter's checkbox list from the agents actually present
  // in this org's call logs, deduped by id (falling back to bolna_agent_id
  // when no linked agent record exists). Keeps the filter list in sync with
  // real data instead of a hardcoded/stale list.
  const agentFilters = useMemo(() => {
    const seen = new Map<string, string>();
    data.forEach((record) => {
      const id = record.agent?.id || record.bolna_agent_id;
      const name = record.agent?.name || record.bolna_agent_id;
      if (id && !seen.has(id)) seen.set(id, name);
    });
    return Array.from(seen.entries())
      .map(([id, name]) => ({ text: name, value: id }))
      .sort((a, b) => a.text.localeCompare(b.text));
  }, [data]);

  const columns: ColumnsType<CallLogRecordType> = [
    {
      title: 'Date & Time',
      dataIndex: 'created_at',
      key: 'created_at',
      filterIcon: (filtered) => (
        <FiCalendar
          size={13}
          className={filtered ? 'text-primary!' : 'text-muted-foreground!'}
        />
      ),
      filterDropdown: (props) => <DateRangeFilterDropdown {...props} />,
      onFilter: (value, record) => {
        if (!record.created_at) return false;
        const [start, end] = decodeRange(value as string);
        const created = dayjs(record.created_at);
        if (start && created.isBefore(start)) return false;
        if (end && created.isAfter(end)) return false;
        return true;
      },
      render: (val) => (
        <Text className="text-xs! sm:text-sm! text-foreground!">
          {formatDate(val)}
        </Text>
      ),
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient_phone_number',
      key: 'recipient_phone_number',
      filterIcon: (filtered) => (
        <FiSearch
          size={13}
          className={filtered ? 'text-primary!' : 'text-muted-foreground!'}
        />
      ),
      filterDropdown: (props) => (
        <SearchFilterDropdown {...props} placeholder="Search phone number" />
      ),
      onFilter: (value, record) =>
        (record.recipient_phone_number || '')
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (phone) => (
        <Space size="small">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-success/10! text-success!">
            <FiPhoneCall size={13} />
          </span>
          <Text className="font-medium text-xs! sm:text-sm! text-foreground!">
            {phone}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Lead Name',
      key: 'lead_name',
      filterIcon: (filtered) => (
        <FiSearch
          size={13}
          className={filtered ? 'text-primary!' : 'text-muted-foreground!'}
        />
      ),
      filterDropdown: (props) => (
        <SearchFilterDropdown {...props} placeholder="Search lead name" />
      ),
      onFilter: (value, record) =>
        (record.lead?.name || '')
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      render: (_, record) => (
        <Text className="text-xs! sm:text-sm! text-foreground! font-medium">
          {record.lead?.name?.trim() || '—'}
        </Text>
      ),
    },
    {
      title: 'Agent',
      key: 'agent',
      filters: agentFilters,
      filterSearch: true,
      onFilter: (value, record) =>
        (record.agent?.id || record.bolna_agent_id) === value,
      render: (_, record) => (
        <Space size="small">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent/10! text-accent!">
            <FiUser size={13} />
          </span>
          <Text className="text-xs! sm:text-sm! text-foreground!">
            {record.agent?.name || record.bolna_agent_id}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) =>
        renderStatusTag(record.status, record.call_status_enum),
    },
    {
      title: 'Duration',
      dataIndex: 'duration_seconds',
      key: 'duration_seconds',
      render: (sec) => (
        <Space size="small">
          <FiClock className="text-muted-foreground!" size={12} />
          <Text className="text-xs! font-mono text-foreground!">
            {formatDuration(sec)}
          </Text>
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
            shape="round"
            size="small"
            icon={<FiPlay size={12} />}
            className="bg-transparent! text-success! border-success!"
            onClick={() => window.open(url, '_blank')}
          >
            Play Audio
          </Button>
        ) : (
          <Text className="text-muted-foreground! text-xs!">-</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          shape="round"
          size="small"
          icon={<FiFileText size={12} />}
          className="bg-transparent! text-foreground! border-border! hover:text-primary! hover:border-primary!"
          onClick={() => onViewDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => (
          <span className="text-muted-foreground!">
            Showing {total} of {total} calls
          </span>
        ),
      }}
      className="w-full overflow-x-auto call-logs-table"
    />
  );
};

export default CallLogsTable;
