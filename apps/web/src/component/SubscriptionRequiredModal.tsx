import React from 'react';
import { Modal, Button, Tag } from 'antd';
import { FiAlertTriangle, FiCreditCard, FiZap, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export interface SubscriptionRequiredModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  errorMessage?: string;
}

export const SubscriptionRequiredModal: React.FC<SubscriptionRequiredModalProps> = ({
  open,
  onClose,
  title = 'Subscription Required to Place Calls',
  errorMessage = 'Your organization subscription has expired or has 0 remaining call seconds. All call placement and campaign execution features are currently paused.',
}) => {
  const navigate = useNavigate();

  const handleGoToBilling = () => {
    onClose();
    navigate('/billing');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="subscription-modal"
    >
      <div className="flex flex-col items-center text-center p-2 sm:p-4 space-y-4">
        {/* Glowing Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/10">
          <FiAlertTriangle />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Tag color="volcano" className="m-0 font-bold text-[11px] px-2 py-0.5 tracking-wider">
              CALLING PAUSED
            </Tag>
          </div>
          <h3 className="text-xl font-bold text-foreground! m-0">
            {title}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground! leading-relaxed bg-secondary/40 p-3.5 rounded-2xl border border-sidebar-border text-left">
          {errorMessage}
        </p>

        {/* Purchase Instructions Box */}
        <div className="w-full bg-primary/10! border border-primary/30! p-4 rounded-2xl text-left space-y-2.5">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <FiZap className="text-sm" /> How to Resume Calling:
          </span>

          <ol className="text-xs text-foreground! space-y-1.5 list-decimal list-inside font-medium">
            <li>Click <strong>"Upgrade Subscription Now"</strong> below.</li>
            <li>Select an active plan (Starter, Growth, or Enterprise).</li>
            <li>Call seconds credit instantly & calling features unblock.</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-3 pt-2">
          <Button
            onClick={onClose}
            className="flex-1 text-xs font-semibold"
          >
            Close
          </Button>
          <Button
            type="primary"
            onClick={handleGoToBilling}
            icon={<FiCreditCard />}
            className="flex-1 text-xs font-bold bg-primary! text-primary-foreground! border-primary! hover:bg-primary/90! shadow-md py-2 flex items-center justify-center gap-1"
          >
            Upgrade Subscription <FiArrowRight />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionRequiredModal;
