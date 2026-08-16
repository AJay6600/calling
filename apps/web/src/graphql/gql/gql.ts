/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation placeSingleCall(\n    $agentId: String!\n    $receiverPhoneNumber: String!\n  ) {\n    placeSingleCall(\n      agentId: $agentId\n      receiverPhoneNumber: $receiverPhoneNumber\n    ) {\n      success\n      executionId\n      message\n    }\n  }\n": typeof types.PlaceSingleCallDocument,
    "\n  query fileUploadS3Url($fileName: String!, $contentType: String!) {\n    fileUploadS3Url(fileName: $fileName, contentType: $contentType) {\n      url\n      key\n      policy\n      algorithm\n      credential\n      date\n      signature\n      contentType\n      contentDisposition\n    }\n  }\n": typeof types.FileUploadS3UrlDocument,
    "\n  query GetAgents {\n    agents {\n      id\n      bolna_agent_id\n      name\n      language_id\n      zitadel_org_id\n    }\n  }\n": typeof types.GetAgentsDocument,
    "\n  query GetOrganizationWithUser(\n    $zitadel_org_id: String!\n    $zitadel_user_id: String!\n  ) {\n    organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }, limit: 1) {\n      id\n      zitadel_org_id\n      name\n      created_at\n      updated_at\n      users(where: { zitadel_user_id: { _eq: $zitadel_user_id } }, limit: 1) {\n        id\n        zitadel_user_id\n        email\n        organization_id\n      }\n    }\n  }\n": typeof types.GetOrganizationWithUserDocument,
};
const documents: Documents = {
    "\n  mutation placeSingleCall(\n    $agentId: String!\n    $receiverPhoneNumber: String!\n  ) {\n    placeSingleCall(\n      agentId: $agentId\n      receiverPhoneNumber: $receiverPhoneNumber\n    ) {\n      success\n      executionId\n      message\n    }\n  }\n": types.PlaceSingleCallDocument,
    "\n  query fileUploadS3Url($fileName: String!, $contentType: String!) {\n    fileUploadS3Url(fileName: $fileName, contentType: $contentType) {\n      url\n      key\n      policy\n      algorithm\n      credential\n      date\n      signature\n      contentType\n      contentDisposition\n    }\n  }\n": types.FileUploadS3UrlDocument,
    "\n  query GetAgents {\n    agents {\n      id\n      bolna_agent_id\n      name\n      language_id\n      zitadel_org_id\n    }\n  }\n": types.GetAgentsDocument,
    "\n  query GetOrganizationWithUser(\n    $zitadel_org_id: String!\n    $zitadel_user_id: String!\n  ) {\n    organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }, limit: 1) {\n      id\n      zitadel_org_id\n      name\n      created_at\n      updated_at\n      users(where: { zitadel_user_id: { _eq: $zitadel_user_id } }, limit: 1) {\n        id\n        zitadel_user_id\n        email\n        organization_id\n      }\n    }\n  }\n": types.GetOrganizationWithUserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation placeSingleCall(\n    $agentId: String!\n    $receiverPhoneNumber: String!\n  ) {\n    placeSingleCall(\n      agentId: $agentId\n      receiverPhoneNumber: $receiverPhoneNumber\n    ) {\n      success\n      executionId\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation placeSingleCall(\n    $agentId: String!\n    $receiverPhoneNumber: String!\n  ) {\n    placeSingleCall(\n      agentId: $agentId\n      receiverPhoneNumber: $receiverPhoneNumber\n    ) {\n      success\n      executionId\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fileUploadS3Url($fileName: String!, $contentType: String!) {\n    fileUploadS3Url(fileName: $fileName, contentType: $contentType) {\n      url\n      key\n      policy\n      algorithm\n      credential\n      date\n      signature\n      contentType\n      contentDisposition\n    }\n  }\n"): (typeof documents)["\n  query fileUploadS3Url($fileName: String!, $contentType: String!) {\n    fileUploadS3Url(fileName: $fileName, contentType: $contentType) {\n      url\n      key\n      policy\n      algorithm\n      credential\n      date\n      signature\n      contentType\n      contentDisposition\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAgents {\n    agents {\n      id\n      bolna_agent_id\n      name\n      language_id\n      zitadel_org_id\n    }\n  }\n"): (typeof documents)["\n  query GetAgents {\n    agents {\n      id\n      bolna_agent_id\n      name\n      language_id\n      zitadel_org_id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationWithUser(\n    $zitadel_org_id: String!\n    $zitadel_user_id: String!\n  ) {\n    organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }, limit: 1) {\n      id\n      zitadel_org_id\n      name\n      created_at\n      updated_at\n      users(where: { zitadel_user_id: { _eq: $zitadel_user_id } }, limit: 1) {\n        id\n        zitadel_user_id\n        email\n        organization_id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetOrganizationWithUser(\n    $zitadel_org_id: String!\n    $zitadel_user_id: String!\n  ) {\n    organizations(where: { zitadel_org_id: { _eq: $zitadel_org_id } }, limit: 1) {\n      id\n      zitadel_org_id\n      name\n      created_at\n      updated_at\n      users(where: { zitadel_user_id: { _eq: $zitadel_user_id } }, limit: 1) {\n        id\n        zitadel_user_id\n        email\n        organization_id\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;