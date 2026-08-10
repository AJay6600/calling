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
