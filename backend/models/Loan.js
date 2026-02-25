import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [1, 'Loan amount must be at least 1']
  },
  duration: {
    type: Number,
    required: [true, 'Loan duration is required'],
    min: [1, 'Duration must be at least 1 month'],
    max: [60, 'Duration cannot exceed 60 months']
  },
  purpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    enum: ['personal', 'business', 'education', 'home', 'medical', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  interestRate: {
    type: Number,
    default: 5 // 5% annual interest rate
  },
  monthlyPayment: {
    type: Number
  },
  totalPayment: {
    type: Number
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate monthly payment before saving
loanSchema.pre('save', function(next) {
  if (this.amount && this.duration && this.interestRate) {
    const principal = this.amount;
    const monthlyRate = this.interestRate / 100 / 12;
    const numberOfPayments = this.duration;
    
    // EMI formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const emi = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    this.monthlyPayment = Math.round(emi * 100) / 100;
    this.totalPayment = Math.round(emi * numberOfPayments * 100) / 100;
  }
  next();
});

// Index for efficient queries
loanSchema.index({ user: 1, status: 1 });
loanSchema.index({ createdAt: -1 });

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;
