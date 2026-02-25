import { useState } from 'react';
import { Calendar, CreditCard, Download, Settings, TrendingDown, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateLoanStatement } from '../../utils/statementGenerator';

const RepaymentCenter = () => {
  const [showAutoPayModal, setShowAutoPayModal] = useState(false);
  const [showEarlyPayoffModal, setShowEarlyPayoffModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [activeLoanId, setActiveLoanId] = useState(null);
  const [payoffAmount, setPayoffAmount] = useState('');
  const [reminders, setReminders] = useState({
    daysBeforeDue: 3,
    enableEmail: true,
    enableSMS: true
  });
  const [paymentMethod, setPaymentMethod] = useState({
    method: 'credit-card',
    last4: '',
    expiry: ''
  });

  const { loans, payments, updateLoan, addPayment } = useApp();
  const { addToast } = useToast();
  const { user } = useAuth();

  const loanSchedules = loans.filter(loan => loan.borrowerId === user?.id && loan.status !== 'closed');
  const totalOutstanding = loanSchedules.reduce((sum, loan) => sum + loan.remaining, 0);
  const autoPayCount = loanSchedules.filter(loan => loan.autoPay).length;
  const nextPayment = loanSchedules
    .filter(loan => loan.nextDue)
    .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue))[0];
  const activeLoan = loanSchedules.find(loan => loan.id === activeLoanId);
  const interestSavings = activeLoan ? Math.round(activeLoan.remaining * 0.04) : 0;

  const handleAutoPayToggle = () => {
    if (!activeLoan) {
      return;
    }
    updateLoan(activeLoan.id, { autoPay: !activeLoan.autoPay });
    setShowAutoPayModal(false);
  };

  const handleEarlyPayoff = () => {
    if (!activeLoan) {
      return;
    }
    const amount = parseFloat(payoffAmount || activeLoan.remaining);
    if (Number.isNaN(amount) || amount <= 0) {
      return;
    }
    addPayment({
      loanId: activeLoan.id,
      amount,
      method: 'Early Payoff',
      status: 'completed',
      type: 'Payoff',
      borrowerId: user?.id
    });
    updateLoan(activeLoan.id, {
      remaining: 0,
      status: 'closed',
      paidInstallments: activeLoan.totalInstallments
    });
    setShowEarlyPayoffModal(false);
  };

  const handleConfigureReminders = () => {
    setShowReminderModal(true);
  };

  const handleSaveReminders = () => {
    localStorage.setItem('paymentReminders', JSON.stringify(reminders));
    addToast('success', 'Reminders Configured', `You'll receive alerts ${reminders.daysBeforeDue} days before EMI due date.`);
    setShowReminderModal(false);
  };

  const handleManagePaymentMethod = () => {
    setShowPaymentMethodModal(true);
  };

  const handleSavePaymentMethod = () => {
    if (!paymentMethod.last4 || !paymentMethod.expiry) {
      addToast('error', 'Validation Error', 'Please enter last 4 digits and expiry date.');
      return;
    }
    localStorage.setItem('defaultPaymentMethod', JSON.stringify(paymentMethod));
    addToast('success', 'Payment Method Updated', 'Your default payment method has been saved.');
    setShowPaymentMethodModal(false);
  };

  const handleDownloadTaxDocuments = () => {
    generateLoanStatement(user, loans, payments, `Tax_Documents_${user?.id}_${new Date().getFullYear()}.pdf`);
    addToast('success', 'Documents Downloaded', 'Your tax statement has been downloaded.');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Loan Repayment Center</h2>
          <p className="text-sm text-slate-600">Manage EMI schedules, auto-pay, and early payoff options.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleDownloadTaxDocuments()}
            className="px-4 py-2 rounded-xl border border-teal-200 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition inline-flex items-center gap-2"
          >
            <Download size={16} />
            Download statements
          </button>
        </div>
      </header>

      {/* Active Loans Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Total Outstanding</p>
          <p className="text-3xl font-black text-slate-900 mt-3">${totalOutstanding.toLocaleString()}</p>
          <p className="text-sm text-slate-600 mt-1">Across {loanSchedules.length} active loans</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Next Payment Due</p>
          <p className="text-3xl font-black text-slate-900 mt-3">
            {nextPayment ? new Date(nextPayment.nextDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {nextPayment ? `EMI $${nextPayment.monthlyEMI}` : 'No upcoming payments'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Auto-pay Status</p>
          <p className="text-3xl font-black text-slate-900 mt-3">{autoPayCount} of {loanSchedules.length}</p>
          <p className="text-sm text-slate-600 mt-1">Enabled on active loans</p>
        </div>
      </section>

      {/* Individual Loan Schedules */}
      {loanSchedules.map((loan) => {
        const progressPercent = (loan.paidInstallments / loan.totalInstallments) * 100;
        const paidAmount = loan.amount - loan.remaining;
        
        return (
          <section key={loan.id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Loan Header */}
            <div className="p-6 border-b border-teal-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">{loan.type}</h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
                      {loan.id}
                    </span>
                    {loan.autoPay ? (
                      <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                        <CreditCard size={12} />
                        Auto-pay ON
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                        <AlertCircle size={12} />
                        Auto-pay OFF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    {loan.startDate} to {loan.endDate} • Monthly EMI: ${loan.monthlyEMI}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setActiveLoanId(loan.id);
                      setShowAutoPayModal(true);
                    }}
                    className="px-3 py-2 rounded-lg border border-teal-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition inline-flex items-center gap-1"
                  >
                    <Settings size={14} />
                    {loan.autoPay ? 'Manage' : 'Enable'} Auto-pay
                  </button>
                  <button 
                    onClick={() => {
                      setActiveLoanId(loan.id);
                      setPayoffAmount(loan.remaining.toString());
                      setShowEarlyPayoffModal(true);
                    }}
                    className="px-3 py-2 rounded-lg border border-teal-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition inline-flex items-center gap-1"
                  >
                    <TrendingDown size={14} />
                    Early payoff
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-6 border-b border-teal-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Repayment Progress</span>
                <span className="text-xs font-semibold text-teal-600">{loan.paidInstallments} of {loan.totalInstallments} paid</span>
              </div>
              <div className="h-3 bg-teal-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-600 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-xs text-slate-600">Paid</p>
                  <p className="text-sm font-bold text-emerald-700">${paidAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Remaining</p>
                  <p className="text-sm font-bold text-slate-900">${loan.remaining.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Schedule Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs text-slate-600 uppercase bg-gradient-to-r from-white to-teal-50 border-b border-teal-100">
                  <tr>
                    <th className="py-3 px-6 font-bold text-slate-900">Installment</th>
                    <th className="py-3 px-6 font-bold text-slate-900">Due Date</th>
                    <th className="py-3 px-6 font-bold text-slate-900">Principal</th>
                    <th className="py-3 px-6 font-bold text-slate-900">Interest</th>
                    <th className="py-3 px-6 font-bold text-slate-900">Total EMI</th>
                    <th className="py-3 px-6 font-bold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  {Array.from({ length: 6 }, (_, i) => {
                    const isPaid = i < loan.paidInstallments;
                    const isDue = i === loan.paidInstallments;
                    const principal = 350 + i * 5;
                    const interest = loan.monthlyEMI - principal;
                    
                    // Calculate due date based on loan start date
                    const startDate = new Date(loan.startDate);
                    const dueDate = new Date(startDate);
                    dueDate.setMonth(startDate.getMonth() + i);
                    const dateStr = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <tr key={i} className={`hover:bg-teal-50/30 transition ${isPaid ? 'opacity-60' : ''}`}>
                        <td className="py-3 px-6 font-semibold text-slate-900">#{i + 1}</td>
                        <td className="py-3 px-6 text-slate-700">
                          {dateStr}
                          {isDue && <span className="ml-2 text-xs font-semibold text-amber-600">(Due soon)</span>}
                        </td>
                        <td className="py-3 px-6 text-slate-700">${principal}</td>
                        <td className="py-3 px-6 text-slate-700">${interest}</td>
                        <td className="py-3 px-6 font-bold text-slate-900">${loan.monthlyEMI}</td>
                        <td className="py-3 px-6">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            isPaid 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : isDue
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isPaid ? 'Paid' : isDue ? 'Due' : 'Scheduled'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border border-teal-200 p-6 hover:shadow-md transition-all duration-300">
          <Calendar size={32} className="text-teal-600 mb-3" />
          <h4 className="text-sm font-bold text-teal-900">Set Payment Reminders</h4>
          <p className="text-xs text-teal-700 mt-2">Get alerts 3 days before EMI due date via email and SMS.</p>
          <button
            onClick={handleConfigureReminders}
            className="mt-4 text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            Configure →
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 hover:shadow-md transition-all duration-300">
          <CreditCard size={32} className="text-blue-600 mb-3" />
          <h4 className="text-sm font-bold text-blue-900">Update Payment Method</h4>
          <p className="text-xs text-blue-700 mt-2">Add or change your default payment method for auto-pay.</p>
          <button
            onClick={handleManagePaymentMethod}
            className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Manage →
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6 hover:shadow-md transition-all duration-300">
          <Download size={32} className="text-emerald-600 mb-3" />
          <h4 className="text-sm font-bold text-emerald-900">Tax Documents</h4>
          <p className="text-xs text-emerald-700 mt-2">Download annual statements for tax filing purposes.</p>
          <button
            onClick={handleDownloadTaxDocuments}
            className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            Download →
          </button>
        </div>
      </section>

      {/* Payment Reminders Modal */}
      <Modal
        open={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="Payment Reminders"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Days Before Due Date</label>
            <select
              value={reminders.daysBeforeDue}
              onChange={(e) => setReminders({ ...reminders, daysBeforeDue: parseInt(e.target.value, 10) })}
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value={1}>1 day before</option>
              <option value={3}>3 days before</option>
              <option value={5}>5 days before</option>
              <option value={7}>7 days before</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reminders.enableEmail}
                onChange={(e) => setReminders({ ...reminders, enableEmail: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-teal-600"
              />
              <span className="text-sm text-slate-700">Email Reminders</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reminders.enableSMS}
                onChange={(e) => setReminders({ ...reminders, enableSMS: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-teal-600"
              />
              <span className="text-sm text-slate-700">SMS Reminders</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowReminderModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReminders}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-bold hover:from-teal-500 hover:to-teal-600 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        open={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        title="Update Payment Method"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Method</label>
            <select
              value={paymentMethod.method}
              onChange={(e) => setPaymentMethod({ ...paymentMethod, method: e.target.value })}
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="credit-card">Credit Card</option>
              <option value="debit-card">Debit Card</option>
              <option value="bank-account">Bank Account</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Last 4 Digits</label>
              <input
                value={paymentMethod.last4}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, last4: e.target.value })}
                maxLength={4}
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">Expiry</label>
              <input
                value={paymentMethod.expiry}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, expiry: e.target.value })}
                placeholder="MM/YY"
                className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPaymentMethodModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePaymentMethod}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-500 hover:to-blue-600 transition"
            >
              Save Method
            </button>
          </div>
        </div>
      </Modal>

      {/* Auto-pay Modal */}
      <Modal
        open={showAutoPayModal}
        onClose={() => setShowAutoPayModal(false)}
        title="Manage Auto-pay"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">How Auto-pay Works</p>
            <p className="text-xs text-blue-700 mt-2">Payments are automatically deducted 1 day before the due date from your default payment method.</p>
          </div>
          
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Select Payment Method</label>
            <select className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white">
              <option>Credit Card ending in 4491</option>
              <option>Debit Card ending in 8822</option>
              <option>Bank Account ending in 3344</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">
              {activeLoan ? `Applies to ${activeLoan.id} • ${activeLoan.type}` : 'Select a loan to manage auto-pay.'}
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
            <input type="checkbox" id="confirm" className="mt-1" />
            <label htmlFor="confirm" className="text-xs text-slate-700">
              I authorize automatic EMI deductions from my selected payment method. I can disable auto-pay anytime.
            </label>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowAutoPayModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAutoPayToggle}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-bold hover:from-teal-500 hover:to-teal-600 transition"
            >
              {activeLoan?.autoPay ? 'Disable Auto-pay' : 'Enable Auto-pay'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Early Payoff Modal */}
      <Modal
        open={showEarlyPayoffModal}
        onClose={() => setShowEarlyPayoffModal(false)}
        title="Early Loan Payoff"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-sm font-semibold text-emerald-900">Save on Interest</p>
            <p className="text-xs text-emerald-700 mt-2">Pay off your loan early and save on future interest charges. No prepayment penalties!</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-teal-100">
              <p className="text-xs text-slate-600">Current Balance</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ${activeLoan ? activeLoan.remaining.toLocaleString() : '0'}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-teal-100">
              <p className="text-xs text-slate-600">Interest Savings</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">${interestSavings.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Payoff Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">$</span>
              <input
                type="number"
                value={payoffAmount}
                onChange={(e) => setPayoffAmount(e.target.value)}
                className="w-full border border-teal-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">Full payoff amount including principal and accrued interest</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowEarlyPayoffModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleEarlyPayoff}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-bold hover:from-emerald-500 hover:to-emerald-600 transition"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RepaymentCenter;
