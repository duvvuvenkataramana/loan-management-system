import { useState } from 'react';
import { CreditCard, Building2, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import Modal from '../../components/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
  const { loans, payments, paymentMethods, addPayment, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } = useApp();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [newMethod, setNewMethod] = useState({
    type: 'credit-card',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    bankName: '',
    accountHolder: ''
  });

  // Filter data for current user
  const userLoans = loans.filter(loan => loan.borrowerId === user?.id && loan.status === 'active');
  const userPayments = payments.filter(payment => payment.borrowerId === user?.id);
  const userPaymentMethods = paymentMethods.filter(method => method.borrowerId === user?.id);

  // Find upcoming payments
  const upcomingPayments = userLoans.map(loan => ({
    loan: loan.id,
    type: loan.type,
    amount: loan.monthlyEMI,
    dueDate: loan.nextDue,
    daysLeft: Math.ceil((new Date(loan.nextDue) - new Date()) / (1000 * 60 * 60 * 24)),
    autoPay: loan.autoPay
  }));

  const handleMakePayment = () => {
    if (!selectedLoan || !paymentAmount || !selectedPaymentMethod) {
      addToast('error', 'Validation Error', 'Please fill in all payment details');
      return;
    }

    const method = userPaymentMethods.find(m => m.id === selectedPaymentMethod);

    addPayment({
      loanId: selectedLoan,
      amount: parseFloat(paymentAmount),
      method: method.type === 'bank-account' ? `Bank ${method.accountNumber}` : `Card ${method.cardNumber}`,
      status: 'completed',
      type: 'EMI',
      borrowerId: user?.id
    });

    setShowPaymentModal(false);
    setSelectedLoan('');
    setPaymentAmount('');
    setSelectedPaymentMethod('');
  };

  const handleAddMethod = () => {
    if (newMethod.type === 'bank-account') {
      if (!newMethod.accountNumber || !newMethod.bankName || !newMethod.accountHolder) {
        addToast('error', 'Validation Error', 'Please fill in all bank account details');
        return;
      }
    } else {
      if (!newMethod.cardNumber || !newMethod.cardHolder || !newMethod.expiryDate) {
        addToast('error', 'Validation Error', 'Please fill in all card details');
        return;
      }
    }

    addPaymentMethod({
      ...newMethod,
      borrowerId: user?.id
    });

    setShowAddMethodModal(false);
    setNewMethod({
      type: 'credit-card',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      accountNumber: '',
      bankName: '',
      accountHolder: ''
    });
  };

  const handleDeleteMethod = (methodId) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      deletePaymentMethod(methodId);
    }
  };

  const handleSetDefault = (methodId) => {
    setDefaultPaymentMethod(methodId);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payments</h2>
          <p className="text-sm text-slate-600">Manage payment methods and make payments.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => addToast('success', 'Receipt Downloaded', 'Your latest receipt has been downloaded')}
            className="px-4 py-2 rounded-xl border border-teal-200 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
          >
            Download receipt
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20"
          >
            Make Payment
          </button>
        </div>
      </header>

      {/* Upcoming Payments */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Upcoming Payments</h3>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700">
            {upcomingPayments.length} due soon
          </span>
        </div>
        <div className="space-y-3">
          {upcomingPayments.length > 0 ? upcomingPayments.map((payment) => (
            <div key={payment.loan} className="bg-white border border-teal-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{payment.type} • {payment.loan}</p>
                    {payment.autoPay && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Auto-pay</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Due: {new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                    ({payment.daysLeft} days left)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">${payment.amount}</p>
                  <button 
                    onClick={() => {
                      setSelectedLoan(payment.loan);
                      setPaymentAmount(payment.amount.toString());
                      setShowPaymentModal(true);
                    }}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-1 transition"
                  >
                    Pay now →
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500 text-center py-4">No upcoming payments</p>
          )}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Payment Methods</h3>
          <button 
            onClick={() => setShowAddMethodModal(true)}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition flex items-center gap-1"
          >
            <Plus size={16} />
            Add new method
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPaymentMethods.map((method) => {
            const Icon = method.type === 'bank-account' ? Building2 : CreditCard;
            return (
              <div key={method.id} className="bg-white border border-teal-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition relative">
                {method.isDefault && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700">Default</span>
                  </div>
                )}
                <Icon size={24} className="text-slate-400 mb-3" />
                <p className="text-sm font-bold text-slate-900 capitalize">{method.type.replace('-', ' ')}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {method.bankName || method.cardHolder}
                </p>
                <p className="text-xs text-slate-600">
                  {method.accountNumber || method.cardNumber}
                </p>
                {method.expiryDate && (
                  <p className="text-xs text-slate-500 mt-1">Expires {method.expiryDate}</p>
                )}
                <div className="mt-3 flex gap-2">
                  {!method.isDefault && (
                    <>
                      <button 
                        onClick={() => handleSetDefault(method.id)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
                      >
                        Set default
                      </button>
                      <span className="text-slate-300">•</span>
                    </>
                  )}
                  <button 
                    onClick={() => handleDeleteMethod(method.id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment History */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
              <p className="text-xs text-slate-600 mt-1">Last 6 months of transactions</p>
            </div>
            <button
              onClick={() => addToast('success', 'Receipts Downloaded', 'All receipts have been downloaded')}
              className="px-3 py-2 rounded-lg border border-teal-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
            >
              Download all
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-slate-600 uppercase bg-gradient-to-r from-white to-teal-50 border-b border-teal-100">
              <tr>
                <th className="py-3 px-6 font-bold text-slate-900">Payment ID</th>
                <th className="py-3 px-6 font-bold text-slate-900">Date</th>
                <th className="py-3 px-6 font-bold text-slate-900">Loan</th>
                <th className="py-3 px-6 font-bold text-slate-900">Amount</th>
                <th className="py-3 px-6 font-bold text-slate-900">Method</th>
                <th className="py-3 px-6 font-bold text-slate-900">Status</th>
                <th className="py-3 px-6 font-bold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-100">
              {userPayments.length > 0 ? (
                userPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-teal-50/30 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{payment.id}</td>
                    <td className="py-4 px-6 text-slate-700">
                      {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{payment.loanId}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">${payment.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-700">{payment.method}</td>
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
                        onClick={() => addToast('success', 'Receipt Downloaded', `Receipt for ${payment.id} has been downloaded`)}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 transition"
                      >
                        View receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 px-6 text-center text-sm text-slate-500">
                    No payment history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Make a Payment"
        size="lg"
      >
        <div className="space-y-6">
          {/* Select Loan */}
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Select loan to pay</label>
            <select
              value={selectedLoan}
              onChange={(e) => {
                const loanId = e.target.value;
                setSelectedLoan(loanId);
                const loan = userLoans.find(l => l.id === loanId);
                if (loan) {
                  setPaymentAmount(loan.monthlyEMI.toString());
                }
              }}
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="">Select a loan</option>
              {userLoans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.id} - {loan.type} (${loan.monthlyEMI} due {new Date(loan.nextDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Payment amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">$</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border border-teal-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">Minimum payment: ${paymentAmount || '0'} • Full payoff varies by loan</p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-3">Payment method</label>
            <div className="space-y-2">
              {userPaymentMethods.length > 0 ? userPaymentMethods.map((method) => {
                const Icon = method.type === 'bank-account' ? Building2 : CreditCard;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedPaymentMethod === method.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-teal-100 hover:border-teal-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <Icon size={20} className="text-slate-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 capitalize">{method.type.replace('-', ' ')}</p>
                        <p className="text-xs text-slate-600">{method.bankName || method.cardHolder}</p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700">Default</span>
                    )}
                  </label>
                );
              }) : (
                <div className="p-4 rounded-xl border border-teal-100 bg-white text-sm text-slate-600">
                  No payment methods available. Please add one first.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleMakePayment}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-bold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal
        open={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        title="Add Payment Method"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-2">Payment method type</label>
            <select
              value={newMethod.type}
              onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
              className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="credit-card">Credit Card</option>
              <option value="debit-card">Debit Card</option>
              <option value="bank-account">Bank Account</option>
            </select>
          </div>

          {newMethod.type === 'bank-account' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Bank Name *</label>
                <input
                  type="text"
                  value={newMethod.bankName}
                  onChange={(e) => setNewMethod({ ...newMethod, bankName: e.target.value })}
                  placeholder="Enter bank name"
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Account Number *</label>
                <input
                  type="text"
                  value={newMethod.accountNumber}
                  onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Account Holder *</label>
                <input
                  type="text"
                  value={newMethod.accountHolder}
                  onChange={(e) => setNewMethod({ ...newMethod, accountHolder: e.target.value })}
                  placeholder="Enter account holder name"
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Card Number *</label>
                <input
                  type="text"
                  value={newMethod.cardNumber}
                  onChange={(e) => setNewMethod({ ...newMethod, cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">Card Holder *</label>
                <input
                  type="text"
                  value={newMethod.cardHolder}
                  onChange={(e) => setNewMethod({ ...newMethod, cardHolder: e.target.value })}
                  placeholder="Name on card"
                  className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-900 block mb-2">Expiry Date *</label>
                  <input
                    type="text"
                    value={newMethod.expiryDate}
                    onChange={(e) => setNewMethod({ ...newMethod, expiryDate: e.target.value })}
                    placeholder="MM/YY"
                    className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-900 block mb-2">CVV</label>
                  <input
                    type="password"
                    value={newMethod.cvv}
                    onChange={(e) => setNewMethod({ ...newMethod, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full border border-teal-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddMethodModal(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-teal-200 text-sm font-bold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMethod}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-bold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20"
            >
              Add Method
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
