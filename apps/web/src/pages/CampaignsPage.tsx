import { ComingSoonCard } from '../component';
import { FiRadio } from 'react-icons/fi';

export const CampaignsPage = () => {
  return (
    <ComingSoonCard
      title="Campaign Management"
      description="Create, schedule, and orchestrate automated AI outbound calling runs with real-time progress tracking."
      badge="Campaigns"
      icon={FiRadio}
    />
  );
};
