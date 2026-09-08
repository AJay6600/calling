import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  Card,
  Col,
  Row,
  Typography,
  Tag,
  Progress,
  Button,
  Modal,
  Table,
  Spin,
  Result,
  message,
} from 'antd';
import {
  FiCreditCard,
  FiClock,
  FiZap,
  FiCheckCircle,
  FiAlertTriangle,
  FiShield,
  FiArrowUpRight,
  FiRefreshCw,
  FiLock,
} from 'react-icons/fi';
import { apiClient, isUserAdmin } from '../utils';

const { Title, Text } = Typography;

const formatSeconds = (totalSec: number) => {
  if (!totalSec || totalSec <= 0) return '0s';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

interface PackageType {
  id: string;
  name: string;
  description: string;
  allocated_seconds: number;
  price_usd: number;
  validity_days: number;
}

interface ActiveSubscriptionType {
  id: string;
  organization_id: string;
  package_id: string | null;
  allocated_seconds: number;
  remaining_seconds: number;
  status: string;
  start_date: string;
  end_date: string;
  package?: {
    name: string;
  };
}

interface UsageLogType {
  id: string;
  seconds_deducted: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export const BillingPage = () => {
  const auth = useAuth();
  const isAdmin = isUserAdmin(auth.user?.profile);

  const [loading, setLoading] = useState<boolean>(true);
  const [activeSub, setActiveSub] = useState<ActiveSubscriptionType | null>(null);
  const [hasClaimedTrial, setHasClaimedTrial] = useState<boolean>(false);
  const [usageLogs, setUsageLogs] = useState<UsageLogType[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PackageType | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check if returning from successful Stripe Checkout
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (sessionId) {
        try {
          const verifyRes = await apiClient.get<{ verified: boolean; subscription?: ActiveSubscriptionType }>(
            `/api/subscriptions/verify-session?session_id=${sessionId}`,
          );
          if (verifyRes.data?.verified) {
            message.success('Payment verified! Your subscription is now active.');
          }
        } catch (verifyErr) {
          console.error('Failed to verify session on callback:', verifyErr);
        } finally {
          // Clean up query string from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      const [subRes, pkgRes] = await Promise.all([
        apiClient.get<{
          subscription: ActiveSubscriptionType;
          hasClaimedFreeTrial: boolean;
          usageLogs: UsageLogType[];
        }>('/api/subscriptions/active'),
        apiClient.get<{ packages: PackageType[] }>('/api/subscriptions/packages'),
      ]);

      setActiveSub(subRes.data.subscription);
      setHasClaimedTrial(subRes.data.hasClaimedFreeTrial ?? false);
      setUsageLogs(subRes.data.usageLogs || []);
      setPackages(pkgRes.data.packages || []);
    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      message.error(err?.response?.data?.message || 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPkg) return;

    setSubmitting(true);
    try {
      if (selectedPkg.price_usd === 0 || selectedPkg.id === '11111111-1111-1111-1111-111111111111') {
        await apiClient.post('/api/subscriptions/subscribe', {
          packageId: selectedPkg.id,
        });
        message.success(`Successfully activated ${selectedPkg.name}!`);
        setSelectedPkg(null);
        await fetchData();
      } else {
        const checkoutRes = await apiClient.post<{ url: string }>(
          '/api/subscriptions/create-checkout-session',
          { packageId: selectedPkg.id },
        );

        if (checkoutRes.data?.url) {
          window.location.href = checkoutRes.data.url;
        } else {
          // Fallback if Stripe key not set yet
          await apiClient.post('/api/subscriptions/subscribe', {
            packageId: selectedPkg.id,
          });
          message.success(`Subscribed to ${selectedPkg.name}!`);
          setSelectedPkg(null);
          await fetchData();
        }
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      // Fallback for dev testing if Stripe key is missing
      try {
        await apiClient.post('/api/subscriptions/subscribe', {
          packageId: selectedPkg.id,
        });
        message.success(`Subscribed to ${selectedPkg.name}!`);
        setSelectedPkg(null);
        await fetchData();
      } catch (fallbackErr: any) {
        message.error(err?.response?.data?.message || 'Failed to subscribe to package');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-full w-full min-h-[400px] items-center justify-center p-6">
        <Result
          status="403"
          title="Access Restricted"
          subTitle="Only Organization Administrators (admin role) can view and manage billing & subscription plans."
          extra={
            <Button type="primary" href="/">
              Return to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" tip="Loading Subscription & Call Balance..." />
      </div>
    );
  }

  const remainingSeconds = activeSub?.remaining_seconds || 0;
  const allocatedSeconds = activeSub?.allocated_seconds || 1;
  const remainingPct = Math.min(100, Math.max(0, Math.round((remainingSeconds / allocatedSeconds) * 100)));

  let statusColor = 'green';
  let statusText = 'ACTIVE';
  if (activeSub?.status === 'expired') {
    statusColor = 'red';
    statusText = 'EXPAIRED';
  } else if (activeSub?.status === 'exhausted' || remainingSeconds <= 0) {
    statusColor = 'volcano';
    statusText = 'EXHAUSTED';
  } else if (remainingPct <= 20) {
    statusColor = 'amber';
    statusText = 'BALANCE LOW';
  }

  const usageColumns = [
    {
      title: 'Date & Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (dateStr: string) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(dateStr).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <span className="text-xs text-foreground font-medium">{desc || 'Call Duration Consumption'}</span>
      ),
    },
    {
      title: 'Call Seconds Consumed',
      dataIndex: 'seconds_deducted',
      key: 'seconds_deducted',
      align: 'right' as const,
      render: (sec: number) => (
        <span className="font-mono text-xs text-rose-400 font-semibold">
          -{sec}s ({formatSeconds(sec)})
        </span>
      ),
    },
    {
      title: 'Remaining Balance',
      dataIndex: 'balance_after',
      key: 'balance_after',
      align: 'right' as const,
      render: (sec: number) => (
        <span className="font-mono text-xs text-emerald-400 font-bold">
          {formatSeconds(sec)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full p-2 sm:p-4">
      {/* Header Banner */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl w-full animate-card-fade-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shadow-inner">
              <FiCreditCard />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Title level={3} className="m-0! text-foreground!">
                  Organization Subscription & Call Balance
                </Title>
              </div>
              <Text className="text-xs text-muted-foreground! block mt-1">
                Manage allocated call seconds, active subscription packages, unit usage deductions, and billing ledgers.
              </Text>
            </div>
          </div>

          <Button
            type="default"
            icon={<FiRefreshCw />}
            onClick={fetchData}
            className="text-xs"
          >
            Refresh Balance
          </Button>
        </div>
      </Card>

      {/* Active Subscription Status Card */}
      <Row gutter={[16, 16]} className="animate-card-fade-1">
        <Col xs={24} lg={16}>
          <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-2 sm:p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Tag color={statusColor} className="m-0 font-bold text-xs px-2.5 py-0.5 tracking-wider">
                    {statusText}
                  </Tag>
                  <Title level={4} className="m-0! text-foreground!">
                    {activeSub?.package?.name || 'Active Subscription Plan'}
                  </Title>
                </div>
                <span className="text-xs text-muted-foreground">
                  Valid Until: <strong className="text-foreground">{new Date(activeSub?.end_date || '').toLocaleDateString()}</strong>
                </span>
              </div>

              {/* Progress Bar & Second Counters */}
              <div className="space-y-3 bg-secondary/40! p-4 rounded-2xl border border-sidebar-border">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-xs font-semibold text-muted-foreground">Remaining Call Time Balance:</span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-black text-emerald-400">{formatSeconds(remainingSeconds)}</span>
                    <span className="text-xs text-muted-foreground">/ {formatSeconds(allocatedSeconds)} allocated</span>
                  </div>
                </div>

                <Progress
                  percent={remainingPct}
                  strokeColor={remainingPct > 20 ? { '0%': '#10b981', '100%': '#6366f1' } : '#ef4444'}
                  trailColor="rgba(255, 255, 255, 0.08)"
                  className="m-0!"
                  showInfo={false}
                />

                <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Start Date: {new Date(activeSub?.start_date || '').toLocaleDateString()}</span>
                  <span>{remainingPct}% Call Seconds Available</span>
                </div>
              </div>
            </div>

            {/* Warning Banner if Expired or Balance Exhausted */}
            {(activeSub?.status === 'expired' || remainingSeconds <= 0) && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                <span className="flex items-center gap-2 font-medium">
                  <FiAlertTriangle className="text-rose-400 text-base shrink-0" />
                  Your call duration balance is exhausted or expired. Outbound calls are paused until upgraded.
                </span>
              </div>
            )}
          </Card>
        </Col>

        {/* Quick Balance Summary KPI Card */}
        <Col xs={24} lg={8}>
          <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-2 sm:p-4 h-full flex flex-col justify-between">
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiShield className="text-primary" /> Subscription Summary
            </Title>

            <div className="space-y-3 text-xs my-3">
              <div className="p-3 rounded-xl bg-secondary/50! border border-sidebar-border flex justify-between items-center">
                <span className="text-muted-foreground">Total Seconds Allocated:</span>
                <span className="font-mono font-bold text-foreground">{allocatedSeconds}s ({formatSeconds(allocatedSeconds)})</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50! border border-sidebar-border flex justify-between items-center">
                <span className="text-muted-foreground">Call Seconds Used:</span>
                <span className="font-mono font-bold text-rose-400">{allocatedSeconds - remainingSeconds}s</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50! border border-sidebar-border flex justify-between items-center">
                <span className="text-muted-foreground">Remaining Seconds:</span>
                <span className="font-mono font-bold text-emerald-400">{remainingSeconds}s</span>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground text-center">
              Deductions are calculated per call interaction in exact seconds.
            </div>
          </Card>
        </Col>
      </Row>

      {/* Subscription Packages Marketplace Grid */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-4 animate-card-fade-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiZap className="text-primary" /> Select / Upgrade Subscription Package
            </Title>
            <p className="text-xs text-muted-foreground! mt-0.5 mb-0">
              Choose a package suited for your monthly call volume requirements. Seconds credit immediately upon selection.
            </p>
          </div>
        </div>

        {(() => {
          const availablePackages = packages.filter((pkg) => {
            const isFreeTrialPkg =
              pkg.price_usd === 0 || pkg.id === '11111111-1111-1111-1111-111111111111';
            if (isFreeTrialPkg && (hasClaimedTrial || !!activeSub)) {
              return false; // Permanently remove free subscription package option for this organization
            }
            return true;
          });

          return (
            <Row gutter={[16, 16]}>
              {availablePackages.map((pkg) => {
                const isCurrentPkg = activeSub?.package_id === pkg.id && activeSub?.status === 'active';
                const colSpan = availablePackages.length === 3 ? { xs: 24, sm: 12, lg: 8 } : { xs: 24, sm: 12, lg: 6 };

                return (
                  <Col {...colSpan} key={pkg.id}>
                    <div
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-full ${
                        isCurrentPkg
                          ? 'bg-primary/10 border-primary shadow-xl ring-2 ring-primary/40'
                          : 'bg-secondary/40 border-sidebar-border hover:border-primary/50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Title level={5} className="m-0! text-foreground!">
                            {pkg.name}
                          </Title>
                          {isCurrentPkg && (
                            <Tag color="green" className="m-0 text-[10px] font-bold px-2 py-0.5">
                              CURRENT PLAN
                            </Tag>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground! block mb-4 min-h-[32px] leading-relaxed">
                          {pkg.description || `${formatSeconds(pkg.allocated_seconds)} call duration credit`}
                        </p>

                        <div className="text-3xl font-black text-foreground! mb-1 tracking-tight">
                          ${pkg.price_usd}
                          <span className="text-xs text-muted-foreground! font-normal ml-1">/ {pkg.validity_days} days</span>
                        </div>

                        <div className="space-y-2.5 border-t border-sidebar-border/60 pt-3 my-3 text-xs">
                          <div className="flex items-center gap-2 text-foreground!">
                            <FiCheckCircle className="text-emerald-400 text-sm shrink-0" />
                            <span><strong className="text-foreground!">{formatSeconds(pkg.allocated_seconds)}</strong> ({pkg.allocated_seconds}s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground!">
                            <FiCheckCircle className="text-emerald-400 text-sm shrink-0" />
                            <span>Valid for <strong className="text-foreground!">{pkg.validity_days} days</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground!">
                            <FiCheckCircle className="text-emerald-400 text-sm shrink-0" />
                            <span>Per-second dynamic deduction</span>
                          </div>
                        </div>
                      </div>

                      {isCurrentPkg ? (
                        <div className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs text-center flex items-center justify-center gap-2 shadow-inner">
                          <FiCheckCircle className="text-sm" /> Current Active Plan
                        </div>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => setSelectedPkg(pkg)}
                          icon={<FiArrowUpRight />}
                          className="w-full mt-3 text-xs font-bold bg-primary! text-primary-foreground! border-primary! hover:bg-primary/90! shadow-md py-2.5"
                        >
                          Subscribe ({pkg.name})
                        </Button>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          );
        })()}
      </Card>

      {/* Usage Deduction History Audit Table */}
      <Card className="bg-card! border! border-sidebar-border! rounded-3xl! shadow-xl p-4 animate-card-fade-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={5} className="m-0! text-foreground! flex items-center gap-2">
              <FiClock className="text-primary" /> Subscription Usage & Deduction Ledger
            </Title>
            <Text className="text-xs text-muted-foreground!">
              Audit trail of call second deductions recorded per call interaction
            </Text>
          </div>
        </div>

        <Table
          dataSource={usageLogs}
          columns={usageColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
          className="text-foreground!"
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title="Confirm Subscription Upgrade"
        open={!!selectedPkg}
        onOk={handleSubscribe}
        confirmLoading={submitting}
        onCancel={() => setSelectedPkg(null)}
        okText="Confirm & Subscribe"
        cancelText="Cancel"
      >
        {selectedPkg && (
          <div className="space-y-3 py-2 text-xs">
            <p className="text-foreground">
              Are you sure you want to subscribe to the <strong>{selectedPkg.name}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-secondary border border-sidebar-border space-y-1">
              <div className="flex justify-between">
                <span>Allocated Call Time:</span>
                <strong className="text-emerald-400">{formatSeconds(selectedPkg.allocated_seconds)} ({selectedPkg.allocated_seconds}s)</strong>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <strong className="text-foreground">${selectedPkg.price_usd}</strong>
              </div>
              <div className="flex justify-between">
                <span>Validity Period:</span>
                <strong className="text-foreground">{selectedPkg.validity_days} days</strong>
              </div>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Upon confirmation, your organization's call seconds balance will update immediately to {formatSeconds(selectedPkg.allocated_seconds)}.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillingPage;
