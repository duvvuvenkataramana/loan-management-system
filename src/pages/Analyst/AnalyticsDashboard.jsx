import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { downloadCSV, downloadPDF, formatLoansForExport } from '../../utils/exportData';

const colors = ['#0d9488', '#06b6d4', '#8b5cf6', '#f59e0b'];

const AnalyticsDashboard = () => {
  const { loans, loanApplications, payments } = useApp();
  const { addToast } = useToast();

  // Calculate loan distribution by type - using actual AMOUNTS
  const loanTypeDistribution = loans.reduce((acc, loan) => {
    const type = loan.type || 'Personal Loan';
    if (!acc[type]) {
      acc[type] = { name: type, value: 0 };
    }
    acc[type].value += loan.amount || 0;
    return acc;
  }, {});

  const distribution = Object.values(loanTypeDistribution);

  // Calculate total portfolio value
  const totalPortfolio = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  
  // Calculate default rate (simplified)
  const closedLoans = loans.filter(loan => loan.status === 'closed').length;
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const defaultRate = closedLoans + activeLoans > 0 ? ((closedLoans / (closedLoans + activeLoans)) * 100).toFixed(1) : '0.0';

  // Average yield (calculated from actual loans)
  const avgYield = activeLoans > 0 
    ? (loans.filter(loan => loan.status === 'active').reduce((sum, loan) => sum + (loan.interestRate || 10), 0) / activeLoans).toFixed(1)
    : '0.0';

  // Profitability trend - calculated from actual payments
  const getProfitTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr'];
    return months.map(month => {
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.toLocaleString('en-US', { month: 'short' }) === month;
      });
      const totalValue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return { month, value: totalValue > 0 ? totalValue : Math.round(totalPortfolio * 0.02) };
    });
  };

  const profit = getProfitTrend();

  // Risk segmentation based on credit scores
  const lowRisk = loanApplications.filter(app => (app.financialInfo?.creditScore || 0) >= 750).length;
  const mediumRisk = loanApplications.filter(app => {
    const score = app.financialInfo?.creditScore || 0;
    return score >= 650 && score < 750;
  }).length;
  const highRisk = loanApplications.filter(app => (app.financialInfo?.creditScore || 0) < 650).length;

  const risk = [
    { segment: 'Low', value: lowRisk },
    { segment: 'Medium', value: mediumRisk },
    { segment: 'High', value: highRisk },
  ];

  const handleDownloadCSV = () => {
    const loansData = formatLoansForExport(loans);
    
    const success = downloadCSV(loansData, `portfolio-report-${new Date().toISOString().split('T')[0]}.csv`);
    if (success) {
      addToast('success', 'CSV Downloaded', `Exported ${loansData.length} loans to CSV`);
    } else {
      addToast('error', 'Export Failed', 'Could not export CSV file');
    }
  };

  const handleDownloadPDF = () => {
    const sections = [
      {
        title: 'Portfolio Overview',
        type: 'info',
        data: {
          'Total Portfolio Value': `₹${totalPortfolio.toLocaleString()}`,
          'Active Loans': activeLoans,
          'Total Loans': loans.length,
          'Default Rate': `${defaultRate}%`,
          'Average Yield': `${avgYield}%`,
          'Loan Applications': loanApplications.length,
        }
      },
      {
        title: 'Active Loans',
        type: 'table',
        data: formatLoansForExport(loans.filter(l => l.status === 'active')),
        headers: ['Loan ID', 'Type', 'Amount', 'Remaining', 'EMI', 'Interest Rate', 'Status', 'Next Due']
      },
      {
        title: 'Risk Distribution',
        type: 'info',
        data: {
          'Low Risk Applications': lowRisk,
          'Medium Risk Applications': mediumRisk,
          'High Risk Applications': highRisk,
        }
      }
    ];
    
    const success = downloadPDF('Portfolio Analytics Report', sections, `portfolio-report-${new Date().toISOString().split('T')[0]}.pdf`);
    if (success) {
      addToast('success', 'PDF Generated', 'Report opened in new window - use Print to save as PDF');
    } else {
      addToast('error', 'Export Failed', 'Could not generate PDF report');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Portfolio Analytics</h2>
          <p className="text-sm text-slate-600">Deep performance signals and distribution snapshots.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadCSV}
            className="px-4 py-2 rounded-xl border border-teal-200 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
          >
            Download CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-bold hover:from-teal-500 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-teal-500/20"
          >
            Download PDF
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Total portfolio</p>
          <p className="text-3xl font-black text-slate-900 mt-3">₹{(totalPortfolio / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-slate-600 mt-1">{loans.length} active loans</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Default rate</p>
          <p className="text-3xl font-black text-slate-900 mt-3">{defaultRate}%</p>
          <p className="text-sm text-slate-600 mt-1">{closedLoans} closed loans</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Avg yield</p>
          <p className="text-3xl font-black text-slate-900 mt-3">{avgYield}%</p>
          <p className="text-sm text-slate-600 mt-1">Across all products</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Loan distribution by type</h3>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {distribution.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {distribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className="text-xs text-slate-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Profitability trend</h3>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profit}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Default risk segmentation</h3>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risk}>
                <XAxis dataKey="segment" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Geographic exposure</h3>
          <div className="mt-6 h-64 flex items-center justify-center border border-dashed border-teal-200 rounded-xl bg-slate-50">
            <p className="text-sm text-slate-600">Map visualization placeholder</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
