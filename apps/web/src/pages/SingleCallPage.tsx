import { ComingSoonCard } from '../component';
import { FiPhoneOutgoing } from 'react-icons/fi';

export const SingleCallPage = () => {
  return (
    <ComingSoonCard
      title="Single Instant Call"
      description="Trigger an instant, one-off AI call to a specified contact number with custom contextual instructions."
      badge="Single Call"
      icon={FiPhoneOutgoing}
    />
  );
};
