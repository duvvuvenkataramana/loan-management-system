import DataTable from '../../components/DataTable';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { downloadCSV, downloadPDF } from '../../utils/exportData';

const ReportBuilder = () => {
  const { loans, loanApplications, payments } = useApp();
  const { addToast } = useToast();
  const columns = [
    { key: 'region', label: 'Region', sortable: true, render: (row) => <span className="font-semibold">{row.region}</span> },
    { key: 'type', label: 'Loan type', sortable: true },
    { key: 'risk', label: 'Risk', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true },
  ];

  const rows = [
    { id: 'r1', region: 'Northeast', type: 'Personal', risk: 'Low', revenue: '$140k' },
    { id: 'r2', region: 'Midwest', type: 'Auto', risk: 'Medium', revenue: '$92k' },
    { id: 'r3', region: 'West', type: 'Education', risk: 'Low', revenue: '$88k' },
  ];

  const handleExportCSV = () => {
    const reportData = rows.map(row => ({
      'Region': row.region,
      'Loan Type': row.type,
      'Risk Level': row.risk,
      'Revenue': row.revenue,
    }));
    
    const success = downloadCSV(reportData, `custom-report-${new Date().toISOString().split('T')[0]}.csv`);
    if (success) {
      addToast('success', 'CSV Exported', 'Custom report exported to CSV');
    } else {
      addToast('error', 'Export Failed', 'Could not export CSV');
    }
  };

  const handleExportPDF = () => {
    const sections = [
      {
        title: 'Report Summary',
        type: 'info',
        data: {
          'Portfolio Size': '$4.8M',
          'Default Rate': '2.4%',
          'Average Yield': '9.6%',
          'Top Region': 'Northeast',
          'Total Loans': loans.length,
          'Total Applications': loanApplications.length,
          'Total Payments': payments.length,
        }
      },
      {
        title: 'Regional Performance',
        type: 'table',
        data: rows,
        headers: ['region', 'type', 'risk', 'revenue']
      }
    ];
    
    const success = downloadPDF('Custom Loan Report', sections, `custom-report-${new Date().toISOString().split('T')[0]}.pdf`);
    if (success) {
      addToast('success', 'PDF Generated', 'Report opened in new window');
    } else {
      addToast('error', 'Export Failed', 'Could not generate PDF');
    }
  };

  return (
  <div className="space-y-6">
    <header>
      <h2 className="text-2xl font-semibold">Custom Report Builder</h2>
      <p className="text-sm text-slate-500">Select fields, ranges, and generate tailored reports.</p>
    </header>

    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs uppercase text-slate-500">Fields</label>
          <div className="mt-2 space-y-2">
            {['Loan type', 'Region', 'Risk score', 'Revenue', 'Defaults'].map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked />
                {field}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase text-slate-500">Date range</label>
          <div className="mt-2 space-y-2">
            <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase text-slate-500">Format</label>
          <div className="mt-2 space-y-2">
            {['Chart + table', 'Table only', 'Chart only'].map((format) => (
              <label key={format} className="flex items-center gap-2 text-sm">
                <input type="radio" name="format" defaultChecked={format === 'Chart + table'} />
                {format}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Export CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Export PDF
          </button>
        </div>
        <button 
          onClick={() => addToast('success', 'Report Generated', 'Custom report has been generated')}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
        >
          Generate report
        </button>
      </div>
    </section>

    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Report preview</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Portfolio size', value: '$4.8M' },
          { label: 'Default rate', value: '2.4%' },
          { label: 'Avg yield', value: '9.6%' },
          { label: 'Top region', value: 'Northeast' },
        ].map((item) => (
          <div key={item.label} className="border border-slate-100 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-500">{item.label}</p>
            <p className="text-lg font-semibold mt-2">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <DataTable columns={columns} rows={rows} initialSort={{ key: 'region', dir: 'asc' }} />
      </div>
    </section>
  </div>
  );
};

export default ReportBuilder;
