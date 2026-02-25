// PDF Generation utility for loan statements
// Uses browser's native HTML to PDF capabilities

export const generateLoanStatement = (user, loans, payments, fileName = 'LoanStatement.pdf') => {
  if (typeof window === 'undefined') return;

  // Filter user's data
  const userLoans = loans.filter(loan => loan.borrowerId === user?.id);
  const userPayments = payments.filter(payment => payment.borrowerId === user?.id);

  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Loan Statement</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #0d9488;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .company-info h1 {
          margin: 0;
          color: #0d9488;
          font-size: 28px;
        }
        .company-info p {
          margin: 5px 0;
          font-size: 12px;
          color: #666;
        }
        .statement-date {
          text-align: right;
          font-size: 12px;
          color: #666;
        }
        .statement-date p {
          margin: 5px 0;
        }
        .borrower-info {
          background: #f0fdf4;
          border-left: 4px solid #0d9488;
          padding: 15px;
          margin-bottom: 30px;
          border-radius: 4px;
        }
        .borrower-info h3 {
          margin: 0 0 10px 0;
          color: #0d9488;
          font-size: 14px;
        }
        .borrower-info p {
          margin: 5px 0;
          font-size: 12px;
        }
        .section-title {
          color: #0d9488;
          font-size: 16px;
          font-weight: bold;
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 2px solid #e0e7ff;
          padding-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 12px;
        }
        th {
          background: #f3f4f6;
          color: #0d9488;
          padding: 10px;
          text-align: left;
          border-bottom: 2px solid #0d9488;
          font-weight: 600;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .amount {
          text-align: right;
          font-weight: 600;
        }
        .status-active {
          color: #10b981;
          font-weight: 600;
        }
        .status-closed {
          color: #6b7280;
          font-weight: 600;
        }
        .summary-box {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
        }
        .summary-row.total {
          border-top: 2px solid #0d9488;
          padding-top: 10px;
          font-weight: bold;
          color: #0d9488;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #666;
          text-align: center;
        }
        .page-break {
          page-break-after: always;
          margin: 40px 0;
        }
        .disclaimer {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>LoanMS™</h1>
            <p>Loan Management System</p>
            <p>📞 1-800-LOAN-HELP | 📧 support@loanms.com</p>
          </div>
          <div class="statement-date">
            <p><strong>ACCOUNT STATEMENT</strong></p>
            <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Period: Last 12 Months</p>
          </div>
        </div>

        <!-- Borrower Info -->
        <div class="borrower-info">
          <h3>BORROWER INFORMATION</h3>
          <p><strong>Name:</strong> ${user?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${user?.phone || 'N/A'}</p>
          <p><strong>Member Since:</strong> ${user?.profile?.createdAt ? new Date(user.profile.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>

        <!-- Active Loans Section -->
        <div class="section-title">ACTIVE LOANS</div>
        ${userLoans.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Outstanding</th>
                <th>Monthly EMI</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${userLoans.slice(0, 10).map(loan => `
                <tr>
                  <td>${loan.id}</td>
                  <td>${loan.type}</td>
                  <td class="amount">$${loan.loanAmount?.toLocaleString()}</td>
                  <td class="amount">$${loan.remaining?.toLocaleString()}</td>
                  <td class="amount">$${loan.monthlyEMI?.toLocaleString()}</td>
                  <td>${new Date(loan.nextDue).toLocaleDateString()}</td>
                  <td><span class="status-active">${loan.status.toUpperCase()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary-box">
            <div class="summary-row">
              <span>Total Active Loans:</span>
              <strong>$${userLoans.reduce((sum, l) => sum + (l.remaining || 0), 0).toLocaleString()}</strong>
            </div>
            <div class="summary-row">
              <span>Average Monthly EMI:</span>
              <strong>$${(userLoans.reduce((sum, l) => sum + (l.monthlyEMI || 0), 0) / userLoans.length || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
            </div>
          </div>
        ` : '<p style="color: #666; font-style: italic;">No active loans</p>'}

        <!-- Recent Payments Section -->
        <div class="section-title">RECENT PAYMENT HISTORY</div>
        ${userPayments.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Loan ID</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${userPayments.slice(0, 15).map(payment => `
                <tr>
                  <td>${new Date(payment.date).toLocaleDateString()}</td>
                  <td>${payment.loanId}</td>
                  <td class="amount">$${payment.amount?.toLocaleString()}</td>
                  <td>${payment.method || 'N/A'}</td>
                  <td><span class="status-active">${(payment.status || 'COMPLETED').toUpperCase()}</span></td>
                  <td>${payment.referenceId || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="color: #666; font-style: italic;">No recent payments</p>'}

        <!-- Account Summary -->
        <div class="section-title">ACCOUNT SUMMARY</div>
        <div class="summary-box">
          <div class="summary-row">
            <span>Total Loans (Active):</span>
            <strong>${userLoans.length}</strong>
          </div>
          <div class="summary-row">
            <span>Total Outstanding Amount:</span>
            <strong>$${userLoans.reduce((sum, l) => sum + (l.remaining || 0), 0).toLocaleString()}</strong>
          </div>
          <div class="summary-row">
            <span>Total Payments Made:</span>
            <strong>$${userPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</strong>
          </div>
          <div class="summary-row">
            <span>Credit Score:</span>
            <strong>${user?.profile?.creditScore || 'N/A'}</strong>
          </div>
          <div class="summary-row total">
            <span>Next Payment Due:</span>
            <strong>${userLoans.length > 0 ? new Date(userLoans[0].nextDue).toLocaleDateString() : 'N/A'}</strong>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
          <strong>Important Notice:</strong> This statement is generated for informational purposes only. 
          All figures reflect the status as of the statement date. For any discrepancies or inquiries, 
          please contact our customer support team. This document should be treated as confidential.
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>LoanMS - Loan Management System | Confidential</p>
          <p>This statement is for ${user?.name || 'Account'} only. If you received this in error, please contact support immediately.</p>
          <p>© 2024 LoanMS. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create PDF using browser's print to PDF functionality
  const printWindow = window.open('', '', '');
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// Alternative function to download as HTML-based PDF
export const downloadStatementAsHTML = (user, loans, payments, fileName = 'LoanStatement') => {
  const userLoans = loans.filter(loan => loan.borrowerId === user?.id);
  const userPayments = payments.filter(payment => payment.borrowerId === user?.id);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Loan Statement</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #0d9488; font-size: 28px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f3f4f6; color: #0d9488; padding: 10px; text-align: left; border-bottom: 2px solid #0d9488; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .amount { text-align: right; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LoanMS™ - Account Statement</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        <h3>Borrower: ${user?.name}</h3>
        <h4>Active Loans</h4>
        <table>
          <tr><th>Type</th><th>Amount</th><th>Outstanding</th><th>EMI</th><th>Status</th></tr>
          ${userLoans.map(l => `
            <tr>
              <td>${l.type}</td>
              <td class="amount">$${l.loanAmount?.toLocaleString()}</td>
              <td class="amount">$${l.remaining?.toLocaleString()}</td>
              <td class="amount">$${l.monthlyEMI?.toLocaleString()}</td>
              <td>${l.status}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Function to generate payment schedule as CSV
export const downloadPaymentScheduleAsCSV = (user, loans, fileName = 'PaymentSchedule') => {
  const userLoans = loans.filter(loan => loan.borrowerId === user?.id && loan.status === 'active');
  
  if (userLoans.length === 0) {
    console.warn('No active loans found');
    return;
  }

  // Create CSV header
  let csv = 'Loan Management System - Payment Schedule\n';
  csv += `Generated: ${new Date().toLocaleDateString()}\n`;
  csv += `Borrower: ${user?.name}\n\n`;
  csv += 'Loan ID,Loan Type,Due Date,EMI,Principal,Interest,Outstanding Balance,Status\n';

  // Add payment schedule data
  userLoans.forEach(loan => {
    csv += `${loan.id},${loan.type},${new Date(loan.nextDue).toLocaleDateString()},`;
    csv += `$${loan.monthlyEMI},Principal,Interest,$${loan.remaining},${loan.status}\n`;
  });

  // Create and download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
