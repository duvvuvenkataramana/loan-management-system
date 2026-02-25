import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { downloadCSV } from '../../utils/exportData';
import { Download } from 'lucide-react';

const WorkQueue = () => {
  const { loanApplications, updateApplicationStatus } = useApp();
  const { addToast } = useToast();

  const getRisk = (amount) => {
    if (amount >= 100000) return 'High';
    if (amount >= 25000) return 'Medium';
    return 'Low';
  };

  const handleExportApplications = () => {
    const exportData = loanApplications.map(app => ({
      'Application ID': app.id,
      'Borrower Name': app.personalInfo?.fullName || 'N/A',
      'Email': app.personalInfo?.email || 'N/A',
      'Phone': app.personalInfo?.phone || 'N/A',
      'Loan Type': app.loanType,
      'Amount': app.amount,
      'Tenure (months)': app.tenure,
      'EMI': app.emi,
      'Status': app.status,
      'Credit Score': app.financialInfo?.creditScore || 'N/A',
      'Monthly Income': app.employmentInfo?.monthlyIncome || 'N/A',
      'Employer': app.employmentInfo?.employer || 'N/A',
      'Application Date': app.applicationDate,
      'Risk Level': getRisk(app.amount)
    }));

    const success = downloadCSV(
      exportData,
      `loan-applications-${new Date().toISOString().split('T')[0]}.csv`
    );

    if (success) {
      addToast('success', 'Export Successful', `${exportData.length} applications exported to CSV`);
    } else {
      addToast('error', 'Export Failed', 'Failed to export applications');
    }
  };

  const columns = [
    {
      title: 'New',
      items: loanApplications.filter(app => app.status === 'pending' || app.status === 'waiting_lender_review')
    },
    {
      title: 'In Review',
      items: loanApplications.filter(app => app.status === 'in_review')
    },
    {
      title: 'Completed',
      items: loanApplications.filter(app => app.status === 'approved' || app.status === 'rejected')
    }
  ];

  const handleAssignToMe = () => {
    loanApplications
      .filter(app => app.status === 'pending' || app.status === 'waiting_lender_review')
      .forEach(app => updateApplicationStatus(app.id, 'in_review'));
  };

  const handleBulkUpdate = () => {
    loanApplications
      .filter(app => app.status === 'in_review')
      .forEach(app => updateApplicationStatus(app.id, 'approved'));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Work Queue</h2>
          <p className="text-sm text-slate-500">Manage incoming applications across review stages.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportApplications}
            className="px-4 py-2 rounded-xl border border-teal-200 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition flex items-center gap-2"
          >
            <Download size={16} />
            Export Report
          </button>
          <button
            onClick={handleAssignToMe}
            className="px-4 py-2 rounded-xl border border-teal-200 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
          >
            Assign to me
          </button>
          <button
            onClick={handleBulkUpdate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20"
          >
            Bulk update
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.title} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-teal-100 flex items-center justify-between bg-gradient-to-r from-white to-teal-50">
              <h3 className="text-sm font-bold text-slate-900">{column.title}</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">{column.items.length}</span>
            </div>
            <div className="p-4 space-y-3">
              {column.items.length > 0 ? column.items.map((item) => {
                const risk = getRisk(item.amount);
                return (
                  <div key={item.id} className="border border-teal-100 rounded-xl p-4 bg-white hover:border-teal-200 hover:shadow-sm transition cursor-pointer hover:bg-teal-50/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{item.personalInfo?.fullName || 'Unknown Applicant'}</p>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          risk === 'Low'
                            ? 'bg-emerald-100 text-emerald-700'
                            : risk === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {risk}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">Loan {item.id}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">₹{Number(item.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-600">Status {item.status.replace('_', ' ')}</p>
                      </div>
                      <Link
                        to={`/review/${item.id}`}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 transition"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-sm text-slate-500 text-center py-6">No applications</div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default WorkQueue;
