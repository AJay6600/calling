import React, { useState } from 'react';
import {
  Modal,
  Radio,
  Table,
  Button,
  Upload,
  Typography,
  Space,
  Tag,
  Alert,
  message,
} from 'antd';
import {
  FiUsers,
  FiUploadCloud,
  FiFileText,
  FiDownload,
  FiPlusCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  LeadRecordType,
  parseLeadsCsv,
  ParsedCsvLead,
  CsvParseResult,
  getSampleLeadsCsv,
} from '../utils';

const { Text, Title } = Typography;

interface AddLeadsModalProps {
  open: boolean;
  campaignName: string;
  existingLeads: LeadRecordType[];
  currentCampaignLeadIds: Set<string>;
  loading?: boolean;
  onCancel: () => void;
  onAddExistingLeads: (leadIds: string[]) => Promise<void>;
  onAddCsvLeads: (leads: ParsedCsvLead[]) => Promise<void>;
}

export const AddLeadsModal: React.FC<AddLeadsModalProps> = ({
  open,
  campaignName,
  existingLeads,
  currentCampaignLeadIds,
  loading,
  onCancel,
  onAddExistingLeads,
  onAddCsvLeads,
}) => {
  const [sourceType, setSourceType] = useState<'existing' | 'csv'>('existing');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter out leads already in this campaign
  const availableLeads = existingLeads.filter(
    (l) => !currentCampaignLeadIds.has(l.id),
  );

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
    reader.readAsText(file);
    return false;
  };

  const handleDownloadSample = () => {
    const csvStr = getSampleLeadsCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_leads_upload.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      if (sourceType === 'existing') {
        if (selectedRowKeys.length === 0) {
          message.warning('Please select at least one lead to add.');
          setSubmitting(false);
          return;
        }
        await onAddExistingLeads(selectedRowKeys as string[]);
      } else {
        if (!parseResult || parseResult.validCount === 0) {
          message.warning('Please upload a CSV file with valid leads.');
          setSubmitting(false);
          return;
        }
        await onAddCsvLeads(parseResult.leads);
      }
    } catch (err: unknown) {
      console.error('Error adding leads:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const leadColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (val: string, record: LeadRecordType) => (
        <span className="font-medium text-foreground!">
          {val || record.phone_number}
        </span>
      ),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (val: string) => (
        <span className="font-mono text-xs text-foreground!">{val}</span>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (val: string) => (
        <span className="text-xs text-foreground/80!">{val || '-'}</span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2 text-foreground! font-bold text-base">
          <FiPlusCircle className="text-primary text-lg" /> Add Leads to: {campaignName}
        </div>
      }
      footer={null}
      destroyOnClose
      width={640}
      centered
      className="add-leads-modal"
    >
      <div className="space-y-5 pt-2">
        {/* Source selector */}
        <div>
          <span className="text-xs font-semibold text-foreground! block mb-2">
            Select Lead Import Method:
          </span>
          <div className="grid grid-cols-2 gap-2 bg-secondary! p-1 rounded-xl border! border-sidebar-border!">
            <button
              type="button"
              onClick={() => setSourceType('existing')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sourceType === 'existing'
                  ? 'bg-primary! text-primary-foreground! shadow-md'
                  : 'bg-transparent text-foreground! hover:bg-card!'
              }`}
            >
              Select Database Leads ({availableLeads.length} available)
            </button>
            <button
              type="button"
              onClick={() => setSourceType('csv')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sourceType === 'csv'
                  ? 'bg-primary! text-primary-foreground! shadow-md'
                  : 'bg-transparent text-foreground! hover:bg-card!'
              }`}
            >
              Upload CSV File
            </button>
          </div>
        </div>

        {sourceType === 'existing' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-foreground/80!">
              <span>Select available leads from your contacts database:</span>
              <div className="flex items-center gap-2">
                {availableLeads.length > 0 && (
                  <Button
                    type="link"
                    size="small"
                    className="p-0 text-xs font-semibold text-primary h-auto flex items-center"
                    onClick={() => {
                      if (selectedRowKeys.length === availableLeads.length) {
                        setSelectedRowKeys([]);
                      } else {
                        setSelectedRowKeys(availableLeads.map((l) => l.id));
                      }
                    }}
                  >
                    {selectedRowKeys.length === availableLeads.length
                      ? 'Deselect All Leads'
                      : `Select All Leads (${availableLeads.length})`}
                  </Button>
                )}
                <Tag color="blue" className="m-0 font-medium">
                  {selectedRowKeys.length} Selected
                </Tag>
              </div>
            </div>

            <Table
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              dataSource={availableLeads}
              columns={leadColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              className="rounded-xl overflow-hidden border border-sidebar-border"
            />
          </div>
        )}

        {sourceType === 'csv' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text className="text-xs text-foreground/80!">
                Upload a CSV file containing phone numbers and lead data:
              </Text>
              <Button
                size="small"
                type="text"
                icon={<FiDownload />}
                onClick={handleDownloadSample}
                className="text-xs text-primary hover:text-primary/80"
              >
                Download Sample CSV
              </Button>
            </div>

            <Upload.Dragger
              accept=".csv"
              beforeUpload={handleFileRead}
              showUploadList={false}
              className="p-4 border-2 border-dashed border-sidebar-border hover:border-primary rounded-2xl bg-card transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2">
                <FiUploadCloud className="text-3xl text-primary" />
                <Text className="text-sm font-semibold text-foreground block">
                  Click or drag CSV file to upload
                </Text>
                <Text className="text-xs text-muted-foreground block">
                  Required column: <code className="text-primary font-bold">phone_number</code>
                </Text>
              </div>
            </Upload.Dragger>

            {fileName && parseResult && (
              <Alert
                type={parseResult.validCount > 0 ? 'success' : 'error'}
                showIcon
                message={
                  <div className="flex justify-between items-center font-medium text-xs">
                    <span>
                      {fileName}: Parsed {parseResult.totalCount} rows ({parseResult.validCount} valid leads)
                    </span>
                    <FiCheckCircle className="text-emerald-500" />
                  </div>
                }
                className="rounded-xl border-sidebar-border"
              />
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-sidebar-border">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            loading={loading || submitting}
            icon={<FiPlusCircle />}
            onClick={handleConfirm}
            className="bg-primary! text-primary-foreground! border-primary!"
          >
            Add Leads to Campaign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddLeadsModal;
