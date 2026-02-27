# TODO: Currency Format & Admin Dashboard Updates

## Task: Convert all currency to Rupees (₹) format and enhance Admin dashboard

### 1. Update Currency Format Functions
- [ ] `src/utils/finance.js` - Change formatCurrency from USD to INR
- [ ] `src/utils/exportData.js` - Change all $ to ₹ in format functions
- [ ] `src/utils/statementGenerator.js` - Change all $$ to ₹

### 2. Update Analyst Dashboard Pages
- [ ] `src/pages/Analyst/AnalyticsDashboard.jsx` - Change $ to ₹
- [ ] `src/pages/Analyst/FinancialAnalysis.jsx` - Uses formatCurrency (auto-fixed)
- [ ] `src/pages/Analyst/PortfolioView.jsx` - Check and update if needed

### 3. Update Other Pages with Currency
- [ ] Check and update any other pages with USD format

### 4. Admin Dashboard Enhancement
- [ ] Add working buttons to close/delete approved applications
- [ ] Add application management functionality to AdminOverview

### 5. Lender Functionality
- [ ] Add ability for lender to close/delete approved applications

## Progress:
- Started: Analyzing codebase and understanding current state
- In Progress: Implementing changes
