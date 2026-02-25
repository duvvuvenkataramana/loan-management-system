const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get token
const getToken = () => localStorage.getItem('token');

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getMe: () => apiRequest('/auth/me'),

  updateProfile: (userData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Loans API
export const loansAPI = {
  applyForLoan: (loanData) => apiRequest('/loans/apply', {
    method: 'POST',
    body: JSON.stringify(loanData),
  }),

  getMyLoans: () => apiRequest('/loans/my-loans'),

  getAllLoans: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/loans${queryString ? `?${queryString}` : ''}`);
  },

  getLoanById: (id) => apiRequest(`/loans/${id}`),

  updateLoanStatus: (id, statusData) => apiRequest(`/loans/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),

  getDashboardStats: () => apiRequest('/loans/stats/dashboard'),
};

export default { authAPI, loansAPI };
