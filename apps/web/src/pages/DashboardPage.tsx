import { ComingSoonCard } from '../component';
import { FiGrid } from 'react-icons/fi';

export const DashboardPage = () => {
  return (
    <ComingSoonCard
      title="Command Center Dashboard"
      description="Live metrics, active call monitoring, wallet balance, and agent performance insights are currently being finalized."
      badge="Command Center"
      icon={FiGrid}
    />
  );
};
