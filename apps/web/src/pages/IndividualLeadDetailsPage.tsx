import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Button, Card, Empty, Result, Tag, Typography } from 'antd';
import {
  FiArrowLeft,
  FiPhone,
  FiPhoneCall,
  FiPhoneOff,
  FiUser,
  FiBriefcase,
  FiMail,
} from 'react-icons/fi';
import { getLeadByIdDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import CallLogDetailView from '../component/CallLogDetailView';
import { CallLogRecordType, LeadRecordType } from '../utils';
import { useSetPageHeader } from '../contexts/PageHeaderContext';

const { Text, Title } = Typography;

const panelCardClass =
  'bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl';

const COMPLETED_STATUS_KEY = 'completed';

const TIMELINE_DOT_SIZE_PX = 44;

const TIMELINE_CONTENT_GAP_PX = 20;

/**
 * Minimum vertical space a single timeline row is allowed to shrink to.
 * Rows grow with flex-basis:auto + flex-grow to fill extra height, but
 * never shrink below this, so a long call list scrolls instead of
 * squishing the dots and text together.
 */
const TIMELINE_ROW_MIN_HEIGHT_PX = 76;

const formatCallDate = (dateStr?: string | null) => {
  if (!dateStr) return { date: '—', time: '' };

  try {
    const d = new Date(dateStr);

    return {
      date: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  } catch {
    return { date: dateStr, time: '' };
  }
};

const toCallLogRecord = (log: {
  total_cost?: unknown;
  [key: string]: unknown;
}): CallLogRecordType =>
  ({
    ...log,
    total_cost: log.total_cost != null ? Number(log.total_cost) : null,
  }) as CallLogRecordType;

const getStatusColor = (status: string) => {
  const key = status.toLowerCase();

  if (key === 'completed') return 'success';

  if (['in_progress', 'in-progress', 'ringing', 'initiated'].includes(key)) {
    return 'processing';
  }

  if (
    ['failed', 'error', 'cancelled', 'canceled', 'call_disconnected'].includes(
      key,
    )
  ) {
    return 'error';
  }

  if (['busy', 'no_answer', 'queued', 'scheduled'].includes(key)) {
    return 'warning';
  }

  return 'default';
};

const isCallCompleted = (status: string) => {
  const normalizedStatus = (status || '').toLowerCase().trim();

  return normalizedStatus === COMPLETED_STATUS_KEY;
};

const getTimelineDotIcon = (status: string) => {
  const completed = isCallCompleted(status);

  if (completed) return <FiPhoneCall size={18} />;

  return <FiPhoneOff size={18} />;
};

const getTimelineDotClasses = (status: string) => {
  const completed = isCallCompleted(status);

  if (completed) return 'border-success! text-success!';

  return 'border-destructive! text-destructive!';
};

interface CallTimelineDotProps {
  status: string;
}

/**
 * Circular icon badge for a single timeline entry. bg-card! keeps it
 * opaque against the connecting line drawn behind it in the same column.
 */
const CallTimelineDot: React.FC<CallTimelineDotProps> = ({ status }) => {
  const dotClasses = getTimelineDotClasses(status);

  const dotIcon = getTimelineDotIcon(status);

  return (
    <span
      className={`relative z-10 flex shrink-0 items-center justify-center rounded-full! border! bg-card! ${dotClasses}`}
      style={{
        width: TIMELINE_DOT_SIZE_PX,
        height: TIMELINE_DOT_SIZE_PX,
        boxSizing: 'border-box',
      }}
    >
      {dotIcon}
    </span>
  );
};

interface CallTimelineRowProps {
  call: CallLogRecordType;
  index: number;
  totalCalls: number;
  isLast: boolean;
  isSelected: boolean;
  onSelect: (callId: string) => void;
}

/**
 * Single row of the call history timeline. Uses an antd Button (type
 * "text") instead of a raw <button>, so it inherits antd's focus ring,
 * hover state, and sizing behavior instead of unstyled native button
 * defaults.
 *
 * The text block is pinned to a fixed height equal to the dot size and
 * top-aligned within the row (not centered across the full, flex-grown
 * row height). This keeps the date/call-number text vertically aligned
 * with the dot regardless of how much extra height the row stretches to
 * fill the card.
 */
const CallTimelineRow: React.FC<CallTimelineRowProps> = ({
  call,
  index,
  totalCalls,
  isLast,
  isSelected,
  onSelect,
}) => {
  const { date, time } = formatCallDate(call.created_at);

  const callNumber = totalCalls - index;

  const handleClick = () => onSelect(call.id);

  const dateTextClasses = isSelected ? 'text-success!' : 'text-foreground!';

  return (
    <div
      className="flex w-full"
      style={{
        flex: `1 1 ${TIMELINE_ROW_MIN_HEIGHT_PX}px`,
        minHeight: TIMELINE_ROW_MIN_HEIGHT_PX,
      }}
    >
      <div
        className="flex shrink-0 flex-col items-center"
        style={{ width: TIMELINE_DOT_SIZE_PX }}
      >
        <CallTimelineDot status={call.status} />
        {!isLast ? <span className="w-[2px] flex-1 bg-border!" /> : null}
      </div>

      <Button
        type="text"
        onClick={handleClick}
        className="h-auto! flex-1! items-start! justify-start! px-0! text-left!"
        style={{ marginLeft: TIMELINE_CONTENT_GAP_PX }}
      >
        <div
          className="flex w-full flex-col justify-center"
          style={{ height: TIMELINE_DOT_SIZE_PX }}
        >
          <Text
            className={`block text-base! font-semibold! ${dateTextClasses}`}
          >
            {date} {time ? `· ${time}` : ''}
          </Text>
          <Text className="mt-0.5 block text-sm! text-muted-foreground!">
            Call #{callNumber}
          </Text>
        </div>
      </Button>
    </div>
  );
};

export const IndividualLeadDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  const { data, loading, error } = useQuery(getLeadByIdDocument, {
    variables: { id: id ?? '' },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const lead = data?.leads_by_pk as
    | (LeadRecordType & { call_logs?: CallLogRecordType[] })
    | null
    | undefined;

  const callLogs = useMemo(
    () => (lead?.call_logs ?? []).map(toCallLogRecord),
    [lead?.call_logs],
  );

  const selectedCall = useMemo(
    () => callLogs.find((call) => call.id === selectedCallId) ?? callLogs[0],
    [callLogs, selectedCallId],
  );

  useEffect(() => {
    setSelectedCallId(null);
  }, [id]);

  useEffect(() => {
    if (callLogs.length > 0 && !selectedCallId) {
      setSelectedCallId(callLogs[0].id);
    }
  }, [callLogs, selectedCallId]);

  const handleBack = () => navigate('/leads');

  const leadTitle = lead?.name?.trim() || lead?.phone_number || 'Lead Details';

  useSetPageHeader(
    {
      title: leadTitle,
      subtext: lead?.phone_number
        ? `${lead.phone_number} · ${lead.lead_status_enum?.label || lead.status}`
        : id
          ? `ID: ${id}`
          : undefined,
      onBack: handleBack,
    },
    [
      leadTitle,
      lead?.phone_number,
      lead?.lead_status_enum?.label,
      lead?.status,
      id,
    ],
  );

  if (loading && !data) return <QueryLoading />;
  if (error && !data) return <QueryError error={error} />;

  if (!lead) {
    return (
      <div className="p-2 sm:p-4">
        <Result
          status="404"
          title={<span className="text-foreground!">Lead not found</span>}
          subTitle={
            <span className="text-muted-foreground!">
              This lead doesn't exist or was removed.
            </span>
          }
          extra={
            <Button type="primary" icon={<FiArrowLeft />} onClick={handleBack}>
              Back to Leads
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col gap-4 overflow-hidden p-2 sm:p-4">
      <Card
        className={`${panelCardClass} shrink-0`}
        styles={{ body: { padding: 20 } }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10! text-success!">
            <FiPhone size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <Title level={4} className="m-0! text-foreground!">
              {lead.name?.trim() || 'Unknown Lead'}
            </Title>
            <Text className="text-muted-foreground! text-sm!">
              {lead.phone_number}
            </Text>
          </div>
          <Tag className="rounded-full! border-primary/30! bg-primary/10! px-3! py-1! text-primary!">
            {lead.lead_status_enum?.label || lead.status}
          </Tag>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-2xl! border! border-border! bg-surface-2! px-3 py-2">
            <FiMail className="text-muted-foreground!" size={14} />
            <Text className="truncate text-sm! text-foreground!">
              {lead.email || '—'}
            </Text>
          </div>
          <div className="flex items-center gap-2 rounded-2xl! border! border-border! bg-surface-2! px-3 py-2">
            <FiBriefcase className="text-muted-foreground!" size={14} />
            <Text className="truncate text-sm! text-foreground!">
              {lead.company_name || '—'}
            </Text>
          </div>
          <div className="flex items-center gap-2 rounded-2xl! border! border-border! bg-surface-2! px-3 py-2">
            <FiUser className="text-muted-foreground!" size={14} />
            <Text className="text-sm! text-foreground!">
              {lead.total_calls_count} call
              {lead.total_calls_count === 1 ? '' : 's'}
            </Text>
          </div>
        </div>
      </Card>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
        <Card
          className={`${panelCardClass} flex h-full min-h-0 flex-col lg:col-span-1`}
          styles={{
            body: {
              padding: 24,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            },
          }}
          title={
            <span className="text-base! font-bold! text-foreground!">
              Call History
            </span>
          }
        >
          {callLogs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text className="text-muted-foreground!">
                    No calls placed for this lead yet.
                  </Text>
                }
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              {callLogs.map((call, index) => {
                const isSelected = selectedCall?.id === call.id;

                const isLast = index === callLogs.length - 1;

                return (
                  <CallTimelineRow
                    key={call.id}
                    call={call}
                    index={index}
                    totalCalls={callLogs.length}
                    isLast={isLast}
                    isSelected={isSelected}
                    onSelect={setSelectedCallId}
                  />
                );
              })}
            </div>
          )}
        </Card>

        <div className="min-h-0 overflow-y-auto lg:col-span-3">
          {selectedCall ? (
            <CallLogDetailView record={selectedCall} />
          ) : (
            <Card className={panelCardClass} styles={{ body: { padding: 48 } }}>
              <Empty
                description={
                  <Text className="text-muted-foreground!">
                    Select a call from the timeline to view details.
                  </Text>
                }
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualLeadDetailsPage;
