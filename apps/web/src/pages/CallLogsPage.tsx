import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Alert, Button, Card, Typography } from 'antd';
import { FiRefreshCw } from 'react-icons/fi';
import { getCallLogsDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import { CallLogRecordType } from '../utils';
import CallLogsTable from '../component/CallLogsTable';

const { Text, Title } = Typography;

export const CallLogsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { bulkCallNotice?: string } | null;

  const { data, loading, error, refetch } = useQuery(getCallLogsDocument, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) return <QueryLoading />;
  if (error && !data) return <QueryError error={error} />;

  const callLogs: CallLogRecordType[] =
    (data?.call_logs as CallLogRecordType[]) || [];

  const handleViewDetails = (record: CallLogRecordType) => {
    navigate(`/calls/logs/${record.id}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full p-2 sm:p-4">
      {locationState?.bulkCallNotice && (
        <Alert
          type="info"
          showIcon
          closable
          message="Bulk Call Campaign Initiated"
          description={locationState.bulkCallNotice}
          className="rounded-2xl border-primary/30 bg-primary/5"
        />
      )}

      <Card
        className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full"
        bodyStyle={{ padding: 24 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Title level={3} className="m-0! text-foreground!">
              Call Logs & Recording History
            </Title>
            <Text className="text-muted-foreground! text-sm!">
              Real-time monitoring of calls, transcripts, audio recordings, and
              AI disposition tags.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<FiRefreshCw />}
            onClick={() => refetch()}
            loading={loading}
            className="bg-primary! text-primary-foreground! border-primary!"
          >
            Refresh
          </Button>
        </div>

        <CallLogsTable
          data={callLogs}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
      </Card>
    </div>
  );
};

export default CallLogsPage;
