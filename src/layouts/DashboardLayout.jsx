import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  LogOut,
  ShieldCheck,
  BarChart3,
  KanbanSquare,
  ClipboardList,
  Settings,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import TopBar from '../components/TopBar';
import NotificationCenter from '../components/NotificationCenter';
import ToastStack from '../components/ToastStack';
import FilterDrawer from '../components/FilterDrawer';

const SidebarLink = ({ to, icon, label, collapsed }) => {
  const Icon = icon;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-xl transition text-sm font-semibold ${
          isActive 
            ? 'bg-teal-100 text-teal-900 shadow-sm' 
            : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
        }`
      }
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light');
  const toastIdRef = useRef(1);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Loan approved',
      message: 'Loan L-1024 has been approved by Risk Desk.',
      time: '2m ago',
      read: false,
    },
    {
      id: 'n2',
      title: 'Payment due',
      message: 'EMI for L-1003 is due tomorrow.',
      time: '1h ago',
      read: false,
    },
  ]);
  const activities = [
    { id: 'a1', title: 'Login', description: 'Signed in as ' + user?.role, time: 'Just now' },
    { id: 'a2', title: 'Action', description: 'Viewed dashboard overview', time: '10m ago' },
    { id: 'a3', title: 'Update', description: 'Applied filters on loan list', time: '30m ago' },
  ];

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Show welcome toast only once on mount
  const hasShownWelcome = useRef(false);
  useEffect(() => {
    if (user && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      const id = toastIdRef.current++;
      setToasts((prev) => [
        ...prev,
        {
          id,
          type: 'info',
          title: 'Welcome back',
          message: `You are signed in as ${user?.role}.`,
        },
      ]);
    }
  }, [user]);

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['BORROWER'] },
      { label: 'Apply Loan', to: '/apply', icon: FileText, roles: ['BORROWER'] },
      { label: 'History', to: '/history', icon: FileText, roles: ['BORROWER'] },
      { label: 'Repayment', to: '/repayment', icon: CreditCard, roles: ['BORROWER'] },
      { label: 'Payments', to: '/borrower/payments', icon: CreditCard, roles: ['BORROWER'] },
      { label: 'Work Queue', to: '/review', icon: KanbanSquare, roles: ['LENDER'] },
      { label: 'Decision Analytics', to: '/lender-analytics', icon: BarChart3, roles: ['LENDER'] },
      { label: 'Payments', to: '/lender/payments', icon: CreditCard, roles: ['LENDER'] },
      { label: 'Portfolio Analytics', to: '/', icon: BarChart3, roles: ['ANALYST'] },
      { label: 'Report Builder', to: '/reports', icon: FileSpreadsheet, roles: ['ANALYST'] },
      { label: 'Admin Overview', to: '/', icon: ShieldCheck, roles: ['ADMIN'] },
      { label: 'System Config', to: '/admin/config', icon: Settings, roles: ['ADMIN'] },
      { label: 'Permissions', to: '/admin/permissions', icon: Shield, roles: ['ADMIN'] },
      { label: 'Audit Trail', to: '/admin/audit', icon: ClipboardList, roles: ['ADMIN'] },
    ],
    []
  );

  const primaryAction =
    user?.role === 'BORROWER'
      ? { label: 'Apply Loan', to: '/apply' }
      : user?.role === 'LENDER'
        ? { label: 'Work Queue', to: '/review' }
        : user?.role === 'ANALYST'
          ? { label: 'View Portfolio', to: '/' }
          : user?.role === 'ADMIN'
            ? { label: 'Admin Overview', to: '/' }
            : null;

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 flex flex-col p-4 transition-all duration-300 border-r border-teal-200/40 dark:border-teal-800/40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center font-serif text-sm font-black text-white">LL</div>
          {!isCollapsed && (
            <div>
              <p className="text-base font-serif font-bold leading-tight">LendLogic</p>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise</p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                collapsed={isCollapsed}
              />
            ))}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 rounded-xl text-rose-600 hover:bg-rose-100/50 mt-auto transition-all duration-200"
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <TopBar
          user={user}
          logout={logout}
          onToggleSidebar={() => setIsCollapsed((prev) => !prev)}
          isSidebarCollapsed={isCollapsed}
          onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onToggleFilters={() => setIsFilterOpen(true)}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          theme={theme}
          primaryAction={primaryAction}
          unreadCount={unreadCount}
        />
        <div className="p-8">{children}</div>
      </main>

      <NotificationCenter
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        activities={activities}
        onMarkAllRead={markAllRead}
      />
      <FilterDrawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <ToastStack toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default DashboardLayout;