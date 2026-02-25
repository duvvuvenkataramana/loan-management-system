import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ApplyLoan from './pages/Borrower/ApplyLoan';
import BorrowerDashboard from './pages/Borrower/BorrowerDashboard';
import LoanHistory from './pages/Borrower/LoanHistory';
import RepaymentCenter from './pages/Borrower/RepaymentCenter';
import BorrowerPayments from './pages/Borrower/Payments';
import UpdateProfile from './pages/Borrower/UpdateProfile';
import RequestSupport from './pages/Borrower/RequestSupport';
import AdminOverview from './pages/Admin/AdminOverview';
import WorkQueue from './pages/Lender/WorkQueue';
import LoanReviewDetail from './pages/Lender/LoanReviewDetail';
import DecisionAnalytics from './pages/Lender/DecisionAnalytics';
import LenderPayments from './pages/Lender/Payments';
import SystemConfig from './pages/Admin/SystemConfig';
import PermissionMatrix from './pages/Admin/PermissionMatrix';
import AuditTrail from './pages/Admin/AuditTrail';
import AnalyticsDashboard from './pages/Analyst/AnalyticsDashboard';
import PortfolioView from './pages/Analyst/PortfolioView';
import ReportBuilder from './pages/Analyst/ReportBuilder';
import Signup from './pages/Signup';

const UniversalDashboard = () => (
  <div className="p-6 bg-white rounded-xl shadow">
    <h2 className="text-xl font-bold">Dashboard</h2>
    <p className="text-gray-600 mt-2">Select a section from the sidebar to get started.</p>
  </div>
);

const RoleDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'BORROWER') {
    return <BorrowerDashboard />;
  }

  if (user?.role === 'LENDER') {
    return <WorkQueue />;
  }

  if (user?.role === 'ANALYST') {
    return <AnalyticsDashboard />;
  }

  if (user?.role === 'ADMIN') {
    return <AdminOverview />;
  }

  return <UniversalDashboard />;
};

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-600 mb-6">You do not have permission to view this page.</p>
        <button
          onClick={() => navigate(-1)}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:from-teal-500 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-teal-500/20"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('analyst');
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Role information
  const roleInfo = {
    admin: { 
      label: 'Admin', 
      color: 'from-purple-600 to-purple-700',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.573 1.066c1.066.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      description: 'Full system access',
      defaultCreds: { username: 'admin', password: '1234' }
    },
    lender: { 
      label: 'Lender', 
      color: 'from-blue-600 to-blue-700',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Review & approve loans',
      defaultCreds: { username: 'lender', password: '1234' }
    },
    borrower: { 
      label: 'Borrower', 
      color: 'from-teal-600 to-teal-700',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      description: 'Apply for loans',
      defaultCreds: { username: 'borrower', password: '1234' }
    },
    analyst: { 
      label: 'Analyst', 
      color: 'from-amber-500 to-orange-600',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      description: 'Portfolio analytics',
      defaultCreds: { username: 'analyst', password: '1234' }
    }
  };

  // Handle role change - auto-fill credentials
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setUsername(roleInfo[role].defaultCreds.username);
    setPassword(roleInfo[role].defaultCreds.password);
    setError('');
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = login(username, password);
    
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-50 p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Loan Management</h1>
          <p className="text-slate-600 text-sm">Sign in to access your account</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Select Role to Login</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(roleInfo).map((role) => {
              const info = roleInfo[role];
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  disabled={loading}
                  className={`p-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${
                    isSelected 
                      ? `bg-gradient-to-r ${info.color} text-white shadow-lg` 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={info.icon} />
                  </svg>
                  <span className="text-[10px] font-bold">{info.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 text-center mt-3">
            {roleInfo[selectedRole].description}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Current Role Display */}
            <div className={`bg-gradient-to-r ${roleInfo[selectedRole].color} rounded-xl p-4 text-white`}>
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={roleInfo[selectedRole].icon} />
                </svg>
                <div>
                  <p className="font-bold">{roleInfo[selectedRole].label} Account</p>
                  <p className="text-xs opacity-90">{roleInfo[selectedRole].description}</p>
                </div>
              </div>
            </div>

            {/* Username Field - Editable */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-400"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Password Field - Editable */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-400 pr-12"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 rounded-xl text-white font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r ${roleInfo[selectedRole].color}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In as {roleInfo[selectedRole].label}</span>
                </>
              )}
            </button>
          </form>


          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{' '}
            <a href="/signup" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              Create one now
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 Loan Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Shared Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'BORROWER', 'LENDER', 'ANALYST']} />}>
            <Route path="/" element={<DashboardLayout><RoleDashboard /></DashboardLayout>} />
          </Route>

          {/* Borrower Specific */}
          <Route element={<ProtectedRoute allowedRoles={['BORROWER']} />}>
            <Route path="/apply" element={<DashboardLayout><ApplyLoan /></DashboardLayout>} />
            <Route path="/history" element={<DashboardLayout><LoanHistory /></DashboardLayout>} />
            <Route path="/repayment" element={<DashboardLayout><RepaymentCenter /></DashboardLayout>} />
            <Route path="/borrower/payments" element={<DashboardLayout><BorrowerPayments /></DashboardLayout>} />
            <Route path="/payments" element={<DashboardLayout><BorrowerPayments /></DashboardLayout>} />
            <Route path="/update-profile" element={<DashboardLayout><UpdateProfile /></DashboardLayout>} />
            <Route path="/request-support" element={<DashboardLayout><RequestSupport /></DashboardLayout>} />
          </Route>

          {/* Lender Specific */}
          <Route element={<ProtectedRoute allowedRoles={['LENDER']} />}>
            <Route path="/review" element={<DashboardLayout><WorkQueue /></DashboardLayout>} />
            <Route path="/review/:loanId" element={<DashboardLayout><LoanReviewDetail /></DashboardLayout>} />
            <Route path="/lender-analytics" element={<DashboardLayout><DecisionAnalytics /></DashboardLayout>} />
            <Route path="/lender/payments" element={<DashboardLayout><LenderPayments /></DashboardLayout>} />
          </Route>

          {/* Analyst Specific */}
          <Route element={<ProtectedRoute allowedRoles={['ANALYST']} />}>
            <Route path="/portfolio" element={<DashboardLayout><PortfolioView /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><ReportBuilder /></DashboardLayout>} />
          </Route>

          {/* Admin Specific */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/config" element={<DashboardLayout><SystemConfig /></DashboardLayout>} />
            <Route path="/admin/permissions" element={<DashboardLayout><PermissionMatrix /></DashboardLayout>} />
            <Route path="/admin/audit" element={<DashboardLayout><AuditTrail /></DashboardLayout>} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
