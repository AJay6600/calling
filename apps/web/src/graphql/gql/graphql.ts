/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: number | null | undefined;
  _gt?: number | null | undefined;
  _gte?: number | null | undefined;
  _in?: Array<number> | null | undefined;
  _is_null?: boolean | null | undefined;
  _lt?: number | null | undefined;
  _lte?: number | null | undefined;
  _neq?: number | null | undefined;
  _nin?: Array<number> | null | undefined;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: string | null | undefined;
  _gt?: string | null | undefined;
  _gte?: string | null | undefined;
  /** does the column match the given case-insensitive pattern */
  _ilike?: string | null | undefined;
  _in?: Array<string> | null | undefined;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: string | null | undefined;
  _is_null?: boolean | null | undefined;
  /** does the column match the given pattern */
  _like?: string | null | undefined;
  _lt?: string | null | undefined;
  _lte?: string | null | undefined;
  _neq?: string | null | undefined;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: string | null | undefined;
  _nin?: Array<string> | null | undefined;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: string | null | undefined;
  /** does the column NOT match the given pattern */
  _nlike?: string | null | undefined;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: string | null | undefined;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: string | null | undefined;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: string | null | undefined;
  /** does the column match the given SQL regular expression */
  _similar?: string | null | undefined;
};

/** Boolean expression to filter rows from the table "agent_language_enum". All fields are combined with a logical 'AND'. */
export type Agent_Language_Enum_Bool_Exp = {
  _and?: Array<Agent_Language_Enum_Bool_Exp> | null | undefined;
  _not?: Agent_Language_Enum_Bool_Exp | null | undefined;
  _or?: Array<Agent_Language_Enum_Bool_Exp> | null | undefined;
  id?: String_Comparison_Exp | null | undefined;
  label?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "agent_language_enum" */
export type Agent_Language_Enum_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'agent_language_enum_pkey';

export type Agent_Language_Enum_Enum =
  /** English */
  | 'english'
  /** Hindi */
  | 'hindi'
  /** Marathi */
  | 'marathi';

/** Boolean expression to compare columns of type "agent_language_enum_enum". All fields are combined with logical 'AND'. */
export type Agent_Language_Enum_Enum_Comparison_Exp = {
  _eq?: Agent_Language_Enum_Enum | null | undefined;
  _in?: Array<Agent_Language_Enum_Enum> | null | undefined;
  _is_null?: boolean | null | undefined;
  _neq?: Agent_Language_Enum_Enum | null | undefined;
  _nin?: Array<Agent_Language_Enum_Enum> | null | undefined;
};

/** input type for inserting data into table "agent_language_enum" */
export type Agent_Language_Enum_Insert_Input = {
  id?: string | null | undefined;
  label?: string | null | undefined;
};

/** input type for inserting object relation for remote table "agent_language_enum" */
export type Agent_Language_Enum_Obj_Rel_Insert_Input = {
  data: Agent_Language_Enum_Insert_Input;
  /** upsert condition */
  on_conflict?: Agent_Language_Enum_On_Conflict | null | undefined;
};

/** on_conflict condition type for table "agent_language_enum" */
export type Agent_Language_Enum_On_Conflict = {
  constraint: Agent_Language_Enum_Constraint;
  update_columns?: Array<Agent_Language_Enum_Update_Column>;
  where?: Agent_Language_Enum_Bool_Exp | null | undefined;
};

/** update columns of table "agent_language_enum" */
export type Agent_Language_Enum_Update_Column =
  /** column name */
  | 'id'
  /** column name */
  | 'label';

export type Agents_Aggregate_Bool_Exp = {
  count?: Agents_Aggregate_Bool_Exp_Count | null | undefined;
};

export type Agents_Aggregate_Bool_Exp_Count = {
  arguments?: Array<Agents_Select_Column> | null | undefined;
  distinct?: boolean | null | undefined;
  filter?: Agents_Bool_Exp | null | undefined;
  predicate: Int_Comparison_Exp;
};

/** input type for inserting array relation for remote table "agents" */
export type Agents_Arr_Rel_Insert_Input = {
  data: Array<Agents_Insert_Input>;
  /** upsert condition */
  on_conflict?: Agents_On_Conflict | null | undefined;
};

/** Boolean expression to filter rows from the table "agents". All fields are combined with a logical 'AND'. */
export type Agents_Bool_Exp = {
  _and?: Array<Agents_Bool_Exp> | null | undefined;
  _not?: Agents_Bool_Exp | null | undefined;
  _or?: Array<Agents_Bool_Exp> | null | undefined;
  agent_language_enum?: Agent_Language_Enum_Bool_Exp | null | undefined;
  bolna_agent_id?: String_Comparison_Exp | null | undefined;
  created_at?: Timestamptz_Comparison_Exp | null | undefined;
  id?: Uuid_Comparison_Exp | null | undefined;
  language_id?: Agent_Language_Enum_Enum_Comparison_Exp | null | undefined;
  name?: String_Comparison_Exp | null | undefined;
  organization?: Organizations_Bool_Exp | null | undefined;
  organization_id?: Uuid_Comparison_Exp | null | undefined;
  updated_at?: Timestamptz_Comparison_Exp | null | undefined;
  zitadel_org_id?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "agents" */
export type Agents_Constraint =
  /** unique or primary key constraint on columns "bolna_agent_id" */
  | 'agents_bolna_agent_id_key'
  /** unique or primary key constraint on columns "id" */
  | 'agents_pkey';

/** input type for inserting data into table "agents" */
export type Agents_Insert_Input = {
  agent_language_enum?: Agent_Language_Enum_Obj_Rel_Insert_Input | null | undefined;
  bolna_agent_id?: string | null | undefined;
  created_at?: string | null | undefined;
  id?: string | null | undefined;
  language_id?: Agent_Language_Enum_Enum | null | undefined;
  name?: string | null | undefined;
  organization?: Organizations_Obj_Rel_Insert_Input | null | undefined;
  organization_id?: string | null | undefined;
  updated_at?: string | null | undefined;
  zitadel_org_id?: string | null | undefined;
};

/** input type for inserting object relation for remote table "agents" */
export type Agents_Obj_Rel_Insert_Input = {
  data: Agents_Insert_Input;
  /** upsert condition */
  on_conflict?: Agents_On_Conflict | null | undefined;
};

/** on_conflict condition type for table "agents" */
export type Agents_On_Conflict = {
  constraint: Agents_Constraint;
  update_columns?: Array<Agents_Update_Column>;
  where?: Agents_Bool_Exp | null | undefined;
};

/** select columns of table "agents" */
export type Agents_Select_Column =
  /** column name */
  | 'bolna_agent_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'language_id'
  /** column name */
  | 'name'
  /** column name */
  | 'organization_id'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'zitadel_org_id';

/** update columns of table "agents" */
export type Agents_Update_Column =
  /** column name */
  | 'bolna_agent_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'language_id'
  /** column name */
  | 'name'
  /** column name */
  | 'organization_id'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'zitadel_org_id';

export type Call_Logs_Aggregate_Bool_Exp = {
  count?: Call_Logs_Aggregate_Bool_Exp_Count | null | undefined;
};

export type Call_Logs_Aggregate_Bool_Exp_Count = {
  arguments?: Array<Call_Logs_Select_Column> | null | undefined;
  distinct?: boolean | null | undefined;
  filter?: Call_Logs_Bool_Exp | null | undefined;
  predicate: Int_Comparison_Exp;
};

/** input type for inserting array relation for remote table "call_logs" */
export type Call_Logs_Arr_Rel_Insert_Input = {
  data: Array<Call_Logs_Insert_Input>;
  /** upsert condition */
  on_conflict?: Call_Logs_On_Conflict | null | undefined;
};

/** Boolean expression to filter rows from the table "call_logs". All fields are combined with a logical 'AND'. */
export type Call_Logs_Bool_Exp = {
  _and?: Array<Call_Logs_Bool_Exp> | null | undefined;
  _not?: Call_Logs_Bool_Exp | null | undefined;
  _or?: Array<Call_Logs_Bool_Exp> | null | undefined;
  agent?: Agents_Bool_Exp | null | undefined;
  agent_id?: Uuid_Comparison_Exp | null | undefined;
  agent_phone_number?: String_Comparison_Exp | null | undefined;
  bolna_agent_id?: String_Comparison_Exp | null | undefined;
  bolna_execution_id?: String_Comparison_Exp | null | undefined;
  call_status_enum?: Call_Status_Enum_Bool_Exp | null | undefined;
  call_type?: String_Comparison_Exp | null | undefined;
  created_at?: Timestamptz_Comparison_Exp | null | undefined;
  disposition?: Disposition_Enum_Enum_Comparison_Exp | null | undefined;
  disposition_enum?: Disposition_Enum_Bool_Exp | null | undefined;
  duration_seconds?: Int_Comparison_Exp | null | undefined;
  extracted_data?: Jsonb_Comparison_Exp | null | undefined;
  hangup_by?: String_Comparison_Exp | null | undefined;
  hangup_reason?: String_Comparison_Exp | null | undefined;
  id?: Uuid_Comparison_Exp | null | undefined;
  initiated_at?: Timestamptz_Comparison_Exp | null | undefined;
  latency_data?: Jsonb_Comparison_Exp | null | undefined;
  lead_id?: Uuid_Comparison_Exp | null | undefined;
  organization?: Organizations_Bool_Exp | null | undefined;
  organization_id?: Uuid_Comparison_Exp | null | undefined;
  raw_response?: Jsonb_Comparison_Exp | null | undefined;
  recipient_phone_number?: String_Comparison_Exp | null | undefined;
  recording_url?: String_Comparison_Exp | null | undefined;
  status?: Call_Status_Enum_Enum_Comparison_Exp | null | undefined;
  summary?: String_Comparison_Exp | null | undefined;
  telephony_provider?: String_Comparison_Exp | null | undefined;
  total_cost?: Numeric_Comparison_Exp | null | undefined;
  transcript?: String_Comparison_Exp | null | undefined;
  updated_at?: Timestamptz_Comparison_Exp | null | undefined;
  zitadel_org_id?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "call_logs" */
export type Call_Logs_Constraint =
  /** unique or primary key constraint on columns "bolna_execution_id" */
  | 'call_logs_bolna_execution_id_key'
  /** unique or primary key constraint on columns "id" */
  | 'call_logs_pkey';

/** input type for inserting data into table "call_logs" */
export type Call_Logs_Insert_Input = {
  agent?: Agents_Obj_Rel_Insert_Input | null | undefined;
  agent_id?: string | null | undefined;
  agent_phone_number?: string | null | undefined;
  bolna_agent_id?: string | null | undefined;
  bolna_execution_id?: string | null | undefined;
  call_status_enum?: Call_Status_Enum_Obj_Rel_Insert_Input | null | undefined;
  call_type?: string | null | undefined;
  created_at?: string | null | undefined;
  disposition?: Disposition_Enum_Enum | null | undefined;
  disposition_enum?: Disposition_Enum_Obj_Rel_Insert_Input | null | undefined;
  duration_seconds?: number | null | undefined;
  extracted_data?: any;
  hangup_by?: string | null | undefined;
  hangup_reason?: string | null | undefined;
  id?: string | null | undefined;
  initiated_at?: string | null | undefined;
  latency_data?: any;
  lead_id?: string | null | undefined;
  organization?: Organizations_Obj_Rel_Insert_Input | null | undefined;
  organization_id?: string | null | undefined;
  raw_response?: any;
  recipient_phone_number?: string | null | undefined;
  recording_url?: string | null | undefined;
  status?: Call_Status_Enum_Enum | null | undefined;
  summary?: string | null | undefined;
  telephony_provider?: string | null | undefined;
  total_cost?: unknown;
  transcript?: string | null | undefined;
  updated_at?: string | null | undefined;
  zitadel_org_id?: string | null | undefined;
};

/** on_conflict condition type for table "call_logs" */
export type Call_Logs_On_Conflict = {
  constraint: Call_Logs_Constraint;
  update_columns?: Array<Call_Logs_Update_Column>;
  where?: Call_Logs_Bool_Exp | null | undefined;
};

/** select columns of table "call_logs" */
export type Call_Logs_Select_Column =
  /** column name */
  | 'agent_id'
  /** column name */
  | 'agent_phone_number'
  /** column name */
  | 'bolna_agent_id'
  /** column name */
  | 'bolna_execution_id'
  /** column name */
  | 'call_type'
  /** column name */
  | 'created_at'
  /** column name */
  | 'disposition'
  /** column name */
  | 'duration_seconds'
  /** column name */
  | 'extracted_data'
  /** column name */
  | 'hangup_by'
  /** column name */
  | 'hangup_reason'
  /** column name */
  | 'id'
  /** column name */
  | 'initiated_at'
  /** column name */
  | 'latency_data'
  /** column name */
  | 'lead_id'
  /** column name */
  | 'organization_id'
  /** column name */
  | 'raw_response'
  /** column name */
  | 'recipient_phone_number'
  /** column name */
  | 'recording_url'
  /** column name */
  | 'status'
  /** column name */
  | 'summary'
  /** column name */
  | 'telephony_provider'
  /** column name */
  | 'total_cost'
  /** column name */
  | 'transcript'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'zitadel_org_id';

/** update columns of table "call_logs" */
export type Call_Logs_Update_Column =
  /** column name */
  | 'agent_id'
  /** column name */
  | 'agent_phone_number'
  /** column name */
  | 'bolna_agent_id'
  /** column name */
  | 'bolna_execution_id'
  /** column name */
  | 'call_type'
  /** column name */
  | 'created_at'
  /** column name */
  | 'disposition'
  /** column name */
  | 'duration_seconds'
  /** column name */
  | 'extracted_data'
  /** column name */
  | 'hangup_by'
  /** column name */
  | 'hangup_reason'
  /** column name */
  | 'id'
  /** column name */
  | 'initiated_at'
  /** column name */
  | 'latency_data'
  /** column name */
  | 'lead_id'
  /** column name */
  | 'organization_id'
  /** column name */
  | 'raw_response'
  /** column name */
  | 'recipient_phone_number'
  /** column name */
  | 'recording_url'
  /** column name */
  | 'status'
  /** column name */
  | 'summary'
  /** column name */
  | 'telephony_provider'
  /** column name */
  | 'total_cost'
  /** column name */
  | 'transcript'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'zitadel_org_id';

/** Boolean expression to filter rows from the table "call_status_enum". All fields are combined with a logical 'AND'. */
export type Call_Status_Enum_Bool_Exp = {
  _and?: Array<Call_Status_Enum_Bool_Exp> | null | undefined;
  _not?: Call_Status_Enum_Bool_Exp | null | undefined;
  _or?: Array<Call_Status_Enum_Bool_Exp> | null | undefined;
  id?: String_Comparison_Exp | null | undefined;
  label?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "call_status_enum" */
export type Call_Status_Enum_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'call_status_enum_pkey';

export type Call_Status_Enum_Enum =
  /** Balance Low */
  | 'balance_low'
  /** Busy */
  | 'busy'
  /** Disconnected */
  | 'call_disconnected'
  /** Cancelled */
  | 'cancelled'
  /** Completed */
  | 'completed'
  /** Error */
  | 'error'
  /** Failed */
  | 'failed'
  /** In Progress */
  | 'in_progress'
  /** Initiated */
  | 'initiated'
  /** No Answer */
  | 'no_answer'
  /** Queued */
  | 'queued'
  /** Rescheduled */
  | 'rescheduled'
  /** Ringing */
  | 'ringing'
  /** Scheduled */
  | 'scheduled'
  /** Stopped */
  | 'stopped';

/** Boolean expression to compare columns of type "call_status_enum_enum". All fields are combined with logical 'AND'. */
export type Call_Status_Enum_Enum_Comparison_Exp = {
  _eq?: Call_Status_Enum_Enum | null | undefined;
  _in?: Array<Call_Status_Enum_Enum> | null | undefined;
  _is_null?: boolean | null | undefined;
  _neq?: Call_Status_Enum_Enum | null | undefined;
  _nin?: Array<Call_Status_Enum_Enum> | null | undefined;
};

/** input type for inserting data into table "call_status_enum" */
export type Call_Status_Enum_Insert_Input = {
  id?: string | null | undefined;
  label?: string | null | undefined;
};

/** input type for inserting object relation for remote table "call_status_enum" */
export type Call_Status_Enum_Obj_Rel_Insert_Input = {
  data: Call_Status_Enum_Insert_Input;
  /** upsert condition */
  on_conflict?: Call_Status_Enum_On_Conflict | null | undefined;
};

/** on_conflict condition type for table "call_status_enum" */
export type Call_Status_Enum_On_Conflict = {
  constraint: Call_Status_Enum_Constraint;
  update_columns?: Array<Call_Status_Enum_Update_Column>;
  where?: Call_Status_Enum_Bool_Exp | null | undefined;
};

/** update columns of table "call_status_enum" */
export type Call_Status_Enum_Update_Column =
  /** column name */
  | 'id'
  /** column name */
  | 'label';

/** Boolean expression to filter rows from the table "disposition_enum". All fields are combined with a logical 'AND'. */
export type Disposition_Enum_Bool_Exp = {
  _and?: Array<Disposition_Enum_Bool_Exp> | null | undefined;
  _not?: Disposition_Enum_Bool_Exp | null | undefined;
  _or?: Array<Disposition_Enum_Bool_Exp> | null | undefined;
  id?: String_Comparison_Exp | null | undefined;
  label?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "disposition_enum" */
export type Disposition_Enum_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'disposition_enum_pkey';

export type Disposition_Enum_Enum =
  /** Callback Requested */
  | 'callback_requested'
  /** Do Not Call */
  | 'do_not_call'
  /** Interested */
  | 'interested'
  /** No Answer */
  | 'no_answer'
  /** Not Interested */
  | 'not_interested'
  /** Voicemail */
  | 'voicemail';

/** Boolean expression to compare columns of type "disposition_enum_enum". All fields are combined with logical 'AND'. */
export type Disposition_Enum_Enum_Comparison_Exp = {
  _eq?: Disposition_Enum_Enum | null | undefined;
  _in?: Array<Disposition_Enum_Enum> | null | undefined;
  _is_null?: boolean | null | undefined;
  _neq?: Disposition_Enum_Enum | null | undefined;
  _nin?: Array<Disposition_Enum_Enum> | null | undefined;
};

/** input type for inserting data into table "disposition_enum" */
export type Disposition_Enum_Insert_Input = {
  id?: string | null | undefined;
  label?: string | null | undefined;
};

/** input type for inserting object relation for remote table "disposition_enum" */
export type Disposition_Enum_Obj_Rel_Insert_Input = {
  data: Disposition_Enum_Insert_Input;
  /** upsert condition */
  on_conflict?: Disposition_Enum_On_Conflict | null | undefined;
};

/** on_conflict condition type for table "disposition_enum" */
export type Disposition_Enum_On_Conflict = {
  constraint: Disposition_Enum_Constraint;
  update_columns?: Array<Disposition_Enum_Update_Column>;
  where?: Disposition_Enum_Bool_Exp | null | undefined;
};

/** update columns of table "disposition_enum" */
export type Disposition_Enum_Update_Column =
  /** column name */
  | 'id'
  /** column name */
  | 'label';

export type Jsonb_Cast_Exp = {
  String?: String_Comparison_Exp | null | undefined;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: Jsonb_Cast_Exp | null | undefined;
  /** is the column contained in the given json value */
  _contained_in?: any;
  /** does the column contain the given json value at the top level */
  _contains?: any;
  _eq?: any;
  _gt?: any;
  _gte?: any;
  /** does the string exist as a top-level key in the column */
  _has_key?: string | null | undefined;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: Array<string> | null | undefined;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: Array<string> | null | undefined;
  _in?: Array<any> | null | undefined;
  _is_null?: boolean | null | undefined;
  _lt?: any;
  _lte?: any;
  _neq?: any;
  _nin?: Array<any> | null | undefined;
};

/** Boolean expression to filter rows from the table "lead_status_enum". All fields are combined with a logical 'AND'. */
export type Lead_Status_Enum_Bool_Exp = {
  _and?: Array<Lead_Status_Enum_Bool_Exp> | null | undefined;
  _not?: Lead_Status_Enum_Bool_Exp | null | undefined;
  _or?: Array<Lead_Status_Enum_Bool_Exp> | null | undefined;
  id?: String_Comparison_Exp | null | undefined;
  label?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "lead_status_enum" */
export type Lead_Status_Enum_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'lead_status_enum_pkey';

export type Lead_Status_Enum_Enum =
  /** Callback Requested */
  | 'callback_requested'
  /** In Progress */
  | 'contacting'
  /** Converted */
  | 'converted'
  /** Do Not Call */
  | 'do_not_call'
  /** New */
  | 'new'
  /** Not Interested */
  | 'not_interested'
  /** Qualified */
  | 'qualified'
  /** Unreachable */
  | 'unreachable';

/** input type for inserting data into table "lead_status_enum" */
export type Lead_Status_Enum_Insert_Input = {
  id?: string | null | undefined;
  label?: string | null | undefined;
};

/** input type for inserting object relation for remote table "lead_status_enum" */
export type Lead_Status_Enum_Obj_Rel_Insert_Input = {
  data: Lead_Status_Enum_Insert_Input;
  /** upsert condition */
  on_conflict?: Lead_Status_Enum_On_Conflict | null | undefined;
};

/** on_conflict condition type for table "lead_status_enum" */
export type Lead_Status_Enum_On_Conflict = {
  constraint: Lead_Status_Enum_Constraint;
  update_columns?: Array<Lead_Status_Enum_Update_Column>;
  where?: Lead_Status_Enum_Bool_Exp | null | undefined;
};

/** update columns of table "lead_status_enum" */
export type Lead_Status_Enum_Update_Column =
  /** column name */
  | 'id'
  /** column name */
  | 'label';

/** input type for inserting data into table "leads" */
export type Leads_Insert_Input = {
  call_logs?: Call_Logs_Arr_Rel_Insert_Input | null | undefined;
  company_name?: string | null | undefined;
  created_at?: string | null | undefined;
  disposition_enum?: Disposition_Enum_Obj_Rel_Insert_Input | null | undefined;
  email?: string | null | undefined;
  id?: string | null | undefined;
  last_call_at?: string | null | undefined;
  last_disposition_id?: Disposition_Enum_Enum | null | undefined;
  lead_status_enum?: Lead_Status_Enum_Obj_Rel_Insert_Input | null | undefined;
  name?: string | null | undefined;
  organization?: Organizations_Obj_Rel_Insert_Input | null | undefined;
  organization_id?: string | null | undefined;
  phone_number?: string | null | undefined;
  status?: Lead_Status_Enum_Enum | null | undefined;
  total_calls_count?: number | null | undefined;
  updated_at?: string | null | undefined;
  zitadel_org_id?: string | null | undefined;
};

/** input type for updating data in table "leads" */
export type Leads_Set_Input = {
  company_name?: string | null | undefined;
  created_at?: string | null | undefined;
  email?: string | null | undefined;
  id?: string | null | undefined;
  last_call_at?: string | null | undefined;
  last_disposition_id?: Disposition_Enum_Enum | null | undefined;
  name?: string | null | undefined;
  organization_id?: string | null | undefined;
  phone_number?: string | null | undefined;
  status?: Lead_Status_Enum_Enum | null | undefined;
  total_calls_count?: number | null | undefined;
  updated_at?: string | null | undefined;
  zitadel_org_id?: string | null | undefined;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: unknown;
  _gt?: unknown;
  _gte?: unknown;
  _in?: Array<unknown> | null | undefined;
  _is_null?: boolean | null | undefined;
  _lt?: unknown;
  _lte?: unknown;
  _neq?: unknown;
  _nin?: Array<unknown> | null | undefined;
};

/** Boolean expression to filter rows from the table "organizations". All fields are combined with a logical 'AND'. */
export type Organizations_Bool_Exp = {
  _and?: Array<Organizations_Bool_Exp> | null | undefined;
  _not?: Organizations_Bool_Exp | null | undefined;
  _or?: Array<Organizations_Bool_Exp> | null | undefined;
  agents?: Agents_Bool_Exp | null | undefined;
  agents_aggregate?: Agents_Aggregate_Bool_Exp | null | undefined;
  bolna_api_key?: String_Comparison_Exp | null | undefined;
  call_logs?: Call_Logs_Bool_Exp | null | undefined;
  call_logs_aggregate?: Call_Logs_Aggregate_Bool_Exp | null | undefined;
  created_at?: Timestamptz_Comparison_Exp | null | undefined;
  id?: Uuid_Comparison_Exp | null | undefined;
  name?: String_Comparison_Exp | null | undefined;
  updated_at?: Timestamptz_Comparison_Exp | null | undefined;
  users?: Users_Bool_Exp | null | undefined;
  users_aggregate?: Users_Aggregate_Bool_Exp | null | undefined;
  zitadel_org_id?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "organizations" */
export type Organizations_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'organizations_pkey'
  /** unique or primary key constraint on columns "zitadel_org_id" */
  | 'organizations_zitadel_org_id_key';

/** input type for inserting data into table "organizations" */
export type Organizations_Insert_Input = {
  agents?: Agents_Arr_Rel_Insert_Input | null | undefined;
  bolna_api_key?: string | null | undefined;
  call_logs?: Call_Logs_Arr_Rel_Insert_Input | null | undefined;
  created_at?: string | null | undefined;
  id?: string | null | undefined;
  name?: string | null | undefined;
  updated_at?: string | null | undefined;
  users?: Users_Arr_Rel_Insert_Input | null | undefined;
  zitadel_org_id?: string | null | undefined;
};

/** input type for inserting object relation for remote table "organizations" */
export type Organizations_Obj_Rel_Insert_Input = {
  data: Organizations_Insert_Input;
  /** upsert condition */
  on_conflict?: Organizations_On_Conflict | null | undefined;
};

/** on_conflict condition type for table "organizations" */
export type Organizations_On_Conflict = {
  constraint: Organizations_Constraint;
  update_columns?: Array<Organizations_Update_Column>;
  where?: Organizations_Bool_Exp | null | undefined;
};

/** update columns of table "organizations" */
export type Organizations_Update_Column =
  /** column name */
  | 'bolna_api_key'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'name'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'zitadel_org_id';

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: string | null | undefined;
  _gt?: string | null | undefined;
  _gte?: string | null | undefined;
  _in?: Array<string> | null | undefined;
  _is_null?: boolean | null | undefined;
  _lt?: string | null | undefined;
  _lte?: string | null | undefined;
  _neq?: string | null | undefined;
  _nin?: Array<string> | null | undefined;
};

export type Users_Aggregate_Bool_Exp = {
  count?: Users_Aggregate_Bool_Exp_Count | null | undefined;
};

export type Users_Aggregate_Bool_Exp_Count = {
  arguments?: Array<Users_Select_Column> | null | undefined;
  distinct?: boolean | null | undefined;
  filter?: Users_Bool_Exp | null | undefined;
  predicate: Int_Comparison_Exp;
};

/** input type for inserting array relation for remote table "users" */
export type Users_Arr_Rel_Insert_Input = {
  data: Array<Users_Insert_Input>;
  /** upsert condition */
  on_conflict?: Users_On_Conflict | null | undefined;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: Array<Users_Bool_Exp> | null | undefined;
  _not?: Users_Bool_Exp | null | undefined;
  _or?: Array<Users_Bool_Exp> | null | undefined;
  created_at?: Timestamptz_Comparison_Exp | null | undefined;
  email?: String_Comparison_Exp | null | undefined;
  id?: Uuid_Comparison_Exp | null | undefined;
  name?: String_Comparison_Exp | null | undefined;
  organization?: Organizations_Bool_Exp | null | undefined;
  organization_id?: Uuid_Comparison_Exp | null | undefined;
  password?: String_Comparison_Exp | null | undefined;
  updated_at?: Timestamptz_Comparison_Exp | null | undefined;
  zitadel_user_id?: String_Comparison_Exp | null | undefined;
};

/** unique or primary key constraints on table "users" */
export type Users_Constraint =
  /** unique or primary key constraint on columns "email" */
  | 'users_email_key'
  /** unique or primary key constraint on columns "id" */
  | 'users_pkey'
  /** unique or primary key constraint on columns "zitadel_user_id" */
  | 'users_zitadel_user_id_key';

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  created_at?: string | null | undefined;
  email?: string | null | undefined;
  id?: string | null | undefined;
  name?: string | null | undefined;
  organization?: Organizations_Obj_Rel_Insert_Input | null | undefined;
  organization_id?: string | null | undefined;
  password?: string | null | undefined;
  updated_at?: string | null | undefined;
  zitadel_user_id?: string | null | undefined;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: Users_Bool_Exp | null | undefined;
};

/** select columns of table "users" */
export type Users_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'email'
  /** column name */
  | 'id'
  /** column name */
  | 'name'
  /** column name */
  | 'organization_id'
  /** column name */
  | 'password'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'zitadel_user_id';

/** update columns of table "users" */
export type Users_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'email'
  /** column name */
  | 'id'
  /** column name */
  | 'name'
  /** column name */
  | 'organization_id'
  /** column name */
  | 'password'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'zitadel_user_id';

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: string | null | undefined;
  _gt?: string | null | undefined;
  _gte?: string | null | undefined;
  _in?: Array<string> | null | undefined;
  _is_null?: boolean | null | undefined;
  _lt?: string | null | undefined;
  _lte?: string | null | undefined;
  _neq?: string | null | undefined;
  _nin?: Array<string> | null | undefined;
};

export type DeleteLeadMutationVariables = Exact<{
  id: string;
}>;


export type DeleteLeadMutation = { delete_leads_by_pk: { id: string } | null };

export type InsertLeadMutationVariables = Exact<{
  object: Leads_Insert_Input;
}>;


export type InsertLeadMutation = { insert_leads_one: { id: string, phone_number: string, name: string | null, email: string | null, company_name: string | null, status: Lead_Status_Enum_Enum, created_at: string } | null };

export type PlaceSingleCallMutationVariables = Exact<{
  agentId: string;
  leadId: string;
}>;


export type PlaceSingleCallMutation = { placeSingleCall: { success: boolean, executionId: string | null, message: string | null } | null };

export type UpdateLeadMutationVariables = Exact<{
  id: string;
  changes: Leads_Set_Input;
}>;


export type UpdateLeadMutation = { update_leads_by_pk: { id: string, phone_number: string, name: string | null, email: string | null, company_name: string | null, status: Lead_Status_Enum_Enum, updated_at: string } | null };

export type FileUploadS3UrlQueryVariables = Exact<{
  fileName: string;
  contentType: string;
}>;


export type FileUploadS3UrlQuery = { fileUploadS3Url: { url: string | null, key: string | null, policy: string | null, algorithm: string | null, credential: string | null, date: string | null, signature: string | null, contentType: string | null, contentDisposition: string | null } | null };

export type GetAgentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAgentsQuery = { agents: Array<{ id: string, bolna_agent_id: string, name: string, language_id: Agent_Language_Enum_Enum | null, zitadel_org_id: string }> };

export type GetCallLogByIdQueryVariables = Exact<{
  id: string;
}>;


export type GetCallLogByIdQuery = { call_logs_by_pk: { id: string, organization_id: string, zitadel_org_id: string, agent_id: string | null, bolna_agent_id: string, bolna_execution_id: string, recipient_phone_number: string, agent_phone_number: string | null, call_type: string | null, telephony_provider: string | null, status: Call_Status_Enum_Enum, hangup_by: string | null, hangup_reason: string | null, duration_seconds: number | null, recording_url: string | null, total_cost: unknown, disposition: Disposition_Enum_Enum | null, summary: string | null, transcript: string | null, extracted_data: any, latency_data: any, raw_response: any, initiated_at: string | null, created_at: string | null, updated_at: string | null, call_status_enum: { id: string, label: string }, disposition_enum: { id: string, label: string } | null, lead: { id: string, name: string | null, phone_number: string } | null, agent: { id: string, name: string, language_id: Agent_Language_Enum_Enum | null } | null } | null };

export type GetCallLogsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCallLogsQuery = { call_logs: Array<{ id: string, organization_id: string, zitadel_org_id: string, agent_id: string | null, bolna_agent_id: string, bolna_execution_id: string, recipient_phone_number: string, agent_phone_number: string | null, call_type: string | null, telephony_provider: string | null, status: Call_Status_Enum_Enum, hangup_by: string | null, hangup_reason: string | null, duration_seconds: number | null, recording_url: string | null, total_cost: unknown, disposition: Disposition_Enum_Enum | null, summary: string | null, transcript: string | null, extracted_data: any, latency_data: any, raw_response: any, initiated_at: string | null, created_at: string | null, updated_at: string | null, call_status_enum: { id: string, label: string }, disposition_enum: { id: string, label: string } | null, lead: { id: string, name: string | null, phone_number: string } | null, agent: { id: string, name: string, language_id: Agent_Language_Enum_Enum | null } | null }> };

export type GetLeadByIdQueryVariables = Exact<{
  id: string;
}>;


export type GetLeadByIdQuery = { leads_by_pk: { id: string, organization_id: string, zitadel_org_id: string, name: string | null, phone_number: string, email: string | null, company_name: string | null, status: Lead_Status_Enum_Enum, total_calls_count: number, last_call_at: string | null, last_disposition_id: Disposition_Enum_Enum | null, created_at: string, updated_at: string, lead_status_enum: { id: string, label: string }, disposition_enum: { id: string, label: string } | null, call_logs: Array<{ id: string, organization_id: string, zitadel_org_id: string, agent_id: string | null, bolna_agent_id: string, bolna_execution_id: string, recipient_phone_number: string, agent_phone_number: string | null, call_type: string | null, telephony_provider: string | null, status: Call_Status_Enum_Enum, hangup_by: string | null, hangup_reason: string | null, duration_seconds: number | null, recording_url: string | null, total_cost: unknown, disposition: Disposition_Enum_Enum | null, summary: string | null, transcript: string | null, extracted_data: any, latency_data: any, raw_response: any, initiated_at: string | null, created_at: string | null, updated_at: string | null, call_status_enum: { id: string, label: string }, disposition_enum: { id: string, label: string } | null, agent: { id: string, name: string, language_id: Agent_Language_Enum_Enum | null } | null }> } | null };

export type GetLeadStatusesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLeadStatusesQuery = { lead_status_enum: Array<{ id: string, label: string }> };

export type GetLeadsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLeadsQuery = { leads: Array<{ id: string, organization_id: string, zitadel_org_id: string, name: string | null, phone_number: string, email: string | null, company_name: string | null, status: Lead_Status_Enum_Enum, total_calls_count: number, last_call_at: string | null, last_disposition_id: Disposition_Enum_Enum | null, created_at: string, updated_at: string, lead_status_enum: { id: string, label: string }, disposition_enum: { id: string, label: string } | null }> };

export type GetOrganizationWithUserQueryVariables = Exact<{
  zitadel_org_id: string;
  zitadel_user_id: string;
}>;


export type GetOrganizationWithUserQuery = { organizations: Array<{ id: string, zitadel_org_id: string, name: string, created_at: string | null, updated_at: string | null, users: Array<{ id: string, zitadel_user_id: string, email: string, organization_id: string }> }> };


export const DeleteLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteLead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"uuid"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"delete_leads_by_pk"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteLeadMutation, DeleteLeadMutationVariables>;
export const InsertLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InsertLead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"object"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"leads_insert_input"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"insert_leads_one"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"object"},"value":{"kind":"Variable","name":{"kind":"Name","value":"object"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<InsertLeadMutation, InsertLeadMutationVariables>;
export const PlaceSingleCallDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"placeSingleCall"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"agentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeSingleCall"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"agentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"agentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"leadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"executionId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<PlaceSingleCallMutation, PlaceSingleCallMutationVariables>;
export const UpdateLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateLead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"uuid"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"changes"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"leads_set_input"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"update_leads_by_pk"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pk_columns"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"_set"},"value":{"kind":"Variable","name":{"kind":"Name","value":"changes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<UpdateLeadMutation, UpdateLeadMutationVariables>;
export const FileUploadS3UrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fileUploadS3Url"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contentType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileUploadS3Url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileName"}}},{"kind":"Argument","name":{"kind":"Name","value":"contentType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contentType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"policy"}},{"kind":"Field","name":{"kind":"Name","value":"algorithm"}},{"kind":"Field","name":{"kind":"Name","value":"credential"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"contentDisposition"}}]}}]}}]} as unknown as DocumentNode<FileUploadS3UrlQuery, FileUploadS3UrlQueryVariables>;
export const GetAgentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAgents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"agents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"language_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}}]}}]}}]} as unknown as DocumentNode<GetAgentsQuery, GetAgentsQueryVariables>;
export const GetCallLogByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCallLogById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"uuid"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"call_logs_by_pk"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_execution_id"}},{"kind":"Field","name":{"kind":"Name","value":"recipient_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"agent_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"call_type"}},{"kind":"Field","name":{"kind":"Name","value":"telephony_provider"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"call_status_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hangup_by"}},{"kind":"Field","name":{"kind":"Name","value":"hangup_reason"}},{"kind":"Field","name":{"kind":"Name","value":"duration_seconds"}},{"kind":"Field","name":{"kind":"Name","value":"recording_url"}},{"kind":"Field","name":{"kind":"Name","value":"total_cost"}},{"kind":"Field","name":{"kind":"Name","value":"disposition"}},{"kind":"Field","name":{"kind":"Name","value":"disposition_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"transcript"}},{"kind":"Field","name":{"kind":"Name","value":"extracted_data"}},{"kind":"Field","name":{"kind":"Name","value":"latency_data"}},{"kind":"Field","name":{"kind":"Name","value":"raw_response"}},{"kind":"Field","name":{"kind":"Name","value":"initiated_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"lead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}}]}},{"kind":"Field","name":{"kind":"Name","value":"agent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"language_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetCallLogByIdQuery, GetCallLogByIdQueryVariables>;
export const GetCallLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCallLogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"call_logs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_execution_id"}},{"kind":"Field","name":{"kind":"Name","value":"recipient_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"agent_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"call_type"}},{"kind":"Field","name":{"kind":"Name","value":"telephony_provider"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"call_status_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hangup_by"}},{"kind":"Field","name":{"kind":"Name","value":"hangup_reason"}},{"kind":"Field","name":{"kind":"Name","value":"duration_seconds"}},{"kind":"Field","name":{"kind":"Name","value":"recording_url"}},{"kind":"Field","name":{"kind":"Name","value":"total_cost"}},{"kind":"Field","name":{"kind":"Name","value":"disposition"}},{"kind":"Field","name":{"kind":"Name","value":"disposition_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"transcript"}},{"kind":"Field","name":{"kind":"Name","value":"extracted_data"}},{"kind":"Field","name":{"kind":"Name","value":"latency_data"}},{"kind":"Field","name":{"kind":"Name","value":"raw_response"}},{"kind":"Field","name":{"kind":"Name","value":"initiated_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"lead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}}]}},{"kind":"Field","name":{"kind":"Name","value":"agent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"language_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetCallLogsQuery, GetCallLogsQueryVariables>;
export const GetLeadByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLeadById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"uuid"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leads_by_pk"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lead_status_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total_calls_count"}},{"kind":"Field","name":{"kind":"Name","value":"last_call_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_disposition_id"}},{"kind":"Field","name":{"kind":"Name","value":"disposition_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"call_logs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_execution_id"}},{"kind":"Field","name":{"kind":"Name","value":"recipient_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"agent_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"call_type"}},{"kind":"Field","name":{"kind":"Name","value":"telephony_provider"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"call_status_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hangup_by"}},{"kind":"Field","name":{"kind":"Name","value":"hangup_reason"}},{"kind":"Field","name":{"kind":"Name","value":"duration_seconds"}},{"kind":"Field","name":{"kind":"Name","value":"recording_url"}},{"kind":"Field","name":{"kind":"Name","value":"total_cost"}},{"kind":"Field","name":{"kind":"Name","value":"disposition"}},{"kind":"Field","name":{"kind":"Name","value":"disposition_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"transcript"}},{"kind":"Field","name":{"kind":"Name","value":"extracted_data"}},{"kind":"Field","name":{"kind":"Name","value":"latency_data"}},{"kind":"Field","name":{"kind":"Name","value":"raw_response"}},{"kind":"Field","name":{"kind":"Name","value":"initiated_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"agent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"language_id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetLeadByIdQuery, GetLeadByIdQueryVariables>;
export const GetLeadStatusesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLeadStatuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lead_status_enum"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"EnumValue","value":"asc"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<GetLeadStatusesQuery, GetLeadStatusesQueryVariables>;
export const GetLeadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLeads"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"company_name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lead_status_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total_calls_count"}},{"kind":"Field","name":{"kind":"Name","value":"last_call_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_disposition_id"}},{"kind":"Field","name":{"kind":"Name","value":"disposition_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<GetLeadsQuery, GetLeadsQueryVariables>;
export const GetOrganizationWithUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationWithUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"zitadel_org_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_org_id"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"zitadel_user_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_user_id"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>;