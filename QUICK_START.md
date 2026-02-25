# Quick Start Guide - Loan Management System

## 🚀 Test the Complete Workflow in 5 Minutes

### Step 1: Apply for Loan (as Borrower)
```
1. Login as Borrower
2. Click "Apply Loan" in sidebar
3. Fill the form:
   - Loan Type: Personal Loan
   - Amount: $10,000
   - Tenure: 12 months
   - Credit Score: 780 (important!)
4. Complete all 7 steps
5. Click "Submit Application"
✅ Application LA-XXXXX created
```

### Step 2: Approve Loan (as Lender)
```
1. Logout → Login as Lender
2. "Work Queue" opens automatically
3. Click on pending application
4. Review details (credit score, risk level)
5. Click "Approve" button
✅ Loan L-XXXXX automatically created!
✅ Borrower can now view and repay the loan
```

### Step 3: View Portfolio (as Analyst)
```
1. Logout → Login as Analyst
2. Analytics Dashboard opens automatically
3. See all loans and applications
4. Click "Download CSV" → CSV file downloads
5. Click "Download PDF" → Print window opens
✅ Working exports with real data!
```

---

## 🎯 What's New & Working

### ✅ Complete End-to-End Flow
- **Borrower applies** → Application created (status: pending)
- **Lender approves** → Loan automatically created (status: active)
- **Borrower manages** → Can view loan, make payments
- **Analyst tracks** → Sees everything in portfolio analytics

### ✅ Automatic Loan Creation
When lender clicks "Approve":
- System calculates EMI based on loan type interest rate
- Creates loan with start/end dates
- Sets next payment due date
- Links to original application
- Shows in borrower's active loans immediately

### ✅ Working CSV Export
- Click "Download CSV" → File downloads automatically
- Real data from your loans
- Opens in Excel, Google Sheets, etc.
- Format: `Loan ID, Type, Amount, EMI, Status...`

### ✅ Working PDF Export
- Click "Download PDF" → New window opens
- Professional formatted report
- Multiple sections (overview, tables, metrics)
- Use browser Print → Save as PDF
- Teal-themed, production-quality design

### ✅ Fixed Issues
- ✅ Analyst login now works
- ✅ Logout button works everywhere (sidebar + header dropdown)
- ✅ All roles functional (Borrower, Lender, Admin, Analyst)

---

## 📊 Export Locations

### Analyst → Analytics Dashboard
- **Download CSV** button → Portfolio data CSV
- **Download PDF** button → Portfolio report PDF

### Analyst → Report Builder
- **Export CSV** button → Custom report CSV
- **Export PDF** button → Custom report PDF

### Analyst → Portfolio View
- **CSV** button → Performance data CSV
- **PDF** button → Performance report PDF

---

## 💡 Pro Tips

1. **Credit Score Matters**
   - 750+: Low Risk (green)
   - 650-749: Medium Risk (yellow)
   - <650: High Risk (red)

2. **Interest Rates by Loan Type**
   - Personal: 10.5%
   - Home: 8.5%
   - Auto: 9.0%
   - Education: 7.5%
   - Business: 11.0%

3. **Persistence**
   - All data saves to localStorage automatically
   - Refresh page → Data persists
   - 400ms delay simulates server

4. **Export Tips**
   - CSV downloads automatically to Downloads folder
   - PDF opens in new tab → Use Ctrl+P or Print button
   - Choose "Save as PDF" in print dialog
   - Filename includes current date

---

## 🔍 Verify It's Working

### Test Checklist
- [ ] Login as Borrower works
- [ ] Can submit loan application
- [ ] Login as Lender works
- [ ] Application appears in Work Queue
- [ ] Click "Approve" creates loan
- [ ] Logout works (both sidebar and header)
- [ ] Login as Analyst works
- [ ] Portfolio shows data
- [ ] CSV download works
- [ ] PDF generation works

**All should be checked! ✅**

---

## 📁 Key Files Modified

```
src/
├── utils/
│   └── exportData.js           (NEW - CSV/PDF utilities)
├── context/
│   └── AuthContext.jsx         (+ ANALYST role)
├── components/
│   └── TopBar.jsx              (+ logout handler)
├── layouts/
│   └── DashboardLayout.jsx     (+ pass logout prop)
├── pages/
    ├── Lender/
    │   └── LoanReviewDetail.jsx   (+ auto-create loan on approve)
    └── Analyst/
        ├── AnalyticsDashboard.jsx (+ working CSV/PDF export)
        ├── ReportBuilder.jsx      (+ working CSV/PDF export)
        └── PortfolioView.jsx      (+ working CSV/PDF export)
```

---

## 🎓 Usage Example

```javascript
// In any component with access to loans data
import { downloadCSV, formatLoansForExport } from '../../utils/exportData';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';

const MyComponent = () => {
  const { loans } = useApp();
  const { addToast } = useToast();

  const handleExport = () => {
    const formattedData = formatLoansForExport(loans);
    const success = downloadCSV(formattedData, 'my-export.csv');
    
    if (success) {
      addToast('success', 'Exported', 'Data exported successfully');
    } else {
      addToast('error', 'Failed', 'Export failed');
    }
  };

  return <button onClick={handleExport}>Export</button>;
};
```

---

## 🎉 Success!

Your loan management system now has:
- ✅ Complete loan application → approval → disbursement flow
- ✅ Automatic loan creation on approval
- ✅ Real CSV file downloads
- ✅ Professional PDF report generation
- ✅ Full data persistence
- ✅ All 4 roles working (Borrower, Lender, Admin, Analyst)
- ✅ Toast notifications everywhere
- ✅ Working logout functionality

**The project is production-ready for demonstration!** 🚀

---

Last Updated: February 23, 2026
