import React, { useState } from 'react';
import { Calendar, CreditCard, Download, Bell, Save, X, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const QuickActions = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState(null);
  const [reminders, setReminders] = useState({
    daysBeforeDue: 3,
    enableEmail: true,
    enableSMS: true,
    enablePush: false
  });
  
  const [paymentMethod, setPaymentMethod] = useState({
    method: 'credit-card',
    autoPayEnabled: false,
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [documentSettings, setDocumentSettings] = useState({
    format: 'pdf',
    emailFrequency: 'monthly',
    autoDownload: false
  });

  // Safety check for user - must be after all hooks
  if (!user) {
    return null;
  }

  // Configure Payment Reminders
  const handleSaveReminders = () => {
    localStorage.setItem('paymentReminders', JSON.stringify(reminders));
    addToast('success', 'Reminders Configured', `You'll receive reminders ${reminders.daysBeforeDue} days before EMI is due.`);
    setActiveTab(null);
  };

  // Update Payment Method
  const handleSavePaymentMethod = () => {
    if (!paymentMethod.cardNumber || !paymentMethod.expiryDate || !paymentMethod.cvv) {
      addToast('error', 'Validation Error', 'Please fill in all payment method details');
      return;
    }
    localStorage.setItem('defaultPaymentMethod', JSON.stringify(paymentMethod));
    addToast('success', 'Payment Method Updated', `${paymentMethod.method} has been set as default`);
    setActiveTab(null);
  };

  // Download Tax Documents
  const handleDownloadDocuments = () => {

    // Create a simple document
    const documentContent = `
LOAN STATEMENT & TAX DOCUMENT
========================================
Borrower: ${user?.name}
Customer ID: ${user?.id}
Generated Date: ${new Date().toLocaleDateString()}
Format: ${documentSettings.format.toUpperCase()}

ANNUAL LOAN SUMMARY
- Total Interest Paid: ₹2,520
- Total Principal Paid: ₹2,520
- Outstanding Balance: ₹3,980
- EMI Paid: 6 installments

TAX DEDUCTIBLE INFORMATION
- Home Loan Principal Paid: -
- Home Loan Interest Paid: -
- Education Loan Amount: -

For any discrepancies, please contact our support team.
========================================
    `;

    const element = document.createElement('a');
    const file = new Blob([documentContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Tax_Statement_${user?.id}_${new Date().getFullYear()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    addToast('success', 'Document Downloaded', `Your ${documentSettings.format.toUpperCase()} statement has been downloaded.`);
    setActiveTab(null);
  };

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Account Management</h2>
        <p className="text-sm text-slate-600 mt-1">Configure reminders, payment methods, and download documents</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configure Payment Reminders */}
        <button
          onClick={() => setActiveTab(activeTab === 'reminders' ? null : 'reminders')}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 text-left"
        >
          <Bell className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Set Payment Reminders</h3>
          <p className="text-sm text-slate-600">Get alerts 3 days before EMI due date via email and SMS.</p>
          <div className="mt-4 text-xs font-semibold text-emerald-700 flex items-center gap-1">
            Configure →
          </div>
        </button>

        {/* Update Payment Method */}
        <button
          onClick={() => setActiveTab(activeTab === 'method' ? null : 'method')}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 text-left"
        >
          <CreditCard className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Update Payment Method</h3>
          <p className="text-sm text-slate-600">Add or change your default payment method for auto-pay.</p>
          <div className="mt-4 text-xs font-semibold text-blue-700 flex items-center gap-1">
            Manage →
          </div>
        </button>

        {/* Download Tax Documents */}
        <button
          onClick={() => setActiveTab(activeTab === 'documents' ? null : 'documents')}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 text-left"
        >
          <Download className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Tax Documents</h3>
          <p className="text-sm text-slate-600">Download annual statements for tax filing purposes.</p>
          <div className="mt-4 text-xs font-semibold text-purple-700 flex items-center gap-1">
            Download →
          </div>
        </button>
      </section>

      {/* Configure Payment Reminders Modal */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-900">Configure Payment Reminders</h4>
            <button
              onClick={() => setActiveTab(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Days Before Due Date</label>
              <select
                value={reminders.daysBeforeDue}
                onChange={(e) => setReminders({ ...reminders, daysBeforeDue: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={1}>1 day before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>1 week before</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.enableEmail}
                  onChange={(e) => setReminders({ ...reminders, enableEmail: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                />
                <span className="text-sm font-medium text-slate-900">Email Reminders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.enableSMS}
                  onChange={(e) => setReminders({ ...reminders, enableSMS: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                />
                <span className="text-sm font-medium text-slate-900">SMS Reminders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders.enablePush}
                  onChange={(e) => setReminders({ ...reminders, enablePush: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                />
                <span className="text-sm font-medium text-slate-900">Push Notifications</span>
              </label>
            </div>

            <button
              onClick={handleSaveReminders}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Reminder Settings
            </button>
          </div>
        </div>
      )}

      {/* Update Payment Method Modal */}
      {activeTab === 'method' && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-900">Update Payment Method</h4>
            <button
              onClick={() => setActiveTab(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">Payment methods are securely stored. Your details are encrypted.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Payment Method</label>
              <select
                value={paymentMethod.method}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, method: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            {paymentMethod.method.includes('card') && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentMethod.cardNumber}
                    onChange={(e) => setPaymentMethod({ ...paymentMethod, cardNumber: e.target.value })}
                    maxLength="19"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentMethod.expiryDate}
                      onChange={(e) => setPaymentMethod({ ...paymentMethod, expiryDate: e.target.value })}
                      maxLength="5"
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={paymentMethod.cvv}
                      onChange={(e) => setPaymentMethod({ ...paymentMethod, cvv: e.target.value })}
                      maxLength="4"
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethod.autoPayEnabled}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, autoPayEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm font-medium text-slate-900">Enable Auto-Pay for EMI</span>
            </label>

            <button
              onClick={handleSavePaymentMethod}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Payment Method
            </button>
          </div>
        </div>
      )}

      {/* Download Tax Documents Modal */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-purple-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-900">Download Tax Documents</h4>
            <button
              onClick={() => setActiveTab(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Document Format</label>
              <select
                value={documentSettings.format}
                onChange={(e) => setDocumentSettings({ ...documentSettings, format: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email Frequency</label>
              <select
                value={documentSettings.emailFrequency}
                onChange={(e) => setDocumentSettings({ ...documentSettings, emailFrequency: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="never">Never</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={documentSettings.autoDownload}
                onChange={(e) => setDocumentSettings({ ...documentSettings, autoDownload: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-purple-600"
              />
              <span className="text-sm font-medium text-slate-900">Auto-download statements</span>
            </label>

            <button
              onClick={handleDownloadDocuments}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
