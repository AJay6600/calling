import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Col, Modal, Row } from 'antd';
import { FiEdit2, FiUserPlus } from 'react-icons/fi';
import { FormItem } from '../component/form-item/FormItem';
import { Input } from '../component/input/Input';
import { Select } from '../component/select/Select';
import { OptionsDataType } from '../utils';

export type LeadFormValues = {
  phoneNumber: string;
  fullName: string;
  email: string;
  companyName: string;
  status: string;
};

type LeadFormPropsType = {
  open: boolean;
  mode?: 'create' | 'edit';
  initialValues?: LeadFormValues;
  statusOptions: OptionsDataType[];
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: LeadFormValues) => void | Promise<void>;
};

const e164Pattern = /^\+[1-9]\d{7,14}$/;

const leadFormSchema = yup.object({
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(
      e164Pattern,
      'Enter a valid E.164 phone number (e.g. +1234567890)',
    ),
  fullName: yup.string().default(''),
  email: yup
    .string()
    .default('')
    .test('email', 'Enter a valid email address', (value) => {
      if (!value || value.trim() === '') return true;
      return yup.string().email().isValidSync(value);
    }),
  companyName: yup.string().default(''),
  status: yup.string().default('new'),
});

const defaultValues: LeadFormValues = {
  phoneNumber: '',
  fullName: '',
  email: '',
  companyName: '',
  status: 'new',
};

const LeadForm = ({
  open,
  mode = 'create',
  initialValues,
  statusOptions,
  loading = false,
  onCancel,
  onSubmit,
}: LeadFormPropsType) => {
  const isEditMode = mode === 'edit';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(leadFormSchema),
  });

  useEffect(() => {
    if (open) {
      reset(initialValues ?? defaultValues);
      return;
    }

    reset(defaultValues);
  }, [open, initialValues, reset]);

  const handleFormSubmit = async (formData: LeadFormValues) => {
    try {
      await onSubmit(formData);
      reset(defaultValues);
    } catch {
      // Keep form inputs on error
    }
  };

  return (
    <Modal
      title={isEditMode ? 'Edit Lead' : 'Add Lead'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={480}
      centered
      styles={{ container: { background: 'var(--card)' } }}
      className="lead-form-modal"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Row className='bg-card!'>
          <Col span={24}>
            <FormItem
              isRequired
              label="Phone Number"
              errorText={
                errors && errors.phoneNumber && errors.phoneNumber.message
              }
            >
              <Input
                name="phoneNumber"
                placeholder="Enter phone number"
                rhfControllerProps={{ control }}
                hasError={!!errors.phoneNumber}
                antdInputProps={{ type: 'tel' }}
              />
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem
              label="Full Name"
              errorText={errors && errors.fullName && errors.fullName.message}
            >
              <Input
                name="fullName"
                placeholder="Enter full name"
                rhfControllerProps={{ control }}
                hasError={!!errors.fullName}
              />
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem
              label="Email Address"
              errorText={errors && errors.email && errors.email.message}
            >
              <Input
                name="email"
                placeholder="Enter email address"
                rhfControllerProps={{ control }}
                hasError={!!errors.email}
                antdInputProps={{ type: 'email' }}
              />
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem
              label="Company Name"
              errorText={
                errors && errors.companyName && errors.companyName.message
              }
            >
              <Input
                name="companyName"
                placeholder="Enter company name"
                rhfControllerProps={{ control }}
                hasError={!!errors.companyName}
              />
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem
              label="Status"
              errorText={errors && errors.status && errors.status.message}
            >
              <Select
                name="status"
                placeholder="Select status"
                rhfControllerProps={{ control }}
                options={statusOptions}
                hasError={!!errors.status}
              />
            </FormItem>
          </Col>

          <Col span={24} className="mt-8">
            <Button
              htmlType="submit"
              size="large"
              type="primary"
              loading={loading}
              icon={isEditMode ? <FiEdit2 /> : <FiUserPlus />}
              className="w-full"
            >
              {isEditMode ? 'Save Changes' : 'Add Lead'}
            </Button>
          </Col>
        </Row>
      </form>
    </Modal>
  );
};

export default LeadForm;
