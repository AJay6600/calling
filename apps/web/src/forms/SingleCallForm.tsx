import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { OptionsDataType } from '../utils';
import { Button, Col, Row } from 'antd';
import { Select } from '../component/select/Select';
import { FormItem } from '../component/form-item/FormItem';
import { Input } from '../component/input/Input';
import { IoCall } from 'react-icons/io5';

export type SingleCallFormValues = {
  agentId: string;
  receiverPhoneNumber: string;
};

type SingleCallFormPropsType = {
  agentData: OptionsDataType[];
  onSubmit: (formData: SingleCallFormValues) => void | Promise<void>;
  loading?: boolean;
};

/** Matches Indian mobile numbers in E.164 format: +91 followed by a
 * 10-digit number starting with 6-9 (valid Indian mobile prefixes).
 * e.g. +919820144210
 */
const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

const singleCallFormSchema = yup.object({
  agentId: yup.string().required('Agent is required'),
  receiverPhoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(
      indianPhoneRegex,
      'Enter a valid Indian phone number (e.g. +919820144210)',
    ),
});

const SingleCallForm = ({ agentData, onSubmit, loading }: SingleCallFormPropsType) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SingleCallFormValues>({
    defaultValues: { agentId: undefined, receiverPhoneNumber: '' },
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
            label="Receiver Number"
            errorText={errors && errors.receiverPhoneNumber && errors.receiverPhoneNumber.message}
          >
            <Input
              name="receiverPhoneNumber"
              placeholder="Enter phone number"
              rhfControllerProps={{ control }}
              hasError={!!errors.receiverPhoneNumber}
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