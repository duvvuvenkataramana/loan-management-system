import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import Stepper from '../../components/Stepper';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/AppContext';
import { calculateEMI } from '../../utils/finance';
import { FileText, Download, CheckCircle, AlertCircle, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';

const LoanReviewDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const { loanApplications, updateApplicationStatus, addLoan } = useApp();
  const { addToast } = useToast();

  const application = loanApplications.find(app => app.id === loanId);

  useEffect(() => {
    // Only show error if loanApplications has loaded and application is still not found
    if (loanApplications.length > 0 && !application) {
      addToast('error', 'Not Found', 'Application not found');
      navigate('/review');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId, loanApplications.length]);

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    // Get interest rate based on loan type
    const loanTypes = {
      'personal': { name: 'Personal Loan', rate: 10.5 },
      'home': { name: 'Home Loan', rate: 8.5 },
      'auto': { name: 'Auto Loan', rate: 9.0 },
      'education': { name: 'Education Loan', rate: 7.5 },
      'business': { name: 'Business Loan', rate: 11.0 },
    };
    
    const loanConfig = loanTypes[application.loanType] || loanTypes['personal'];
    const interestRate = loanConfig.rate;
    const monthlyEMI = parseFloat(calculateEMI(application.amount, interestRate, application.tenure));
    
    // Calculate dates
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.setMonth(today.getMonth() + application.tenure)).toISOString().split('T')[0];
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);
    const nextDueDate = nextDue.toISOString().split('T')[0];
    
    // Create loan from approved application
    const newLoan = {
      type: loanConfig.name,
      amount: application.amount,
      monthlyEMI: monthlyEMI,
      interestRate: interestRate,
      tenure: application.tenure,
      totalInstallments: application.tenure,
      nextDue: nextDueDate,
      startDate: startDate,
      endDate: endDate,
      autoPay: false,
      borrowerId: application.borrowerId || 1,
      lenderId: 2,
      applicationId: application.id
    };
    
    // Add the loan to the system
    const createdLoan = addLoan(newLoan);
    
    // Update application status
    updateApplicationStatus(application.id, 'approved');
    addToast('success', 'Application Approved', `Loan application ${application.id} has been approved. Loan ${createdLoan.id} created.`);
    navigate('/review');
  };

  const handleReject = () => {
    updateApplicationStatus(application.id, 'rejected');
    addToast('info', 'Application Rejected', `Loan application ${application.id} has been rejected`);
    navigate('/review');
  };

  const handleRequestDocs = () => {
    addToast('info', 'Documents Requested', 'Additional document request sent to borrower');
  };

  const handleSaveNotes = () => {
    addToast('success', 'Notes Saved', 'Internal comments have been saved');
  };

  const handleDownloadDoc = () => {
    addToast('success', 'Document Downloaded', `Downloaded ${selectedDoc}`);
  };

  const handleMarkVerified = () => {
    addToast('success', 'Document Verified', `${selectedDoc} has been marked as verified`);
    setIsPreviewOpen(false);
  };

  const openDocPreview = (docName) => {
    setSelectedDoc(docName);
    setIsPreviewOpen(true);
  };

  const statusToStep = {
    'pending': { current: 0 },
    'in_review': { current: 1 },
    'approved': { current: 2 },
    'rejected': { current: 2 }
  };

  const stepStatus = statusToStep[application.status] || { current: 0 };

  const steps = [
    { label: 'Submitted', description: 'Application received', status: stepStatus.current >= 0 ? 'done' : 'upcoming' },
    { label: 'Verification', description: 'Documents reviewed', status: stepStatus.current === 1 ? 'current' : stepStatus.current > 1 ? 'done' : 'upcoming' },
    { label: 'Decision', description: application.status === 'approved' ? 'Approved' : application.status === 'rejected' ? 'Rejected' : 'Pending decision', status: stepStatus.current === 2 ? 'current' : 'upcoming' },
  ];

  // Build documents array from uploaded files
  const documents = [];
  if (application.documents?.idProof) {
    documents.push({ name: application.documents.idProof, label: 'ID Proof', status: 'Verified' });
  }
  if (application.documents?.incomeProof) {
    documents.push({ name: application.documents.incomeProof, label: 'Income Proof', status: 'Verified' });
  }
  if (application.documents?.addressProof) {
    documents.push({ name: application.documents.addressProof, label: 'Address Proof', status: 'Verified' });
  }
  if (application.documents?.bankStatement) {
    documents.push({ name: application.documents.bankStatement, label: 'Bank Statement', status: 'Verified' });
  }

  const creditScore = application.financialInfo?.creditScore || 0;
  const getRiskScore = (score) => {
    if (score >= 750) return { label: 'Low', color: 'emerald' };
    if (score >= 650) return { label: 'Medium', color: 'amber' };
    return { label: 'High', color: 'rose' };
  };

  const riskScore = getRiskScore(creditScore);
  const debtToIncome = application.financialInfo?.existingEMI && application.employmentInfo?.monthlyIncome
    ? Math.round((parseFloat(application.financialInfo.existingEMI) / parseFloat(application.employmentInfo.monthlyIncome)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate('/review')}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Work Queue
      </button>

      {/* Header */}
      <header className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">Loan Application Review</h2>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                application.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                application.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                application.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-600">Application ID: <span className="font-semibold text-slate-900">{application.id}</span></p>
            <p className="text-xs text-slate-500 mt-1">Submitted on {new Date(application.applicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Show action buttons only for pending or in_review applications */}
            {(application.status === 'pending' || application.status === 'in_review') && (
              <>
                <button 
                  onClick={handleRequestDocs}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Request Documents
                </button>
                <button 
                  onClick={handleReject}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
                >
                  Reject Application
                </button>
                <button 
                  onClick={handleApprove}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Approve Application
                </button>
              </>
            )}
            {/* Show decision info for already processed applications */}
            {application.status === 'approved' && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Application Approved</span>
              </div>
            )}
            {application.status === 'rejected' && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span className="text-sm font-semibold text-rose-700">Application Rejected</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Application Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl border border-teal-100 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Loan Amount</p>
          <p className="text-3xl font-black text-slate-900 mt-3">₹{Number(application.amount || 0).toLocaleString()}</p>
          <p className="text-sm text-slate-600 mt-1">{application.loanType?.charAt(0).toUpperCase() + application.loanType?.slice(1)} Loan</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Credit Score</p>
          <div className="flex items-end gap-2 mt-3">
            <p className="text-3xl font-black text-slate-900">{creditScore || 'N/A'}</p>
            {creditScore >= 750 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-1" />
            ) : creditScore >= 650 ? (
              <TrendingUp className="w-5 h-5 text-amber-600 mb-1" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600 mb-1" />
            )}
          </div>
          <p className={`text-sm font-semibold mt-1 ${
            riskScore.label === 'Low' ? 'text-emerald-600' :
            riskScore.label === 'Medium' ? 'text-amber-600' :
            'text-rose-600'
          }`}>{riskScore.label} Risk</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">Monthly EMI</p>
          <p className="text-3xl font-black text-slate-900 mt-3">₹{application.emi ? application.emi.toLocaleString() : 'N/A'}</p>
          <p className="text-sm text-slate-600 mt-1">Over {application.tenure || 0} months</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-semibold">DTI Ratio</p>
          <p className="text-3xl font-black text-slate-900 mt-3">{debtToIncome}%</p>
          <p className={`text-sm font-semibold mt-1 ${
            debtToIncome < 36 ? 'text-emerald-600' :
            debtToIncome < 50 ? 'text-amber-600' :
            'text-rose-600'
          }`}>{debtToIncome < 36 ? 'Healthy' : debtToIncome < 50 ? 'Moderate' : 'High'}</p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrower Profile */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Borrower Profile</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Personal Information</p>
              <p className="text-lg font-bold text-slate-900">{application.personalInfo?.fullName || 'Unknown'}</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Email</span>
                  <span className="font-semibold text-slate-900">{application.personalInfo?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Phone</span>
                  <span className="font-semibold text-slate-900">{application.personalInfo?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">City</span>
                  <span className="font-semibold text-slate-900">{application.personalInfo?.city || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Employment Details</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Employer</span>
                  <span className="font-semibold text-slate-900">{application.employmentInfo?.employer || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Designation</span>
                  <span className="font-semibold text-slate-900">{application.employmentInfo?.designation || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Experience</span>
                  <span className="font-semibold text-slate-900">{application.employmentInfo?.workExperience || 'N/A'} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Monthly Income</span>
                  <span className="font-semibold text-emerald-600">₹{application.employmentInfo?.monthlyIncome ? Number(application.employmentInfo.monthlyIncome).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Financial Health</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Existing EMI</span>
                  <span className="font-semibold text-slate-900">₹{application.financialInfo?.existingEMI ? Number(application.financialInfo.existingEMI).toLocaleString() : '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Savings</span>
                  <span className="font-semibold text-slate-900">₹{application.financialInfo?.savings ? Number(application.financialInfo.savings).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Co-applicant</span>
                  <span className="font-semibold text-slate-900">{application.financialInfo?.coApplicant ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Documents</h3>
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-teal-600 mb-1">{doc.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                    <button
                      type="button"
                      onClick={() => openDocPreview(doc.name)}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-1"
                    >
                      Preview Document →
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'Verified' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-900">No Documents Uploaded</p>
                <p className="text-xs text-amber-700 mt-1">The borrower has not uploaded any documents yet.</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 bg-white border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-all">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">Upload Additional Documents</p>
            <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                Choose Files
              </button>
              <button 
                onClick={() => addToast('success', 'Upload Complete', 'Documents uploaded successfully')}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Risk Assessment & Timeline */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Assessment</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Credit Score</p>
                  <span className={`text-sm font-bold ${
                    creditScore >= 750 ? 'text-emerald-600' :
                    creditScore >= 650 ? 'text-amber-600' :
                    'text-rose-600'
                  }`}>{creditScore || 'N/A'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      creditScore >= 750 ? 'bg-emerald-500' :
                      creditScore >= 650 ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min((creditScore / 850) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Debt-to-Income Ratio</p>
                  <span className={`text-sm font-bold ${
                    debtToIncome < 36 ? 'text-emerald-600' :
                    debtToIncome < 50 ? 'text-amber-600' :
                    'text-rose-600'
                  }`}>{debtToIncome}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      debtToIncome < 36 ? 'bg-emerald-500' :
                      debtToIncome < 50 ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(debtToIncome, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Missed Payments</p>
                  <p className="text-sm font-semibold text-slate-900">0</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Employment Tenure</p>
                  <p className="text-sm font-semibold text-slate-900">{application.employmentInfo?.workExperience || 'N/A'} years</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Loan Purpose</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{application.loanPurpose || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Decision Timeline</h3>
            <Stepper steps={steps} />
            <div className="mt-4 bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900">Current Status</p>
              <p className="text-xs text-slate-600 capitalize mt-1">{application.status?.replace('_', ' ')}</p>
              <p className="text-xs text-slate-500 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Comments */}
      <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-teal-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Internal Comments & Notes</h3>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white"
          rows={5}
          placeholder="Add underwriting notes, risk assessment details, exceptions, or follow-up requirements..."
        />
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSaveNotes}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-sm font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-500/20"
          >
            Save Notes
          </button>
        </div>
      </section>

      {/* Document Preview Modal */}
      <Modal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Document Preview - ${selectedDoc}`}
        actions={
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={handleDownloadDoc}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            <button 
              onClick={handleMarkVerified}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Mark Verified
            </button>
          </div>
        }
      >
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl h-96 flex flex-col items-center justify-center">
          <FileText className="w-16 h-16 text-slate-400 mb-4" />
          <p className="text-sm font-semibold text-slate-700">Document Preview</p>
          <p className="text-xs text-slate-500 mt-2">{selectedDoc}</p>
          <p className="text-xs text-slate-400 mt-4">Preview functionality will be implemented with actual document viewer</p>
        </div>
      </Modal>
    </div>
  );
};

export default LoanReviewDetail;
