import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Col,
  Row,
  Switch,
  Checkbox,
  Input as AntdInput,
  Select as AntdSelect,
  Typography,
  message,
} from 'antd';
import { FiEdit3, FiSave, FiSettings, FiRepeat, FiClock } from 'react-icons/fi';
import { FormItem } from './form-item/FormItem';
import { Input } from './input/Input';
import { Select } from './select/Select';
import { OptionsDataType } from '../utils';

const { Text } = Typography;

export type EditCampaignFormValues = {
  name: string;
  agentId: string;
  autoRetryEnabled: boolean;
  autoRetryConditions: string[];
  autoRetryMaxAttempts: number;
  autoRetryGapMinutes: number;
  callingWindowStart?: string;
  callingWindowEnd?: string;
  callingWindowTimezone: string;
};

const editCampaignSchema = yup.object({
  name: yup.string().required('Campaign name is required'),
  agentId: yup.string().required('AI Agent selection is required'),
  autoRetryEnabled: yup.boolean().default(false),
  autoRetryConditions: yup.array().of(yup.string().required()).default(['busy', 'no_answer']),
  autoRetryMaxAttempts: yup.number().min(1).max(5).default(1),
  autoRetryGapMinutes: yup.number().min(5).max(1440).default(15),
  callingWindowStart: yup.string().optional(),
  callingWindowEnd: yup.string().optional(),
  callingWindowTimezone: yup.string().default('Asia/Kolkata'),
});

const timezoneOptions = [
  { label: 'Asia/Kolkata (IST +5:30)', value: 'Asia/Kolkata' },
  { label: 'UTC', value: 'UTC' },
  { label: 'America/New_York (EST -5:00)', value: 'America/New_York' },
  { label: 'Europe/London (GMT +0:00)', value: 'Europe/London' },
];

interface EditCampaignModalProps {
  open: boolean;
  initialValues: {
    name: string;
    agentId: string;
    autoRetryEnabled: boolean;
    autoRetryConditions?: string[];
    autoRetryMaxAttempts?: number;
    autoRetryGapMinutes?: number;
    callingWindowStart?: string;
    callingWindowEnd?: string;
    callingWindowTimezone?: string;
  };
  agentOptions: OptionsDataType[];
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: EditCampaignFormValues) => Promise<void>;
}

export const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  open,
  initialValues,
  agentOptions,
  loading,
  onCancel,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditCampaignFormValues>({
    defaultValues: {
      name: initialValues.name,
      agentId: initialValues.agentId,
      autoRetryEnabled: initialValues.autoRetryEnabled ?? false,
      autoRetryConditions: initialValues.autoRetryConditions || ['busy', 'no_answer'],
      autoRetryMaxAttempts: initialValues.autoRetryMaxAttempts || 1,
      autoRetryGapMinutes: initialValues.autoRetryGapMinutes || 15,
      callingWindowStart: initialValues.callingWindowStart || '',
      callingWindowEnd: initialValues.callingWindowEnd || '',
      callingWindowTimezone: initialValues.callingWindowTimezone || 'Asia/Kolkata',
    },
    resolver: yupResolver(editCampaignSchema) as any,
  });

  useEffect(() => {
    reset({
      name: initialValues.name,
      agentId: initialValues.agentId,
      autoRetryEnabled: initialValues.autoRetryEnabled ?? false,
      autoRetryConditions: initialValues.autoRetryConditions || ['busy', 'no_answer'],
      autoRetryMaxAttempts: initialValues.autoRetryMaxAttempts || 1,
      autoRetryGapMinutes: initialValues.autoRetryGapMinutes || 15,
      callingWindowStart: initialValues.callingWindowStart || '',
      callingWindowEnd: initialValues.callingWindowEnd || '',
      callingWindowTimezone: initialValues.callingWindowTimezone || 'Asia/Kolkata',
    });
  }, [initialValues, reset]);

  const autoRetryEnabled = watch('autoRetryEnabled');
  const autoRetryConditions = watch('autoRetryConditions');

  const handleFormSubmit = async (values: EditCampaignFormValues) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      console.error('Error submitting edit campaign form:', err);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2 text-foreground! font-bold text-base">
          <FiEdit3 className="text-primary text-lg" /> Edit Campaign Details
        </div>
      }
      footer={null}
      destroyOnClose
      width={680}
      centered
      className="edit-campaign-modal"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 pt-2">
        {/* General Campaign Parameters */}
        <div className="space-y-3">
          <Text className="text-xs font-bold uppercase tracking-wider text-foreground! block border-b border-sidebar-border pb-1">
            General Campaign Details
          </Text>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FormItem label="Campaign Name" errorText={errors.name?.message} isRequired>
                <Input
                  name="name"
                  rhfControllerProps={{ control }}
                  hasError={!!errors.name}
                  placeholder="e.g. Q4 Product Demo Campaign"
                />
              </FormItem>
            </Col>

            <Col xs={24} md={12}>
              <FormItem label="Assigned AI Voice Agent" errorText={errors.agentId?.message} isRequired>
                <Select
                  name="agentId"
                  rhfControllerProps={{ control }}
                  hasError={!!errors.agentId}
                  options={agentOptions}
                  placeholder="Select AI Voice Agent"
                />
              </FormItem>
            </Col>
          </Row>
        </div>

        {/* Auto-Retry Configuration */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-sidebar-border pb-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-foreground! flex items-center gap-1.5">
              <FiRepeat className="text-primary" /> Auto-Retry Settings
            </Text>
            <Switch
              checked={autoRetryEnabled}
              onChange={(val) => setValue('autoRetryEnabled', val)}
              checkedChildren="Enabled"
              unCheckedChildren="Disabled"
            />
          </div>

          {autoRetryEnabled && (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <FormItem label="Retry Triggers (Call Outcomes)">
                  <Checkbox.Group
                    value={autoRetryConditions}
                    onChange={(vals) => setValue('autoRetryConditions', vals as string[])}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1"
                  >
                    <Checkbox value="no_answer">No Answer</Checkbox>
                    <Checkbox value="busy">Busy Line</Checkbox>
                    <Checkbox value="failed">Call Failed</Checkbox>
                    <Checkbox value="call_disconnected">Disconnected</Checkbox>
                  </Checkbox.Group>
                </FormItem>
              </Col>

              <Col xs={12}>
                <FormItem label="Max Retry Attempts">
                  <AntdInput
                    type="number"
                    min={1}
                    max={5}
                    value={watch('autoRetryMaxAttempts')}
                    onChange={(e) => setValue('autoRetryMaxAttempts', Number(e.target.value))}
                    className="w-full"
                  />
                </FormItem>
              </Col>

              <Col xs={12}>
                <FormItem label="Retry Gap (Minutes)">
                  <AntdInput
                    type="number"
                    min={5}
                    max={1440}
                    value={watch('autoRetryGapMinutes')}
                    onChange={(e) => setValue('autoRetryGapMinutes', Number(e.target.value))}
                    className="w-full"
                  />
                </FormItem>
              </Col>
            </Row>
          )}
        </div>

        {/* Calling Window Configuration */}
        <div className="space-y-3">
          <Text className="text-xs font-bold uppercase tracking-wider text-foreground! flex items-center gap-1.5 border-b border-sidebar-border pb-1">
            <FiClock className="text-primary" /> Calling Window Schedule
          </Text>

          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <FormItem label="Start Time (HH:mm)">
                <AntdInput
                  type="time"
                  value={watch('callingWindowStart')}
                  onChange={(e) => setValue('callingWindowStart', e.target.value)}
                  className="w-full"
                />
              </FormItem>
            </Col>

            <Col xs={12} sm={8}>
              <FormItem label="End Time (HH:mm)">
                <AntdInput
                  type="time"
                  value={watch('callingWindowEnd')}
                  onChange={(e) => setValue('callingWindowEnd', e.target.value)}
                  className="w-full"
                />
              </FormItem>
            </Col>

            <Col xs={24} sm={8}>
              <FormItem label="Timezone">
                <AntdSelect
                  options={timezoneOptions}
                  value={watch('callingWindowTimezone')}
                  onChange={(val) => setValue('callingWindowTimezone', val)}
                  className="w-full"
                />
              </FormItem>
            </Col>
          </Row>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-sidebar-border">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<FiSave />}
            className="bg-primary! text-primary-foreground! border-primary!"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCampaignModal;
