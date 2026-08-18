import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Table,
  Tag,
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
} from 'react-icons/fi';
import { IoCall } from 'react-icons/io5';
import { FormItem } from '../component/form-item/FormItem';
import { Select } from '../component/select/Select';
import {
  OptionsDataType,
  parseLeadsCsv,
  ParsedCsvLead,
  CsvParseResult,
  getSampleLeadsCsv,
} from '../utils';

const { Text, Title } = Typography;

export type BulkCallFormValues = {
  agentId: string;
};

type BulkCallFormPropsType = {
  agentData: OptionsDataType[];
  onSubmit: (
    values: BulkCallFormValues,
    validLeads: ParsedCsvLead[],
  ) => void | Promise<void>;
  loading?: boolean;
};

const bulkCallFormSchema = yup.object({
  agentId: yup.string().required('Agent selection is required'),
});

export const BulkCallForm = ({
  agentData,
  onSubmit,
  loading,
}: BulkCallFormPropsType) => {
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BulkCallFormValues>({
    defaultValues: { agentId: undefined },
    mode: 'onChange',
    resolver: yupResolver(bulkCallFormSchema),
  });

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
    return false; // Prevent default upload behavior
  };

  const handleDownloadSample = () => {
    const sampleText = getSampleLeadsCsv();
    const blob = new Blob([sampleText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (formData: BulkCallFormValues) => {
    if (!parseResult || parseResult.validCount === 0) {
      message.error('Please upload a valid CSV file with lead contacts before placing calls.');
      return;
    }

    const validLeads = parseResult.leads.filter((l) => l.isValid);
    await onSubmit(formData, validLeads);
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
      render: (text: string) => <span className="text-foreground! italic">{text || "Not provided"}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <span className="text-foreground! italic">{text || "Not provided"}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text: string) => <span className="text-foreground! italic">{text || "Not provided"}</span>,
    },
    {
      title: 'Status',
      key: 'isValid',
      width: 140,
      render: (_: unknown, record: ParsedCsvLead) =>
        record.isValid ? (
          <Tag color="success" icon={<FiCheckCircle />} className='bg-transparent! border-success!'>
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
      {/* CSV Upload Section */}
      <Card
        className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm"
        bodyStyle={{ padding: 20 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiFileText className="text-primary" /> Upload Leads CSV
            </Title>
            <Text className="text-muted-foreground! text-xs!">
              Upload a CSV file containing contact numbers and optional lead details.
            </Text>
          </div>
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
          className="bg-background! border-dashed! border-sidebar-border! rounded-xl! hover:border-primary! p-4"
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
              'Click or drag CSV file to this area to parse leads'
            )}
          </p>
          <p className="ant-upload-hint text-xs text-muted-foreground! mt-1">
            Supports E.164 phone formats (e.g. +919876543210). Columns: phone_number, name, email, company_name.
          </p>
        </Upload.Dragger>
      </Card>

      {/* CSV Preview Table & Stats */}
      {parseResult && (
        <Card
          className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm"
          bodyStyle={{ padding: 20 }}
        >
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Badge count={parseResult.validCount} overflowCount={9999} color="#10b981" />
              <Title level={5} className="m-0! text-foreground!">
                Parsed Contacts Preview ({parseResult.validCount} valid / {parseResult.totalCount} total)
              </Title>
            </div>

            <div className="flex items-center gap-2">
              <Tag color="green" className="px-3 py-1 text-xs">
                {parseResult.validCount} Ready to Call
              </Tag>
              {parseResult.invalidCount > 0 && (
                <Tag color="red" className="px-3 py-1 text-xs">
                  {parseResult.invalidCount} Skipped (Invalid)
                </Tag>
              )}
            </div>
          </div>

          {parseResult.invalidCount > 0 && (
            <Alert
              type="warning"
              showIcon
              message={`${parseResult.invalidCount} row(s) contain invalid phone numbers and will be automatically skipped during dispatch.`}
              className="mb-4 text-xs"
            />
          )}

          <Table
            dataSource={parseResult.leads}
            columns={tableColumns}
            rowKey={(record) => `${record.rowNumber}-${record.phoneNumber}`}
            pagination={{ pageSize: 5, showSizeChanger: false }}
            size="small"
            scroll={{ x: true }}
            className="rounded-lg overflow-hidden border border-sidebar-border text-forground!"
          />
        </Card>
      )}

      {/* Agent Selection & Action */}
      <Card
        className="bg-card! border! border-sidebar-border! rounded-2xl! shadow-sm"
        bodyStyle={{ padding: 20 }}
      >
        <Row align="bottom" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <FormItem
              isRequired
              label="Select AI Voice Agent"
              errorText={errors && errors.agentId && errors.agentId.message}
            >
              <Select
                name="agentId"
                placeholder="Select the AI agent for this call campaign"
                rhfControllerProps={{ control }}
                options={agentData}
                hasError={!!errors.agentId}
              />
            </FormItem>
          </Col>

          <Col xs={24} md={10}>
            <Button
              htmlType="submit"
              size="large"
              type="primary"
              loading={loading}
              disabled={!parseResult || parseResult.validCount === 0}
              icon={<IoCall />}
              className="w-full bg-primary! text-primary-foreground! border-primary! h-10! text-base! font-medium!"
            >
              Dispatch Bulk Calls ({parseResult ? parseResult.validCount : 0})
            </Button>
          </Col>
        </Row>
      </Card>
    </form>
  );
};

export default BulkCallForm;
