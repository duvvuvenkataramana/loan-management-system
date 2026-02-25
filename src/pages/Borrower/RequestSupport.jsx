import { useState } from 'react';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/AppContext';

const RequestSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    description: '',
    attachmentType: 'none',
    loanId: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.category.trim()) return 'Please select a category';
    if (!formData.subject.trim()) return 'Subject is required';
    if (formData.subject.length < 5) return 'Subject must be at least 5 characters';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.description.length < 10) return 'Description must be at least 10 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create support ticket
      const supportTicket = {
        id: `SUP-${Date.now().toString().slice(-8)}`,
        userId: user?.id,
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        attachmentType: formData.attachmentType,
        loanId: formData.loanId,
        status: 'open',
        priority: formData.category === 'urgent' ? 'high' : 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage (for demo)
      const existingTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
      localStorage.setItem('supportTickets', JSON.stringify([...existingTickets, supportTicket]));

      addToast('success', 'Support Request Submitted', `Your ticket ${supportTicket.id} has been created. Our team will respond within 24 hours.`);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to submit support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-white shadow-sm border border-slate-200 rounded-xl p-2 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Request Support</h1>
            <p className="text-slate-600 mt-1">Get help from our support team</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <div className="text-blue-600 font-bold text-lg">ℹ️</div>
            <div>
              <p className="text-sm text-blue-900 font-semibold">Response Guarantee</p>
              <p className="text-xs text-blue-800 mt-1">Our team typically responds to support requests within 24 hours during business days.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
              >
                <option value="">Select a category</option>
                <option value="payment">Payment Issue</option>
                <option value="loan">Loan Related</option>
                <option value="account">Account & Profile</option>
                <option value="statement">Statement & Documents</option>
                <option value="technical">Technical Issue</option>
                <option value="general">General Inquiry</option>
                <option value="urgent">Urgent Issue</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief description of your issue"
                maxLength="100"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
              />
              <p className="text-xs text-slate-500 mt-1">{formData.subject.length}/100 characters</p>
            </div>

            {/* Loan Selection (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Related to Loan (Optional)
              </label>
              <input
                type="text"
                name="loanId"
                value={formData.loanId}
                onChange={handleInputChange}
                placeholder="Loan ID (if applicable)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
              />
              <p className="text-xs text-slate-500 mt-1">Leave blank if not related to a specific loan</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed information about your issue. Include any relevant details that might help us assist you better."
                rows="6"
                maxLength="1000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{formData.description.length}/1000 characters</p>
            </div>

            {/* Attachment Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Attachment Type (Optional)
              </label>
              <select
                name="attachmentType"
                value={formData.attachmentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
              >
                <option value="none">No Attachment</option>
                <option value="screenshot">Screenshot</option>
                <option value="document">Document</option>
                <option value="receipt">Receipt</option>
                <option value="statement">Bank Statement</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">You can attach files during the next step</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Other Ways to Contact Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600 font-medium">📞 Phone Support</p>
              <p className="text-slate-500 mt-1">+1 (800) LOAN-HELP<br/>Mon-Fri, 9AM-6PM EST</p>
            </div>
            <div>
              <p className="text-slate-600 font-medium">📧 Email Support</p>
              <p className="text-slate-500 mt-1">support@loanms.com<br/>Response within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestSupport;
