import { useAuth, hasAuthParams } from 'react-oidc-context';
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin, Button, Result } from 'antd';
import { registerAuthTokenInterceptor, getZitadelOrgIdFromProfile } from '../utils';
import {
  registerApolloAuthToken,
  registerApolloZitadelOrgId,
} from '../lib/apolloClient';
import { registerZitadelOrgIdInterceptor } from '../utils/helper/apiClient';
import {
  AuthCallbackPage,
  DashboardPage,
  CampaignsPage,
  LeadsPage,
  AiAgentsPage,
  SingleCallPage,
  BulkCallPage,
  CallLogsPage,
  AnalyticsPage,
  BillingPage,
} from '../pages';
import { AppLayout, OrganizationGuard } from '../component';

export const App = () => {
  const auth = useAuth();

  useEffect(() => {
    const getToken = () => auth.user?.id_token ?? auth.user?.access_token;
    const getOrgId = () => getZitadelOrgIdFromProfile(auth.user?.profile);

    registerAuthTokenInterceptor(getToken);
    registerZitadelOrgIdInterceptor(getOrgId);
    registerApolloAuthToken(getToken);
    registerApolloZitadelOrgId(getOrgId);

    if (auth.isAuthenticated && auth.user) {
      console.log('Logged in user details:', auth.user);
    }
  }, [auth.user, auth.isAuthenticated]);

  useEffect(() => {
    if (
      !auth.isLoading &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !hasAuthParams() &&
      !auth.error
    ) {
      auth.signinRedirect();
    }
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.activeNavigator,
    auth.error,
    auth,
  ]);

  if (auth.isLoading) {
    return <Spin fullscreen />;
  }

  if (auth.error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Result
          status="error"
          title="Authentication Error"
          subTitle={auth.error.message}
          extra={[
            <Button
              type="primary"
              key="signin"
              onClick={() => auth.signinRedirect()}
            >
              Sign In Again
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!auth.isAuthenticated && !hasAuthParams()) {
    return <Spin fullscreen tip="Redirecting to login..." />;
  }

  return (
    <Routes>
      <Route path="/callback" element={<AuthCallbackPage />} />
      <Route
        path="/"
        element={
          <OrganizationGuard>
            <AppLayout />
          </OrganizationGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="ai-agents" element={<AiAgentsPage />} />
        <Route path="calls" element={<Navigate to="/calls/single" replace />} />
        <Route path="calls/single" element={<SingleCallPage />} />
        <Route path="calls/bulk" element={<BulkCallPage />} />
        <Route path="calls/logs" element={<CallLogsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="billing" element={<BillingPage />} />
      </Route>
    </Routes>
  );
};
