import axios from "axios";
import type { ApiErrorResponseType } from "../types";

const apiBaseUrl = import.meta.env["VITE_API_BASE_URL"];

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

/**
 * Call this once, near the app root, after the AuthProvider has mounted -
 * typically inside a component that has access to the useAuth() hook from
 * react-oidc-context. Attaches the current access token to every outgoing request.
 */
let interceptorId: number | null = null;

export const registerAuthTokenInterceptor = (
  getAccessToken: () => string | undefined,
) => {
  if (interceptorId !== null) {
    apiClient.interceptors.request.eject(interceptorId);
  }

  interceptorId = apiClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    const hasAccessToken = accessToken !== undefined && accessToken !== '';

    if (hasAccessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });
};

export const isApiErrorResponse = (
  error: unknown,
): error is { response: { data: ApiErrorResponseType } } => {
  return axios.isAxiosError(error) && error.response !== undefined;
};
