// Loans API - Serverless function for Vercel
// Handles loan CRUD operations

const STORAGE_KEY = 'loanAppState';

// In-memory storage for serverless environment
let loansCache = [];
let initialized = false;

const getState = () => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveState = (state) => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  const loanId = query.id;

  try {
    const state = getState() || {};
    loansCache = state.loans || [];
    initialized = true;

    switch (method) {
      case 'GET':
        if (loanId) {
          // Get single loan
          const loan = loansCache.find(l => l.id === loanId);
          if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
          }
          return res.status(200).json(loan);
        }
        // Get all loans or filter by borrower
        let result = loansCache;
        if (query.borrowerId) {
          result = result.filter(l => l.borrowerId === query.borrowerId);
        }
        if (query.status) {
          result = result.filter(l => l.status === query.status);
        }
        return res.status(200).json(result);

      case 'POST':
        // Create new loan
        const newLoan = {
          ...body,
          id: `L-${Date.now()}`,
          status: body.status || 'active',
          paidInstallments: 0,
          remaining: body.amount,
          createdAt: new Date().toISOString()
        };
        loansCache.push(newLoan);
        saveState({ ...state, loans: loansCache });
        return res.status(201).json(newLoan);

      case 'PUT':
        if (!loanId) {
          return res.status(400).json({ error: 'Loan ID required' });
        }
        const loanIndex = loansCache.findIndex(l => l.id === loanId);
        if (loanIndex === -1) {
          return res.status(404).json({ error: 'Loan not found' });
        }
        loansCache[loanIndex] = { ...loansCache[loanIndex], ...body, updatedAt: new Date().toISOString() };
        saveState({ ...state, loans: loansCache });
        return res.status(200).json(loansCache[loanIndex]);

      case 'DELETE':
        if (!loanId) {
          return res.status(400).json({ error: 'Loan ID required' });
        }
        const deleteIndex = loansCache.findIndex(l => l.id === loanId);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Loan not found' });
        }
        const deleted = loansCache.splice(deleteIndex, 1)[0];
        saveState({ ...state, loans: loansCache });
        return res.status(200).json(deleted);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Loans API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
