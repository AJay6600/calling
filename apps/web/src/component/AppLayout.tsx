import { useState } from 'react';
import { Layout, Menu, Typography, Button, type MenuProps } from 'antd';
import {
  FiGrid,
  FiRadio,
  FiUsers,
  FiCpu,
  FiPhone,
  FiBarChart2,
  FiCreditCard,
  FiPhoneOutgoing,
} from 'react-icons/fi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

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

const buildMenuItems = (currentPath: string): Required<MenuProps>['items'] => {
  return navConfig.map((item) => {
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

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuNavigate: MenuProps['onClick'] = (info) => {
    navigate(info.key);
  };

  const menuItems = buildMenuItems(location.pathname);
  const headerMeta =
    pageMetaMap[location.pathname] ??
    pageMetaMap['/'] ?? {
      title: 'Command center',
      subtext: 'Live view of your AI calling operation',
    };

  return (
    <Layout className="h-screen bg-background">
      <Sider
        width={260}
        collapsedWidth={72}
        collapsed={collapsed}
        trigger={null}
        theme="dark"
        className="h-full border-r border-sidebar-border bg-sidebar! transition-all duration-300 overflow-y-auto"
      >
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
      </Sider>

      <Layout className="h-full min-w-0 bg-background">
        <Header className="flex h-auto shrink-0 flex-col justify-center border-b border-border bg-background! px-8 py-4">
          <Title
            level={3}
            className="m-0! text-foreground!"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            {headerMeta.title}
          </Title>
          <Text className="text-sm text-muted-foreground opacity-70">
            {headerMeta.subtext}
          </Text>
        </Header>

        <Content className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background bg-[radial-gradient(120%_90%_at_15%_0%,#00C39124,transparent_60%)] p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
