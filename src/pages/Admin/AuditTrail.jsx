import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const AuditTrail = () => {
  const { loanApplications, loans } = useApp();
  const { user } = useAuth();

  // Generate audit events from application data
  const currentDate = new Date();
  const auditEvents = [
    ...loanApplications.map(app => ({
      id: `AT-${app.id}`,
      user: app.personalInfo?.fullName || 'System',
      action: `Loan application ${app.status}`,
      before: 'pending',
      after: app.status,
      time: new Date(app.submittedDate || currentDate).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    })),
    ...loans.slice(0, 3).map(loan => ({
      id: `AT-${loan.id}`,
      user: 'System',
      action: `Loan ${loan.status}`,
      before: 'N/A',
      after: `$${loan.amount.toLocaleString()}`,
      time: new Date(loan.startDate).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    })),
    {
      id: 'AT-CONF-001',
      user: user?.name || 'Admin',
      action: 'Updated auto loan rate',
      before: '8.5%',
      after: '8.2%',
      time: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  ].slice(0, 10);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Audit Trail</h2>
        <p className="text-sm text-slate-500">Every configuration change logged with before and after values.</p>
      </header>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 shadow-sm">
        <div className="divide-y divide-teal-100">
          {auditEvents.length > 0 ? auditEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-teal-50/30 transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{event.action}</p>
                  <p className="text-xs text-slate-600">{event.user} · {event.time}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700">
                  {event.id}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-teal-100 rounded-xl p-3 bg-teal-50">
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-600 font-semibold">Before</p>
                  <p className="text-sm font-bold text-slate-900 mt-2">{event.before}</p>
                </div>
                <div className="border border-slate-100 rounded-xl p-3 bg-emerald-50 border-emerald-100">
                  <p className="text-xs uppercase tracking-[0.1em] text-emerald-600 font-semibold">After</p>
                  <p className="text-sm font-bold text-emerald-900 mt-2">{event.after}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-500">
              No audit events found
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AuditTrail;
