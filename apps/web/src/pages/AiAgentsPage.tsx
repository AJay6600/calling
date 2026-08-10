import { ComingSoonCard } from '../component';
import { FiCpu } from 'react-icons/fi';

export const AiAgentsPage = () => {
  return (
    <ComingSoonCard
      title="AI Voice Agents Studio"
      description="Configure custom system prompts, select voice characteristics, tune language settings, and test agent responses live."
      badge="AI Agents"
      icon={FiCpu}
    />
  );
};
