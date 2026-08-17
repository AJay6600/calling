import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button, Card, Modal, message } from 'antd';
import { FiUserPlus } from 'react-icons/fi';
import {
  getLeadsDocument,
  getLeadStatusesDocument,
  getOrganizationWithUserDocument,
  insertLeadDocument,
  updateLeadDocument,
  deleteLeadDocument,
} from '../graphql';
import QueryLoading from '../component/query-loading/QueryLoading';
import QueryError from '../component/query-error/QueryError';
import LeadsTable from '../component/LeadsTable';
import LeadForm, { LeadFormValues } from '../forms/LeadForm';
import {
  getZitadelOrgIdFromProfile,
  getZitadelUserIdFromProfile,
  LeadRecordType,
  OptionsDataType,
} from '../utils';

const toLeadFormValues = (lead: LeadRecordType): LeadFormValues => ({
  phoneNumber: lead.phone_number,
  fullName: lead.name ?? '',
  email: lead.email ?? '',
  companyName: lead.company_name ?? '',
  status: lead.status,
});

const toLeadChanges = (values: LeadFormValues) => ({
  phone_number: values.phoneNumber,
  name: values.fullName.trim() || null,
  email: values.email.trim() || null,
  company_name: values.companyName.trim() || null,
  status: values.status || 'new',
});

export const LeadsPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingLead, setEditingLead] = useState<LeadRecordType | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);

  const zitadelOrgId = getZitadelOrgIdFromProfile(auth.user?.profile);
  const zitadelUserId = getZitadelUserIdFromProfile(auth.user?.profile);

  const { data: orgData } = useQuery(getOrganizationWithUserDocument, {
    variables: {
      zitadel_org_id: zitadelOrgId ?? '',
      zitadel_user_id: zitadelUserId ?? '',
    },
    skip: zitadelOrgId === undefined || zitadelUserId === undefined,
    fetchPolicy: 'cache-only',
  });

  const {
    data: leadsData,
    loading: leadsLoading,
    error: leadsError,
  } = useQuery(getLeadsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: statusData, loading: statusLoading } = useQuery(
    getLeadStatusesDocument,
  );

  const [insertLead, { loading: insertLoading }] = useMutation(
    insertLeadDocument,
    {
      refetchQueries: [{ query: getLeadsDocument }],
    },
  );

  const [updateLead, { loading: updateLoading }] = useMutation(
    updateLeadDocument,
    {
      refetchQueries: [{ query: getLeadsDocument }],
    },
  );

  const [deleteLead] = useMutation(deleteLeadDocument, {
    refetchQueries: [{ query: getLeadsDocument }],
  });

  const organization = orgData?.organizations?.[0];

  const statusOptions: OptionsDataType[] =
    statusData?.lead_status_enum?.map((status) => ({
      label: status.label,
      value: status.id,
    })) ?? [];

  const leads: LeadRecordType[] =
    (leadsData?.leads as LeadRecordType[] | undefined) ?? [];

  const formInitialValues = useMemo(
    () => (editingLead ? toLeadFormValues(editingLead) : undefined),
    [editingLead],
  );

  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: LeadRecordType) => {
    setFormMode('edit');
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLead(null);
    setFormMode('create');
  };

  const handleSubmitLead = async (values: LeadFormValues) => {
    if (formMode === 'edit') {
      if (!editingLead) {
        message.error('No lead selected for editing.');
        throw new Error('No lead selected for editing');
      }

      try {
        await updateLead({
          variables: {
            id: editingLead.id,
            changes: toLeadChanges(values),
          },
        });

        message.success('Lead updated successfully');
        handleCloseForm();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to update lead';
        message.error(errorMsg);
        throw err;
      }

      return;
    }

    if (!organization) {
      message.error('Organization context is missing. Please sign in again.');
      throw new Error('Organization context is missing');
    }

    try {
      await insertLead({
        variables: {
          object: {
            organization_id: organization.id,
            zitadel_org_id: organization.zitadel_org_id,
            ...toLeadChanges(values),
          },
        },
      });

      message.success('Lead created successfully');
      handleCloseForm();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to create lead';
      message.error(errorMsg);
      throw err;
    }
  };

  const handleDeleteLead = (lead: LeadRecordType) => {
    const leadLabel = lead.name?.trim() || lead.phone_number;

    Modal.confirm({
      title: 'Delete lead',
      content: `Are you sure you want to delete "${leadLabel}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        setDeletingLeadId(lead.id);
        try {
          await deleteLead({
            variables: { id: lead.id },
          });
          message.success('Lead deleted successfully');
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : 'Failed to delete lead';
          message.error(errorMsg);
          throw err;
        } finally {
          setDeletingLeadId(null);
        }
      },
    });
  };

  if ((leadsLoading || statusLoading) && !leadsData) {
    return <QueryLoading />;
  }

  if (leadsError && !leadsData) {
    return <QueryError error={leadsError} />;
  }

  return (
    <div className="space-y-4 w-full p-2 sm:p-4">
      <div className="flex justify-end">
        <Button
          type="primary"
          icon={<FiUserPlus />}
          onClick={handleOpenCreateForm}
          className="bg-primary! text-primary-foreground! border-primary!"
        >
          Add Lead
        </Button>
      </div>

      <Card
        className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full"
        styles={{ body: { padding: 24 } }}
      >
        <LeadsTable
          data={leads}
          loading={leadsLoading}
          deletingLeadId={deletingLeadId}
          onView={(lead) => navigate(`/leads/${lead.id}`)}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
        />
      </Card>

      <LeadForm
        open={isFormOpen}
        mode={formMode}
        initialValues={formInitialValues}
        statusOptions={statusOptions}
        loading={formMode === 'edit' ? updateLoading : insertLoading}
        onCancel={handleCloseForm}
        onSubmit={handleSubmitLead}
      />
    </div>
  );
};

export default LeadsPage;
