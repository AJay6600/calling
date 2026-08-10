import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import type { ReactNode } from 'react';

const zitadelAuthority = import.meta.env['VITE_ZITADEL_AUTHORITY'];
const zitadelClientId = import.meta.env['VITE_ZITADEL_CLIENT_ID'];
const zitadelRedirectUri = import.meta.env['VITE_ZITADEL_REDIRECT_URI'];
const zitadelPostLogoutRedirectUri = import.meta.env[
  'VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI'
];

const isMissingZitadelConfig =
  zitadelAuthority === undefined ||
  zitadelClientId === undefined ||
  zitadelRedirectUri === undefined;

if (isMissingZitadelConfig) {
  throw new Error(
    'Missing Zitadel env vars - check apps/web/.env against .env.example',
  );
}

const oidcConfig = {
  authority: zitadelAuthority,
  client_id: zitadelClientId,
  redirect_uri: zitadelRedirectUri,
  post_logout_redirect_uri: zitadelPostLogoutRedirectUri,
  scope: 'openid profile email offline_access',
  automaticSilentRenew: true,
  includeIdTokenInSilentRenew: false,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

type AppOidcProviderPropsType = {
  children: ReactNode;
};

export const AppOidcProvider = ({ children }: AppOidcProviderPropsType) => {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
};
