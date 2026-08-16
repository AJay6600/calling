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
