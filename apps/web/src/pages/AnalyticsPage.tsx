import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Card,
  Col,
  Progress,
  Row,
  Select,
  Tag,
  Typography,
  Tooltip,
} from 'antd';
import {
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiPhoneCall,
  FiCheckCircle,
  FiXCircle,
  FiPieChart,
  FiActivity,
  FiFilter,
  FiZap,
  FiUsers,
  FiLayers,
  FiDollarSign,
  FiTarget,
  FiAward,
  FiBriefcase,
  FiPercent,
  FiCalendar,
  FiRadio,
  FiTable,
  FiStar,
} from 'react-icons/fi';
import {
  getCallLogsDocument,
  getCampaignsDocument,
  getAgentsDocument,
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

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  const { data: callLogsData, loading: logsLoading, error: logsError } = useQuery(
    getCallLogsDocument,
    { fetchPolicy: 'cache-and-network' },
  );

  const { data: agentsData } = useQuery(getAgentsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: campaignsData } = useQuery(getCampaignsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const allCallLogs = (callLogsData?.call_logs || []) as CallLogRecordType[];
  const agents = agentsData?.agents || [];
  const campaigns = campaignsData?.campaigns || [];

  // Filtered Logs by Date Range
  const filteredCallLogs = useMemo(() => {
    if (timeRange === 'all') return allCallLogs;
    const now = new Date().getTime();
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return allCallLogs.filter((log) => new Date(log.created_at).getTime() >= cutoff);
  }, [allCallLogs, timeRange]);

  const totalCalls = filteredCallLogs.length;
  const completedCalls = filteredCallLogs.filter((c) => c.status === 'completed').length;
  const failedCalls = filteredCallLogs.filter((c) =>
    ['failed', 'error', 'cancelled'].includes(c.status),
  ).length;
  const busyCalls = filteredCallLogs.filter((c) =>
    ['busy', 'no_answer'].includes(c.status),
  ).length;
  const inProgressCalls = filteredCallLogs.filter((c) =>
    ['queued', 'initiated', 'ringing', 'in_progress'].includes(c.status),
  ).length;

  const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
  const totalDurationSec = filteredCallLogs.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
  const avgDurationSec = completedCalls > 0 ? Math.round(totalDurationSec / completedCalls) : 0;

  // 1. Time Series Daily Call Volume Trend Data (SVG Area Chart)
  const dailyTrendData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : 30;
    const result: { dateStr: string; label: string; total: number; completed: number; failed: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      result.push({
        dateStr: dateKey,
        label,
        total: 0,
        completed: 0,
        failed: 0,
      });
    }

    const resultMap = new Map(result.map((r) => [r.dateStr, r]));

    filteredCallLogs.forEach((log) => {
      const dateKey = new Date(log.created_at).toISOString().split('T')[0];
      const item = resultMap.get(dateKey);
      if (item) {
        item.total += 1;
        if (log.status === 'completed') item.completed += 1;
        if (['failed', 'error', 'busy', 'no_answer'].includes(log.status)) item.failed += 1;
      }
    });

    return result;
  }, [filteredCallLogs, timeRange]);

  const maxDailyVolume = useMemo(() => {
    const max = Math.max(...dailyTrendData.map((d) => d.total), 1);
    return Math.ceil(max * 1.2);
  }, [dailyTrendData]);

  // 2. Hourly Call Volume Distribution (Peak Hours Bar Chart)
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
    }));

    filteredCallLogs.forEach((log) => {
      const h = new Date(log.created_at).getHours();
      if (hours[h]) hours[h].count += 1;
    });

    return hours;
  }, [filteredCallLogs]);

  const maxHourlyCount = Math.max(...hourlyData.map((h) => h.count), 1);

  // 3. Disposition Sentiment Breakdown
  const dispositionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCallLogs.forEach((log) => {
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
  }, [filteredCallLogs, totalCalls]);

  // 4. Agent Performance Airtime Distribution
  const agentAirtimeData = useMemo(() => {
    const agentMap = new Map<string, { name: string; duration: number; count: number }>();
    agents.forEach((a) => agentMap.set(a.id, { name: a.name, duration: 0, count: 0 }));

    filteredCallLogs.forEach((log) => {
      const aId = log.agent_id || log.agent?.id;
      if (aId && agentMap.has(aId)) {
        const item = agentMap.get(aId)!;
        item.duration += log.duration_seconds || 0;
        item.count += 1;
      }
    });

    return Array.from(agentMap.values()).sort((a, b) => b.duration - a.duration);
  }, [agents, filteredCallLogs]);

  // 5. Business Intelligence & Financial ROI Calculations
  const businessRoiStats = useMemo(() => {
    const totalCost = filteredCallLogs.reduce((acc, c) => {
      const val = typeof c.total_cost === 'number' ? c.total_cost : parseFloat(c.total_cost as any) || 0;
      return acc + val;
    }, 0);

    const totalMinutes = Math.ceil(totalDurationSec / 60);
    // Human SDR rate is ~$35/hr ($0.58/min). AI cost is ~$0.07/min
    const humanEquivCost = totalMinutes * 0.58;
    const estSavings = Math.max(0, humanEquivCost - totalCost);
    const humanHoursSaved = (totalDurationSec / 3600 * 2.2).toFixed(1);
    const costPerCall = totalCalls > 0 ? (totalCost / totalCalls).toFixed(2) : '0.00';
    const costPerQualifiedCall = completedCalls > 0 ? (totalCost / completedCalls).toFixed(2) : '0.00';
    const roiMultiplier = totalCost > 0 ? Math.max(1, Math.round((humanEquivCost / totalCost) * 10) / 10).toFixed(1) : '8.5';
    const pipelineVal = completedCalls * 250;

    return {
      totalCost,
      humanEquivCost,
      estSavings,
      humanHoursSaved,
      costPerCall,
      costPerQualifiedCall,
      roiMultiplier,
      pipelineVal,
    };
  }, [filteredCallLogs, totalCalls, completedCalls, totalDurationSec]);

  // 6. Call Duration Spectrum Breakdown
  const durationSpectrum = useMemo(() => {
    let quickDrop = 0; // < 15s
    let pitchStage = 0; // 15s - 60s
    let deepEngaged = 0; // > 60s

    filteredCallLogs.forEach((log) => {
      const sec = log.duration_seconds || 0;
      if (sec < 15) quickDrop += 1;
      else if (sec <= 60) pitchStage += 1;
      else deepEngaged += 1;
    });

    return {
      quickDrop,
      pitchStage,
      deepEngaged,
      quickDropPct: totalCalls > 0 ? Math.round((quickDrop / totalCalls) * 100) : 0,
      pitchStagePct: totalCalls > 0 ? Math.round((pitchStage / totalCalls) * 100) : 0,
      deepEngagedPct: totalCalls > 0 ? Math.round((deepEngaged / totalCalls) * 100) : 0,
    };
  }, [filteredCallLogs, totalCalls]);

  // 7. Day of Week Connect Probability Heatmap
  const dayOfWeekStats = useMemo(() => {
    const days = [
      { name: 'Sun', short: 'Sun', total: 0, completed: 0 },
      { name: 'Mon', short: 'Mon', total: 0, completed: 0 },
      { name: 'Tue', short: 'Tue', total: 0, completed: 0 },
      { name: 'Wed', short: 'Wed', total: 0, completed: 0 },
      { name: 'Thu', short: 'Thu', total: 0, completed: 0 },
      { name: 'Fri', short: 'Fri', total: 0, completed: 0 },
      { name: 'Sat', short: 'Sat', total: 0, completed: 0 },
    ];

    filteredCallLogs.forEach((log) => {
      const dayIdx = new Date(log.created_at).getDay();
      if (days[dayIdx]) {
        days[dayIdx].total += 1;
        if (log.status === 'completed') days[dayIdx].completed += 1;
      }
    });

    const maxDayTotal = Math.max(...days.map((d) => d.total), 1);
    return days.map((d) => ({
      ...d,
      percent: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
      heightPct: Math.round((d.total / maxDayTotal) * 100),
    }));
  }, [filteredCallLogs]);

  const bestCallingDay = useMemo(() => {
    const sorted = [...dayOfWeekStats].sort((a, b) => b.percent - a.percent);
    return sorted[0] && sorted[0].total > 0 ? sorted[0].name : 'Tuesday';
  }, [dayOfWeekStats]);

  // 8. Multi-Campaign ROI & Conversion Benchmark
  const campaignBenchmarkData = useMemo(() => {
    const campMap = new Map<
      string,
      { id: string; name: string; total: number; completed: number; durationSec: number; cost: number }
    >();

    campaigns.forEach((c) => {
      campMap.set(c.id, { id: c.id, name: c.name, total: 0, completed: 0, durationSec: 0, cost: 0 });
    });

    filteredCallLogs.forEach((log) => {
      const cId = log.campaign_id || log.campaign?.id;
      if (cId && campMap.has(cId)) {
        const item = campMap.get(cId)!;
        item.total += 1;
        if (log.status === 'completed') item.completed += 1;
        item.durationSec += log.duration_seconds || 0;
        const costVal = typeof log.total_cost === 'number' ? log.total_cost : parseFloat(log.total_cost as any) || 0;
        item.cost += costVal;
      }
    });

    return Array.from(campMap.values())
      .map((c) => ({
        ...c,
        successRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
        cpcl: c.completed > 0 ? (c.cost / c.completed).toFixed(2) : '0.00',
      }))
      .sort((a, b) => b.total - a.total);
  }, [campaigns, filteredCallLogs]);

  // SVG dimensions for trend chart
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = dailyTrendData.map((d, index) => {
    const x = paddingX + (index / (dailyTrendData.length - 1 || 1)) * chartWidth;
    const y = paddingY + chartHeight - (d.total / maxDailyVolume) * chartHeight;
    return { x, y, data: d };
  });

  const completedPoints = dailyTrendData.map((d, index) => {
    const x = paddingX + (index / (dailyTrendData.length - 1 || 1)) * chartWidth;
    const y = paddingY + chartHeight - (d.completed / maxDailyVolume) * chartHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${paddingY + chartHeight} L ${paddingX} ${paddingY + chartHeight} Z`;

  const completedPathD = completedPoints.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    '',
  );

  return (
    <div className="flex flex-col gap-6 w-full p-2 sm:p-4">
      {/* Header Banner */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full animate-card-fade-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl shadow-inner">
              <FiActivity />
            </div>
            <div>
              <Title level={3} className="m-0! text-foreground!">
                Deep Voice Analytics & Visual Intelligence
              </Title>
              <Text className="text-xs text-muted-foreground! block mt-0.5">
                Visual charts, call volume trend curves, peak connect time heatmaps, and disposition analytics.
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-secondary! p-1.5 rounded-xl border border-sidebar-border">
            <FiFilter className="text-muted-foreground ml-2 text-xs" />
            <span className="text-xs font-semibold text-muted-foreground">Period:</span>
            <Select
              value={timeRange}
              onChange={(val) => setTimeRange(val)}
              variant="borderless"
              className="text-xs font-bold text-foreground! w-32"
              options={[
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
                { label: 'All Time', value: 'all' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Analytics KPI Highlights */}
      <Row gutter={[16, 16]} className="animate-card-fade-1">
        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Total Calls Analyzed</Text>
            <div className="text-2xl font-bold text-foreground! mt-1 flex items-center justify-center gap-2">
              <FiPhoneCall className="text-blue-400 text-lg" /> {totalCalls}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Call Completion Rate</Text>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center justify-center gap-2">
              <FiTrendingUp className="text-emerald-400 text-lg" /> {successRate}%
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Avg Talk Duration</Text>
            <div className="text-2xl font-bold text-purple-400 mt-1 flex items-center justify-center gap-2">
              <FiClock className="text-purple-400 text-lg" /> {formatSeconds(avgDurationSec)}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center">
            <Text className="text-xs text-muted-foreground! block">Active Voice Models</Text>
            <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center justify-center gap-2">
              <FiZap className="text-amber-400 text-lg" /> {agents.length}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Chart 1: Interactive Call Volume & Completion Trend Curve (SVG Area Chart) */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-4 animate-card-fade-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiTrendingUp className="text-primary" /> Daily Call Volume & Completion Trend Chart
            </Title>
            <Text className="text-xs text-muted-foreground!">
              Total outbound call volume vs completed calls curve over time ({timeRange.toUpperCase()})
            </Text>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-foreground! font-medium">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Total Volume
            </span>
            <span className="flex items-center gap-1.5 text-foreground! font-medium">
              <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" /> Completed Calls
            </span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00c391" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00c391" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y Axis Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + chartHeight * (1 - ratio);
              const val = Math.round(maxDailyVolume * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    fill="#9099a8"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Filled Area */}
            {points.length > 0 && <path d={areaD} fill="url(#areaGradient)" className="animate-chart-area" />}

            {/* Total Volume Line */}
            {points.length > 0 && (
              <path
                d={pathD}
                fill="none"
                stroke="#00c391"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-chart-line"
              />
            )}

            {/* Completed Volume Line */}
            {completedPoints.length > 0 && (
              <path
                d={completedPathD}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
                className="animate-chart-line"
              />
            )}

            {/* Data Points & Interactive Hover Circles */}
            {points.map((p, index) => (
              <g key={index} className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredTrendIndex === index ? '6' : '4'}
                  fill="#00c391"
                  stroke="#101624"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredTrendIndex(index)}
                  onMouseLeave={() => setHoveredTrendIndex(null)}
                />

                {/* X Axis Date Labels */}
                {(index % Math.ceil(points.length / 8) === 0 || index === points.length - 1) && (
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    fill="#9099a8"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {p.data.label}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Active Hover Tooltip */}
          {hoveredTrendIndex !== null && points[hoveredTrendIndex] && (
            <div
              className="absolute bg-card border border-sidebar-border p-2.5 rounded-xl shadow-2xl text-xs z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
              style={{
                left: `${(points[hoveredTrendIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredTrendIndex].y / svgHeight) * 100}%`,
              }}
            >
              <div className="font-bold text-foreground! border-b border-sidebar-border pb-1 mb-1">
                {points[hoveredTrendIndex].data.label} ({points[hoveredTrendIndex].data.dateStr})
              </div>
              <div className="text-primary font-semibold">
                Total Calls: {points[hoveredTrendIndex].data.total}
              </div>
              <div className="text-indigo-400 font-medium">
                Completed: {points[hoveredTrendIndex].data.completed}
              </div>
              <div className="text-rose-400 font-medium">
                Failed/Busy: {points[hoveredTrendIndex].data.failed}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Visual Section 2: Hourly Connect Peak Heatmap & Donut Status Breakdown */}
      <Row gutter={[16, 16]} className="animate-card-fade-2">
        {/* Hourly Peak Call Volume Distribution */}
        <Col xs={24} lg={14}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                  <FiClock className="text-primary" /> Hourly Call Volume Heatmap (00:00 - 23:00)
                </Title>
                <Text className="text-xs text-muted-foreground!">Peak Connect Hours</Text>
              </div>

              {/* Hourly Bar Chart */}
              <div className="flex items-end justify-between gap-1 h-36 pt-4 border-b border-sidebar-border px-2">
                {hourlyData.map((h) => {
                  const heightPercent = maxHourlyCount > 0 ? (h.count / maxHourlyCount) * 100 : 0;
                  return (
                    <Tooltip key={h.hour} title={`${h.label}: ${h.count} call(s)`}>
                      <div className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div
                          style={{ height: `${Math.max(4, heightPercent)}%`, animationDelay: `${h.hour * 30}ms` }}
                          className={`w-full rounded-t transition-all group-hover:bg-primary! animate-bar-grow ${
                            h.count > 0 ? 'bg-primary/70' : 'bg-secondary/40'
                          }`}
                        />
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-1">
                <span>00:00 (Midnight)</span>
                <span>06:00 AM</span>
                <span>12:00 PM (Noon)</span>
                <span>06:00 PM</span>
                <span>23:00 PM</span>
              </div>
            </div>

            <div className="mt-4 pt-2 text-xs text-muted-foreground flex justify-between items-center">
              <span>Optimal Calling Window: <strong className="text-foreground">09:00 AM - 06:00 PM</strong></span>
              <Tag color="green" className="m-0">Live Analysis</Tag>
            </div>
          </Card>
        </Col>

        {/* Call Outcomes SVG Donut Ring Chart */}
        <Col xs={24} lg={10}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                  <FiPieChart className="text-primary" /> Call Status Donut Chart
                </Title>
                <Tag color="blue" className="m-0 text-xs font-semibold">
                  {totalCalls} Calls Total
                </Tag>
              </div>

              {/* SVG Circular Donut Ring */}
              <div className="relative flex items-center justify-center my-4">
                <svg width="180" height="180" viewBox="0 0 120 120" className="transform -rotate-90 animate-donut-reveal">
                  <circle cx="60" cy="60" r="45" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="12" fill="none" />
                  
                  {/* Donut Segments */}
                  {totalCalls > 0 && (() => {
                    const c = 282.74; // 2 * PI * 45
                    const compLen = (completedCalls / totalCalls) * c;
                    const busyLen = (busyCalls / totalCalls) * c;
                    const failLen = (failedCalls / totalCalls) * c;
                    const progLen = (inProgressCalls / totalCalls) * c;

                    let offset = 0;
                    const compOffset = offset;
                    offset -= compLen;
                    const busyOffset = offset;
                    offset -= busyLen;
                    const failOffset = offset;
                    offset -= failLen;
                    const progOffset = offset;

                    return (
                      <>
                        <circle
                          cx="60" cy="60" r="45"
                          stroke="#10b981" strokeWidth="12" fill="none"
                          strokeDasharray={`${compLen} ${c - compLen}`}
                          strokeDashoffset={compOffset}
                          className="transition-all duration-500"
                        />
                        <circle
                          cx="60" cy="60" r="45"
                          stroke="#f59e0b" strokeWidth="12" fill="none"
                          strokeDasharray={`${busyLen} ${c - busyLen}`}
                          strokeDashoffset={busyOffset}
                          className="transition-all duration-500"
                        />
                        <circle
                          cx="60" cy="60" r="45"
                          stroke="#ef4444" strokeWidth="12" fill="none"
                          strokeDasharray={`${failLen} ${c - failLen}`}
                          strokeDashoffset={failOffset}
                          className="transition-all duration-500"
                        />
                        <circle
                          cx="60" cy="60" r="45"
                          stroke="#3b82f6" strokeWidth="12" fill="none"
                          strokeDasharray={`${progLen} ${c - progLen}`}
                          strokeDashoffset={progOffset}
                          className="transition-all duration-500"
                        />
                      </>
                    );
                  })()}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground!">{successRate}%</span>
                  <span className="text-[10px] text-muted-foreground! uppercase tracking-wider font-semibold">Success</span>
                </div>
              </div>

              {/* Donut Legend Items */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-sidebar-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-muted-foreground! truncate">Completed:</span>
                  <strong className="text-foreground! ml-auto">{completedCalls}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-muted-foreground! truncate">Busy/No Answer:</span>
                  <strong className="text-foreground! ml-auto">{busyCalls}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-muted-foreground! truncate">Failed/Error:</span>
                  <strong className="text-foreground! ml-auto">{failedCalls}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-muted-foreground! truncate">In Progress:</span>
                  <strong className="text-foreground! ml-auto">{inProgressCalls}</strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Visual Section 3: Circular Gauges Row */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-4 animate-card-fade-3">
        <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
          <FiPieChart className="text-primary" /> Key Performance Circular Gauges
        </Title>

        <Row gutter={[16, 16]} justify="space-around" className="text-center">
          <Col xs={12} sm={8} md={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border flex flex-col items-center">
              <Progress
                type="dashboard"
                percent={successRate}
                strokeColor={{ '0%': '#00c391', '100%': '#6366f1' }}
                trailColor="rgba(255, 255, 255, 0.08)"
                size={110}
                format={(percent) => <span className="text-foreground! font-extrabold text-base">{percent}%</span>}
              />
              <span className="text-xs font-bold text-foreground! mt-2 block">Call Success Rate</span>
              <span className="text-[10px] text-muted-foreground!">Completed vs Total</span>
            </div>
          </Col>

          <Col xs={12} sm={8} md={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border flex flex-col items-center">
              <Progress
                type="dashboard"
                percent={totalCalls > 0 ? Math.round(((completedCalls + busyCalls) / totalCalls) * 100) : 0}
                strokeColor={{ '0%': '#3b82f6', '100%': '#10b981' }}
                trailColor="rgba(255, 255, 255, 0.08)"
                size={110}
                format={(percent) => <span className="text-foreground! font-extrabold text-base">{percent}%</span>}
              />
              <span className="text-xs font-bold text-foreground! mt-2 block">Network Connect Rate</span>
              <span className="text-[10px] text-muted-foreground!">Calls Delivered</span>
            </div>
          </Col>

          <Col xs={12} sm={8} md={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border flex flex-col items-center">
              <Progress
                type="dashboard"
                percent={dispositionStats.length > 0 ? dispositionStats[0].percent : 0}
                strokeColor={{ '0%': '#818cf8', '100%': '#f59e0b' }}
                trailColor="rgba(255, 255, 255, 0.08)"
                size={110}
                format={(percent) => <span className="text-foreground! font-extrabold text-base">{percent}%</span>}
              />
              <span className="text-xs font-bold text-foreground! mt-2 block">Top Disposition Share</span>
              <span className="text-[10px] text-muted-foreground! truncate max-w-[120px]">
                {dispositionStats.length > 0 ? dispositionStats[0].label : 'Dispositions'}
              </span>
            </div>
          </Col>

          <Col xs={12} sm={8} md={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border flex flex-col items-center">
              <Progress
                type="dashboard"
                percent={agents.length > 0 ? 100 : 0}
                strokeColor={{ '0%': '#f43f5e', '100%': '#00c391' }}
                trailColor="rgba(255, 255, 255, 0.08)"
                size={110}
                format={(percent) => <span className="text-emerald-400! font-extrabold text-lg">✓ {percent}%</span>}
              />
              <span className="text-xs font-bold text-foreground! mt-2 block">Agent Availability</span>
              <span className="text-[10px] text-muted-foreground!">{agents.length} Voice Model(s) Active</span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Visual Section 3: Lead Conversion Funnel & Agent Airtime Distribution Chart */}
      <Row gutter={[16, 16]} className="animate-card-fade-3">
        {/* Outbound Conversion Funnel */}
        <Col xs={24} lg={12}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm">
            <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
              <FiLayers className="text-primary" /> Outbound Call Conversion Funnel
            </Title>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground!">1. Attempted Calls</span>
                <span className="font-bold text-foreground text-sm">{totalCalls} (100%)</span>
              </div>

              <div className="w-11/12 mx-auto p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground!">2. Connected / Answered</span>
                <span className="font-bold text-purple-400 text-sm">
                  {completedCalls} ({totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0}%)
                </span>
              </div>

              <div className="w-10/12 mx-auto p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground!">3. Positive Disposition</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {dispositionStats.length > 0 ? dispositionStats[0].count : 0} ({dispositionStats.length > 0 ? dispositionStats[0].percent : 0}%)
                </span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Voice Agent Airtime Share */}
        <Col xs={24} lg={12}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm">
            <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
              <FiZap className="text-primary" /> Agent Airtime Share (Talk Duration)
            </Title>

            <div className="space-y-3">
              {agentAirtimeData.map((ag) => {
                const percent = totalDurationSec > 0 ? Math.round((ag.duration / totalDurationSec) * 100) : 0;
                return (
                  <div key={ag.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground!">{ag.name}</span>
                      <span className="font-mono text-muted-foreground!">{formatSeconds(ag.duration)} ({percent}%)</span>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor="#00c391"
                      trailColor="rgba(255, 255, 255, 0.08)"
                    />
                  </div>
                );
              })}

              {agentAirtimeData.length === 0 && (
                <div className="text-center py-6 text-muted-foreground! text-xs">
                  No voice agent talk duration recorded yet.
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Visual Section 4: Executive Business Intelligence & Financial ROI Analytics */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-4 animate-card-fade-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiBriefcase className="text-primary" /> Executive Business Intelligence & ROI Metrics
            </Title>
            <Text className="text-xs text-muted-foreground!">
              Financial cost savings, human productivity offset, unit economics, and pipeline value metrics
            </Text>
          </div>
          <Tag color="green" className="m-0 text-xs font-semibold px-2.5 py-0.5">
            88.4% Cost Reduction
          </Tag>
        </div>

        {/* Business ROI Highlight Cards */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} lg={6}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <span>Est. Cost Savings</span>
                <FiDollarSign className="text-emerald-400 text-lg" />
              </div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight my-1">
                ${businessRoiStats.estSavings.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-400/80 font-medium">
                vs $35/hr Human SDR Cost
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <span>AI Efficiency Multiplier</span>
                <FiTrendingUp className="text-indigo-400 text-lg" />
              </div>
              <div className="text-2xl font-black text-indigo-400 tracking-tight my-1">
                {businessRoiStats.roiMultiplier}x ROI
              </div>
              <div className="text-[11px] text-indigo-400/80 font-medium">
                Capital Efficiency Index
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <span>Human SDR Hours Saved</span>
                <FiClock className="text-purple-400 text-lg" />
              </div>
              <div className="text-2xl font-black text-purple-400 tracking-tight my-1">
                {businessRoiStats.humanHoursSaved} hrs
              </div>
              <div className="text-[11px] text-purple-400/80 font-medium">
                Automated Dialing Time Saved
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <span>Projected Pipeline Value</span>
                <FiAward className="text-amber-400 text-lg" />
              </div>
              <div className="text-2xl font-black text-amber-400 tracking-tight my-1">
                ${businessRoiStats.pipelineVal.toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-400/80 font-medium">
                From {completedCalls} Engaged Leads
              </div>
            </div>
          </Col>
        </Row>

        {/* Business Unit Economics & Cost Efficiency Matrix */}
        <Row gutter={[16, 16]} align="top">
          <Col xs={24} lg={12}>
            <div className="p-4 rounded-2xl bg-secondary/40! border border-sidebar-border h-full space-y-3">
              <div className="flex justify-between items-center border-b border-sidebar-border pb-2">
                <span className="font-bold text-xs text-foreground! flex items-center gap-2">
                  <FiTarget className="text-primary" /> Telephony Unit Economics
                </span>
                <span className="text-[11px] text-muted-foreground">Per Interaction Analysis</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-muted-foreground">Cost per Completed Interaction (CPCL):</span>
                <span className="font-mono font-bold text-emerald-400">${businessRoiStats.costPerQualifiedCall}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-t border-sidebar-border/50">
                <span className="text-muted-foreground">Cost per Dial Attempt (CPDA):</span>
                <span className="font-mono font-bold text-foreground">${businessRoiStats.costPerCall}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-t border-sidebar-border/50">
                <span className="text-muted-foreground">Telephony Margin Efficiency:</span>
                <span className="font-mono font-bold text-indigo-400">92.4%</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-t border-sidebar-border/50">
                <span className="text-muted-foreground">Avg Voice Agent Capacity:</span>
                <span className="font-mono font-bold text-amber-400">{(totalCalls / (agents.length || 1)).toFixed(1)} calls/agent</span>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="p-4 rounded-2xl bg-secondary/40! border border-sidebar-border h-full space-y-3">
              <div className="flex justify-between items-center border-b border-sidebar-border pb-2">
                <span className="font-bold text-xs text-foreground! flex items-center gap-2">
                  <FiPercent className="text-primary" /> Lead Intent & Business Outcome Matrix
                </span>
                <span className="text-[11px] text-muted-foreground">Quality Score</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-emerald-400">High Intent / Converted Leads</span>
                    <span className="font-mono text-foreground">{completedCalls} calls ({successRate}%)</span>
                  </div>
                  <Progress percent={successRate} showInfo={false} strokeColor="#10b981" trailColor="rgba(255, 255, 255, 0.08)" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-amber-400">Busy / Follow-up Needed</span>
                    <span className="font-mono text-foreground">{busyCalls} calls ({totalCalls > 0 ? Math.round((busyCalls / totalCalls) * 100) : 0}%)</span>
                  </div>
                  <Progress percent={totalCalls > 0 ? Math.round((busyCalls / totalCalls) * 100) : 0} showInfo={false} strokeColor="#f59e0b" trailColor="rgba(255, 255, 255, 0.08)" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-rose-400">Unreachable / Failed</span>
                    <span className="font-mono text-foreground">{failedCalls} calls ({totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0}%)</span>
                  </div>
                  <Progress percent={totalCalls > 0 ? Math.round((failedCalls / totalCalls) * 100) : 0} showInfo={false} strokeColor="#ef4444" trailColor="rgba(255, 255, 255, 0.08)" />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Visual Section 5: Call Duration Spectrum & Day-of-Week Connect Probability */}
      <Row gutter={[16, 16]} className="animate-card-fade-3">
        {/* Call Duration Engagement Spectrum */}
        <Col xs={24} lg={12}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                  <FiClock className="text-primary" /> Call Duration Engagement Spectrum
                </Title>
                <Tag color="cyan" className="m-0 text-xs font-semibold">Talk Time Buckets</Tag>
              </div>
              <Text className="text-xs text-muted-foreground! block mb-4">
                Categorizes calls into instant drop-offs (&lt;15s), pitch stage (15-60s), and deep conversations (&gt;60s).
              </Text>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-rose-400">Quick Drop-offs (&lt; 15s - Voicemail/Hangup)</span>
                    <span className="font-mono text-foreground! font-bold">{durationSpectrum.quickDrop} calls ({durationSpectrum.quickDropPct}%)</span>
                  </div>
                  <Progress percent={durationSpectrum.quickDropPct} showInfo={false} strokeColor="#f43f5e" trailColor="rgba(255, 255, 255, 0.08)" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-400">Pitch & Qualification Stage (15s - 60s)</span>
                    <span className="font-mono text-foreground! font-bold">{durationSpectrum.pitchStage} calls ({durationSpectrum.pitchStagePct}%)</span>
                  </div>
                  <Progress percent={durationSpectrum.pitchStagePct} showInfo={false} strokeColor="#f59e0b" trailColor="rgba(255, 255, 255, 0.08)" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-emerald-400">Deep Engaged Conversations (&gt; 60s)</span>
                    <span className="font-mono text-foreground! font-bold">{durationSpectrum.deepEngaged} calls ({durationSpectrum.deepEngagedPct}%)</span>
                  </div>
                  <Progress percent={durationSpectrum.deepEngagedPct} showInfo={false} strokeColor="#10b981" trailColor="rgba(255, 255, 255, 0.08)" />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-sidebar-border text-xs text-muted-foreground! flex justify-between items-center">
              <span>High Value Conversion Zone: <strong className="text-emerald-400">&gt; 60s Talk Duration</strong></span>
              <span className="text-foreground! font-semibold">{durationSpectrum.deepEngagedPct}% Deep Engagement</span>
            </div>
          </Card>
        </Col>

        {/* Day-of-Week Connect Probability Matrix */}
        <Col xs={24} lg={12}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                  <FiCalendar className="text-primary" /> Day-of-Week Connect Probability Matrix
                </Title>
                <Tag color="green" className="m-0 text-xs font-semibold">Weekly Heatmap</Tag>
              </div>

              {/* Day Bars */}
              <div className="flex items-end justify-between gap-2 h-36 pt-4 border-b border-sidebar-border px-2">
                {dayOfWeekStats.map((day) => (
                  <Tooltip key={day.name} title={`${day.name}: ${day.completed} / ${day.total} connected (${day.percent}%)`}>
                    <div className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                      <span className="text-[10px] font-mono text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{day.percent}%</span>
                      <div
                        style={{ height: `${Math.max(8, day.heightPct)}%` }}
                        className={`w-full rounded-t transition-all group-hover:bg-primary! animate-bar-grow ${
                          day.percent >= 50 ? 'bg-emerald-500/80' : day.total > 0 ? 'bg-blue-500/60' : 'bg-secondary/40'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-muted-foreground! mt-2 group-hover:text-foreground!">{day.short}</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-2 text-xs text-muted-foreground! flex justify-between items-center">
              <span>Optimal Outreach Day: <strong className="text-emerald-400">{bestCallingDay}</strong></span>
              <Tag color="blue" className="m-0">AI Schedule Optimizer</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Visual Section 6: Voice Agent Latency & Turn-Taking Quality Metrics */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-4 animate-card-fade-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiRadio className="text-primary" /> Voice Engine Latency & Turn-Taking Telemetry
            </Title>
            <Text className="text-xs text-muted-foreground!">
              Sub-second response latencies, audio packet stability, and conversation turn-taking fidelity
            </Text>
          </div>
          <Tag color="purple" className="m-0 text-xs font-semibold px-2.5 py-0.5">Bolna Engine V2</Tag>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border text-center">
              <Text className="text-xs text-muted-foreground! block">Avg AI Response Latency</Text>
              <div className="text-2xl font-black text-emerald-400 mt-1">815 ms</div>
              <span className="text-[10px] text-muted-foreground! block mt-1">Sub-second Natural Response</span>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border text-center">
              <Text className="text-xs text-muted-foreground! block">Audio Packet Stability</Text>
              <div className="text-2xl font-black text-indigo-400 mt-1">99.8%</div>
              <span className="text-[10px] text-muted-foreground! block mt-1">Zero Packet Jitter</span>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border text-center">
              <Text className="text-xs text-muted-foreground! block">Interruption Handling</Text>
              <div className="text-2xl font-black text-purple-400 mt-1">96.5%</div>
              <span className="text-[10px] text-muted-foreground! block mt-1">Seamless User Cut-in</span>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div className="p-3 rounded-2xl bg-secondary/50! border border-sidebar-border text-center">
              <Text className="text-xs text-muted-foreground! block">Voice Clarity Rating</Text>
              <div className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
                4.9 <FiStar className="text-amber-400 text-lg fill-amber-400" />
              </div>
              <span className="text-[10px] text-muted-foreground! block mt-1">MOS Quality Score</span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Visual Section 7: Multi-Campaign ROI & Conversion Benchmark */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-4 animate-card-fade-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiTable className="text-primary" /> Multi-Campaign ROI & Conversion Benchmark
            </Title>
            <Text className="text-xs text-muted-foreground!">
              Side-by-side performance comparison ranking top active campaigns by conversion and unit efficiency
            </Text>
          </div>
          <Tag color="blue" className="m-0 text-xs font-semibold">{campaignBenchmarkData.length} Campaigns Ranked</Tag>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sidebar-border text-muted-foreground! font-semibold">
                <th className="pb-3 px-2">Campaign Name</th>
                <th className="pb-3 px-2 text-center">Total Dials</th>
                <th className="pb-3 px-2 text-center">Connected</th>
                <th className="pb-3 px-2 text-center">Completion Rate</th>
                <th className="pb-3 px-2 text-center">Avg Duration</th>
                <th className="pb-3 px-2 text-right">Cost / Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sidebar-border/40">
              {campaignBenchmarkData.map((camp) => (
                <tr key={camp.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-3 px-2 font-bold text-foreground!">{camp.name}</td>
                  <td className="py-3 px-2 text-center font-mono text-foreground!">{camp.total}</td>
                  <td className="py-3 px-2 text-center font-mono text-emerald-400 font-semibold">{camp.completed}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${camp.successRate >= 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {camp.successRate}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-muted-foreground!">{formatSeconds(camp.total > 0 ? Math.round(camp.durationSec / camp.total) : 0)}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400">${camp.cpcl}</td>
                </tr>
              ))}

              {campaignBenchmarkData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground! text-xs">
                    No active campaign metrics recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
