import { ComingSoonCard } from '../component';
import { FiUsers } from 'react-icons/fi';

export const LeadsPage = () => {
  return (
    <ComingSoonCard
      title="Lead Directory & Management"
      description="Upload CSV lead lists, segment contacts by attributes, and assign custom variables for personalized AI interactions."
      badge="Leads"
      icon={FiUsers}
    />
  );
};
