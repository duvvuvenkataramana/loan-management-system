/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Storage keys
const USERS_STORAGE_KEY = 'lms_users';
const CURRENT_USER_STORAGE_KEY = 'lms_currentUser';

// Default demo users
const DEFAULT_USERS = [
  { 
    id: 1, 
    username: 'borrower', 
    password: '1234', 
    name: 'John Doe', 
    email: 'john.doe@example.com',
    phone: '+1-555-0101',
    role: 'BORROWER',
    profile: {
      dob: '1990-05-15',
      maritalStatus: 'single',
      dependents: 1,
      employmentType: 'salaried',
      employer: 'Tech Innovations Inc',
      designation: 'Senior Developer',
      workExperience: '8',
      monthlyIncome: 50000,
      existingLoans: 'no',
      creditScore: 750,
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102',
      createdAt: new Date().toISOString()
    }
  },
  { 
    id: 2, 
    username: 'lender', 
    password: '1234', 
    name: 'Global Finance Corp', 
    email: 'info@globalfinance.com',
    phone: '+1-555-0102',
    role: 'LENDER',
    profile: {
      companyName: 'Global Finance Corporation',
      registrationNumber: 'GFC-2024-001',
      createdAt: new Date().toISOString()
    }
  },
  { 
    id: 3, 
    username: 'admin', 
    password: '1234', 
    name: 'Super Admin', 
    email: 'admin@loansystem.com',
    phone: '+1-555-0103',
    role: 'ADMIN',
    profile: {
      department: 'Administration',
      createdAt: new Date().toISOString()
    }
  },
  { 
    id: 4, 
    username: 'analyst', 
    password: '1234', 
    name: 'Data Analyst', 
    email: 'analyst@loansystem.com',
    phone: '+1-555-0104',
    role: 'ANALYST',
    profile: {
      department: 'Analytics',
      createdAt: new Date().toISOString()
    }
  },
];

// Initialize storage with default users if not present
const initializeStorage = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  }
};

const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    initializeStorage();
    return getCurrentUser();
  });
  const isLoading = false;

  const login = (username, password) => {
    const users = getUsers();
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setCurrentUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid username or password' };
  };

  const signup = (userData) => {
    const users = getUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
      return { success: false, error: 'Username already exists' };
    }

    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username: userData.username,
      password: userData.password,
      name: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: 'BORROWER', // New users default as borrower
      profile: {
        dob: userData.dob,
        maritalStatus: userData.maritalStatus,
        dependents: userData.dependents,
        employmentType: userData.employmentType,
        employer: userData.employer,
        designation: userData.designation,
        workExperience: userData.workExperience,
        monthlyIncome: userData.monthlyIncome,
        existingLoans: userData.existingLoans,
        creditScore: userData.creditScore,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        createdAt: new Date().toISOString()
      }
    };

    // Save to storage
    users.push(newUser);
    saveUsers(users);

    // Log the user in
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setCurrentUser(userWithoutPassword);

    return { success: true, user: userWithoutPassword };
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  const updateUserProfile = (userId, profileData) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        ...profileData,
        profile: {
          ...users[userIndex].profile,
          ...profileData.profile
        }
      };
      saveUsers(users);
      
      const updatedUser = users[userIndex];
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      setCurrentUser(userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'User not found' };
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUserProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);