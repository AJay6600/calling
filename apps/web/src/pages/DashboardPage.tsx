import { ComingSoonCard } from '../component';
import { FiGrid } from 'react-icons/fi';
import { apiClient } from '../utils';

export const DashboardPage = () => {
  const handleCheckMe = async () => {
    try {
      const response = await apiClient.get('/api/me');
      console.log('me:', response.data);
    } catch (error) {
      console.error('me failed:', error);
    }
  };
  return (
    <>
      <button onClick={handleCheckMe}>Check /api/me</button>
      <ComingSoonCard
        title="Command Center Dashboard"
        description="Live metrics, active call monitoring, wallet balance, and agent performance insights are currently being finalized."
        badge="Command Center"
        icon={FiGrid}
      />
    </>
  );
};
