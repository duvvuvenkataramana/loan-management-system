import { useState } from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { downloadCSV } from '../../utils/exportData';

const LenderPayments = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('this_month');

  const { loans, payments } = useApp();
  const { addToast } = useToast();
  const { user } = useAuth();

  const lenderLoans = loans.filter(loan => loan.lenderId === user?.id && loan.status !== 'closed');
  const lenderLoanIds = new Set(lenderLoans.map(loan => loan.id));
  const lenderPayments = payments.filter(payment => lenderLoanIds.has(payment.loanId));

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const filterByDateRange = (dateStr) => {
    const date = new Date(dateStr);
    if (dateRange === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (dateRange === 'this_week') {
      return date >= startOfWeek;
    }
    if (dateRange === 'this_month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }
    return true;
  };

  const incomingPayments = lenderLoans
    .map((loan) => {
      const dueDate = new Date(loan.nextDue);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return {
        id: `UP-${loan.id}`,
        borrower: `Borrower ${loan.borrowerId}`,
        loan: loan.id,
        amount: loan.monthlyEMI,
        dueDate: loan.nextDue,
        status: daysUntilDue <= 0 ? 'overdue' : 'pending',
        daysUntilDue
      };
    })
    .filter(payment => payment.daysUntilDue <= 7 && payment.daysUntilDue >= -2);

  const filteredPayments = lenderPayments
    .filter(payment => (filterStatus === 'all' ? true : payment.status === filterStatus))
    .filter(payment => filterByDateRange(payment.date))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalReceived = lenderPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const failedPayments = lenderPayments.filter(payment => payment.status === 'failed').length;
  const successRate = lenderPayments.length > 0
    ? Math.round((lenderPayments.filter(payment => payment.status === 'completed').length / lenderPayments.length) * 100)
    : 0;

  const paymentStats = [
    { label: 'Total Received', value: `$${totalReceived.toLocaleString()}`, change: '+6.1%', trend: 'up' },
    { label: 'Pending Payments', value: `$${incomingPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}`, count: `${incomingPayments.length} payments`, trend: 'neutral' },
    { label: 'Failed Payments', value: `$${lenderPayments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, count: `${failedPayments} payments`, trend: 'down' },
    { label: 'Success Rate', value: `${successRate}%`, change: '+2.1%', trend: 'up' },
  ];

  const methodBreakdown = lenderPayments.reduce((acc, payment) => {
    const method = (payment.method || '').toLowerCase();
    let key = 'Manual Payment';
    if (method.includes('bank')) {
      key = 'Bank Transfer';
    } else if (method.includes('card')) {
      key = 'Card Payment';
    } else if (method.includes('auto')) {
      key = 'Auto-pay';
    }
    if (!acc[key]) {
      acc[key] = { count: 0, amount: 0 };
    }
    acc[key].count += 1;
    acc[key].amount += payment.amount || 0;
    return acc;
  }, {});

  const methodBreakdownList = Object.entries(methodBreakdown).map(([method, stats]) => ({
    method,
    count: stats.count,
    amount: stats.amount
  }));

  const monthlyPayments = lenderPayments.filter(payment => {
    const date = new Date(payment.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthlyReceived = monthlyPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const monthlyFailed = monthlyPayments.filter(payment => payment.status === 'failed').length;
  const monthlyCompletedCount = monthlyPayments.filter(payment => payment.status === 'completed').length;
  const monthlyAverage = monthlyCompletedCount > 0 ? Math.round(monthlyReceived / monthlyCompletedCount) : 0;

  const handleExportPayments = () => {
    const exportData = filteredPayments.map(payment => {
      const loan = loans.find(l => l.id === payment.loanId);
      return {
        'Payment ID': payment.id,
        'Loan ID': payment.loanId,
        'Borrower ID': loan?.borrowerId || 'N/A',
        'Amount': payment.amount,
        'Date': payment.date,
        'Status': payment.status,
        'Method': payment.method || 'Manual Payment',
        'Transaction ID': payment.transactionId || 'N/A'
      };
    });

    const success = downloadCSV(
      exportData,
      `payment-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    );

    if (success) {
      addToast('success', 'Report Exported', `${exportData.length} payment records exported to CSV`);
    } else {
      addToast('error', 'Export Failed', 'Failed to export payment data');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Tracking</h2>
          <p className="text-sm text-slate-600">Monitor incoming payments and reconciliation.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-teal-200 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
          </select>
          <button
            onClick={handleExportPayments}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </header>

      {/* Payment Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {paymentStats.map((stat) => (
          <div key={stat.label} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-3">{stat.value}</p>
                {stat.change && (
                  <p className={`text-xs font-semibold mt-1 ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {stat.change}
                  </p>
                )}
                {stat.count && (
                  <p className="text-xs text-slate-600 mt-1">{stat.count}</p>
                )}
              </div>
              {stat.trend === 'up' && (
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
              )}
              {stat.trend === 'down' && (
                <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <AlertCircle size={20} className="text-rose-600" />
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Expected Incoming Payments */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Expected Payments</h3>
            <p className="text-xs text-slate-600 mt-1">Payments due in the next 7 days</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700">
            {incomingPayments.length} pending
          </span>
        </div>
        <div className="space-y-3">
          {incomingPayments.length > 0 ? incomingPayments.map((payment) => (
            <div key={payment.id} className="bg-white border border-teal-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-slate-900">{payment.borrower}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {payment.loan}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Due: {new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {payment.daysUntilDue} days left
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">${payment.amount.toLocaleString()}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block ${
                    payment.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {payment.status === 'pending' ? 'Pending' : 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-sm text-slate-500 py-6">No upcoming payments in the next 7 days.</div>
          )}
        </div>
      </section>

      {/* Payment History with Filters */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-teal-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
              <p className="text-xs text-slate-600 mt-1">All payment transactions and their status</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-teal-200 text-slate-700 hover:bg-teal-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-teal-200 text-slate-700 hover:bg-teal-50'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus('failed')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'failed'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-teal-200 text-slate-700 hover:bg-teal-50'
                }`}
              >
                Failed
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-slate-600 uppercase bg-gradient-to-r from-white to-teal-50 border-b border-teal-100">
              <tr>
                <th className="py-3 px-6 font-bold text-slate-900">Payment ID</th>
                <th className="py-3 px-6 font-bold text-slate-900">Borrower</th>
                <th className="py-3 px-6 font-bold text-slate-900">Loan</th>
                <th className="py-3 px-6 font-bold text-slate-900">Amount</th>
                <th className="py-3 px-6 font-bold text-slate-900">Date</th>
                <th className="py-3 px-6 font-bold text-slate-900">Method</th>
                <th className="py-3 px-6 font-bold text-slate-900">Status</th>
                <th className="py-3 px-6 font-bold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-teal-50/30 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{payment.id}</td>
                    <td className="py-4 px-6 text-slate-700">Borrower {payment.borrowerId}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{payment.loanId}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">${payment.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-700">
                      {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {payment.method}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        payment.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : payment.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                      }`}>
                        {payment.status === 'completed' && <CheckCircle size={12} />}
                        {payment.status === 'pending' && <Clock size={12} />}
                        {payment.status === 'failed' && <XCircle size={12} />}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => addToast('info', 'Payment Details', `Viewing details for payment ${payment.id}`)}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 transition"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 px-6 text-center text-sm text-slate-500">
                    No payments found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Analytics Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-900">Payment Methods Breakdown</h3>
          <div className="mt-4 space-y-3">
            {methodBreakdownList.length > 0 ? methodBreakdownList.map((item) => (
              <div key={item.method} className="flex items-center justify-between p-3 rounded-xl border border-teal-100 hover:bg-teal-50/30 transition">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.method}</p>
                  <p className="text-xs text-slate-600">{item.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${item.amount.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No payment data available.</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-900">This Month Summary</h3>
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-600 font-bold">Total Received</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">${monthlyReceived.toLocaleString()}</p>
                </div>
                <TrendingUp size={32} className="text-emerald-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-teal-100">
                <p className="text-xs text-slate-600">Completed payments</p>
                <p className="text-xl font-black text-slate-900 mt-1">{monthlyCompletedCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-teal-100">
                <p className="text-xs text-slate-600">Avg. payment</p>
                <p className="text-xl font-black text-slate-900 mt-1">${monthlyAverage.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-xs text-rose-600">Failed payments this month</p>
              <p className="text-xl font-black text-rose-700 mt-1">{monthlyFailed}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LenderPayments;
