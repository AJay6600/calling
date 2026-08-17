export type AuthenticatedUserType = {
  userId: string;
  email: string;
  orgId: string | null;
};

export type ApiErrorResponseType = {
  statusCode: number;
  message: string;
  error: string;
};

export type OrganizationType = {
  id: string;
  zitadel_org_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type UserType = {
  id: string;
  zitadel_user_id: string;
  email: string;
  organization_id: string;
};

export type OptionsDataType = {
  /** Value which will be returned when the option is selected */
  value: string | number;
  /** Label for option in select dropdown */
  label: string | number;
};

export type DispositionEnumType = {
  id: string;
  label: string;
  description?: string | null;
};

export type CallStatusEnumType = {
  id: string;
  label: string;
};

export type CallLogRecordType = {
  id: string;
  organization_id: string;
  zitadel_org_id: string;
  agent_id?: string | null;
  bolna_agent_id: string;
  bolna_execution_id: string;
  recipient_phone_number: string;
  agent_phone_number?: string | null;
  call_type?: string | null;
  telephony_provider?: string | null;
  status: string;
  call_status_enum?: { id: string; label: string } | null;
  hangup_by?: string | null;
  hangup_reason?: string | null;
  duration_seconds?: number | null;
  recording_url?: string | null;
  total_cost?: number | null;
  disposition?: string | null;
  disposition_enum?: {
    id: string;
    label: string;
    description?: string | null;
  } | null;
  summary?: string | null;
  transcript?: string | null;
  extracted_data?: any;
  latency_data?: any;
  raw_response?: any;
  initiated_at?: string | null;
  created_at: string;
  updated_at: string;
  agent?: { id: string; name: string; language_id?: string | null } | null;
};
