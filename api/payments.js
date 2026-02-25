// Payments API - Serverless function for Vercel
// Handles payment processing operations

const STORAGE_KEY = 'loanAppState';

let paymentsCache = [];
let loansCache = [];

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
  const paymentId = query.id;

  try {
    const state = getState() || {};
    paymentsCache = state.payments || [];
    loansCache = state.loans || [];

    switch (method) {
      case 'GET':
        if (paymentId) {
          // Get single payment
          const payment = paymentsCache.find(p => p.id === paymentId);
          if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
          }
          return res.status(200).json(payment);
        }
        // Get all payments or filter
        let result = paymentsCache;
        if (query.loanId) {
          result = result.filter(p => p.loanId === query.loanId);
        }
        if (query.borrowerId) {
          result = result.filter(p => p.borrowerId === query.borrowerId);
        }
        if (query.status) {
          result = result.filter(p => p.status === query.status);
        }
        return res.status(200).json(result);

      case 'POST':
        // Process new payment
        const newPayment = {
          ...body,
          id: `P-${Date.now()}`,
          date: body.date || new Date().toISOString().split('T')[0],
          status: body.status || 'completed',
          createdAt: new Date().toISOString()
        };
        paymentsCache.push(newPayment);

        // Update loan remaining balance
        if (body.loanId) {
          const loanIndex = loansCache.findIndex(l => l.id === body.loanId);
          if (loanIndex !== -1) {
            const loan = loansCache[loanIndex];
            loansCache[loanIndex] = {
              ...loan,
              remaining: (loan.remaining || loan.amount) - (body.amount || 0),
              paidInstallments: (loan.paidInstallments || 0) + 1,
              updatedAt: new Date().toISOString()
            };
          }
        }

        saveState({ ...state, payments: paymentsCache, loans: loansCache });
        return res.status(201).json(newPayment);

      case 'PUT':
        if (!paymentId) {
          return res.status(400).json({ error: 'Payment ID required' });
        }
        const paymentIndex = paymentsCache.findIndex(p => p.id === paymentId);
        if (paymentIndex === -1) {
          return res.status(404).json({ error: 'Payment not found' });
        }
        paymentsCache[paymentIndex] = { 
          ...paymentsCache[paymentIndex], 
          ...body, 
          updatedAt: new Date().toISOString() 
        };
        saveState({ ...state, payments: paymentsCache });
        return res.status(200).json(paymentsCache[paymentIndex]);

      case 'DELETE':
        if (!paymentId) {
          return res.status(400).json({ error: 'Payment ID required' });
        }
        const deleteIndex = paymentsCache.findIndex(p => p.id === paymentId);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Payment not found' });
        }
        const deleted = paymentsCache.splice(deleteIndex, 1)[0];
        saveState({ ...state, payments: paymentsCache });
        return res.status(200).json(deleted);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Payments API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
