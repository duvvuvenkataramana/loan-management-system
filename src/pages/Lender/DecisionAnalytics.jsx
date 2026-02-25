import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { downloadCSV } from '../../utils/exportData';
import { Download } from 'lucide-react';

const colors = ['#0d9488', '#f59e0b', '#ef4444'];

const DecisionAnalytics = () => {
  const { loanApplications } = useApp();
  const { addToast } = useToast();

  // Filter applications for this lender (in real app, would be based on lenderId)
  const allApplications = loanApplications;

  // Calculate approval distribution
  const approved = allApplications.filter(app => app.status === 'approved').length;
  const rejected = allApplications.filter(app => app.status === 'rejected').length;
  const pending = allApplications.filter(app => app.status === 'pending' || app.status === 'in_review').length;
  const total = allApplications.length || 1;

  const approvals = [
    { name: 'Approved', value: approved },
    { name: 'Rejected', value: rejected },
    { name: 'Pending', value: pending },
  ];

  const approvalRate = Math.round((approved / total) * 100);

  // Calculate processing times (mock data for weeks)
  const processing = [
    { label: 'Week 1', hours: 12 },
    { label: 'Week 2', hours: 9 },
    { label: 'Week 3', hours: 11 },
    { label: 'Week 4', hours: 7 },
  ];

  const avgProcessingTime = processing.reduce((sum, week) => sum + week.hours, 0) / processing.length;

  // Risk heatmap based on credit scores
  const lowRisk = allApplications.filter(app => (app.financialInfo?.creditScore || 0) >= 750).length;
  const mediumRisk = allApplications.filter(app => {
    const score = app.financialInfo?.creditScore || 0;
    return score >= 650 && score < 750;
  }).length;
  const highRisk = allApplications.filter(app => (app.financialInfo?.creditScore || 0) < 650).length;

  const heat = [
    { label: 'Low', count: lowRisk },
    { label: 'Medium', count: mediumRisk },
    { label: 'High', count: highRisk },
  ];

  const escalations = rejected;

  const handleExportAnalytics = () => {
    const analyticsData = [
      { 'Metric': 'Total Applications', 'Value': total },
      { 'Metric': 'Approved', 'Value': approved },
      { 'Metric': 'Rejected', 'Value': rejected },
      { 'Metric': 'Pending', 'Value': pending },
      { 'Metric': 'Approval Rate (%)', 'Value': approvalRate },
      { 'Metric': 'Average Processing Time (hrs)', 'Value': avgProcessingTime.toFixed(1) },
      { 'Metric': 'Low Risk Applications', 'Value': lowRisk },
      { 'Metric': 'Medium Risk Applications', 'Value': mediumRisk },
      { 'Metric': 'High Risk Applications', 'Value': highRisk },
      { 'Metric': 'Escalations', 'Value': escalations }
    ];

    const success = downloadCSV(
      analyticsData,
      `decision-analytics-${new Date().toISOString().split('T')[0]}.csv`
    );

    if (success) {
      addToast('success', 'Export Successful', 'Analytics data exported to CSV');
    } else {
      addToast('error', 'Export Failed', 'Failed to export analytics data');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Decision Analytics</h2>
          <p className="text-sm text-slate-600">Approval trends, processing velocity, and risk heat.</p>
        </div>
        <button
          onClick={handleExportAnalytics}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
        >
          <Download size={16} />
          Export Report
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Approval rate</p>
          <p className="text-3xl font-black text-slate-900 mt-3">{approvalRate}%</p>
          <p className="text-sm text-slate-600 mt-1">{approved} of {total} applications</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Avg processing time</p>
          <p className="text-3xl font-black text-slate-900 mt-3">{avgProcessingTime.toFixed(1)} hrs</p>
          <p className="text-sm text-slate-600 mt-1">Last 4 weeks average</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Escalations</p>
          <p className="text-3xl font-black text-slate-900 mt-3">{escalations}</p>
          <p className="text-sm text-slate-600 mt-1">Rejected applications</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Approval distribution</h3>
          <div className="mt-6 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={approvals} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {approvals.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {approvals.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }}></div>
                <span className="text-xs text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Average processing time</h3>
          <div className="mt-6 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processing}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="hours" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Risk heatmap (counts)</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {heat.map((item, index) => (
            <div key={item.label} className="bg-slate-50 border border-teal-100 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all duration-300">
              <p className="text-sm font-semibold text-slate-700">{item.label} risk</p>
              <p className="text-3xl font-black mt-2" style={{ color: ['#059669', '#d97706', '#f43f5e'][index] }}>
                {item.count}
              </p>
              <p className="text-xs text-slate-600">Applications</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DecisionAnalytics;
