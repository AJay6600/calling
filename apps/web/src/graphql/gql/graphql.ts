/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Agent_Language_Enum_Enum =
  /** English */
  | 'english'
  /** Hindi */
  | 'hindi'
  /** Marathi */
  | 'marathi';

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

export type PlaceSingleCallMutationVariables = Exact<{
  agentId: string;
  receiverPhoneNumber: string;
}>;


export type PlaceSingleCallMutation = { placeSingleCall: { success: boolean, executionId: string | null, message: string | null } | null };

export type FileUploadS3UrlQueryVariables = Exact<{
  fileName: string;
  contentType: string;
}>;


export type FileUploadS3UrlQuery = { fileUploadS3Url: { url: string | null, key: string | null, policy: string | null, algorithm: string | null, credential: string | null, date: string | null, signature: string | null, contentType: string | null, contentDisposition: string | null } | null };

export type GetAgentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAgentsQuery = { agents: Array<{ id: string, bolna_agent_id: string, name: string, language_id: Agent_Language_Enum_Enum | null, zitadel_org_id: string }> };

export type GetCallLogsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCallLogsQuery = { call_logs: Array<{ id: string, organization_id: string, zitadel_org_id: string, agent_id: string | null, bolna_agent_id: string, bolna_execution_id: string, recipient_phone_number: string, agent_phone_number: string | null, call_type: string | null, telephony_provider: string | null, status: Call_Status_Enum_Enum, hangup_by: string | null, hangup_reason: string | null, duration_seconds: number | null, recording_url: string | null, total_cost: unknown, disposition: Disposition_Enum_Enum | null, summary: string | null, transcript: string | null, extracted_data: any, latency_data: any, raw_response: any, initiated_at: string | null, created_at: string | null, updated_at: string | null, call_status_enum: { id: string, label: string }, disposition_enum: { id: string, label: string } | null, agent: { id: string, name: string, language_id: Agent_Language_Enum_Enum | null } | null }> };

export type GetOrganizationWithUserQueryVariables = Exact<{
  zitadel_org_id: string;
  zitadel_user_id: string;
}>;


export type GetOrganizationWithUserQuery = { organizations: Array<{ id: string, zitadel_org_id: string, name: string, created_at: string | null, updated_at: string | null, users: Array<{ id: string, zitadel_user_id: string, email: string, organization_id: string }> }> };


export const PlaceSingleCallDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"placeSingleCall"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"agentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"receiverPhoneNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeSingleCall"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"agentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"agentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"receiverPhoneNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"receiverPhoneNumber"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"executionId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<PlaceSingleCallMutation, PlaceSingleCallMutationVariables>;
export const FileUploadS3UrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"fileUploadS3Url"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contentType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileUploadS3Url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileName"}}},{"kind":"Argument","name":{"kind":"Name","value":"contentType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contentType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"policy"}},{"kind":"Field","name":{"kind":"Name","value":"algorithm"}},{"kind":"Field","name":{"kind":"Name","value":"credential"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"contentDisposition"}}]}}]}}]} as unknown as DocumentNode<FileUploadS3UrlQuery, FileUploadS3UrlQueryVariables>;
export const GetAgentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAgents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"agents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"language_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}}]}}]}}]} as unknown as DocumentNode<GetAgentsQuery, GetAgentsQueryVariables>;
export const GetCallLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCallLogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"call_logs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_agent_id"}},{"kind":"Field","name":{"kind":"Name","value":"bolna_execution_id"}},{"kind":"Field","name":{"kind":"Name","value":"recipient_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"agent_phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"call_type"}},{"kind":"Field","name":{"kind":"Name","value":"telephony_provider"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"call_status_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hangup_by"}},{"kind":"Field","name":{"kind":"Name","value":"hangup_reason"}},{"kind":"Field","name":{"kind":"Name","value":"duration_seconds"}},{"kind":"Field","name":{"kind":"Name","value":"recording_url"}},{"kind":"Field","name":{"kind":"Name","value":"total_cost"}},{"kind":"Field","name":{"kind":"Name","value":"disposition"}},{"kind":"Field","name":{"kind":"Name","value":"disposition_enum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"transcript"}},{"kind":"Field","name":{"kind":"Name","value":"extracted_data"}},{"kind":"Field","name":{"kind":"Name","value":"latency_data"}},{"kind":"Field","name":{"kind":"Name","value":"raw_response"}},{"kind":"Field","name":{"kind":"Name","value":"initiated_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"agent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"language_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetCallLogsQuery, GetCallLogsQueryVariables>;
export const GetOrganizationWithUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationWithUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"zitadel_org_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_org_id"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_org_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"zitadel_user_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zitadel_user_id"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zitadel_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetOrganizationWithUserQuery, GetOrganizationWithUserQueryVariables>;