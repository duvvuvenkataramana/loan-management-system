import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
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

// Helper function to get time ago string
function getTimeAgo(now, past) {
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { loans, loanApplications, payments } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light');
  const toastIdRef = useRef(1);
  const [toasts, setToasts] = useState([]);

  // Generate realistic notifications based on actual data
  const notifications = useMemo(() => {
    const notifs = [];
    const now = new Date();
    
    // Check for pending loan applications
    const pendingApps = loanApplications.filter(app => app.status === 'pending');
    if (pendingApps.length > 0) {
      notifs.push({
        id: 'n-pending',
        title: 'Pending Applications',
        message: `You have ${pendingApps.length} loan application${pendingApps.length > 1 ? 's' : ''} waiting for review.`,
        time: 'Just now',
        read: false,
      });
    }
    
    // Check for approved loans
    const activeLoans = loans.filter(loan => loan.status === 'active');
    if (activeLoans.length > 0) {
      // Check for upcoming EMIs
      const upcomingLoans = activeLoans.filter(loan => {
        if (!loan.nextDue) return false;
        const dueDate = new Date(loan.nextDue);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 7 && daysUntilDue >= 0;
      });
      
      if (upcomingLoans.length > 0) {
        notifs.push({
          id: 'n-emi-due',
          title: 'EMI Payment Due',
          message: `Your EMI payment${upcomingLoans.length > 1 ? 's are' : ' is'} due within the next 7 days.`,
          time: 'Just now',
          read: false,
        });
      }
    }
    
    // Check for recent payments
    const recentPayments = payments.filter(p => {
      const paymentDate = new Date(p.date);
      const daysDiff = Math.ceil((now - paymentDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    if (recentPayments.length > 0) {
      notifs.push({
        id: 'n-payment-success',
        title: 'Payment Received',
        message: `Your recent payment${recentPayments.length > 1 ? 's have' : ' has'} been processed successfully.`,
        time: 'Just now',
        read: false,
      });
    }
    
    // Check for rejected applications
    const rejectedApps = loanApplications.filter(app => app.status === 'rejected');
    if (rejectedApps.length > 0) {
      notifs.push({
        id: 'n-rejected',
        title: 'Application Status Update',
        message: `${rejectedApps.length} loan application${rejectedApps.length > 1 ? 's have' : ' has'} been reviewed.`,
        time: 'Just now',
        read: false,
      });
    }
    
    // If no notifications, show a welcome message
    if (notifs.length === 0) {
      notifs.push({
        id: 'n-welcome',
        title: 'Welcome to LendLogic',
        message: 'Your dashboard is ready. Apply for a loan or review pending applications.',
        time: 'Just now',
        read: false,
      });
    }
    
    return notifs;
  }, [loans, loanApplications, payments]);

  // Generate realistic activity log based on actual data
  const activities = useMemo(() => {
    const acts = [];
    const now = new Date();
    
    // Login activity
    acts.push({ 
      id: 'a-login', 
      title: 'Login', 
      description: `Signed in as ${user?.role || 'User'}`, 
      time: 'Just now' 
    });
    
    // Recent loan applications
    if (loanApplications.length > 0) {
      const sortedApps = [...loanApplications].sort((a, b) => 
        new Date(b.applicationDate || b.createdAt) - new Date(a.applicationDate || a.createdAt)
      );
      const latestApp = sortedApps[0];
      
      acts.push({
        id: 'a-application',
        title: 'Loan Application',
        description: `Submitted application for ₹${latestApp?.amount?.toLocaleString() || '0'}`,
        time: getTimeAgo(now, new Date(latestApp?.applicationDate || latestApp?.createdAt || now))
      });
    }
    
    // Recent payments
    if (payments.length > 0) {
      const sortedPayments = [...payments].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      const latestPayment = sortedPayments[0];
      
      acts.push({
        id: 'a-payment',
        title: 'Payment Processed',
        description: `Payment of ₹${latestPayment?.amount?.toLocaleString() || '0'} recorded`,
        time: getTimeAgo(now, new Date(latestPayment?.date || now))
      });
    }
    
    // Active loans
    if (loans.length > 0) {
      const activeCount = loans.filter(l => l.status === 'active').length;
      acts.push({
        id: 'a-loans',
        title: 'Active Loans',
        description: `${activeCount} loan${activeCount !== 1 ? 's' : ''} currently active`,
        time: '1h ago'
      });
    }
    
    // If no real activities, show default
    if (acts.length <= 1) {
      acts.push(
        { id: 'a-dashboard', title: 'Action', description: 'Viewed dashboard overview', time: '5m ago' },
        { id: 'a-profile', title: 'Update', description: 'Profile information up to date', time: '1h ago' }
      );
    }
    
    return acts.slice(0, 5); // Limit to 5 activities
  }, [loans, loanApplications, payments, user]);

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
      { label: 'Portfolio Analytics', to: '/portfolio', icon: BarChart3, roles: ['ANALYST'] },
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
          ? { label: 'View Portfolio', to: '/portfolio' }
          : user?.role === 'ADMIN'
            ? { label: 'Admin Overview', to: '/' }
            : null;

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const markAllRead = () => {
    // Mark all notifications as read
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
