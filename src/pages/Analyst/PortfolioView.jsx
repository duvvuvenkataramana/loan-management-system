import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { downloadCSV, downloadPDF } from '../../utils/exportData';
import { Download, FileText } from 'lucide-react';

const data = [
  { month: 'Jan', performance: 4000 },
  { month: 'Feb', performance: 3000 },
  { month: 'Mar', performance: 5000 },
  { month: 'Apr', performance: 4780 },
];

const PortfolioView = () => {
  const { loans } = useApp();
  const { addToast } = useToast();

  const handleExportCSV = () => {
    const performanceData = data.map(d => ({
      'Month': d.month,
      'Performance': `$${d.performance.toLocaleString()}`,
    }));
    
    const success = downloadCSV(performanceData, `portfolio-performance-${new Date().toISOString().split('T')[0]}.csv`);
    if (success) {
      addToast('success', 'CSV Exported', 'Portfolio performance data exported');
    } else {
      addToast('error', 'Export Failed', 'Could not export CSV');
    }
  };

  const handleExportPDF = () => {
    const sections = [
      {
        title: 'Portfolio Performance Overview',
        type: 'info',
        data: {
          'Total Loans': loans.length,
          'Latest Performance': `$${data[data.length - 1].performance.toLocaleString()}`,
          'Trend': 'Growing',
        }
      },
      {
        title: 'Monthly Performance',
        type: 'table',
        data: data,
        headers: ['month', 'performance']
      }
    ];
    
    const success = downloadPDF('Portfolio Performance Report', sections, `portfolio-performance-${new Date().toISOString().split('T')[0]}.pdf`);
    if (success) {
      addToast('success', 'PDF Generated', 'Report opened in new window');
    } else {
      addToast('error', 'Export Failed', 'Could not generate PDF');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Portfolio Performance (Growth)</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-2"
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="performance" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioView;