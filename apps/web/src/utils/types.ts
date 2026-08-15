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
