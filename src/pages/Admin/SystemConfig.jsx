import { useState } from 'react';
import { useToast } from '../../context/AppContext';

const SystemConfig = () => {
  const { addToast } = useToast();
  const [loanTypes] = useState([
    { name: 'Personal loan', rate: '10.4%', tenure: '12-36 months' },
    { name: 'Auto loan', rate: '8.2%', tenure: '24-60 months' },
    { name: 'Education loan', rate: '6.9%', tenure: '36-84 months' },
    { name: 'Home loan', rate: '8.5%', tenure: '120-360 months' },
    { name: 'Business loan', rate: '11.0%', tenure: '12-60 months' },
  ]);

  const handleAddLoanType = () => {
    addToast('info', 'Coming Soon', 'Add loan type feature will be available soon');
  };

  const handleUpdateRules = () => {
    addToast('success', 'Rules Updated', 'Interest rules have been updated successfully');
  };

  const handleSaveSettings = () => {
    addToast('success', 'Settings Saved', 'Penalty and grace settings have been saved');
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>
        <p className="text-sm text-slate-500">Maintain loan products, interest rules, and penalties.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-900">Loan types</h3>
          <div className="mt-4 space-y-3">
            {loanTypes.map((item) => (
              <div key={item.name} className="flex items-center justify-between border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Tenure {item.tenure}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700">
                  {item.rate}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleAddLoanType}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Add loan type
          </button>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-900">Interest rules</h3>
          <div className="mt-4 space-y-3">
            {[
              { tier: 'Prime', rule: 'Score 720+', rate: '7.2%' },
              { tier: 'Standard', rule: 'Score 660-719', rate: '9.4%' },
              { tier: 'Subprime', rule: 'Score < 660', rate: '12.8%' },
            ].map((item) => (
              <div key={item.tier} className="border border-teal-100 rounded-xl p-3 hover:bg-teal-50 hover:border-teal-200 transition">
                <p className="text-sm font-semibold text-slate-900">{item.tier}</p>
                <p className="text-xs text-slate-600">{item.rule}</p>
                <p className="text-xs text-slate-700 mt-2 font-medium">Rate {item.rate}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={handleUpdateRules}
            className="mt-4 px-4 py-2 rounded-xl border border-teal-200 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-300 transition"
          >
            Update rules
          </button>
        </div>
      </section>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-900">Penalty & grace settings</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Late fee', value: '2.5% of EMI' },
            { label: 'Grace period', value: '7 days' },
            { label: 'Default threshold', value: '60 days' },
          ].map((item) => (
            <div key={item.label} className="border border-teal-100 rounded-xl p-4 hover:shadow-sm hover:border-teal-200 transition">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">{item.label}</p>
              <p className="text-xl font-bold mt-2 text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Save settings
          </button>
        </div>
      </section>
    </div>
  );
};

export default SystemConfig;
