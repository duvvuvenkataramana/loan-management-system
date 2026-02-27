import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateEMI } from '../../utils/finance';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  User, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Home,
  Car,
  GraduationCap,
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  Calendar,
  Activity,
  PieChart as PieChartIcon,
  ChevronDown,
  Shield,
  Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ApplyLoan = () => {
  const navigate = useNavigate();
  const { submitLoanApplication, loanTypes: globalLoanTypes } = useApp();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [submittedApp, setSubmittedApp] = useState(null);
  
  // Initialize formData with user profile data or localStorage
  const getInitialFormData = () => {
    // Check if there's saved form data in localStorage
    const savedFormData = localStorage.getItem('loanApplicationFormData');
    if (savedFormData) {
      try {
        return JSON.parse(savedFormData);
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
    
    // Return default form data
    return {
      // Loan Details
      loanType: 'personal',
      amount: 10000,
      tenure: 12,
      purpose: '',
      
      // Personal Information (pre-filled from user profile)
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dob: user?.profile?.dob || '',
      maritalStatus: user?.profile?.maritalStatus || 'single',
      dependents: user?.profile?.dependents?.toString() || '0',
      
      // Employment Information (pre-filled from user profile)
      employmentType: user?.profile?.employmentType || 'salaried',
      employer: user?.profile?.employer || '',
      designation: user?.profile?.designation || '',
      workExperience: user?.profile?.workExperience?.toString() || '',
      monthlyIncome: user?.profile?.monthlyIncome?.toString() || '',
      
      // Financial Information (pre-filled from user profile)
      existingLoans: user?.profile?.existingLoans || 'no',
      existingEMI: '',
      creditCard: 'no',
      creditScore: user?.profile?.creditScore?.toString() || '',
      
      // Address (pre-filled from user profile)
      address: user?.profile?.address || '',
      city: user?.profile?.city || '',
      state: user?.profile?.state || '',
      zipCode: user?.profile?.zipCode || '',
      
      // Documents
      documents: {
        idProof: null,
        incomeProof: null,
        addressProof: null,
        bankStatement: null
      },
      
      // Step 6 Consents
      termsAccepted: false,
      privacyAccepted: false,
      verificationAccepted: false
    };
  };
  
  const [formData, setFormData] = useState(getInitialFormData());

  const [eligibility, setEligibility] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [autoSaved, setAutoSaved] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('loanApplicationFormData', JSON.stringify(formData));
    
    // Show auto-save indicator after a brief delay to avoid synchronous setState
    const showTimer = setTimeout(() => setAutoSaved(true), 100);
    const hideTimer = setTimeout(() => setAutoSaved(false), 2100);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [formData]);

  // Use global loanTypes from Admin System Config - map to display format
  const loanTypes = globalLoanTypes && globalLoanTypes.length > 0 
    ? globalLoanTypes.map(lt => ({
        id: lt.name.toLowerCase().replace(/\s+/g, '_'),
        name: lt.name,
        rate: parseFloat(lt.rate) || 10,
        maxAmount: lt.tenureMax * 10000 || 50000,
        color: lt.name.toLowerCase().includes('personal') ? 'teal' : 
               lt.name.toLowerCase().includes('home') ? 'blue' : 
               lt.name.toLowerCase().includes('auto') ? 'purple' : 
               lt.name.toLowerCase().includes('education') ? 'emerald' : 'amber',
        icon: lt.name.toLowerCase().includes('personal') ? User :
              lt.name.toLowerCase().includes('home') ? Home :
              lt.name.toLowerCase().includes('auto') ? Car :
              lt.name.toLowerCase().includes('education') ? GraduationCap : ShoppingBag
      }))
    : [
        { id: 'personal', name: 'Personal Loan', icon: User, rate: 10.5, maxAmount: 50000, color: 'teal' },
        { id: 'home', name: 'Home Loan', icon: Home, rate: 8.5, maxAmount: 500000, color: 'blue' },
        { id: 'auto', name: 'Auto Loan', icon: Car, rate: 9.0, maxAmount: 100000, color: 'purple' },
        { id: 'education', name: 'Education Loan', icon: GraduationCap, rate: 7.5, maxAmount: 200000, color: 'emerald' },
        { id: 'business', name: 'Business Loan', icon: ShoppingBag, rate: 11.0, maxAmount: 150000, color: 'amber' },
      ];

  const selectedLoan = loanTypes.find(loan => loan.id === formData.loanType) || loanTypes[0];
  const interestRate = selectedLoan.rate;
  
  // Safe calculation with fallbacks
  const calculateSafeEMI = () => {
    try {
      const amount = parseFloat(formData.amount) || 0;
      const tenure = parseInt(formData.tenure) || 1;
      if (amount <= 0 || tenure <= 0) return 0;
      return parseFloat(calculateEMI(amount, interestRate, tenure)) || 0;
    } catch(e) {
      console.error('EMI calculation error:', e);
      return 0;
    }
  };
  
  const emi = calculateSafeEMI();
  const totalPayable = emi * (parseInt(formData.tenure) || 1);
  const totalInterest = totalPayable - (parseFloat(formData.amount) || 0);

  // EMI Breakdown Data for Chart - commented out since Step 6 no longer uses charts
  // const emiBreakdownData = [
  //   { name: 'Principal', value: Math.max(0, parseFloat(formData.amount) || 0), color: '#0d9488' },
  //   { name: 'Interest', value: Math.max(0, isNaN(totalInterest) ? 0 : totalInterest), color: '#f59e0b' }
  // ].filter(item => item.value > 0);

  // Monthly Payment Schedule - commented out since Step 6 no longer uses charts
  // const monthlySchedule = Array.from({ length: Math.min(12, parseInt(formData.tenure) || 1) }, (_, i) => {
  //   const amount = parseFloat(formData.amount) || 0;
  //   const tenure = parseInt(formData.tenure) || 1;
  //   const principalValue = tenure > 0 ? amount / tenure : 0;
  //   const interestValue = emi > principalValue ? emi - principalValue : 0;
  //   return {
  //     month: i + 1,
  //     principal: Math.max(0, parseFloat(principalValue.toFixed(2)) || 0),
  //     interest: Math.max(0, parseFloat(interestValue.toFixed(2)) || 0)
  //   };
  // });

  const checkEligibility = () => {
    const income = parseFloat(formData.monthlyIncome) || 0;
    const existingEMI = parseFloat(formData.existingEMI) || 0;
    const availableIncome = income - existingEMI;
    const maxEMI = availableIncome * 0.5; // 50% of available income
    const tenure = parseInt(formData.tenure) || 1;
    
    const eligible = emi <= maxEMI && income >= 3000;
    const eligibilityPercentage = Math.min(100, emi > 0 ? (maxEMI / emi) * 100 : 0);
    
    setEligibility({
      eligible,
      percentage: eligibilityPercentage.toFixed(0),
      maxLoanAmount: (maxEMI * tenure).toFixed(0),
      message: eligible 
        ? 'Congratulations! You are eligible for this loan.' 
        : 'Based on your income, you may need to reduce the loan amount or increase the tenure.'
    });
  };

  const handleFileUpload = (docType, file) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [docType]: file
      }
    });
  };

  // Validation functions for each step
  const validateStep1 = () => {
    // Step 1: Loan Type and Amount - required
    if (!formData.loanType) return 'Please select a loan type';
    if (!formData.amount || parseFloat(formData.amount) <= 0) return 'Please enter a valid loan amount';
    if (!formData.tenure || parseInt(formData.tenure) <= 0) return 'Please select a tenure';
    return '';
  };

  const validateStep2 = () => {
    // Step 2: Personal Information - required
    if (!formData.fullName || !formData.fullName.trim()) return 'Full name is required';
    if (!formData.email || !formData.email.trim()) return 'Email address is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address';
    if (!formData.phone || !formData.phone.trim()) return 'Phone number is required';
    if (!formData.dob) return 'Date of birth is required';
    return '';
  };

  const validateStep3 = () => {
    // Step 3: Employment Information - required
    if (!formData.employer || !formData.employer.trim()) return 'Employer name is required';
    if (!formData.designation || !formData.designation.trim()) return 'Designation is required';
    if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) return 'Monthly income must be greater than 0';
    return '';
  };

  const validateStep4 = () => {
    // Step 4: Address - required
    if (!formData.address || !formData.address.trim()) return 'Street address is required';
    if (!formData.city || !formData.city.trim()) return 'City is required';
    if (!formData.state || !formData.state.trim()) return 'State is required';
    if (!formData.zipCode || !formData.zipCode.trim()) return 'Zip code is required';
    return '';
  };

  const validateStep5 = () => {
    // Step 5: Documents - Optional for demo purposes
    // In production, you would enforce document uploads
    // For now, we'll allow users to proceed without documents
    return '';
  };

  const nextStep = () => {
    setValidationError('');
    let error = '';

    if (step === 1) {
      error = validateStep1();
    } else if (step === 2) {
      error = validateStep2();
    } else if (step === 3) {
      error = validateStep3();
    } else if (step === 4) {
      error = validateStep4();
    } else if (step === 5) {
      error = validateStep5();
    }

    if (error) {
      setValidationError(error);
      return;
    }

    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    setValidationError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Validate all steps before submission
    const validationErrors = [];
    
    // Step 2 validation
    if (!formData.fullName || !formData.fullName.trim()) validationErrors.push('Full name is required');
    if (!formData.email || !formData.email.trim()) validationErrors.push('Email address is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) validationErrors.push('Please enter a valid email address');
    if (!formData.phone || !formData.phone.trim()) validationErrors.push('Phone number is required');
    if (!formData.dob) validationErrors.push('Date of birth is required');
    
    // Step 3 validation
    if (!formData.employer || !formData.employer.trim()) validationErrors.push('Employer name is required');
    if (!formData.designation || !formData.designation.trim()) validationErrors.push('Designation is required');
    if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) validationErrors.push('Monthly income must be greater than 0');
    
    // Step 4 validation
    if (!formData.address || !formData.address.trim()) validationErrors.push('Street address is required');
    if (!formData.city || !formData.city.trim()) validationErrors.push('City is required');
    if (!formData.state || !formData.state.trim()) validationErrors.push('State is required');
    if (!formData.zipCode || !formData.zipCode.trim()) validationErrors.push('Zip code is required');
    
    // Step 5 validation - Documents are optional for demo purposes
    // In production, you would enforce: if (!formData.documents.idProof) validationErrors.push('ID Proof is required');

    if (validationErrors.length > 0) {
      addToast('error', 'Validation Error', validationErrors[0]);
      return;
    }

    // Create application object with all details
    const application = {
      borrowerId: user?.id,
      borrowerName: user?.name,
      borrowerEmail: user?.email,
      
      // Loan Details
      loanType: formData.loanType,
      amount: parseFloat(formData.amount),
      tenure: parseInt(formData.tenure),
      purpose: formData.purpose,
      emi: emi,
      interestRate: interestRate,
      totalPayable: totalPayable,
      totalInterest: totalInterest,
      
      // Personal Information
      personalInfo: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        maritalStatus: formData.maritalStatus,
        dependents: parseInt(formData.dependents)
      },
      
      // Employment Information
      employmentInfo: {
        employmentType: formData.employmentType,
        employer: formData.employer,
        designation: formData.designation,
        workExperience: parseInt(formData.workExperience) || 0,
        monthlyIncome: parseFloat(formData.monthlyIncome)
      },
      
      // Financial Information
      financialInfo: {
        existingLoans: formData.existingLoans,
        existingEMI: parseFloat(formData.existingEMI) || 0,
        creditCard: formData.creditCard,
        creditScore: parseInt(formData.creditScore) || 0
      },
      
      // Address
      address: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      },
      
      // Documents uploaded by borrower (for lender to review)
      documents: {
        idProof: formData.documents.idProof ? formData.documents.idProof.name : null,
        incomeProof: formData.documents.incomeProof ? formData.documents.incomeProof.name : null,
        addressProof: formData.documents.addressProof ? formData.documents.addressProof.name : null,
        bankStatement: formData.documents.bankStatement ? formData.documents.bankStatement.name : null,
      },
      
      // Metadata
      applicationDate: new Date().toISOString(),
      status: 'pending'  // Now goes directly to lender for review
    };

    // Submit application
    const result = submitLoanApplication(application);
    
    // Clear the saved form data from localStorage
    localStorage.removeItem('loanApplicationFormData');
    
    // Show success state
    setSubmittedApp(result);
    addToast('success', 'Application Submitted', `Application ${result.id} has been submitted to the lender for review!`);
    
    // Navigate after delay
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <React.Fragment key={s}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm transition-all ${
            step === s 
              ? 'bg-teal-600 border-teal-600 text-white' 
              : step > s 
                ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-400'
          }`}>
            {step > s ? <CheckCircle size={20} /> : s}
          </div>
          {s < 6 && (
            <div className={`w-16 h-1 ${step > s ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Loan Type</h2>
        <p className="text-sm text-slate-600">Select the type of loan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loanTypes.map((loan) => {
          const Icon = loan.icon;
          const isSelected = formData.loanType === loan.id;
          return (
            <button
              key={loan.id}
              onClick={() => setFormData({ ...formData, loanType: loan.id })}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? `border-${loan.color}-500 bg-${loan.color}-50 shadow-lg`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <Icon size={32} className={`mx-auto mb-3 ${isSelected ? `text-${loan.color}-600` : 'text-slate-400'}`} />
              <p className={`text-sm font-bold ${isSelected ? `text-${loan.color}-900` : 'text-slate-900'}`}>{loan.name}</p>
              <p className="text-xs text-slate-600 mt-1">{loan.rate}% p.a.</p>
              <p className="text-xs text-slate-500 mt-1">Up to ₹{(loan.maxAmount / 1000).toFixed(0)}K</p>
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">Loan Amount</label>
          <input
            type="range"
            min="1000"
            max={selectedLoan.maxAmount}
            step="1000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
            className="w-full h-3 bg-teal-200 rounded-full appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-3xl font-black text-teal-900">₹{Number(formData.amount || 0).toLocaleString()}</span>
            <span className="text-sm text-slate-600">Max: ₹{selectedLoan.maxAmount.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">Loan Tenure</label>
          <select
            value={formData.tenure}
            onChange={(e) => setFormData({ ...formData, tenure: parseInt(e.target.value) })}
            className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
          >
            <option value="6">6 Months</option>
            <option value="12">12 Months (1 Year)</option>
            <option value="24">24 Months (2 Years)</option>
            <option value="36">36 Months (3 Years)</option>
            <option value="48">48 Months (4 Years)</option>
            <option value="60">60 Months (5 Years)</option>
            {formData.loanType === 'home' && (
              <>
                <option value="120">120 Months (10 Years)</option>
                <option value="180">180 Months (15 Years)</option>
                <option value="240">240 Months (20 Years)</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">Loan Purpose</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="Please describe the purpose of this loan..."
            className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white resize-none"
            rows="3"
          />
        </div>
      </div>

      {/* EMI Calculator Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border border-teal-200 p-6">
          <p className="text-xs uppercase tracking-wider text-teal-700 font-bold">Monthly EMI</p>
          <p className="text-3xl font-black text-teal-900 mt-2">₹{Number(emi || 0).toLocaleString()}</p>
          <p className="text-xs text-teal-700 mt-1">@ {interestRate}% p.a.</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
          <p className="text-xs uppercase tracking-wider text-blue-700 font-bold">Total Interest</p>
          <p className="text-3xl font-black text-blue-900 mt-2">₹{Number(totalInterest || 0).toLocaleString()}</p>
          <p className="text-xs text-blue-700 mt-1">{Number(formData.amount) > 0 ? ((totalInterest / Number(formData.amount)) * 100).toFixed(1) : 0}% of principal</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
          <p className="text-xs uppercase tracking-wider text-purple-700 font-bold">Total Payable</p>
          <p className="text-3xl font-black text-purple-900 mt-2">₹{Number(totalPayable || 0).toLocaleString()}</p>
          <p className="text-xs text-purple-700 mt-1">Over {formData.tenure} months</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
        <p className="text-sm text-slate-600">Please provide your personal details</p>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Date of Birth *</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Marital Status</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Number of Dependents</label>
            <select
              value={formData.dependents}
              onChange={(e) => setFormData({ ...formData, dependents: e.target.value })}
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Employment & Financial Information</h2>
        <p className="text-sm text-slate-600">Help us understand your financial situation</p>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Employment Type *</label>
            <select
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="salaried">Salaried</option>
              <option value="self-employed">Self-Employed</option>
              <option value="business">Business Owner</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Employer/Company Name *</label>
            <input
              type="text"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              placeholder="Enter company name"
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Designation/Title *</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g., Senior Developer"
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Work Experience (Years) *</label>
            <input
              type="number"
              value={formData.workExperience}
              onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
              placeholder="5"
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-900 mb-2">Monthly Income (Net) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">₹</span>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                placeholder="5000"
                className="w-full rounded-xl border-2 border-teal-200 pl-8 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white font-bold"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-teal-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Do you have existing loans?</label>
              <select
                value={formData.existingLoans}
                onChange={(e) => setFormData({ ...formData, existingLoans: e.target.value })}
                className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {formData.existingLoans === 'yes' && (
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Total Existing EMI *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">₹</span>
                  <input
                    type="number"
                    value={formData.existingEMI}
                    onChange={(e) => setFormData({ ...formData, existingEMI: e.target.value })}
                    placeholder="500"
                    className="w-full rounded-xl border-2 border-teal-200 pl-8 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Do you have a credit card?</label>
              <select
                value={formData.creditCard}
                onChange={(e) => setFormData({ ...formData, creditCard: e.target.value })}
                className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Credit Score (if known)</label>
              <input
                type="number"
                value={formData.creditScore}
                onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                placeholder="750"
                min="300"
                max="850"
                className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Eligibility Checker */}
        {formData.monthlyIncome && (
          <div className="pt-6 border-t border-teal-100">
            <button
              onClick={checkEligibility}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-xl font-bold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2"
            >
              <Activity size={20} />
              Check Loan Eligibility
            </button>

            {eligibility && (
              <div className={`mt-4 p-6 rounded-xl border-2 ${
                eligibility.eligible 
                  ? 'bg-emerald-50 border-emerald-300' 
                  : 'bg-amber-50 border-amber-300'
              }`}>
                <div className="flex items-start gap-3">
                  {eligibility.eligible ? (
                    <CheckCircle size={24} className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={24} className="text-amber-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className={`text-lg font-bold ${
                      eligibility.eligible ? 'text-emerald-900' : 'text-amber-900'
                    }`}>
                      {eligibility.eligible ? 'Eligible!' : 'Partially Eligible'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {eligibility.message}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Eligibility Score</p>
                        <p className="text-2xl font-black text-slate-900">{eligibility.percentage}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Max Loan Amount</p>
                        <p className="text-2xl font-black text-slate-900">₹{parseFloat(eligibility.maxLoanAmount).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Residential Address</h2>
        <p className="text-sm text-slate-600">Please provide your residential address details</p>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Street Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street, Apt 4B"
              className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
                className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="NY"
                className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">ZIP Code *</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="10001"
                className="w-full rounded-xl border-2 border-teal-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>

          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mt-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-cyan-900">Address Verification</p>
              <p className="text-xs text-cyan-700 mt-1">We'll verify your address using official documents uploaded in the next step.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Document Upload</h2>
        <p className="text-sm text-slate-600">Please upload the required documents to process your application (Optional for demo)</p>
      </div>

      {/* Info Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-teal-900">Demo Mode</p>
          <p className="text-xs text-teal-700 mt-1">Document upload is optional for testing purposes. You can proceed to the next step without uploading files.</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-8 space-y-6">
        {[
          { id: 'idProof', label: 'ID Proof', desc: 'Passport, Driver\'s License, or National ID', required: false },
          { id: 'incomeProof', label: 'Income Proof', desc: 'Salary slips, Tax returns, or Bank statements', required: false },
          { id: 'addressProof', label: 'Address Proof', desc: 'Utility bill, Rental agreement, or Bank statement', required: false },
          { id: 'bankStatement', label: 'Bank Statement', desc: 'Last 6 months bank statement', required: false },
        ].map((doc) => (
          <div key={doc.id} className="border-2 border-dashed border-teal-200 rounded-xl p-6 hover:border-teal-400 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {doc.label} {doc.required && <span className="text-rose-500">*</span>}
                </h4>
                <p className="text-xs text-slate-600 mt-1">{doc.desc}</p>
              </div>
              {formData.documents[doc.id] && (
                <CheckCircle size={20} className="text-emerald-600" />
              )}
            </div>
            <label className="block">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                className="hidden"
              />
              <div className="bg-white border-2 border-teal-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-teal-50 transition flex items-center justify-center gap-2 text-sm font-semibold text-teal-700">
                <Upload size={16} />
                {formData.documents[doc.id] 
                  ? `Uploaded: ${formData.documents[doc.id].name}` 
                  : 'Click to upload'}
              </div>
            </label>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Document Requirements</p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>All documents must be clear and legible</li>
              <li>Accepted formats: PDF, JPG, PNG (Max 5MB per file)</li>
              <li>Documents should not be older than 3 months</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => {
    const calculatedEMI = calculateSafeEMI();
    const calculatedInterest = Math.max(0, (calculatedEMI * formData.tenure) - formData.amount);
    const totalAmount = Math.max(0, Number(formData.amount || 0) + calculatedInterest);

    return (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Terms & Conditions</h2>
        <p className="text-sm text-slate-600">Please review and accept all agreements before submitting</p>
      </div>

      {/* Loan Summary */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border-2 border-teal-300 p-6">
        <h3 className="text-lg font-bold text-teal-900 mb-4">Loan Application Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-teal-700 font-bold">Loan Type</p>
            <p className="text-xl font-black text-teal-900 mt-2 capitalize">{formData.loanType} Loan</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-teal-700 font-bold">Loan Amount</p>
            <p className="text-xl font-black text-teal-900 mt-2">₹{Number(formData.amount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-teal-700 font-bold">Tenure</p>
            <p className="text-xl font-black text-teal-900 mt-2">{formData.tenure} Months</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-teal-300 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-teal-700">Monthly EMI</p>
            <p className="text-lg font-bold text-teal-900">₹{calculatedEMI.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-teal-700">Interest Rate</p>
            <p className="text-lg font-bold text-teal-900">{interestRate}% p.a.</p>
          </div>
          <div>
            <p className="text-xs text-teal-700">Total Interest</p>
            <p className="text-lg font-bold text-amber-700">₹{calculatedInterest.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-teal-700">Total Payable</p>
            <p className="text-lg font-bold text-teal-900">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setTermsExpanded(!termsExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-600" />
            <div className="text-left">
              <h4 className="font-bold text-slate-900">Terms & Conditions</h4>
              <p className="text-xs text-slate-600">Click to read the loan agreement terms</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${termsExpanded ? 'rotate-180' : ''}`} />
        </button>
        {termsExpanded && (
          <div className="px-6 pb-6 border-t border-slate-200 pt-4 max-h-64 overflow-y-auto">
            <div className="space-y-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">1. Loan Agreement</p>
              <p>This loan agreement is entered between the Borrower and the Lender. By accepting these terms, you agree to repay the loan amount with interest as per the schedule.</p>
              
              <p className="font-semibold text-slate-900">2. Interest & Charges</p>
              <p>The interest rate of {interestRate}% per annum is fixed for the entire tenure. Processing fees of 1-2% may apply. No hidden charges will be levied.</p>
              
              <p className="font-semibold text-slate-900">3. Repayment Terms</p>
              <p>Monthly EMI of ₹{calculatedEMI.toLocaleString()} must be paid by the 5th of each month. Late payments will incur a penalty of 2% per month on overdue amount.</p>
              
              <p className="font-semibold text-slate-900">4. Prepayment & Foreclosure</p>
              <p>You may prepay part or full loan amount after 6 months. Foreclosure charges of 2-4% on outstanding principal may apply.</p>
              
              <p className="font-semibold text-slate-900">5. Default Consequences</p>
              <p>Non-payment for 3 consecutive months will be considered default. This will impact your credit score and legal action may be initiated to recover dues.</p>
              
              <p className="font-semibold text-slate-900">6. Collateral & Security</p>
              <p>Depending on loan type, collateral or guarantor may be required. The lender reserves the right to seize collateral in case of default.</p>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Policy Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setPrivacyExpanded(!privacyExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-teal-600" />
            <div className="text-left">
              <h4 className="font-bold text-slate-900">Privacy Policy</h4>
              <p className="text-xs text-slate-600">How we handle your personal information</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${privacyExpanded ? 'rotate-180' : ''}`} />
        </button>
        {privacyExpanded && (
          <div className="px-6 pb-6 border-t border-slate-200 pt-4 max-h-64 overflow-y-auto">
            <div className="space-y-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">1. Data Collection</p>
              <p>We collect personal, financial, and employment information necessary for loan processing. This includes name, contact details, income proof, and credit history.</p>
              
              <p className="font-semibold text-slate-900">2. Data Usage</p>
              <p>Your information is used for loan assessment, credit verification, communication, and regulatory compliance. We do not sell your data to third parties.</p>
              
              <p className="font-semibold text-slate-900">3. Data Sharing</p>
              <p>We may share your information with credit bureaus, regulatory authorities, and service providers for loan processing and legal compliance.</p>
              
              <p className="font-semibold text-slate-900">4. Data Security</p>
              <p>We use industry-standard encryption and security measures to protect your data. Access is restricted to authorized personnel only.</p>
              
              <p className="font-semibold text-slate-900">5. Your Rights</p>
              <p>You have the right to access, correct, or delete your personal information. Contact us at privacy@loanmanagement.com for data requests.</p>
              
              <p className="font-semibold text-slate-900">6. Data Retention</p>
              <p>We retain your data for the loan tenure plus 7 years as per regulatory requirements. After this period, data will be securely deleted.</p>
            </div>
          </div>
        )}
      </div>

      {/* Acceptance Checkboxes */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6 space-y-4">
        <h4 className="font-bold text-slate-900 mb-4">Required Consents</h4>
        
        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            id="termsAccept" 
            checked={formData.termsAccepted}
            onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
            className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <label htmlFor="termsAccept" className="text-sm text-slate-700 cursor-pointer">
            I have read and accept the <span className="font-bold text-slate-900">Terms & Conditions</span> of this loan agreement. I understand the interest rate, EMI amount, and repayment obligations.
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            id="privacyAccept" 
            checked={formData.privacyAccepted}
            onChange={(e) => setFormData({...formData, privacyAccepted: e.target.checked})}
            className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <label htmlFor="privacyAccept" className="text-sm text-slate-700 cursor-pointer">
            I have read and accept the <span className="font-bold text-slate-900">Privacy Policy</span>. I consent to the collection and processing of my personal information for loan processing.
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            id="verificationAccept" 
            checked={formData.verificationAccepted}
            onChange={(e) => setFormData({...formData, verificationAccepted: e.target.checked})}
            className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <label htmlFor="verificationAccept" className="text-sm text-slate-700 cursor-pointer">
            I authorize the lender to <span className="font-bold text-slate-900">verify my information</span> with credit bureaus, employers, and financial institutions. I understand this may impact my credit score temporarily.
          </label>
        </div>

        {(!formData.termsAccepted || !formData.privacyAccepted || !formData.verificationAccepted) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mt-4">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">You must accept all consents to proceed with the application.</p>
          </div>
        )}
      </div>

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-2">Important Information</p>
            <ul className="text-xs text-blue-800 space-y-1.5">
              <li>• Your application will be reviewed by the lender within 24-48 hours</li>
              <li>• Approval is subject to credit verification and document validation</li>
              <li>• Interest rate may be revised based on your credit profile</li>
              <li>• Loan disbursement takes 3-5 business days after approval</li>
              <li>• Keep your documents ready for verification if requested</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 mb-1">Ready to Submit?</p>
            <p className="text-xs text-emerald-800">Once you submit, you cannot edit the application. Make sure all information is accurate.</p>
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      {/* Success Screen */}
      {submittedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
            <p className="text-slate-600 mb-6">Your loan application has been successfully submitted to the lender for review.</p>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-emerald-700 mb-1">Application Reference Number</p>
              <p className="text-lg font-bold text-emerald-900">{submittedApp.id}</p>
            </div>

            <div className="space-y-2 mb-6 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Loan Type:</span>
                <span className="font-semibold text-slate-900 capitalize">{formData.loanType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Loan Amount:</span>
                <span className="font-semibold text-slate-900">₹{Number(formData.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Monthly EMI:</span>
                <span className="font-semibold text-slate-900">₹{Number(emi || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-bold text-teal-900 mb-2">What Happens Next:</h3>
              <ol className="text-xs text-teal-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Lender will review your application within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>You'll receive a notification once decision is made</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>If approved, loan will be disbursed to your account</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold hover:from-teal-500 hover:to-teal-600 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="text-center">
        <h1 className="text-4xl font-black text-slate-900">Loan Application</h1>
        <p className="text-sm text-slate-600 mt-2">Complete the following steps to apply for your loan</p>
        {autoSaved && (
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            <CheckCircle size={14} />
            <span>Progress auto-saved</span>
          </div>
        )}
      </header>

      {renderStepIndicator()}

      <div className="min-h-[600px]">
        {(() => {
          let stepContent;
          try {
            switch(step) {
              case 1: stepContent = renderStep1(); break;
              case 2: stepContent = renderStep2(); break;
              case 3: stepContent = renderStep3(); break;
              case 4: stepContent = renderStep4(); break;
              case 5: stepContent = renderStep5(); break;
              case 6: stepContent = renderStep6(); break;
              default: stepContent = null; break;
            }
          } catch (error) {
            console.error('Error rendering step:', error);
            return (
              <div className="text-center py-12">
                <p className="text-rose-600">An error occurred. Please try again.</p>
                <button 
                  onClick={() => setStep(1)}
                  className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg"
                >
                  Start Over
                </button>
              </div>
            );
          }
          
          return stepContent || <div className="text-center text-slate-600">Invalid step</div>;
        })()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 sticky bottom-0 bg-white border-t border-teal-100 py-6 px-8 -mx-8">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
            step === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white border-2 border-teal-200 text-teal-700 hover:bg-teal-50'
          }`}
        >
          <ArrowLeft size={20} />
          Previous
        </button>

        <div className="text-sm text-slate-600">
          Step {step} of 6
        </div>

        {step < 6 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold hover:from-teal-500 hover:to-teal-600 transition shadow-lg shadow-teal-500/30"
          >
            Next
            <ArrowRight size={20} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={!formData.termsAccepted || !formData.privacyAccepted || !formData.verificationAccepted}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition shadow-lg ${
              !formData.termsAccepted || !formData.privacyAccepted || !formData.verificationAccepted
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-slate-300/30'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-500/30'
            }`}
          >
            <CheckCircle size={20} />
            Submit Application
          </button>
        )}
      </div>
    </div>
    </>
  );
};

export default ApplyLoan;