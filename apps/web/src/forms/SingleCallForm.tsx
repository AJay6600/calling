// SingleCallForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { OptionsDataType } from '../utils';
import { Button, Col, Divider, Row } from 'antd';
import { Select } from '../component/select/Select';
import { FormItem } from '../component/form-item/FormItem';
import { IoCall } from 'react-icons/io5';
import { FiUserPlus } from 'react-icons/fi';

export type SingleCallFormValues = {
  agentId: string;
  leadId: string;
};

type SingleCallFormPropsType = {
  agentData: OptionsDataType[];
  leadData: OptionsDataType[];
  onSubmit: (formData: SingleCallFormValues) => void | Promise<void>;
  onAddLeadClick: () => void;
  loading?: boolean;
};

const singleCallFormSchema = yup.object({
  agentId: yup.string().required('Agent is required'),
  leadId: yup.string().required('Lead is required'),
});

/**
 * Matches typed search text against an option's label, case-insensitive.
 * antd calls this per-option on every keystroke, so it's kept as a plain
 * top-level function rather than an inline closure in the Select prop.
 */
const filterLeadOption = (
  inputValue: string,
  option?: { label?: React.ReactNode },
) => {
  const label = String(option?.label ?? '');

  return label.toLowerCase().includes(inputValue.toLowerCase());
};

const SingleCallForm = ({
  agentData,
  leadData,
  onSubmit,
  onAddLeadClick,
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

  /**
   * Appends an "Add Lead" action below the options list inside the Lead
   * select's dropdown, so users can create a lead without leaving this
   * form. The mousedown handler is stopped/prevented because antd Select
   * closes its dropdown and steals focus on mousedown before the click
   * event fires, which would otherwise swallow the click.
   */
  const renderLeadDropdown = (menu: React.ReactNode) => (
    <>
      {menu}
      <Divider className="my-2! bg-sidebar-border!" />
      <Button
        type="text"
        block
        icon={<FiUserPlus />}
        className="text-left! justify-start! text-foreground! hover:text-primary!"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onAddLeadClick}
      >
        Add Lead
      </Button>
    </>
  );

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
              placeholder="Search or select a lead"
              rhfControllerProps={{ control }}
              options={leadData}
              hasError={!!errors.leadId}
              antdSelectProps={{
                showSearch: true,
                optionFilterProp: 'label',
                filterOption: filterLeadOption,
                dropdownRender: renderLeadDropdown,
              }}
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
