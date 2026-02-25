// Authentication API - Serverless function for Vercel
// Handles user authentication operations

const STORAGE_KEY = 'loanAppState';

// Default users for the system
const DEFAULT_USERS = [
  { id: 1, username: 'admin', password: '1234', role: 'admin', name: 'Admin User', email: 'admin@loanms.com' },
  { id: 2, username: 'lender', password: '1234', role: 'lender', name: 'Lender User', email: 'lender@loanms.com' },
  { id: 3, username: 'borrower', password: '1234', role: 'borrower', name: 'Borrower User', email: 'borrower@loanms.com' },
  { id: 4, username: 'analyst', password: '1234', role: 'analyst', name: 'Analyst User', email: 'analyst@loanms.com' }
];

let usersCache = [];
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

const initializeUsers = () => {
  if (!initialized) {
    const state = getState();
    usersCache = state?.users || [...DEFAULT_USERS];
    initialized = true;
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

  initializeUsers();

  try {
    switch (method) {
      case 'POST':
        // Handle different auth actions
        const action = body.action;

        if (action === 'login') {
          // Login user
          const { username, password } = body;
          const user = usersCache.find(u => u.username === username && u.password === password);
          
          if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Return user without password
          const { password: _, ...userWithoutPassword } = user;
          return res.status(200).json({ 
            success: true, 
            user: userWithoutPassword,
            token: `token-${Date.now()}-${user.id}`
          });
        }

        if (action === 'register') {
          // Register new user
          const { username, email, name, password, role } = body;
          
          // Check if username exists
          if (usersCache.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
          }

          // Check if email exists
          if (usersCache.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already exists' });
          }

          const newUser = {
            id: usersCache.length + 1,
            username,
            email,
            name,
            password,
            role: role || 'borrower',
            createdAt: new Date().toISOString()
          };

          usersCache.push(newUser);
          
          // Save to state
          const state = getState() || {};
          saveState({ ...state, users: usersCache });

          // Return user without password
          const { password: _, ...userWithoutPassword } = newUser;
          return res.status(201).json({ 
            success: true, 
            user: userWithoutPassword,
            token: `token-${Date.now()}-${newUser.id}`
          });
        }

        if (action === 'logout') {
          // Logout - just return success
          return res.status(200).json({ success: true, message: 'Logged out successfully' });
        }

        return res.status(400).json({ error: 'Invalid action' });

      case 'GET':
        // Get user by ID
        const userId = query.id;
        if (userId) {
          const user = usersCache.find(u => u.id === parseInt(userId));
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          const { password: _, ...userWithoutPassword } = user;
          return res.status(200).json(userWithoutPassword);
        }
        
        // Get all users (without passwords)
        const usersWithoutPassword = usersCache.map(({ password: _, ...u }) => u);
        return res.status(200).json(usersWithoutPassword);

      case 'PUT':
        // Update user
        const updateId = query.id || body.id;
        if (!updateId) {
          return res.status(400).json({ error: 'User ID required' });
        }
        
        const userIndex = usersCache.findIndex(u => u.id === parseInt(updateId));
        if (userIndex === -1) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Don't allow role change through this endpoint
        const { role, ...updateData } = body;
        usersCache[userIndex] = { 
          ...usersCache[userIndex], 
          ...updateData,
          updatedAt: new Date().toISOString() 
        };
        
        // Save to state
        const state = getState() || {};
        saveState({ ...state, users: usersCache });

        // Return user without password
        const { password: __, ...updatedUser } = usersCache[userIndex];
        return res.status(200).json(updatedUser);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
