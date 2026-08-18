import React, { useMemo } from 'react';
import { Button, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FiPhone, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { LeadRecordType } from '../utils';

const { Text } = Typography;

type TagVisual = {
  label: string;
  classes: string;
};

const STATUS_VISUALS: Record<string, TagVisual> = {
  new: { label: 'New', classes: 'bg-info/10! text-info! border-info/30' },
  contacting: {
    label: 'In Progress',
    classes: 'bg-warning/10! text-warning! border-warning/30',
  },
  qualified: {
    label: 'Qualified',
    classes: 'bg-success/10! text-success! border-success/30',
  },
  callback_requested: {
    label: 'Callback Requested',
    classes: 'bg-info/10! text-info! border-info/30',
  },
  not_interested: {
    label: 'Not Interested',
    classes: 'bg-muted/40! text-muted-foreground! border-border',
  },
  unreachable: {
    label: 'Unreachable',
    classes: 'bg-accent/10! text-accent! border-accent/30',
  },
  do_not_call: {
    label: 'Do Not Call',
    classes: 'bg-destructive/10! text-destructive! border-destructive/30',
  },
  converted: {
    label: 'Converted',
    classes: 'bg-success/10! text-success! border-success/30',
  },
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
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
  const key = (status || 'new').toLowerCase().trim();
  const visual = STATUS_VISUALS[key] ?? {
    label: statusEnum?.label || status,
    classes: 'bg-muted/40! text-muted-foreground! border-border',
  };
  const label = statusEnum?.label || visual.label;

  return (
    <Tag
      bordered
      className={`whitespace-nowrap rounded-full border px-3 py-0.5 text-xs! font-semibold ${visual.classes}`}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current! align-middle" />
      {label}
    </Tag>
  );
};

interface LeadsTableProps {
  data: LeadRecordType[];
  loading: boolean;
  deletingLeadId?: string | null;
  onView: (record: LeadRecordType) => void;
  onEdit: (record: LeadRecordType) => void;
  onDelete: (record: LeadRecordType) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  data,
  loading,
  deletingLeadId = null,
  onView,
  onEdit,
  onDelete,
}) => {
  const statusFilters = useMemo(() => {
    const seen = new Map<string, string>();
    data.forEach((record) => {
      const id = record.status;
      const label = record.lead_status_enum?.label || record.status;
      if (id && !seen.has(id)) seen.set(id, label);
    });
    return Array.from(seen.entries())
      .map(([value, text]) => ({ text, value }))
      .sort((a, b) => a.text.localeCompare(b.text));
  }, [data]);

  const columns: ColumnsType<LeadRecordType> = [
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: 170,
      fixed: 'left',
      render: (phone) => (
        <Space size={6}>
          <FiPhone className="shrink-0 text-success!" size={13} />
          <Text className="whitespace-nowrap text-xs! text-foreground! font-semibold tracking-wide sm:text-sm!">
            {phone}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      ellipsis: true,
      render: (name) => (
        <Text className="text-xs! sm:text-sm! text-foreground! ">
          {name?.trim() || '—'}
        </Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      ellipsis: true,
      render: (email) =>
        email ? (
          <Tooltip title={email}>
            <Text className="block truncate text-xs! sm:text-sm! text-foreground! ">
              {email}
            </Text>
          </Tooltip>
        ) : (
          <Text className="text-xs! text-muted-foreground! sm:text-sm!">—</Text>
        ),
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 140,
      ellipsis: true,
      render: (company) => (
        <Text className="text-xs! sm:text-sm! text-foreground!">
          {company?.trim() || '—'}
        </Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      filters: statusFilters,
      onFilter: (value, record) => record.status === value,
      render: (_, record) =>
        renderStatusTag(record.status, record.lead_status_enum),
    },
    {
      title: 'Total Calls',
      dataIndex: 'total_calls_count',
      key: 'total_calls_count',
      width: 100,
      align: 'center',
      render: (count) => (
        <Text className="font-mono text-xs! font-medium sm:text-sm! text-foreground! ">
          {count ?? 0}
        </Text>
      ),
    },
    {
      title: 'Last Call',
      dataIndex: 'last_call_at',
      key: 'last_call_at',
      width: 180,
      render: (val) => (
        <Text className="whitespace-nowrap text-xs! sm:text-sm! text-foreground! ">
          {formatDate(val)}
        </Text>
      ),
    },
    // {
    //   title: 'Created',
    //   dataIndex: 'created_at',
    //   key: 'created_at',
    //   width: 180,
    //   render: (val) => (
    //     <Text className="whitespace-nowrap text-xs! text-foreground!  sm:text-sm!">
    //       {formatDate(val)}
    //     </Text>
    //   ),
    // },
    {
      title: 'Actions',
      key: 'actions',
      width: 170,
      fixed: 'right',
      render: (_, record) => (
        <Space size={8} className="whitespace-nowrap">
          <Button
            shape="round"
            size="small"
            icon={<FiEdit2 size={12} />}
            className="border-border! bg-transparent! text-foreground! hover:border-primary! hover:text-primary!"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(record);
            }}
          />

          <Button
            shape="round"
            size="small"
            danger
            icon={<FiTrash2 size={12} />}
            loading={deletingLeadId === record.id}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      sticky
      scroll={{ x: 1250 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => (
          <span className="text-muted-foreground!">
            Showing {total} lead{total === 1 ? '' : 's'}
          </span>
        ),
      }}
      className="leads-table w-full"
      onRow={(record) => {
        const hasCalls = (record.total_calls_count ?? 0) > 0;
        return {
          onClick: () => {
            if (hasCalls) {
              onView(record);
            }
          },
          className: hasCalls ? 'cursor-pointer' : 'cursor-default',
        };
      }}
    />
  );
};

export default LeadsTable;
