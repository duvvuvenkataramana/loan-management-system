import React from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';

const LoanRequests = () => {
  const { loanApplications, updateApplicationStatus } = useApp();
  const { addToast } = useToast();
  const requests = loanApplications.filter(app => app.status === 'waiting_lender_review' || app.status === 'in_review');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Review Loan Applications</h2>
      <div className="overflow-x-auto bg-gradient-to-br from-white to-slate-50 rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition-all duration-300">
        <table className="min-w-full divide-y divide-teal-100">
          <thead className="bg-gradient-to-r from-white to-teal-50 border-b border-teal-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Borrower</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Credit Score</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-teal-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-teal-50/30 transition">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{req.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-700">{req.personalInfo?.fullName || 'Unknown Applicant'}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">₹{Number(req.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (req.financialInfo?.creditScore || 0) > 700 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {req.financialInfo?.creditScore || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex space-x-3">
                  <button
                    onClick={() => addToast('info', 'View Application', `Opening application ${req.id} details`)}
                    className="text-teal-600 hover:text-teal-700 transition hover:bg-teal-50 p-2 rounded-lg"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(req.id, 'approved')}
                    className="text-emerald-600 hover:text-emerald-700 transition hover:bg-emerald-50 p-2 rounded-lg"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(req.id, 'rejected')}
                    className="text-rose-600 hover:text-rose-700 transition hover:bg-rose-50 p-2 rounded-lg"
                  >
                    <XCircle size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanRequests;