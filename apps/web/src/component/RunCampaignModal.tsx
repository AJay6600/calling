import { useState } from 'react';
import { DatePicker, Modal, Radio, Space, Tag, Typography, Button } from 'antd';
import { FiClock, FiPlay, FiCalendar } from 'react-icons/fi';
import dayjs, { Dayjs } from 'dayjs';

const { Text, Title } = Typography;

type RunCampaignModalPropsType = {
  open: boolean;
  campaignName: string;
  agentName: string;
  leadCount: number;
  loading?: boolean;
  onCancel: () => void;
  onRun: (scheduledAt?: string) => void | Promise<void>;
};

export const RunCampaignModal = ({
  open,
  campaignName,
  agentName,
  leadCount,
  loading,
  onCancel,
  onRun,
}: RunCampaignModalPropsType) => {
  const [runMode, setRunMode] = useState<'now' | 'schedule'>('now');
  const [scheduledTime, setScheduledTime] = useState<Dayjs | null>(null);

  const handleShortcutClick = (minutes: number) => {
    setRunMode('schedule');
    setScheduledTime(dayjs().add(minutes, 'minute'));
  };

  const handleConfirm = () => {
    if (runMode === 'schedule') {
      if (!scheduledTime) {
        return;
      }
      onRun(scheduledTime.toISOString());
    } else {
      onRun();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2 text-foreground! font-bold text-base">
          <FiPlay className="text-primary" /> Run Campaign: {campaignName}
        </div>
      }
      footer={null}
      destroyOnClose
      width={480}
      centered
      className="run-campaign-modal"
    >
      <div className="space-y-5 pt-2">
        {/* Campaign Summary */}
        <div className="bg-secondary/80! p-4 rounded-2xl border! border-sidebar-border! space-y-2.5">
          <div className="flex justify-between text-xs text-foreground/80!">
            <span>AI Voice Agent:</span>
            <span className="font-semibold text-foreground!">{agentName}</span>
          </div>
          <div className="flex justify-between text-xs text-foreground/80!">
            <span>Target Audience:</span>
            <Tag color="blue" className="m-0 font-medium">
              {leadCount} Leads
            </Tag>
          </div>
        </div>

        {/* Execution Options */}
        <div>
          <span className="text-xs font-semibold text-foreground! block mb-2">
            Execution Timing:
          </span>
          <div className="grid grid-cols-2 gap-2 bg-secondary! p-1 rounded-xl border! border-sidebar-border!">
            <button
              type="button"
              onClick={() => setRunMode('now')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                runMode === 'now'
                  ? 'bg-primary! text-primary-foreground! shadow-md'
                  : 'bg-transparent text-foreground! hover:bg-card!'
              }`}
            >
              Run Now
            </button>
            <button
              type="button"
              onClick={() => setRunMode('schedule')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                runMode === 'schedule'
                  ? 'bg-primary! text-primary-foreground! shadow-md'
                  : 'bg-transparent text-foreground! hover:bg-card!'
              }`}
            >
              Schedule for Later
            </button>
          </div>
        </div>

        {runMode === 'schedule' && (
          <div className="space-y-3 pt-1">
            <span className="text-xs text-foreground/80! block">
              Quick Select Shortcuts:
            </span>
            <Space wrap>
              <Button
                size="small"
                icon={<FiClock />}
                onClick={() => handleShortcutClick(10)}
                className="text-xs"
              >
                In 10 mins
              </Button>
              <Button
                size="small"
                icon={<FiClock />}
                onClick={() => handleShortcutClick(30)}
                className="text-xs"
              >
                In 30 mins
              </Button>
              <Button
                size="small"
                icon={<FiClock />}
                onClick={() => handleShortcutClick(60)}
                className="text-xs"
              >
                In 1 hour
              </Button>
            </Space>

            <div className="pt-2">
              <span className="text-xs text-foreground/80! block mb-1">
                Custom Schedule Time:
              </span>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className="w-full"
                value={scheduledTime}
                onChange={(val) => setScheduledTime(val)}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-sidebar-border">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            loading={loading}
            icon={runMode === 'now' ? <FiPlay /> : <FiCalendar />}
            onClick={handleConfirm}
            className="bg-primary! text-primary-foreground! border-primary!"
          >
            {runMode === 'now' ? 'Launch Campaign Now' : 'Schedule Campaign'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RunCampaignModal;
