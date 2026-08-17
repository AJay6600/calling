import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { OptionsDataType } from '../utils';
import { Button, Col, Row } from 'antd';
import { Select } from '../component/select/Select';
import { FormItem } from '../component/form-item/FormItem';
import { IoCall } from 'react-icons/io5';

export type SingleCallFormValues = {
  agentId: string;
  leadId: string;
};

type SingleCallFormPropsType = {
  agentData: OptionsDataType[];
  leadData: OptionsDataType[];
  onSubmit: (formData: SingleCallFormValues) => void | Promise<void>;
  loading?: boolean;
};

const singleCallFormSchema = yup.object({
  agentId: yup.string().required('Agent is required'),
  leadId: yup.string().required('Lead is required'),
});

const SingleCallForm = ({
  agentData,
  leadData,
  onSubmit,
  loading,
}: SingleCallFormPropsType) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SingleCallFormValues>({
    defaultValues: { agentId: undefined, leadId: undefined },
    mode: 'onChange',
    resolver: yupResolver(singleCallFormSchema),
  });

  const handleFormSubmit = async (formData: SingleCallFormValues) => {
    try {
      await onSubmit(formData);
      reset();
    } catch {
      // Keep form inputs on error
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Row>
        <Col span={24}>
          <FormItem
            isRequired
            label="Agent"
            errorText={errors && errors.agentId && errors.agentId.message}
          >
            <Select
              name="agentId"
              placeholder="Select the agent"
              rhfControllerProps={{ control }}
              options={agentData}
              hasError={!!errors.agentId}
            />
          </FormItem>
        </Col>

        <Col span={24}>
          <FormItem
            isRequired
            label="Lead"
            errorText={errors && errors.leadId && errors.leadId.message}
          >
            <Select
              name="leadId"
              placeholder="Select a lead"
              rhfControllerProps={{ control }}
              options={leadData}
              hasError={!!errors.leadId}
            />
          </FormItem>
        </Col>

        <Col span={24} className="mt-8">
          <Button
            htmlType="submit"
            size="large"
            type="primary"
            loading={loading}
            icon={<IoCall />}
            className="w-full"
          >
            Place call
          </Button>
        </Col>
      </Row>
    </form>
  );
};

export default SingleCallForm;
