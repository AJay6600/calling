import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input as AntdInput,
  Radio,
  Row,
  Select as AntdSelect,
  Switch,
  Table,
  Tag,
  TimePicker,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  FiDownload,
  FiFileText,
  FiUploadCloud,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiRepeat,
} from 'react-icons/fi';
import { FormItem } from '../component/form-item/FormItem';
import { Input } from '../component/input/Input';
import { Select } from '../component/select/Select';
import {
  OptionsDataType,
  parseLeadsCsv,
  ParsedCsvLead,
  CsvParseResult,
  getSampleLeadsCsv,
  LeadRecordType,
} from '../utils';

const { Text, Title } = Typography;

export type CreateCampaignFormValues = {
  name: string;
  agentId: string;
  leadSourceType: 'csv' | 'existing';
  selectedLeadIds?: string[];
  autoRetryEnabled: boolean;
  autoRetryConditions: string[];
  autoRetryMaxAttempts: number;
  autoRetryGapMinutes: number;
  callingWindowEnabled: boolean;
  callingWindowStart?: string;
  callingWindowEnd?: string;
  callingWindowTimezone: string;
};

type CreateCampaignFormPropsType = {
  agentOptions: OptionsDataType[];
  existingLeads: LeadRecordType[];
  onSubmit: (
    values: CreateCampaignFormValues,
    parsedLeads: ParsedCsvLead[],
  ) => void | Promise<void>;
  loading?: boolean;
};

const createCampaignSchema = yup.object({
  name: yup.string().required('Campaign name is required'),
  agentId: yup.string().required('AI Agent selection is required'),
  leadSourceType: yup
    .mixed<'csv' | 'existing'>()
    .oneOf(['csv', 'existing'])
    .default('csv'),
  selectedLeadIds: yup.array().of(yup.string().required()).default([]),
  autoRetryEnabled: yup.boolean().default(false),
  autoRetryConditions: yup.array().of(yup.string().required()).default(['busy', 'no_answer']),
  autoRetryMaxAttempts: yup.number().min(1).max(5).default(1),
  autoRetryGapMinutes: yup.number().min(5).max(1440).default(15),
  callingWindowEnabled: yup.boolean().default(false),
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

export const CreateCampaignForm = ({
  agentOptions,
  existingLeads,
  onSubmit,
  loading,
}: CreateCampaignFormPropsType) => {
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCampaignFormValues>({
    defaultValues: {
      name: '',
      agentId: undefined,
      leadSourceType: 'csv',
      selectedLeadIds: [],
      autoRetryEnabled: false,
      autoRetryConditions: ['busy', 'no_answer'],
      autoRetryMaxAttempts: 1,
      autoRetryGapMinutes: 15,
      callingWindowEnabled: false,
      callingWindowTimezone: 'Asia/Kolkata',
    },
    mode: 'onChange',
    resolver: yupResolver(createCampaignSchema) as any,
  });

  const leadSourceType = watch('leadSourceType');
  const autoRetryEnabled = watch('autoRetryEnabled');
  const autoRetryConditions = watch('autoRetryConditions');
  const callingWindowEnabled = watch('callingWindowEnabled');

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const result = parseLeadsCsv(content);
        setParseResult(result);
        setFileName(file.name);
        if (result.validCount === 0) {
          message.error('No valid phone numbers found in uploaded CSV file.');
        } else {
          message.success(
            `Parsed ${result.totalCount} rows: ${result.validCount} valid lead(s).`,
          );
        }
      }
    };
    reader.onerror = () => {
      message.error('Failed to read CSV file');
    };
    reader.readAsText(file);
    return false;
  };

  const handleDownloadSample = () => {
    const sampleText = getSampleLeadsCsv();
    const blob = new Blob([sampleText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_campaign_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (formData: CreateCampaignFormValues) => {
    if (formData.leadSourceType === 'csv') {
      if (!parseResult || parseResult.validCount === 0) {
        message.error('Please upload a CSV file containing valid leads.');
        return;
      }
      const validLeads = parseResult.leads.filter((l) => l.isValid);
      await onSubmit(formData, validLeads);
    } else {
      if (!formData.selectedLeadIds || formData.selectedLeadIds.length === 0) {
        message.error('Please select at least one lead from the list.');
        return;
      }
      await onSubmit(formData, []);
    }
  };

  const tableColumns = [
    {
      title: '#',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 60,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text: string, record: ParsedCsvLead) => (
        <span className={record.isValid ? 'font-medium text-foreground!' : 'text-destructive font-medium'}>
          {text || '—'}
        </span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => <span className="text-foreground! italic">{text || 'Not provided'}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <span className="text-foreground! italic">{text || 'Not provided'}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text: string) => <span className="text-foreground! italic">{text || 'Not provided'}</span>,
    },
    {
      title: 'Status',
      key: 'isValid',
      width: 140,
      render: (_: unknown, record: ParsedCsvLead) =>
        record.isValid ? (
          <Tag color="success" icon={<FiCheckCircle />} className="bg-transparent! border-success!">
            Valid
          </Tag>
        ) : (
          <Tag color="error" icon={<FiAlertCircle />}>
            Invalid Format
          </Tag>
        ),
    },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      {/* Basic Campaign Info */}
      <Card
        className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm"
        bodyStyle={{ padding: 20 }}
      >
        <Title level={5} className="m-0! mb-4 text-foreground! flex items-center gap-2">
          <FiFileText className="text-primary" /> Basic Campaign Details
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <FormItem
              isRequired
              label="Campaign Name"
              errorText={errors && errors.name && errors.name.message}
            >
              <Input
                name="name"
                placeholder="e.g. Q3 QBR Followup Outreach"
                rhfControllerProps={{ control }}
                hasError={!!errors.name}
              />
            </FormItem>
          </Col>

          <Col xs={24} md={12}>
            <FormItem
              isRequired
              label="Assigned AI Voice Agent"
              errorText={errors && errors.agentId && errors.agentId.message}
            >
              <Select
                name="agentId"
                placeholder="Select an agent for this campaign"
                rhfControllerProps={{ control }}
                options={agentOptions}
                hasError={!!errors.agentId}
              />
            </FormItem>
          </Col>
        </Row>
      </Card>

      {/* Lead Source Selection */}
      <Card
        className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm"
        bodyStyle={{ padding: 20 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiUsers className="text-primary" /> Lead Selection & Audience
            </Title>
            <Text className="text-muted-foreground! text-xs!">
              Choose whether to upload a fresh CSV file or select from existing contacts in your database.
            </Text>
          </div>

          <Radio.Group
            value={leadSourceType}
            onChange={(e) => setValue('leadSourceType', e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="csv">Upload CSV</Radio.Button>
            <Radio.Button value="existing">Select Existing Leads</Radio.Button>
          </Radio.Group>
        </div>

        {leadSourceType === 'csv' ? (
          <div>
            <div className="flex justify-end mb-3">
              <Button
                type="default"
                size="small"
                icon={<FiDownload />}
                onClick={handleDownloadSample}
                className="text-xs flex items-center gap-1"
              >
                Sample CSV Template
              </Button>
            </div>

            <Upload.Dragger
              name="file"
              accept=".csv"
              multiple={false}
              showUploadList={false}
              beforeUpload={handleFileRead}
              className="bg-background! border-dashed! border-sidebar-border! rounded-xl! hover:border-primary! p-4 mb-4"
            >
              <p className="flex justify-center text-primary text-3xl mb-2">
                <FiUploadCloud />
              </p>
              <p className="ant-upload-text font-medium text-foreground! text-sm">
                {fileName ? (
                  <span className="text-primary font-semibold flex items-center justify-center gap-2">
                    <FiFileText /> Loaded: {fileName}
                  </span>
                ) : (
                  'Click or drag CSV file to upload campaign leads'
                )}
              </p>
              <p className="ant-upload-hint text-xs text-muted-foreground! mt-1">
                Supports E.164 phone formats (e.g. +919876543210). Columns: phone_number, name, email, company_name.
              </p>
            </Upload.Dragger>

            {parseResult && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge count={parseResult.validCount} overflowCount={9999} color="#10b981" />
                    <Text className="font-semibold text-foreground!">
                      Parsed Leads Preview ({parseResult.validCount} valid / {parseResult.totalCount} total)
                    </Text>
                  </div>
                </div>

                {parseResult.invalidCount > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    message={`${parseResult.invalidCount} invalid row(s) detected and will be skipped.`}
                    className="text-xs"
                  />
                )}

                <Table
                  dataSource={parseResult.leads}
                  columns={tableColumns}
                  rowKey={(record) => `${record.rowNumber}-${record.phoneNumber}`}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  size="small"
                  scroll={{ x: true }}
                  className="rounded-lg overflow-hidden border border-sidebar-border text-foreground!"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Text className="text-xs text-muted-foreground! block">
                Select one or more existing leads for this campaign:
              </Text>
              {existingLeads.length > 0 && (
                <Button
                  type="link"
                  size="small"
                  className="p-0 text-xs font-semibold text-primary h-auto flex items-center"
                  onClick={() => {
                    const currentSelected = watch('selectedLeadIds') || [];
                    const allIds = existingLeads.map((l) => l.id);
                    if (currentSelected.length === existingLeads.length) {
                      setValue('selectedLeadIds', []);
                    } else {
                      setValue('selectedLeadIds', allIds);
                    }
                  }}
                >
                  {(watch('selectedLeadIds') || []).length === existingLeads.length
                    ? 'Deselect All Leads'
                    : `Select All Leads (${existingLeads.length})`}
                </Button>
              )}
            </div>
            <AntdSelect
              mode="multiple"
              allowClear
              placeholder="Search and select leads"
              className="w-full"
              options={[
                ...(existingLeads.length > 0
                  ? [
                      {
                        label:
                          (watch('selectedLeadIds') || []).length === existingLeads.length
                            ? '✓ Select All Leads (Selected)'
                            : `Select All Leads (${existingLeads.length})`,
                        value: '__SELECT_ALL__',
                      },
                    ]
                  : []),
                ...existingLeads.map((l) => ({
                  label: `${l.name || 'Unknown'} · ${l.phone_number}`,
                  value: l.id,
                })),
              ]}
              value={watch('selectedLeadIds')}
              onChange={(vals: string[]) => {
                if (vals.includes('__SELECT_ALL__')) {
                  const currentSelected = watch('selectedLeadIds') || [];
                  const allIds = existingLeads.map((l) => l.id);
                  if (currentSelected.length === existingLeads.length) {
                    setValue('selectedLeadIds', []);
                  } else {
                    setValue('selectedLeadIds', allIds);
                  }
                } else {
                  setValue('selectedLeadIds', vals);
                }
              }}
            />
          </div>
        )}
      </Card>

      {/* Auto-Retry & Calling Window Config */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm h-full"
            bodyStyle={{ padding: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                <FiRepeat className="text-primary" /> Auto-Retry Settings
              </Title>
              <Switch
                checked={autoRetryEnabled}
                onChange={(checked) => setValue('autoRetryEnabled', checked)}
              />
            </div>

            {autoRetryEnabled && (
              <div className="space-y-4 pt-2">
                <div>
                  <Text className="text-xs font-medium text-foreground! block mb-2">
                    Retry Conditions:
                  </Text>
                  <Checkbox.Group
                    options={[
                      { label: 'Busy Number', value: 'busy' },
                      { label: 'No Answer', value: 'no_answer' },
                    ]}
                    value={autoRetryConditions}
                    onChange={(vals) => setValue('autoRetryConditions', vals as string[])}
                  />
                </div>

                <Row gutter={12}>
                  <Col span={12}>
                    <Text className="text-xs text-muted-foreground! block mb-1">Max Attempts:</Text>
                    <AntdSelect
                      className="w-full"
                      value={watch('autoRetryMaxAttempts')}
                      onChange={(v) => setValue('autoRetryMaxAttempts', v)}
                      options={[
                        { label: '1 Attempt', value: 1 },
                        { label: '2 Attempts', value: 2 },
                        { label: '3 Attempts', value: 3 },
                      ]}
                    />
                  </Col>
                  <Col span={12}>
                    <Text className="text-xs text-muted-foreground! block mb-1">Gap Between Retries:</Text>
                    <AntdSelect
                      className="w-full"
                      value={watch('autoRetryGapMinutes')}
                      onChange={(v) => setValue('autoRetryGapMinutes', v)}
                      options={[
                        { label: '15 Minutes', value: 15 },
                        { label: '30 Minutes', value: 30 },
                        { label: '1 Hour', value: 60 },
                      ]}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm h-full"
            bodyStyle={{ padding: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
                <FiClock className="text-primary" /> Calling Window & Timezone
              </Title>
              <Switch
                checked={callingWindowEnabled}
                onChange={(checked) => setValue('callingWindowEnabled', checked)}
              />
            </div>

            {callingWindowEnabled && (
              <div className="space-y-4 pt-2">
                <Row gutter={12}>
                  <Col span={12}>
                    <Text className="text-xs text-muted-foreground! block mb-1">Start Time:</Text>
                    <TimePicker
                      format="HH:mm"
                      className="w-full"
                      onChange={(_, timeString) =>
                        setValue(
                          'callingWindowStart',
                          Array.isArray(timeString) ? timeString[0] : timeString,
                        )
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <Text className="text-xs text-muted-foreground! block mb-1">End Time:</Text>
                    <TimePicker
                      format="HH:mm"
                      className="w-full"
                      onChange={(_, timeString) =>
                        setValue(
                          'callingWindowEnd',
                          Array.isArray(timeString) ? timeString[0] : timeString,
                        )
                      }
                    />
                  </Col>
                </Row>

                <div>
                  <Text className="text-xs text-muted-foreground! block mb-1">Target Timezone:</Text>
                  <AntdSelect
                    className="w-full"
                    options={timezoneOptions}
                    value={watch('callingWindowTimezone')}
                    onChange={(v) => setValue('callingWindowTimezone', v)}
                  />
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Form Action */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          htmlType="submit"
          size="large"
          type="primary"
          loading={loading}
          className="bg-primary! text-primary-foreground! border-primary! px-8!"
        >
          Save as Draft
        </Button>
      </div>
    </form>
  );
};

export default CreateCampaignForm;
