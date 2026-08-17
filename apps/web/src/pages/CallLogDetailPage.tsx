import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Button, Result } from 'antd';
import { FiArrowLeft } from 'react-icons/fi';
import { getCallLogByIdDocument } from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import CallLogDetailView from '../component/CallLogDetailView';
import { CallLogRecordType } from '../utils';
import { useSetPageHeader } from '../contexts/PageHeaderContext';

export const CallLogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(getCallLogByIdDocument, {
    variables: { id: id ?? '' },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const handleBack = () => navigate('/calls/logs');

  // total_cost comes back as `unknown` from codegen because it maps to a
  // custom numeric scalar with no scalar type mapping configured. Cast it
  // to the shape CallLogDetailView actually expects rather than loosening
  // CallLogRecordType itself.
  const record = data?.call_logs_by_pk
    ? ({
        ...data.call_logs_by_pk,
        total_cost:
          data.call_logs_by_pk.total_cost != null
            ? Number(data.call_logs_by_pk.total_cost)
            : null,
      } as CallLogRecordType)
    : undefined;

  // Push title/subtext/back-button into the AppLayout header instead of
  // rendering a local one. Re-runs when the record id changes; clears
  // automatically on unmount (see useSetPageHeader).
  useSetPageHeader(
    {
      title: 'Call Details',
      subtext: record?.id ? `ID: ${record.id}` : id ? `ID: ${id}` : undefined,
      onBack: handleBack,
    },
    [record?.id, id],
  );

  if (loading && !data) return <QueryLoading />;
  if (error && !data) return <QueryError error={error} />;

  if (!record) {
    return (
      <div className="p-2 sm:p-4">
        <Result
          status="404"
          title={<span className="text-foreground!">Call not found</span>}
          subTitle={
            <span className="text-muted-foreground!">
              This call log doesn't exist or was removed.
            </span>
          }
          extra={
            <Button type="primary" icon={<FiArrowLeft />} onClick={handleBack}>
              Back to Call Logs
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full p-2 sm:p-4">
      <CallLogDetailView record={record} />
    </div>
  );
};

export default CallLogDetailPage;
