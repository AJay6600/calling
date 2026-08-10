import { ComingSoonCard } from '../component';
import { FiRadio } from 'react-icons/fi';

export const BulkCallPage = () => {
  return (
    <ComingSoonCard
      title="Bulk Calling Dispatch"
      description="Launch batch outbound calling queues across selected lead lists with automated pacing and concurrency control."
      badge="Bulk Call"
      icon={FiRadio}
    />
  );
};
