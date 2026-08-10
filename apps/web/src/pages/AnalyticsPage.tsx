import { ComingSoonCard } from '../component';
import { FiBarChart2 } from 'react-icons/fi';

export const AnalyticsPage = () => {
  return (
    <ComingSoonCard
      title="Performance Analytics & Reporting"
      description="Deep dive into call conversion funnels, response dispositions, talk-time breakdown, and campaign performance over time."
      badge="Analytics"
      icon={FiBarChart2}
    />
  );
};
