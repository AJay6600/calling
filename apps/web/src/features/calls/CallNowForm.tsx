import { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { FiPhoneOutgoing } from 'react-icons/fi';
import { triggerCall } from '../../api/calls.api';
import { isApiErrorResponse } from '../../utils';

type CallNowFormValuesType = {
  recipientPhoneNumber: string;
};

export const CallNowForm = () => {
  const [form] = Form.useForm<CallNowFormValuesType>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();

  const handleFinish = async (values: CallNowFormValuesType) => {
    setIsSubmitting(true);

    try {
      const result = await triggerCall(values.recipientPhoneNumber);
      message.success(`Call triggered — execution ID: ${result.executionId}`);
      form.resetFields();
    } catch (error) {
      const errorMessage = isApiErrorResponse(error)
        ? error.response.data.message
        : 'Failed to trigger call';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="inline" onFinish={handleFinish}>
      <Form.Item
        name="recipientPhoneNumber"
        rules={[
          { required: true, message: 'Phone number is required' },
          {
            pattern: /^\+[1-9]\d{7,14}$/,
            message: 'Use E.164 format, e.g. +919876543210',
          },
        ]}
      >
        <Input placeholder="+919876543210" style={{ width: 220 }} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<FiPhoneOutgoing />}
          loading={isSubmitting}
        >
          Call Now
        </Button>
      </Form.Item>
    </Form>
  );
};
