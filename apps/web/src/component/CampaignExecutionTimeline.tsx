import React, { useState } from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiCalendar,
  FiPhoneCall,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { CallLogRecordType } from '../utils';
import CallLogsTable from './CallLogsTable';

export type ExecutionRun = {
  runNumber: number;
  startTime: string;
  endTime: string;
  logs: CallLogRecordType[];
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  inProgressCalls: number;
};

export function groupLogsIntoRuns(
  callLogs: CallLogRecordType[],
  thresholdMinutes = 10,
): ExecutionRun[] {
  if (!callLogs || callLogs.length === 0) return [];

  const sorted = [...callLogs].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const runs: ExecutionRun[] = [];
  let currentLogs: CallLogRecordType[] = [];
  let lastTimestamp = 0;
  const thresholdMs = thresholdMinutes * 60 * 1000;

  for (const log of sorted) {
    const logTime = new Date(log.created_at).getTime();
    if (currentLogs.length === 0 || logTime - lastTimestamp <= thresholdMs) {
      currentLogs.push(log);
    } else {
      const startTime = currentLogs[0].created_at;
      const endTime = currentLogs[currentLogs.length - 1].created_at;
      runs.push(
        buildRunObject(runs.length + 1, startTime, endTime, currentLogs),
      );
      currentLogs = [log];
    }
    lastTimestamp = logTime;
  }

  if (currentLogs.length > 0) {
    const startTime = currentLogs[0].created_at;
    const endTime = currentLogs[currentLogs.length - 1].created_at;
    runs.push(
      buildRunObject(runs.length + 1, startTime, endTime, currentLogs),
    );
  }

  return runs.reverse();
}

function buildRunObject(
  runNumber: number,
  startTime: string,
  endTime: string,
  logs: CallLogRecordType[],
): ExecutionRun {
  const completedCalls = logs.filter((c) => c.status === 'completed').length;
  const failedCalls = logs.filter((c) =>
    ['failed', 'busy', 'no_answer', 'cancelled', 'error'].includes(c.status),
  ).length;
  const inProgressCalls = logs.filter((c) =>
    ['queued', 'initiated', 'ringing', 'in_progress'].includes(c.status),
  ).length;

  return {
    runNumber,
    startTime,
    endTime,
    logs,
    totalCalls: logs.length,
    completedCalls,
    failedCalls,
    inProgressCalls,
  };
}

interface CampaignExecutionTimelineProps {
  callLogs: CallLogRecordType[];
  loading: boolean;
  onViewDetails: (record: CallLogRecordType) => void;
}

export const CampaignExecutionTimeline: React.FC<
  CampaignExecutionTimelineProps
> = ({ callLogs, loading, onViewDetails }) => {
  const runs = groupLogsIntoRuns(callLogs);
  const [expandedRunNumbers, setExpandedRunNumbers] = useState<Record<number, boolean>>({
    [runs[0]?.runNumber ?? 1]: true,
  });

  const toggleRunExpand = (runNumber: number) => {
    setExpandedRunNumbers((prev) => ({
      ...prev,
      [runNumber]: !prev[runNumber],
    }));
  };

  const expandAll = () => {
    const next: Record<number, boolean> = {};
    runs.forEach((r) => {
      next[r.runNumber] = true;
    });
    setExpandedRunNumbers(next);
  };

  const collapseAll = () => {
    setExpandedRunNumbers({});
  };

  if (!loading && runs.length === 0) {
    return (
      <div className="py-14 text-center">
        <FiLayers className="text-5xl mx-auto mb-3 text-primary opacity-60" />
        <span className="text-base font-semibold text-foreground! block">
          No Execution Runs Recorded
        </span>
        <span className="text-xs text-foreground/70! block mt-1">
          Launch this campaign to start recording outbound execution runs and call attempts.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Controls Bar */}
      <div className="flex justify-between items-center bg-card! p-3 rounded-xl border! border-sidebar-border!">
        <div className="flex items-center gap-2">
          <FiLayers className="text-primary text-base" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground!">
            Execution Runs ({runs.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-semibold text-foreground! hover:text-primary! px-3 py-1 rounded-lg bg-secondary! hover:bg-secondary/80 border! border-sidebar-border! cursor-pointer transition-all shadow-xs"
          >
            Expand All
          </button>
          <span className="text-sidebar-border text-xs">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-semibold text-foreground! hover:text-primary! px-3 py-1 rounded-lg bg-secondary! hover:bg-secondary/80 border! border-sidebar-border! cursor-pointer transition-all shadow-xs"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Timeline Wrapper with Vertical Connecting Line */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-sidebar-border before:to-transparent">
        {runs.map((run) => {
          const isExpanded = !!expandedRunNumbers[run.runNumber];
          const isLatestRun = run.runNumber === runs[0].runNumber;

          return (
            <div key={run.runNumber} className="relative group">
              {/* Timeline Marker Node */}
              <div
                className={`absolute -left-6 sm:-left-10 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-extrabold z-10 transition-transform ${
                  isLatestRun
                    ? 'bg-primary! text-primary-foreground! ring-4 ring-primary/30 shadow-lg scale-110'
                    : 'bg-secondary! border-2 border-sidebar-border! text-foreground! shadow-md'
                }`}
              >
                #{run.runNumber}
              </div>

              {/* Execution Run Card */}
              <div className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-xl overflow-hidden hover:border-primary/50 transition-all">
                {/* Header */}
                <div
                  className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer bg-background/50 hover:bg-background/80 transition-colors"
                  onClick={() => toggleRunExpand(run.runNumber)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-foreground! m-0">
                        Execution Run #{run.runNumber}
                      </h3>
                      {isLatestRun && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/30">
                          Latest Run
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-foreground/80 font-medium">
                      <FiCalendar className="text-primary text-xs" />
                      <span>{dayjs(run.startTime).format('MMM D, YYYY · hh:mm A')}</span>
                    </div>
                  </div>

                  {/* Summary Badges & Toggle Icon */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-sidebar-border pt-2 sm:pt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary! text-foreground! border! border-sidebar-border! flex items-center gap-1.5 shadow-xs">
                        <FiPhoneCall className="text-primary text-xs" /> {run.totalCalls} Calls
                      </span>
                      {run.completedCalls > 0 && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400! border border-emerald-500/30! flex items-center gap-1.5 shadow-xs">
                          <FiCheckCircle className="text-emerald-400 text-xs" /> {run.completedCalls} Completed
                        </span>
                      )}
                      {run.failedCalls > 0 && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400! border border-rose-500/30! flex items-center gap-1.5 shadow-xs">
                          <FiXCircle className="text-rose-400 text-xs" /> {run.failedCalls} Unreachable
                        </span>
                      )}
                      {run.inProgressCalls > 0 && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400! border border-amber-500/30! flex items-center gap-1.5 animate-pulse shadow-xs">
                          <FiClock className="text-amber-400 text-xs" /> {run.inProgressCalls} Active
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-foreground! hover:text-primary! hover:bg-secondary! transition-colors cursor-pointer"
                    >
                      {isExpanded ? <FiChevronUp className="text-lg" /> : <FiChevronDown className="text-lg" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Run Dedicated Call Log Table */}
                {isExpanded && (
                  <div className="border-t border-sidebar-border p-4 sm:p-5 bg-card">
                    <div className="mb-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground! uppercase tracking-wider">
                        Run #{run.runNumber} Call Log Records ({run.logs.length})
                      </span>
                    </div>

                    <CallLogsTable
                      data={run.logs}
                      loading={loading}
                      onViewDetails={onViewDetails}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignExecutionTimeline;
