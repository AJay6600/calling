import axios from 'axios';
import type { ApiErrorResponseType } from '../types';
import { ZITADEL_ORG_ID_HEADER } from './zitadelClaims';

const apiBaseUrl = import.meta.env['VITE_API_BASE_URL'];

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

let interceptorId: number | null = null;

let getAccessToken: () => string | undefined = () => undefined;
let getZitadelOrgId: () => string | undefined = () => undefined;

export const registerAuthTokenInterceptor = (
  tokenGetter: () => string | undefined,
) => {
  getAccessToken = tokenGetter;
  attachRequestInterceptor();
};

export const registerZitadelOrgIdInterceptor = (
  orgIdGetter: () => string | undefined,
) => {
  getZitadelOrgId = orgIdGetter;
  attachRequestInterceptor();
};

const attachRequestInterceptor = () => {
  if (interceptorId !== null) {
    apiClient.interceptors.request.eject(interceptorId);
  }

  interceptorId = apiClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    const zitadelOrgId = getZitadelOrgId();

    if (accessToken !== undefined && accessToken !== '') {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (zitadelOrgId !== undefined && zitadelOrgId !== '') {
      config.headers[ZITADEL_ORG_ID_HEADER] = zitadelOrgId;
      config.headers['x-hasura-org-id'] = zitadelOrgId;
      config.headers['x-hasura-zitadel-org-id'] = zitadelOrgId;
    }

    return config;
  });
};

export const isApiErrorResponse = (
  error: unknown,
): error is { response: { data: ApiErrorResponseType } } => {
  return axios.isAxiosError(error) && error.response !== undefined;
};
