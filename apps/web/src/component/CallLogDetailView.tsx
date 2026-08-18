import React, { useMemo, useState } from 'react';
import { Card, Typography, Tag, message, Tabs, Button } from 'antd';
import {
  FiPhoneCall,
  FiUser,
  FiClock,
  FiDollarSign,
  FiPlay,
  FiPhoneOff,
  FiActivity,
  FiFileText,
  FiTag,
  FiServer,
  FiCalendar,
  FiCode,
  FiCheck,
  FiCopy,
} from 'react-icons/fi';
import { CallLogRecordType } from '../utils';

const { Text, Title, Paragraph } = Typography;

interface CallLogDetailViewProps {
  record: CallLogRecordType;
}

type TagVisual = { label: string; colorClass: string; dotClass?: string };

const STATUS_VISUALS: Record<string, TagVisual> = {
  completed: {
    label: 'Completed',
    colorClass: 'text-success! border-success!',
    dotClass: 'bg-success!',
  },
  'in-progress': {
    label: 'In Progress',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
  },
  in_progress: {
    label: 'In Progress',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
  },
  queued: {
    label: 'Queued',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
  },
  scheduled: {
    label: 'Scheduled',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
  },
  rescheduled: {
    label: 'Rescheduled',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
  },
  busy: {
    label: 'Busy',
    colorClass: 'text-warning! border-warning!',
    dotClass: 'bg-warning!',
  },
  initiated: {
    label: 'Initiated',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
  },
  ringing: {
    label: 'Ringing',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
  },
  'no-answer': {
    label: 'No Answer',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
  },
  no_answer: {
    label: 'No Answer',
    colorClass: 'text-info! border-info!',
    dotClass: 'bg-info!',
  },
  failed: {
    label: 'Failed',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  error: {
    label: 'Error',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  cancelled: {
    label: 'Cancelled',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  canceled: {
    label: 'Cancelled',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  'call-disconnected': {
    label: 'Disconnected',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  call_disconnected: {
    label: 'Disconnected',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  stopped: {
    label: 'Stopped',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  'balance-low': {
    label: 'Balance Low',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
  },
  balance_low: {
    label: 'Balance Low',
    colorClass: 'text-destructive! border-destructive!',
    dotClass: 'bg-destructive!',
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

type TranscriptTurn = { role: 'assistant' | 'user' | 'other'; text: string };

// Parses raw "assistant: ...\nuser: ..." transcript text into structured
// turns so it can render as chat bubbles instead of a flat text block.
const parseTranscript = (raw?: string | null): TranscriptTurn[] => {
  if (!raw) return [];
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const turns: TranscriptTurn[] = [];

  lines.forEach((line) => {
    const match = line.match(/^\s*(assistant|user|agent|ai|bot)\s*:\s*(.*)$/i);
    if (match) {
      const roleRaw = match[1].toLowerCase();
      const role: TranscriptTurn['role'] =
        roleRaw === 'user' ? 'user' : 'assistant';
      turns.push({ role, text: match[2].trim() });
    } else if (turns.length > 0) {
      // Continuation of the previous turn (wrapped line, no role prefix)
      turns[turns.length - 1].text += ' ' + line.trim();
    } else {
      turns.push({ role: 'other', text: line.trim() });
    }
  });

  return turns;
};

const StatusPill: React.FC<{ status: string; label?: string }> = ({
  status,
  label,
}) => {
  const key = (status || '').toLowerCase().trim();
  const visual = STATUS_VISUALS[key] ?? {
    label: label || status,
    colorClass: 'text-muted-foreground! border-border!',
    dotClass: 'bg-muted-foreground!',
  };
  return (
    <Tag
      className={`bg-transparent! rounded-full! px-4! py-1! text-sm! font-medium! inline-flex! items-center! ${visual.colorClass}`}
    >
      <span
        className={`w-2 h-2 rounded-full! inline-block mr-2 ${visual.dotClass}`}
      />
      {label || visual.label}
    </Tag>
  );
};

// Shared hover/shadow treatment for the small "block" cards throughout this
// view (StatCard, TechField, TechAudioField): a subtle lift, a soft primary
// shadow bloom, and a border tint on hover — consistent across all of them.
const hoverCardClass =
  'transition-all! duration-200! ease-out! hover:border-primary/40! hover:shadow-lg! hover:shadow-primary/5! hover:-translate-y-0.5! hover:bg-surface-2/80!';

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accentClass?: string;
}> = ({ icon, label, value, accentClass = 'bg-primary/10! text-primary!' }) => (
  <div
    className={`group bg-surface-2! border! border-border! rounded-2xl! p-4 flex items-center gap-3 min-w-0 ${hoverCardClass}`}
  >
    <span
      className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-transform! duration-200! group-hover:scale-105! ${accentClass}`}
    >
      {icon}
    </span>
    <div className="min-w-0">
      <Text className="text-muted-foreground! text-xs! block">{label}</Text>
      <div className="truncate">
        <Text className="text-foreground! text-sm! font-semibold!">
          {value}
        </Text>
      </div>
    </div>
  </div>
);

// Technical-details field: label + value card. `copyable` shows a copy icon
// (for IDs); `mono` renders the value in monospace.
const TechField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  copyable?: boolean;
  mono?: boolean;
}> = ({ icon, label, value, copyable, mono }) => (
  <div
    className={`bg-surface-2! border! border-border! rounded-2xl! p-4 min-w-0 ${hoverCardClass}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <span className="text-muted-foreground!">{icon}</span>
      <Text className="text-muted-foreground! text-xs! uppercase! tracking-wide!">
        {label}
      </Text>
    </div>
    {value ? (
      <Text
        className={`text-foreground! text-sm! font-medium! break-all ${mono ? 'font-mono!' : ''}`}
        copyable={copyable ? { text: value } : false}
      >
        {value}
      </Text>
    ) : (
      <Text className="text-muted-foreground! text-sm!">-</Text>
    )}
  </div>
);

// Technical-details field that hosts an inline audio player instead of a
// text value — used for the call recording inside Technical Details.
const TechAudioField: React.FC<{
  icon: React.ReactNode;
  label: string;
  url?: string | null;
}> = ({ icon, label, url }) => (
  <div
    className={`bg-surface-2! border! border-border! rounded-2xl! p-4 min-w-0 ${hoverCardClass}`}
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-muted-foreground!">{icon}</span>
      <Text className="text-muted-foreground! text-xs! uppercase! tracking-wide!">
        {label}
      </Text>
    </div>
    {url ? (
      <audio controls src={url} className="w-full">
        Your browser does not support audio playback.
      </audio>
    ) : (
      <Text className="text-muted-foreground! text-sm!">-</Text>
    )}
  </div>
);

const cardClass =
  'bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl';
const sectionTitleClass =
  'flex items-center gap-2 text-foreground! text-base! font-semibold!';

export const CallLogDetailView: React.FC<CallLogDetailViewProps> = ({
  record,
}) => {
  const statusLabel = record.call_status_enum?.label;

  const dispositionValue = useMemo(() => {
    if (!record.disposition && !record.disposition_enum) return '-';
    const key = (record.disposition_enum?.id || record.disposition || '')
      .toLowerCase()
      .trim();
    const visual = DISPOSITION_VISUALS[key];
    return (
      record.disposition_enum?.label ||
      visual?.label ||
      record.disposition ||
      '-'
    );
  }, [record.disposition, record.disposition_enum]);

  const dispositionAccentClass = useMemo(() => {
    const key = (record.disposition_enum?.id || record.disposition || '')
      .toLowerCase()
      .trim();
    const visual = DISPOSITION_VISUALS[key];
    if (!visual) return 'bg-muted-foreground/10! text-muted-foreground!';
    if (visual.colorClass.includes('success'))
      return 'bg-success/10! text-success!';
    if (visual.colorClass.includes('info')) return 'bg-info/10! text-info!';
    if (visual.colorClass.includes('accent'))
      return 'bg-accent/10! text-accent!';
    return 'bg-muted-foreground/10! text-muted-foreground!';
  }, [record.disposition, record.disposition_enum]);

  const transcriptTurns = useMemo(
    () => parseTranscript(record.transcript),
    [record.transcript],
  );

  const [copied, setCopied] = useState(false);

  const rawJson = useMemo(
    () =>
      record.raw_response ? JSON.stringify(record.raw_response, null, 2) : '',
    [record.raw_response],
  );

  const handleCopyRaw = async () => {
    if (!rawJson) return;
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      message.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      message.error('Failed to copy');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1: Hero summary */}
      <Card className={cardClass} bodyStyle={{ padding: 24 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-success/10! text-success! shrink-0">
              <FiPhoneCall size={22} />
            </span>
            <div>
              <Title level={3} className="m-0! text-foreground!">
                {record.lead?.name
                  ? `${record.lead.name} (${record.recipient_phone_number})`
                  : record.recipient_phone_number}
              </Title>
              <Text className="text-muted-foreground! text-sm!">
                {formatDate(record.created_at)}
              </Text>
            </div>
          </div>
          <StatusPill status={record.status} label={statusLabel} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={<FiUser size={16} />}
            label="Agent"
            value={record.agent?.name || record.bolna_agent_id}
            accentClass="bg-accent/10! text-accent!"
          />
          <StatCard
            icon={<FiClock size={16} />}
            label="Duration"
            value={formatDuration(record.duration_seconds)}
          />
          <StatCard
            icon={<FiDollarSign size={16} />}
            label="Total Cost"
            value={`$${record.total_cost ?? 0}`}
            accentClass="bg-warning/10! text-warning!"
          />
          <StatCard
            icon={<FiPhoneOff size={16} />}
            label="Hangup By"
            value={record.hangup_by || 'System'}
            accentClass="bg-info/10! text-info!"
          />
          <StatCard
            icon={<FiTag size={16} />}
            label="Disposition"
            value={dispositionValue}
            accentClass={dispositionAccentClass}
          />
        </div>
      </Card>

      {/* Step 2: Technical Details — grouped label/value cards */}
      <Card
        title={
          <span className={sectionTitleClass}>
            <FiServer className="text-info!" /> Technical Details
          </span>
        }
        className={cardClass}
      >
        <div className="flex flex-col gap-8">
          <div>
            <Text className="text-muted-foreground! text-xs! uppercase! tracking-wide! block mb-3">
              Call Meta
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <TechField
                icon={<FiUser size={13} />}
                label="Lead Name"
                value={record.lead?.name}
              />
              <TechField
                icon={<FiPhoneCall size={13} />}
                label="Call Type"
                value={record.call_type}
              />
              <TechField
                icon={<FiServer size={13} />}
                label="Telephony Provider"
                value={record.telephony_provider}
              />
              <TechField
                icon={<FiPhoneCall size={13} />}
                label="Agent Phone Number"
                value={record.agent_phone_number}
                mono
              />
              <TechField
                icon={<FiPhoneOff size={13} />}
                label="Hangup Reason"
                value={record.hangup_reason}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            <div>
              <Text className="text-muted-foreground! text-xs! uppercase! tracking-wide! block mb-3">
                Recording
              </Text>
              <TechAudioField
                icon={<FiPlay size={13} />}
                label="Call Recording"
                url={record.recording_url}
              />
            </div>

            <div>
              <Text className="text-muted-foreground! text-xs! uppercase! tracking-wide! block mb-3">
                Timestamps
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TechField
                  icon={<FiCalendar size={13} />}
                  label="Initiated At"
                  value={formatDate(record.initiated_at)}
                />
                <TechField
                  icon={<FiCalendar size={13} />}
                  label="Last Updated"
                  value={formatDate(record.updated_at)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Step 3: Summary / Transcript / Raw Data */}
      <div className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl px-6 pt-3 pb-5">
        <Tabs
          defaultActiveKey="summary"
          size="large"
          tabBarGutter={32}
          items={[
            {
              key: 'summary',
              label: (
                <span className="flex items-center gap-2">
                  <FiActivity size={16} /> AI Summary
                </span>
              ),
              children: (
                <div className="pt-2">
                  {record.summary ? (
                    <Paragraph className="m-0! text-base! text-foreground! leading-relaxed">
                      {record.summary}
                    </Paragraph>
                  ) : (
                    <Text className="text-muted-foreground! text-sm!">
                      No summary available for this call.
                    </Text>
                  )}
                </div>
              ),
            },
            {
              key: 'transcript',
              label: (
                <span className="flex items-center gap-2">
                  <FiFileText size={16} /> Transcript
                </span>
              ),
              children: (
                <div className="pt-2">
                  {transcriptTurns.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-[32rem] overflow-y-auto pr-1">
                      {transcriptTurns.map((turn, idx) => {
                        const isUser = turn.role === 'user';
                        const isOther = turn.role === 'other';
                        return (
                          <div
                            key={idx}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`flex items-end gap-2 max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              {!isOther && (
                                <span
                                  className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-xs! font-semibold! ${
                                    isUser
                                      ? 'bg-accent/15! text-accent!'
                                      : 'bg-primary/15! text-primary!'
                                  }`}
                                >
                                  {isUser ? 'U' : 'AI'}
                                </span>
                              )}
                              <div
                                className={`rounded-2xl! px-4 py-3 text-[15px]! leading-relaxed shadow-sm ${
                                  isUser
                                    ? 'bg-accent/10! text-foreground! rounded-br-sm!'
                                    : isOther
                                      ? 'bg-transparent! text-muted-foreground! italic'
                                      : 'bg-surface-2! text-foreground! rounded-bl-sm!'
                                }`}
                              >
                                {turn.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Text className="text-muted-foreground! text-sm!">
                      No transcript available for this call.
                    </Text>
                  )}
                </div>
              ),
            },
            {
              key: 'raw',
              label: (
                <span className="flex items-center gap-2">
                  <FiCode size={16} /> Raw Data
                </span>
              ),
              children: (
                <div className="relative pt-2">
                  {rawJson ? (
                    <>
                      <Button
                        size="small"
                        onClick={handleCopyRaw}
                        icon={copied ? <FiCheck /> : <FiCopy />}
                        className="absolute! top-4! right-4! bg-surface-2! border-border! text-foreground! z-10"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <pre className="text-xs! font-mono p-4 bg-surface-2! text-foreground! rounded-2xl! max-h-[32rem] overflow-y-auto m-0!">
                        {rawJson}
                      </pre>
                    </>
                  ) : (
                    <Text className="text-muted-foreground! text-sm!">
                      No raw payload available for this call.
                    </Text>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CallLogDetailView;
