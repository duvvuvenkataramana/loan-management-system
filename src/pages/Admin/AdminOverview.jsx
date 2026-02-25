import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Users, Settings, Activity } from 'lucide-react';

const AdminOverview = () => {
  const { loanApplications, loans, payments } = useApp();
  
  const loanTypes = ['personal', 'home', 'auto', 'education', 'business'];
  const activeLoanTypes = loanTypes.length;
  const totalApplications = loanApplications.length;
  const totalLoans = loans.length;
  const totalPayments = payments.length;
  const auditEvents = totalApplications + totalLoans + totalPayments;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Admin Overview</h2>
        <p className="text-sm text-slate-500 mt-2">
          Configure loan products, permissions, and audit trails from this workspace.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/config" className="block">
          <div className="bg-gradient-to-br from-white to-slate-50 border border-teal-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Loan Types</p>
                <p className="text-3xl font-bold mt-3 text-slate-900">{activeLoanTypes} active</p>
              </div>
              <Settings className="text-teal-600" size={40} />
            </div>
          </div>
        </Link>
        
        <Link to="/admin/permissions" className="block">
          <div className="bg-gradient-to-br from-white to-slate-50 border border-teal-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Permission Sets</p>
                <p className="text-3xl font-bold mt-3 text-slate-900">4 roles</p>
              </div>
              <Users className="text-teal-600" size={40} />
            </div>
          </div>
        </Link>
        
        <Link to="/admin/audit" className="block">
          <div className="bg-gradient-to-br from-white to-slate-50 border border-teal-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Audit Events</p>
                <p className="text-3xl font-bold mt-3 text-slate-900">{auditEvents.toLocaleString()}</p>
              </div>
              <Activity className="text-teal-600" size={40} />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Access */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/config" className="block">
            <div className="border border-teal-100 rounded-xl p-4 hover:bg-teal-50/30 transition cursor-pointer h-full">
              <p className="font-semibold text-slate-900">System Configuration</p>
              <p className="text-xs text-slate-600 mt-1">Manage app settings and parameters</p>
            </div>
          </Link>
          <Link to="/admin/permissions" className="block">
            <div className="border border-teal-100 rounded-xl p-4 hover:bg-teal-50/30 transition cursor-pointer h-full">
              <p className="font-semibold text-slate-900">Permission Matrix</p>
              <p className="text-xs text-slate-600 mt-1">Configure role-based access</p>
            </div>
          </Link>
          <Link to="/admin/audit" className="block">
            <div className="border border-teal-100 rounded-xl p-4 hover:bg-teal-50/30 transition cursor-pointer h-full">
              <p className="font-semibold text-slate-900">Audit Trail</p>
              <p className="text-xs text-slate-600 mt-1">View system activity logs</p>
            </div>
          </Link>
        </div>
      </section>

      {/* System Stats */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-teal-100 rounded-xl">
            <p className="text-2xl font-bold text-slate-900">{totalApplications}</p>
            <p className="text-xs text-slate-600 mt-1">Applications</p>
          </div>
          <div className="text-center p-4 border border-teal-100 rounded-xl">
            <p className="text-2xl font-bold text-slate-900">{totalLoans}</p>
            <p className="text-xs text-slate-600 mt-1">Active Loans</p>
          </div>
          <div className="text-center p-4 border border-teal-100 rounded-xl">
            <p className="text-2xl font-bold text-slate-900">{totalPayments}</p>
            <p className="text-xs text-slate-600 mt-1">Payments</p>
          </div>
          <div className="text-center p-4 border border-teal-100 rounded-xl">
            <p className="text-2xl font-bold text-slate-900">100%</p>
            <p className="text-xs text-slate-600 mt-1">Uptime</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminOverview;
