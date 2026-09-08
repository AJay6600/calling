import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, Progress, Tag, Tooltip, Popover, message, type MenuProps } from 'antd';
import { useQuery } from '@apollo/client/react';
import {
  FiGrid,
  FiRadio,
  FiUsers,
  FiCpu,
  FiPhone,
  FiBarChart2,
  FiCreditCard,
  FiPhoneOutgoing,
  FiLogOut,
  FiArrowLeft,
  FiZap,
  FiClock,
  FiArrowUpRight,
  FiBriefcase,
  FiUser,
  FiChevronDown,
  FiShield,
  FiLock,
} from 'react-icons/fi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import {
  PageHeaderProvider,
  usePageHeader,
} from '../contexts/PageHeaderContext';
import { getOrganizationWithUserDocument } from '../graphql';
import {
  apiClient,
  getZitadelOrgIdFromProfile,
  getZitadelUserIdFromProfile,
  isUserAdmin,
} from '../utils';

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

const formatSecondsLabel = (secs: number): string => {
  if (secs <= 0) return '0s';
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  if (mins >= 60) {
    const hours = (secs / 3600).toFixed(1);
    return `${hours} hrs`;
  }
  if (mins > 0) {
    return `${mins}m ${remainingSecs > 0 ? `${remainingSecs}s` : ''}`.trim();
  }
  return `${secs}s`;
};

const SidebarToggleIcon = ({
  className = '',
  size = 18,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

type PageMeta = {
  title: string;
  subtext: string;
};

const pageMetaMap: Record<string, PageMeta> = {
  '/': {
    title: 'Command center',
    subtext: 'Live view of your AI calling operation',
  },
  '/campaigns': {
    title: 'Campaigns',
    subtext: 'Bulk calling runs and their live progress',
  },
  '/leads': {
    title: 'Leads',
    subtext: '12,480 contacts across 6 uploads',
  },
  '/ai-agents': {
    title: 'AI Agents',
    subtext: 'Prompts, voices and languages your callers use',
  },
  '/calls': {
    title: 'Single call',
    subtext: 'Place one AI call to a specific contact right now',
  },
  '/calls/single': {
    title: 'Single call',
    subtext: 'Place one AI call to a specific contact right now',
  },
  '/calls/bulk': {
    title: 'Bulk call',
    subtext: 'Launch automated AI campaigns to list of contacts',
  },
  '/calls/logs': {
    title: 'Call logs',
    subtext: 'Transcripts, recordings and dispositions for past calls',
  },
  '/analytics': {
    title: 'Analytics',
    subtext: 'Performance metrics, conversion rates, and ROI insights',
  },
  '/billing': {
    title: 'Billing',
    subtext: 'Manage wallet balance, auto-recharge, and subscription plans',
  },
};

type NavItemConfig = {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: {
    key: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[];
};

const navConfig: NavItemConfig[] = [
  { key: '/', label: 'Dashboard', icon: FiGrid },
  { key: '/campaigns', label: 'Campaigns', icon: FiRadio },
  { key: '/leads', label: 'Leads', icon: FiUsers },
  { key: '/ai-agents', label: 'AI Agents', icon: FiCpu },
  {
    key: '/calls',
    label: 'Calls',
    icon: FiPhone,
    children: [
      { key: '/calls/single', label: 'Single call', icon: FiPhoneOutgoing },
      { key: '/calls/bulk', label: 'Bulk call', icon: FiRadio },
      { key: '/calls/logs', label: 'Call logs', icon: FiPhone },
    ],
  },
  { key: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { key: '/billing', label: 'Billing', icon: FiCreditCard },
];

const buildMenuItems = (
  currentPath: string,
  isAdmin: boolean,
): Required<MenuProps>['items'] => {
  const filteredNavConfig = navConfig.filter((item) => {
    if (item.key === '/billing' && !isAdmin) {
      return false;
    }
    return true;
  });

  return filteredNavConfig.map((item) => {
    const isSelected = item.key === currentPath;
    const IconComponent = item.icon;
    const iconClassName = isSelected
      ? 'text-primary'
      : 'text-secondary-foreground';

    if (item.children) {
      return {
        key: item.key,
        label: item.label,
        icon: <IconComponent size={18} className={iconClassName} />,
        children: item.children.map((child) => {
          const isChildSelected = child.key === currentPath;
          const ChildIcon = child.icon;
          return {
            key: child.key,
            label: child.label,
            icon: (
              <ChildIcon
                size={16}
                className={
                  isChildSelected ? 'text-primary' : 'text-secondary-foreground'
                }
              />
            ),
            style: {
              borderRight: isChildSelected
                ? '3px solid var(--primary)'
                : '3px solid transparent',
              color: isChildSelected ? 'var(--primary)' : undefined,
            },
          };
        }),
      };
    }

    return {
      key: item.key,
      label: item.label,
      icon: <IconComponent size={18} className={iconClassName} />,
      style: {
        borderRight: isSelected
          ? '3px solid var(--primary)'
          : '3px solid transparent',
        color: isSelected ? 'var(--primary)' : undefined,
      },
    };
  });
};

/**
 * Renders the left-hand side of the top Header. Uses `usePageHeader()` so
 * any nested route (e.g. CallLogDetailPage) can override the title/subtext
 * and inject a back button by calling `useSetPageHeader(...)`. Falls back
 * to the static `pageMetaMap` lookup when no page has set an override.
 *
 * Must be rendered inside <PageHeaderProvider>.
 */
const AppHeaderTitle: React.FC<{ pathname: string }> = ({ pathname }) => {
  const { headerOverride } = usePageHeader();

  const headerMeta = pageMetaMap[pathname] ??
    pageMetaMap['/'] ?? {
      title: 'Command center',
      subtext: 'Live view of your AI calling operation',
    };

  const title = headerOverride?.title ?? headerMeta.title;
  const subtext = headerOverride?.subtext ?? headerMeta.subtext;
  const onBack = headerOverride?.onBack;

  return (
    <div className="flex items-center gap-3">
      {onBack && (
        <Button
          shape="circle"
          icon={<FiArrowLeft />}
          onClick={onBack}
          className="bg-transparent! text-foreground! border-border! hover:text-primary! hover:border-primary!"
        />
      )}
      <div className="flex flex-col">
        <Title
          level={3}
          className="m-0! text-foreground!"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
        >
          {title}
        </Title>
        {subtext && (
          <Text className="text-sm text-muted-foreground opacity-70">
            {subtext}
          </Text>
        )}
      </div>
    </div>
  );
};

const AppLayoutInner = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [subscription, setSubscription] = useState<{
    allocated_seconds: number;
    remaining_seconds: number;
    status: string;
    package?: { name: string };
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const userProfile = auth.user?.profile;
  const zitadelOrgId = getZitadelOrgIdFromProfile(userProfile);
  const zitadelUserId = getZitadelUserIdFromProfile(userProfile);

  const { data: orgData } = useQuery(getOrganizationWithUserDocument, {
    variables: {
      zitadel_org_id: zitadelOrgId ?? '',
      zitadel_user_id: zitadelUserId ?? '',
    },
    skip: zitadelOrgId === undefined || zitadelUserId === undefined,
  });

  const organization = orgData?.organizations?.[0];

  useEffect(() => {
    const fetchSubscriptionData = () => {
      apiClient
        .get('/api/subscriptions/active')
        .then((res) => {
          if (res.data?.subscription) {
            setSubscription(res.data.subscription);
          }
        })
        .catch((err) => console.error('Error fetching subscription in AppLayout:', err));
    };

    fetchSubscriptionData();
    const intervalId = setInterval(fetchSubscriptionData, 10000);
    return () => clearInterval(intervalId);
  }, [location.pathname]);

  const handleMenuNavigate: MenuProps['onClick'] = (info) => {
    navigate(info.key);
  };

  const handleSignOut = async () => {
    try {
      await auth.signoutRedirect();
    } catch {
      await auth.removeUser();
    }
  };

  const firstName = userProfile?.given_name || '';
  const lastName = userProfile?.family_name || '';
  const computedFullName = [firstName, lastName].filter(Boolean).join(' ');
  const fullName =
    computedFullName ||
    userProfile?.name ||
    userProfile?.preferred_username ||
    userProfile?.email ||
    'User';
  const email = userProfile?.email || '';

  const isAdmin = isUserAdmin(userProfile);
  const menuItems = buildMenuItems(location.pathname, isAdmin);

  const remainingPct = subscription
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (subscription.remaining_seconds / (subscription.allocated_seconds || 1)) * 100,
          ),
        ),
      )
    : 0;

  const userProfilePopoverContent = (
    <div className="w-80 p-4 bg-sidebar! text-foreground! rounded-2xl border border-sidebar-border shadow-2xl space-y-4">
      {/* User Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-sidebar-border">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-md shadow-primary/30">
          {(firstName || fullName).charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-foreground m-0 truncate">
            {fullName}
          </h4>
          {email && (
            <span className="text-xs text-muted-foreground truncate">
              {email}
            </span>
          )}
          <span className="w-fit m-0 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Zitadel Authenticated
          </span>
        </div>
      </div>

      {/* Organization Info Box */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <FiBriefcase className="text-emerald-400" /> Organization Context
        </span>
        <div className="p-3 rounded-xl bg-secondary/50 border border-sidebar-border text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Org Name:</span>
            <strong className="text-foreground font-semibold truncate max-w-[150px]">
              {organization?.name || 'Default Organization'}
            </strong>
          </div>
          {zitadelOrgId && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground">Zitadel Org ID:</span>
              <span className="font-mono text-emerald-400 truncate max-w-[130px]">
                {zitadelOrgId}
              </span>
            </div>
          )}
          {organization?.created_at && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground">Org Created:</span>
              <span className="text-foreground font-mono">
                {new Date(organization.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User Context Box */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <FiUser className="text-emerald-400" /> Account Credentials
        </span>
        <div className="p-3 rounded-xl bg-secondary/50 border border-sidebar-border text-xs space-y-2">
          {zitadelUserId && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-muted-foreground truncate max-w-[140px]">
                {zitadelUserId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex gap-2 border-t border-sidebar-border/80">
        {isAdmin && (
          <Button
            type="default"
            icon={<FiCreditCard />}
            onClick={() => navigate('/billing')}
            className="flex-1 text-xs font-semibold bg-secondary/80! text-foreground! border-sidebar-border! hover:border-primary! hover:text-primary!"
          >
            Billing & Plan
          </Button>
        )}
        <Button
          danger
          type="primary"
          icon={<FiLogOut />}
          onClick={handleSignOut}
          className="flex-1 text-xs font-bold bg-rose-500! text-white! border-rose-500! hover:bg-rose-600!"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <Layout className="h-screen bg-background">
      <Sider
        width={260}
        collapsedWidth={72}
        collapsed={collapsed}
        trigger={null}
        theme="dark"
        className="h-full border-r border-sidebar-border bg-sidebar! transition-all duration-300 [&>.ant-layout-sider-children]:flex [&>.ant-layout-sider-children]:flex-col [&>.ant-layout-sider-children]:justify-between [&>.ant-layout-sider-children]:h-full"
      >
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          {/* Sidebar Header Section */}
          {!collapsed ? (
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary">
                  <FiPhoneOutgoing
                    size={16}
                    className="text-sidebar-primary-foreground"
                  />
                </div>
                <div className="truncate">
                  <Title
                    level={5}
                    className="m-0! text-sidebar-foreground! text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Kaller AI
                  </Title>
                  <Text className="text-[11px] text-sidebar-foreground! opacity-60">
                    Outbound voice cloud
                  </Text>
                </div>
              </div>
              <Button
                type="text"
                icon={
                  <SidebarToggleIcon className="text-sidebar-foreground opacity-70 hover:opacity-100" />
                }
                onClick={() => setCollapsed(true)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg p-0 hover:bg-white/10"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 px-2 py-4">
              <Button
                type="text"
                icon={
                  <SidebarToggleIcon className="text-sidebar-foreground opacity-70 hover:opacity-100" />
                }
                onClick={() => setCollapsed(false)}
                className="flex size-9 items-center justify-center rounded-lg p-0 hover:bg-white/10"
              />
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary">
                <FiPhoneOutgoing
                  size={16}
                  className="text-sidebar-primary-foreground"
                />
              </div>
            </div>
          )}

          <Menu
            theme="dark"
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={collapsed ? [] : ['/calls']}
            items={menuItems}
            onClick={handleMenuNavigate}
            className="border-none! bg-transparent! px-2"
          />
        </div>

        {/* Bottom Subscription Details & Remaining Seconds Widget */}
        {subscription && (
          <div className="p-3 border-t border-sidebar-border/60 bg-sidebar-accent/30 shrink-0 mt-auto">
            {!collapsed ? (
              <div className="p-3 rounded-2xl bg-secondary/60 border border-sidebar-border/80 flex flex-col gap-2 shadow-lg">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-foreground truncate max-w-[130px]">
                    <FiZap className="text-primary text-sm shrink-0 animate-pulse" />
                    <span className="truncate">
                      {subscription.package?.name || 'Active Plan'}
                    </span>
                  </div>
                  <Tag
                    color={
                      subscription.status === 'active' && subscription.remaining_seconds > 0
                        ? 'green'
                        : 'volcano'
                    }
                    className="m-0 text-[10px] font-bold px-1.5 py-0"
                  >
                    {subscription.remaining_seconds <= 0
                      ? 'EXHAUSTED'
                      : subscription.status.toUpperCase()}
                  </Tag>
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Call Balance:
                  </span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span
                      className={`font-black text-sm ${
                        subscription.remaining_seconds > 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {formatSecondsLabel(subscription.remaining_seconds)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      / {formatSecondsLabel(subscription.allocated_seconds)}
                    </span>
                  </div>
                </div>

                <Progress
                  percent={remainingPct}
                  showInfo={false}
                  size="small"
                  strokeColor={
                    subscription.remaining_seconds > 0
                      ? { '0%': '#10b981', '100%': '#6366f1' }
                      : '#ef4444'
                  }
                  trailColor="rgba(255, 255, 255, 0.08)"
                  className="m-0!"
                />

                {isAdmin && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<FiCreditCard />}
                    onClick={() => navigate('/billing')}
                    className="w-full mt-1 text-[11px] font-bold bg-primary/20! text-primary! border-primary/40! hover:bg-primary! hover:text-white! transition-all flex items-center justify-center gap-1 py-1 h-7"
                  >
                    Billing & Plans <FiArrowUpRight />
                  </Button>
                )}
              </div>
            ) : (
              <Tooltip
                title={
                  <div className="text-xs space-y-1 p-1">
                    <div>
                      <strong>{subscription.package?.name || 'Active Plan'}</strong>
                    </div>
                    <div>
                      Balance:{' '}
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatSecondsLabel(subscription.remaining_seconds)}
                      </span>
                    </div>
                    <div>Status: {subscription.status}</div>
                  </div>
                }
                placement="right"
              >
                <div
                  onClick={() => {
                    if (isAdmin) navigate('/billing');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/60 border border-sidebar-border/80 transition-all text-center gap-1 ${
                    isAdmin ? 'cursor-pointer hover:border-primary/50' : 'cursor-default'
                  }`}
                >
                  <FiClock className="text-emerald-400 text-base shrink-0" />
                  <span className="font-mono font-bold text-[10px] text-emerald-400 truncate max-w-[60px]">
                    {formatSecondsLabel(subscription.remaining_seconds)}
                  </span>
                </div>
              </Tooltip>
            )}
          </div>
        )}
      </Sider>

      <Layout className="h-full min-w-0 bg-background">
        <Header className="flex h-auto shrink-0 items-center justify-between border-b border-border bg-background! px-8 py-4">
          <AppHeaderTitle pathname={location.pathname} />

          <Popover
            content={userProfilePopoverContent}
            trigger={['hover', 'click']}
            placement="bottomRight"
            overlayInnerStyle={{
              padding: 0,
              backgroundColor: '#0f172a',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/50 px-3.5 py-1.5 backdrop-blur-md shadow-sm transition-all hover:border-primary/50 hover:bg-secondary/80 cursor-pointer group">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
                {(firstName || fullName).charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white tracking-tight leading-tight truncate">
                    {fullName}
                  </span>
                  <FiChevronDown className="text-muted-foreground text-xs group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary/90 font-medium leading-tight truncate">
                  <FiBriefcase className="text-[11px] shrink-0 text-primary" />
                  <span className="truncate max-w-[120px] font-medium text-muted-foreground">
                    {organization?.name || 'Organization'}
                  </span>
                </div>
              </div>
              <div className="h-6 w-px bg-border/80 mx-1" />

              <Button
                type="text"
                icon={
                  <FiLogOut
                    size={17}
                    className="text-primary/90 transition-all group-hover:text-destructive!"
                  />
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignOut();
                }}
                aria-label="Sign out"
                className="group flex size-8 shrink-0 items-center justify-center rounded-lg p-0 transition-all duration-200 hover:bg-destructive/20"
              />
            </div>
          </Popover>
        </Header>

        <Content className="relative flex flex-1 flex-col overflow-y-auto bg-background bg-[radial-gradient(120%_90%_at_15%_0%,#00C39124,transparent_60%)] p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export const AppLayout = () => (
  <PageHeaderProvider>
    <AppLayoutInner />
  </PageHeaderProvider>
);

export default AppLayout;
