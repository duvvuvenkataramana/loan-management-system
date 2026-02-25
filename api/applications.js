// Loan Applications API - Serverless function for Vercel
// Handles loan application operations

const STORAGE_KEY = 'loanAppState';

let applicationsCache = [];

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
  const applicationId = query.id;

  try {
    const state = getState() || {};
    applicationsCache = state.loanApplications || [];

    switch (method) {
      case 'GET':
        if (applicationId) {
          // Get single application
          const application = applicationsCache.find(app => app.id === applicationId);
          if (!application) {
            return res.status(404).json({ error: 'Application not found' });
          }
          return res.status(200).json(application);
        }
        // Get all applications or filter
        let result = applicationsCache;
        if (query.borrowerId) {
          result = result.filter(app => app.borrowerId === query.borrowerId);
        }
        if (query.lenderId) {
          result = result.filter(app => app.lenderId === query.lenderId);
        }
        if (query.status) {
          result = result.filter(app => app.status === query.status);
        }
        return res.status(200).json(result);

      case 'POST':
        // Submit new application
        const newApplication = {
          ...body,
          id: `LA-${Date.now()}`,
          status: body.status || 'pending',
          applicationDate: body.applicationDate || new Date().toISOString(),
          submittedDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        applicationsCache.push(newApplication);
        saveState({ ...state, loanApplications: applicationsCache });
        return res.status(201).json(newApplication);

      case 'PUT':
        if (!applicationId) {
          return res.status(400).json({ error: 'Application ID required' });
        }
        const appIndex = applicationsCache.findIndex(app => app.id === applicationId);
        if (appIndex === -1) {
          return res.status(404).json({ error: 'Application not found' });
        }
        applicationsCache[appIndex] = { 
          ...applicationsCache[appIndex], 
          ...body, 
          updatedAt: new Date().toISOString() 
        };
        saveState({ ...state, loanApplications: applicationsCache });
        return res.status(200).json(applicationsCache[appIndex]);

      case 'DELETE':
        if (!applicationId) {
          return res.status(400).json({ error: 'Application ID required' });
        }
        const deleteIndex = applicationsCache.findIndex(app => app.id === applicationId);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Application not found' });
        }
        const deleted = applicationsCache.splice(deleteIndex, 1)[0];
        saveState({ ...state, loanApplications: applicationsCache });
        return res.status(200).json(deleted);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Applications API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
