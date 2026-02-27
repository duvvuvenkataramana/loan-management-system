/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loadAppState, saveAppState } from '../api/mockApi';

const AppContext = createContext();

// Toast context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // System Settings - shared across all dashboards (Admin, Lender, Analyst, Borrower)
  const [loanTypes, setLoanTypes] = useState([
    { id: 1, name: 'Personal loan', rate: '10.4', tenureMin: 12, tenureMax: 36 },
    { id: 2, name: 'Auto loan', rate: '8.2', tenureMin: 24, tenureMax: 60 },
    { id: 3, name: 'Education loan', rate: '6.9', tenureMin: 36, tenureMax: 84 },
    { id: 4, name: 'Home loan', rate: '8.5', tenureMin: 120, tenureMax: 360 },
    { id: 5, name: 'Business loan', rate: '11.0', tenureMin: 12, tenureMax: 60 },
  ]);

  const [interestRules, setInterestRules] = useState([
    { id: 1, tier: 'Prime', minScore: 720, maxScore: 850, rate: '7.2' },
    { id: 2, tier: 'Standard', minScore: 660, maxScore: 719, rate: '9.4' },
    { id: 3, tier: 'Subprime', minScore: 0, maxScore: 659, rate: '12.8' },
  ]);

  const [penaltySettings, setPenaltySettings] = useState({
    lateFee: '2.5',
    gracePeriod: '7',
    defaultThreshold: '60',
  });

  // Toast system
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = (type, title, message, duration = 5000) => {
    const id = ++toastIdRef.current;
    const toast = { id, type, title, message };
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load state on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedState = await loadAppState();
        if (savedState) {
          setLoans(savedState.loans || []);
          setPayments(savedState.payments || []);
          setPaymentMethods(savedState.paymentMethods || []);
          setLoanApplications(savedState.loanApplications || []);
          setNotifications(savedState.notifications || []);
        } else {
          // Initialize with empty arrays - no mock data
          // Users will see empty loan list until they apply for a loan
          setLoans([]);
          setPayments([]);
          setPaymentMethods([]);
          setLoanApplications([]);
        }
      } catch (error) {
        console.error('Failed to load app state:', error);
        // Fallback - empty arrays instead of mock data
        setLoans([]);
        setPayments([]);
        setPaymentMethods([]);
        setLoanApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await saveAppState({
            loans,
            payments,
            paymentMethods,
            loanApplications,
            notifications
          });
        } catch (error) {
          console.error('Failed to save app state:', error);
        }
      };
      
      saveData();
    }
  }, [loans, payments, paymentMethods, loanApplications, notifications, isLoading]);

  // Loan operations
  const addLoan = (loan) => {
    const newLoan = {
      ...loan,
      id: `L-${Date.now()}`,
      status: 'active',
      paidInstallments: 0,
      remaining: loan.amount
    };
    setLoans([...loans, newLoan]);
    return newLoan;
  };

  const updateLoan = (loanId, updates) => {
    setLoans(loans.map(loan => 
      loan.id === loanId ? { ...loan, ...updates } : loan
    ));
  };

  const getLoanById = (loanId) => {
    return loans.find(loan => loan.id === loanId);
  };

  // Payment operations
  const addPayment = (payment) => {
    const newPayment = {
      ...payment,
      id: `P-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setPayments([...payments, newPayment]);
    
    // Update loan remaining balance
    if (payment.loanId) {
      const loan = loans.find(l => l.id === payment.loanId);
      if (loan) {
        updateLoan(payment.loanId, {
          remaining: loan.remaining - (payment.amount || 0),
          paidInstallments: loan.paidInstallments + 1
        });
      }
    }
    
    addNotification({
      type: 'success',
      message: `Payment of ₹${payment.amount} processed successfully`,
      title: 'Payment Successful'
    });
    
    return newPayment;
  };

  const getPaymentsByLoan = (loanId) => {
    return payments.filter(payment => payment.loanId === loanId);
  };

  const getPaymentsByBorrower = (borrowerId) => {
    return payments.filter(payment => payment.borrowerId === borrowerId);
  };

  // Payment method operations
  const addPaymentMethod = (method) => {
    const newMethod = {
      ...method,
      id: `PM-${Date.now()}`,
      isDefault: paymentMethods.length === 0
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    addNotification({
      type: 'success',
      message: 'Payment method added successfully',
      title: 'Success'
    });
    return newMethod;
  };

  const updatePaymentMethod = (methodId, updates) => {
    setPaymentMethods(paymentMethods.map(method =>
      method.id === methodId ? { ...method, ...updates } : method
    ));
  };

  const deletePaymentMethod = (methodId) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== methodId));
    addNotification({
      type: 'info',
      message: 'Payment method removed',
      title: 'Removed'
    });
  };

  const setDefaultPaymentMethod = (methodId) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));
  };

  // Loan application operations
  const submitLoanApplication = (application) => {
    const newApplication = {
      ...application,
      id: `LA-${Date.now()}`,
      status: application.status || 'pending',
      applicationDate: application.applicationDate || new Date().toISOString(),
      submittedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setLoanApplications([...loanApplications, newApplication]);
    addNotification({
      type: 'success',
      message: `Loan application ${newApplication.id} submitted successfully and sent to lender for review.`,
      title: 'Application Submitted'
    });
    return newApplication;
  };

  const confirmLoanApplication = (applicationId) => {
    const application = loanApplications.find(app => app.id === applicationId);
    if (application) {
      updateApplicationStatus(applicationId, 'waiting_lender_review');
      addNotification({
        type: 'info',
        message: `Application ${applicationId} waiting for lender review`,
        title: 'Waiting for Lender'
      });
    }
  };

  const approveLoanApplication = (applicationId) => {
    const application = loanApplications.find(app => app.id === applicationId);
    if (application) {
      updateApplicationStatus(applicationId, 'approved');
      // Create a loan from approved application
      const newLoan = {
        id: `L-${Date.now()}`,
        type: application.loanType,
        amount: application.amount,
        remaining: application.amount,
        monthlyEMI: application.emi,
        interestRate: application.interestRate,
        tenure: application.tenure,
        paidInstallments: 0,
        totalInstallments: application.tenure,
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + application.tenure * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        autoPay: false,
        borrowerId: application.borrowerId,
        lenderId: 1,
        applicationId: applicationId
      };
      setLoans([...loans, newLoan]);
      addNotification({
        type: 'success',
        message: `Loan ${newLoan.id} has been confirmed. Amount: ₹${application.amount}. Please check your dashboard.`,
        title: 'Loan Approved'
      });
    }
  };

  const updateApplicationStatus = (applicationId, status) => {
    setLoanApplications(loanApplications.map(app =>
      app.id === applicationId ? { ...app, status, updatedDate: new Date().toISOString() } : app
    ));
  };

  const getLoanApplicationsByBorrower = (borrowerId) => {
    return loanApplications.filter(app => app.borrowerId === borrowerId);
  };

  const getLoanApplicationById = (applicationId) => {
    return loanApplications.find(app => app.id === applicationId);
  };

  // Notification operations
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: `N-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications([newNotification, ...notifications]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const markNotificationRead = (notificationId) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const value = {
    // Loans
    loans,
    addLoan,
    updateLoan,
    getLoanById,
    
    // Payments
    payments,
    addPayment,
    getPaymentsByLoan,
    getPaymentsByBorrower,
    
    // Payment Methods
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    
    // Loan Applications
    loanApplications,
    submitLoanApplication,
    updateApplicationStatus,
    confirmLoanApplication,
    approveLoanApplication,
    getLoanApplicationsByBorrower,
    getLoanApplicationById,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    markNotificationRead,
    
    // Loading state
    isLoading,
    
    // System Settings - shared across all dashboards (Admin, Lender, Analyst, Borrower)
    loanTypes,
    setLoanTypes,
    interestRules,
    setInterestRules,
    penaltySettings,
    setPenaltySettings
  };

  const toastValue = {
    toasts,
    addToast,
    removeToast
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastContext.Provider value={toastValue}>
      <AppContext.Provider value={value}>
        {children}
        {/* Toast Stack */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`min-w-[320px] rounded-lg shadow-lg p-4 border-l-4 animate-slide-in ${
                toast.type === 'success' 
                  ? 'bg-white border-green-500' 
                  : toast.type === 'error'
                  ? 'bg-white border-red-500'
                  : 'bg-white border-blue-500'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{toast.title}</p>
                  {toast.message && (
                    <p className="text-sm text-slate-600 mt-1">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </AppContext.Provider>
    </ToastContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
