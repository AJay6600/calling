import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Card,
  Col,
  Input,
  Row,
  Table,
  Tag,
  Typography,
  Button,
  Tooltip,
  message,
} from 'antd';
import {
  FiCpu,
  FiSearch,
  FiCopy,
  FiGlobe,
} from 'react-icons/fi';
import { getAgentsDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';

const { Title, Text } = Typography;

const getLanguageLabel = (langId?: string | null) => {
  const code = (langId || 'en').toLowerCase();
  if (code.includes('hi-en') || code.includes('hinglish')) return 'Hinglish (HI-EN)';
  if (code.includes('hi') || code.includes('hindi')) return 'Hindi (HI)';
  if (code.includes('en') || code.includes('english')) return 'English (EN)';
  return langId || 'Multilingual';
};

const getLanguageColor = (langId?: string | null) => {
  const code = (langId || 'en').toLowerCase();
  if (code.includes('hi-en') || code.includes('hinglish')) return 'purple';
  if (code.includes('hi') || code.includes('hindi')) return 'orange';
  if (code.includes('en') || code.includes('english')) return 'blue';
  return 'cyan';
};

export const AiAgentsPage = () => {
  const { data, loading, error } = useQuery(getAgentsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const agents = data?.agents || [];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Copied ${label} to clipboard`);
  };

  // Stats calculation
  const totalAgents = agents.length;

  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach((agent) => {
      const label = getLanguageLabel(agent.language_id);
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [agents]);

  const uniqueLanguagesCount = Object.keys(languageStats).length;

  const languageFilterOptions = useMemo(() => {
    const uniqueLabels = Array.from(
      new Set(agents.map((a) => getLanguageLabel(a.language_id))),
    );
    return uniqueLabels.map((lbl) => ({ text: lbl, value: lbl }));
  }, [agents]);

  if (loading && !data) return <QueryLoading />;
  if (error && !data) return <QueryError error={error} />;

  const tableColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-muted-foreground!">{index + 1}</span>
      ),
    },
    {
      title: 'Agent Name',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div className="p-3 space-y-3 w-64 bg-card! border! border-sidebar-border! rounded-xl shadow-2xl">
          <Input
            placeholder="Search agent name..."
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            size="small"
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-1 border-t border-sidebar-border">
            <Button
              size="small"
              type="text"
              onClick={() => clearFilters && clearFilters()}
              className="text-xs text-muted-foreground! hover:text-foreground!"
            >
              Reset
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => confirm()}
              className="bg-primary! text-primary-foreground! border-primary! text-xs font-semibold"
            >
              Search
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <FiSearch className={filtered ? 'text-primary font-bold text-base' : 'text-muted-foreground text-sm'} />
      ),
      onFilter: (value: any, record: any) =>
        record.name.toLowerCase().includes(String(value).toLowerCase()),
      render: (name: string) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            <FiCpu />
          </div>
          <span className="font-semibold text-foreground!">{name}</span>
        </div>
      ),
    },
    {
      title: 'Bolna Agent ID',
      dataIndex: 'bolna_agent_id',
      key: 'bolna_agent_id',
      render: (bolnaId: string, record: any) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-foreground! bg-secondary! px-2 py-1 rounded-lg border border-sidebar-border">
            {bolnaId}
          </span>
          <Tooltip title="Copy Bolna Agent ID">
            <Button
              type="text"
              size="small"
              icon={<FiCopy />}
              onClick={() => handleCopy(bolnaId, `Bolna ID for "${record.name}"`)}
              className="text-muted-foreground hover:text-primary p-1 h-auto"
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Language',
      dataIndex: 'language_id',
      key: 'language_id',
      filters: languageFilterOptions,
      onFilter: (value: any, record: any) =>
        getLanguageLabel(record.language_id) === value,
      render: (langId: string) => (
        <Tag color={getLanguageColor(langId)} className="font-medium">
          {getLanguageLabel(langId)}
        </Tag>
      ),
    },
    {
      title: 'Internal DB ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <span className="font-mono text-xs text-muted-foreground!">{id}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-2 sm:p-4">
      {/* Header Title */}
      <div>
        <Title level={3} className="m-0! text-foreground! flex items-center gap-2">
          <FiCpu className="text-primary text-2xl" /> AI Voice Agents
        </Title>
        <Text className="text-xs text-muted-foreground! block mt-1">
          Overview of available AI Voice Agents, language distributions, and agent identifiers.
        </Text>
      </div>

      {/* KPI Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center h-full flex flex-col justify-center">
            <Text className="text-xs text-muted-foreground! block font-medium">Total Voice Agents</Text>
            <div className="text-3xl font-bold text-foreground! mt-1 flex items-center justify-center gap-2">
              <FiCpu className="text-primary text-xl" /> {totalAgents}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! text-center h-full flex flex-col justify-center">
            <Text className="text-xs text-muted-foreground! block font-medium">Total Languages</Text>
            <div className="text-3xl font-bold text-foreground! mt-1 flex items-center justify-center gap-2">
              <FiGlobe className="text-emerald-500 text-xl" /> {uniqueLanguagesCount}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="bg-card! border! border-sidebar-border! rounded-2xl! h-full flex flex-col justify-center">
            <Text className="text-xs text-muted-foreground! block font-medium mb-2 text-center">
              Agents per Language
            </Text>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {Object.entries(languageStats).map(([lang, count]) => (
                <Tag color={getLanguageColor(lang)} key={lang} className="m-0 text-xs font-semibold px-2 py-0.5">
                  {lang}: <span className="font-bold">{count}</span>
                </Tag>
              ))}
              {uniqueLanguagesCount === 0 && (
                <Text className="text-xs text-muted-foreground">None</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Agents Table Section */}
      <Card className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm overflow-hidden">
        <Table
          dataSource={agents}
          columns={tableColumns}
          rowKey="id"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          className="text-foreground!"
        />
      </Card>
    </div>
  );
};

export default AiAgentsPage;
