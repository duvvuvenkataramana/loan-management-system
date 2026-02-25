// Export utilities for CSV and PDF generation

/**
 * Convert array of objects to CSV format
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  
  // If headers not provided, use keys from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      let cell = row[header];
      
      // Handle nested objects
      if (typeof cell === 'object' && cell !== null) {
        cell = JSON.stringify(cell);
      }
      
      // Handle undefined/null
      if (cell === undefined || cell === null) {
        cell = '';
      }
      
      // Escape quotes and wrap in quotes if contains comma
      cell = String(cell).replace(/"/g, '""');
      if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
        cell = `"${cell}"`;
      }
      
      return cell;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (data, filename = 'export.csv', headers = null) => {
  try {
    const csv = convertToCSV(data, headers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

/**
 * Generate basic PDF using HTML canvas approach
 * For production, consider using jsPDF library
 */
export const downloadPDF = (title, sections) => {
  try {
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return false;
    }
    
    // Build HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          h1 {
            color: #0d9488;
            border-bottom: 3px solid #0d9488;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          h2 {
            color: #0f766e;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: auto;
          }
          th {
            background-color: #0d9488;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }
          .info-item {
            padding: 10px;
            background-color: #f1f5f9;
            border-radius: 6px;
          }
          .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 16px;
            color: #1e293b;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #cbd5e1;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="no-print" style="margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="background: #64748b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-left: 10px; font-weight: 600;">
            Close
          </button>
        </div>
    `;
    
    sections.forEach(section => {
      htmlContent += `<h2>${section.title}</h2>`;
      
      if (section.type === 'table' && section.data && section.data.length > 0) {
        htmlContent += '<table>';
        
        // Headers
        const headers = section.headers || Object.keys(section.data[0]);
        htmlContent += '<thead><tr>';
        headers.forEach(header => {
          htmlContent += `<th>${header}</th>`;
        });
        htmlContent += '</tr></thead>';
        
        // Rows
        htmlContent += '<tbody>';
        section.data.forEach(row => {
          htmlContent += '<tr>';
          headers.forEach(header => {
            let value = row[header];
            if (typeof value === 'object' && value !== null) {
              value = JSON.stringify(value);
            }
            if (value === undefined || value === null) {
              value = '-';
            }
            htmlContent += `<td>${value}</td>`;
          });
          htmlContent += '</tr>';
        });
        htmlContent += '</tbody></table>';
      } else if (section.type === 'info' && section.data) {
        htmlContent += '<div class="info-grid">';
        Object.entries(section.data).forEach(([key, value]) => {
          htmlContent += `
            <div class="info-item">
              <div class="info-label">${key}</div>
              <div class="info-value">${value}</div>
            </div>
          `;
        });
        htmlContent += '</div>';
      } else if (section.type === 'text') {
        htmlContent += `<p>${section.content}</p>`;
      }
    });
    
    htmlContent += `
        <div class="footer">
          Generated on ${new Date().toLocaleString()} | Loan Management System
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Format loan data for export
 */
export const formatLoansForExport = (loans) => {
  return loans.map(loan => ({
    'Loan ID': loan.id,
    'Type': loan.type,
    'Amount': `$${loan.amount.toLocaleString()}`,
    'Remaining': `$${loan.remaining.toLocaleString()}`,
    'EMI': `$${loan.monthlyEMI.toLocaleString()}`,
    'Interest Rate': `${loan.interestRate}%`,
    'Tenure': `${loan.tenure} months`,
    'Status': loan.status,
    'Start Date': loan.startDate,
    'End Date': loan.endDate,
    'Paid': `${loan.paidInstallments}/${loan.totalInstallments}`,
  }));
};

/**
 * Format loan applications for export
 */
export const formatApplicationsForExport = (applications) => {
  return applications.map(app => ({
    'Application ID': app.id,
    'Loan Type': app.loanType,
    'Amount': `$${app.amount.toLocaleString()}`,
    'Tenure': `${app.tenure} months`,
    'Applicant': app.personalInfo?.fullName || '-',
    'Email': app.personalInfo?.email || '-',
    'Monthly Income': app.employmentInfo?.monthlyIncome ? `$${app.employmentInfo.monthlyIncome.toLocaleString()}` : '-',
    'Status': app.status,
    'Submitted': app.submittedDate,
  }));
};

/**
 * Format payments for export
 */
export const formatPaymentsForExport = (payments) => {
  return payments.map(payment => ({
    'Payment ID': payment.id,
    'Loan ID': payment.loanId,
    'Amount': `$${payment.amount.toLocaleString()}`,
    'Date': payment.date,
    'Method': payment.method,
    'Type': payment.type,
    'Status': payment.status,
  }));
};
