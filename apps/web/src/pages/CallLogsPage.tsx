import { ComingSoonCard } from '../component';
import { FiPhone } from 'react-icons/fi';

export const CallLogsPage = () => {
  return (
    <ComingSoonCard
      title="Call Logs & Recording History"
      description="Review full conversation audio recordings, transcripts, AI sentiment disposition tags, and metered durations."
      badge="Call Logs"
      icon={FiPhone}
    />
  );
};
