import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const statuses = ['Submitted', 'Under review', 'Approved'];

const LoanHistory = () => {
  const { loanApplications } = useApp();
  const { user } = useAuth();
  
  // Get applications for current user
  const userApplications = loanApplications.filter(app => app.borrowerId === user?.id);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting_borrower_confirmation':
        return 'Submitted';
      case 'waiting_lender_review':
        return 'Under review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getMockLoans = () => [
    { id: 'L-2041', type: 'Personal', amount: '₹6,500', status: 'Approved', date: 'Feb 10, 2026' },
    { id: 'L-5112', type: 'Auto', amount: '₹12,000', status: 'Under review', date: 'Feb 18, 2026' },
    { id: 'L-3099', type: 'Education', amount: '₹4,200', status: 'Submitted', date: 'Jan 22, 2026' },
    { id: 'L-1442', type: 'Personal', amount: '₹9,500', status: 'Rejected', date: 'Dec 05, 2025' },
  ];

  // Combine user applications with mock data if no applications exist
  const displayApplications = userApplications.length > 0 ? userApplications.map(app => ({
    id: app.id,
    type: app.loanType ? app.loanType.charAt(0).toUpperCase() + app.loanType.slice(1) : 'Loan',
    amount: `₹${app.amount.toLocaleString()}`,
    status: getStatusLabel(app.status),
    statusValue: app.status,
    date: new Date(app.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  })) : getMockLoans();

  return (
  <div className="space-y-6">
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Loan Application History</h2>
        <p className="text-sm text-slate-500">Track every application and its approval stage.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />
        <select className="border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
          <option>All types</option>
          <option>Personal</option>
          <option>Auto</option>
          <option>Education</option>
        </select>
      </div>
    </header>

    <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {displayApplications.length > 0 ? displayApplications.map((loan) => (
          <div key={loan.id} className="border border-teal-100 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Loan {loan.id}</p>
                <p className="text-xs text-slate-600">{loan.type} · {loan.date}</p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  loan.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : loan.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-700'
                      : loan.status === 'Under review'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {loan.status}
              </span>
            </div>
            <p className="text-3xl font-bold mt-4 text-slate-900">{loan.amount}</p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                {statuses.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {statuses.map((label, index) => {
                  const reached =
                    loan.status === 'Approved'
                      ? index <= 2
                      : loan.status === 'Under review'
                        ? index <= 1
                        : loan.status === 'Submitted'
                          ? index <= 0
                          : false;

                  return (
                    <span
                      key={label}
                      className={`h-2.5 flex-1 rounded-full transition ${
                        reached ? 'bg-teal-600' : 'bg-teal-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 py-12 text-center">
            <p className="text-slate-600">No loan applications yet. <a href="/apply-loan" className="text-teal-600 font-semibold hover:text-teal-700">Apply for a loan</a></p>
          </div>
        )}
      </div>
    </section>
  </div>
  );
};

export default LoanHistory;
