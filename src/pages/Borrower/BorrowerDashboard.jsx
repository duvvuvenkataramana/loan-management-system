import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuickActions from './QuickActions';

const BorrowerDashboard = () => {
  const navigate = useNavigate();
  const { loans, payments } = useApp();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Check if user is loaded
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter loans for current user with safe fallbacks
  const userLoans = (loans || []).filter(loan => loan.borrowerId === user?.id);

  // Calculate dashboard stats with safe fallbacks
  const activeLoans = userLoans.filter(loan => loan.status === 'active');
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + (loan.remaining || 0), 0);
  const upcomingEMI = activeLoans.length > 0 ? (activeLoans[0].monthlyEMI || 0) : 0;
  const nextDueDate = activeLoans.length > 0 ? activeLoans[0].nextDue : null;

  // Get user payments
  const userLoanIds = new Set(userLoans.map(l => l.id));
  const userPayments = (payments || []).filter(p => userLoanIds.has(p.loanId));

  // Calculate dynamic chart data based on user's actual loans
  const calculatePaymentProgress = () => {
    if (activeLoans.length === 0) return [];
    
    // Get last 6 months of payment data
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    return months.map((month, index) => {
      const totalAmount = activeLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
      const paidSoFar = activeLoans.reduce((sum, loan) => {
        const paidInstallments = loan.paidInstallments || 0;
        return sum + (paidInstallments * (loan.monthlyEMI || 0));
      }, 0);
      const monthlyPayment = activeLoans.reduce((sum, loan) => sum + (loan.monthlyEMI || 0), 0);
      
      return {
        month,
        paid: Math.min(paidSoFar + (monthlyPayment * (index + 1 - 6)), totalAmount),
        remaining: Math.max(totalAmount - (paidSoFar + (monthlyPayment * (index + 1 - 6))), 0)
      };
    });
  };

  const calculatePaymentBreakdown = () => {
    if (activeLoans.length === 0) return [];
    
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    return months.map(month => {
      const totalEMI = activeLoans.reduce((sum, loan) => sum + (loan.monthlyEMI || 0), 0);
      const avgInterestRate = activeLoans.reduce((sum, loan) => sum + (loan.interestRate || 0), 0) / activeLoans.length;
      const interest = Math.round((totalEMI * avgInterestRate) / 100);
      const principal = Math.round(totalEMI - interest);
      
      return { month, principal, interest };
    });
  };

  const calculateLoanDistribution = () => {
    if (activeLoans.length === 0) return [];
    
    const loanTypeColors = {
      'Personal Loan': '#0d9488',
      'Home Loan': '#8b5cf6',
      'Auto Loan': '#06b6d4',
      'Education Loan': '#f59e0b',
      'Business Loan': '#ec4899'
    };
    
    const distribution = {};
    activeLoans.forEach(loan => {
      const type = loan.type || 'Personal Loan';
      if (!distribution[type]) {
        distribution[type] = { name: type, value: 0, color: loanTypeColors[type] || '#64748b' };
      }
      distribution[type].value += loan.remaining || loan.amount || 0;
    });
    
    return Object.values(distribution);
  };

  const calculateCreditScoreTrend = () => {
    // Mock credit score trend - in real app would come from credit bureau
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const baseScore = 720;
    const improvement = activeLoans.length > 0 ? 4 : 0; // Score improves with active loans
    
    return months.map((month, index) => ({
      month,
      score: baseScore + (index * improvement)
    }));
  };

  const calculatePaymentBehavior = () => {
    if (userPayments.length === 0) return [];
    
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    return months.map(month => {
      const monthPayments = userPayments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.toLocaleString('en-US', { month: 'short' }) === month;
      });
      
      const onTime = monthPayments.filter(p => p.status === 'completed').length;
      const late = monthPayments.filter(p => p.status === 'failed' || p.status === 'overdue').length;
      
      return { month, onTime, late };
    });
  };

  const calculateUpcomingSchedule = () => {
    if (activeLoans.length === 0) return [];
    
    return activeLoans.slice(0, 3).flatMap(loan => {
      const nextDue = new Date(loan.nextDue);
      const secondDue = new Date(nextDue);
      secondDue.setMonth(secondDue.getMonth() + 1);
      
      const daysUntilDue = Math.ceil((nextDue - new Date()) / (1000 * 60 * 60 * 24));
      
      return [
        {
          id: loan.id,
          date: nextDue.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          amount: `₹${(loan.monthlyEMI || 0).toLocaleString()}`,
          status: daysUntilDue <= 7 ? `Due in ${daysUntilDue} days` : 'Scheduled'
        },
        {
          id: loan.id,
          date: secondDue.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          amount: `₹${(loan.monthlyEMI || 0).toLocaleString()}`,
          status: 'Scheduled'
        }
      ];
    }).slice(0, 3);
  };

  // Generate dynamic data
  const paymentProgressData = calculatePaymentProgress();
  const paymentBreakdownData = calculatePaymentBreakdown();
  const loanDistributionData = calculateLoanDistribution();
  const creditScoreData = calculateCreditScoreTrend();
  const paymentBehaviorData = calculatePaymentBehavior();
  const upcomingSchedule = calculateUpcomingSchedule();

  // Check if user has any data
  const hasLoans = activeLoans.length > 0;
  const hasPayments = userPayments.length > 0;

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'pay':
        navigate('/payments');
        break;
      case 'statement':
        addToast('success', 'Statement Generated', 'Your statement is being prepared for download. Your browser\'s print/save dialog should appear shortly.');
        break;
      case 'profile':
        navigate('/update-profile');
        break;
      case 'support':
        navigate('/request-support');
        break;
      default:
        break;
    }
  };

  return (
  <div className="space-y-6">
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Active Loans</p>
        <p className="text-3xl font-black text-slate-900 mt-3">{activeLoans.length}</p>
        <p className="text-sm text-slate-600 mt-1">
          {activeLoans.length > 0 ? `${activeLoans.map(l => (l.type || l.loanType || 'Loan').split(' ')[0]).join(', ')}` : 'No active loans'}
        </p>
      </div>
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Upcoming EMI</p>
        <p className="text-3xl font-black text-slate-900 mt-3">₹{upcomingEMI.toLocaleString()}</p>
        <p className="text-sm text-slate-600 mt-1">
          {nextDueDate ? `Due on ${new Date(nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No upcoming payments'}
        </p>
      </div>
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Total Outstanding</p>
        <p className="text-3xl font-black text-slate-900 mt-3">₹{totalOutstanding.toLocaleString()}</p>
        <p className="text-sm text-slate-600 mt-1">Across all loans</p>
      </div>
    </section>

    {/* Main Charts Grid */}
    {hasLoans ? (
      <>
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Payment Progress - Area Chart */}
      {paymentProgressData.length > 0 && (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-teal-600" />
              Payment Progress
            </h3>
            <p className="text-xs text-slate-600 mt-1">Cumulative paid vs remaining balance</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={paymentProgressData}>
              <defs>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                formatter={(value) => `₹${value}`}
              />
              <Legend />
              <Area type="monotone" dataKey="paid" stroke="#10b981" fillOpacity={1} fill="url(#colorPaid)" />
              <Area type="monotone" dataKey="remaining" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRemaining)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Principal vs Interest Breakdown - Stacked Bar Chart */}
      {paymentBreakdownData.length > 0 && (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-teal-600" />
              Principal vs Interest
            </h3>
            <p className="text-xs text-slate-600 mt-1">Monthly payment breakdown</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                formatter={(value) => `₹${value}`}
              />
              <Legend />
              <Bar dataKey="principal" stackId="a" fill="#0d9488" radius={[0, 0, 8, 8]} />
              <Bar dataKey="interest" stackId="a" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Loan Distribution - Pie Chart */}
      {loanDistributionData.length > 0 && (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon size={20} className="text-teal-600" />
              Loan Portfolio
            </h3>
            <p className="text-xs text-slate-600 mt-1">Distribution by loan type</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={loanDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {loanDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {loanDistributionData.map((loan) => (
            <div key={loan.name} className="text-center p-2 rounded-lg bg-white border border-slate-100">
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: loan.color }} />
              <p className="text-xs font-semibold text-slate-900">₹{(loan.value / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-slate-600">{loan.name.split(' ')[0]}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Credit Score Trend - Line Chart */}
      {creditScoreData.length > 0 && (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600" />
              Credit Score Trend
            </h3>
            <p className="text-xs text-slate-600 mt-1">Your credit health over time</p>
          </div>
          <div className="bg-emerald-100 px-3 py-1 rounded-lg">
            <p className="text-xs font-semibold text-emerald-700">+{activeLoans.length * 4 * 6} pts</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={creditScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[700, 760]} stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </section>

    {/* Payment Behavior Chart */}
    {hasPayments && paymentBehaviorData.length > 0 && (
    <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Payment Behavior</h3>
          <p className="text-xs text-slate-600 mt-1">On-time vs late payments over the last 6 months</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600">On-time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-xs text-slate-600">Late</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={paymentBehaviorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
            />
            <Legend />
            <Bar dataKey="onTime" fill="#10b981" radius={[8, 8, 0, 0]} name="On-time" />
            <Bar dataKey="late" fill="#f43f5e" radius={[8, 8, 0, 0]} name="Late" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
    )}
    </>
    ) : (
      /* Empty State for New Users */
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-12 shadow-sm text-center">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Loans</h3>
        <p className="text-sm text-slate-600 mb-6">You don't have any active loans yet. Apply for a loan to get started!</p>
        <button
          onClick={() => navigate('/apply')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold hover:from-teal-500 hover:to-teal-600 transition-all shadow-lg shadow-teal-500/20"
        >
          Apply for a Loan
        </button>
      </section>
    )}

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Upcoming Payment Schedule</h3>
        <div className="mt-4 space-y-3">
          {upcomingSchedule.length > 0 ? (
            upcomingSchedule.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
                <div>
                  <p className="text-sm font-semibold">{item.date}</p>
                  <p className="text-xs text-slate-500">Loan {item.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{item.amount}</p>
                  <p className="text-xs text-slate-500">{item.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No upcoming payments</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={() => handleQuickAction('pay')}
            className="border border-teal-200 rounded-xl p-4 hover:border-teal-400 hover:bg-teal-50 transition cursor-pointer text-left"
          >
            <p className="text-sm font-semibold text-slate-900">Pay installment</p>
            <p className="text-xs text-slate-500 mt-1">Secure payment flow</p>
          </button>
          <button 
            onClick={() => handleQuickAction('statement')}
            className="border border-teal-200 rounded-xl p-4 hover:border-teal-400 hover:bg-teal-50 transition cursor-pointer text-left"
          >
            <p className="text-sm font-semibold text-slate-900">Download statement</p>
            <p className="text-xs text-slate-500 mt-1">PDF schedule & receipts</p>
          </button>
          <button 
            onClick={() => handleQuickAction('profile')}
            className="border border-teal-200 rounded-xl p-4 hover:border-teal-400 hover:bg-teal-50 transition cursor-pointer text-left"
          >
            <p className="text-sm font-semibold text-slate-900">Update profile</p>
            <p className="text-xs text-slate-500 mt-1">Keep your info current</p>
          </button>
          <button 
            onClick={() => handleQuickAction('support')}
            className="border border-teal-200 rounded-xl p-4 hover:border-teal-400 hover:bg-teal-50 transition cursor-pointer text-left"
          >
            <p className="text-sm font-semibold text-slate-900">Request support</p>
            <p className="text-xs text-slate-500 mt-1">Talk to your officer</p>
          </button>
        </div>
      </div>
    </section>

    {/* Quick Actions Management */}
    <QuickActions />
  </div>
);
};

export default BorrowerDashboard;
