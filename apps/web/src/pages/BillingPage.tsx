import { ComingSoonCard } from '../component';
import { FiCreditCard } from 'react-icons/fi';

export const BillingPage = () => {
  return (
    <ComingSoonCard
      title="Wallet Balance & Billing Management"
      description="Top up your call wallet balance with Razorpay, set auto-recharge thresholds, view per-second usage ledgers, and manage plans."
      badge="Billing & Subscriptions"
      icon={FiCreditCard}
    />
  );
};
