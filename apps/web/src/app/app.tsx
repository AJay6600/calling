import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { registerAuthTokenInterceptor } from '../utils';
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
import { AppLayout } from '../component/AppLayout';

export const App = () => {
  const auth = useAuth();

  useEffect(() => {
    registerAuthTokenInterceptor(() => auth.user?.access_token);
  }, [auth.user]);

  if (auth.isLoading) {
    return <Spin fullscreen />;
  }

  return (
    <Routes>
      <Route path="/callback" element={<AuthCallbackPage />} />
      <Route path="/" element={<AppLayout />}>
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
