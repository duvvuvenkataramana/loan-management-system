import express from 'express';
import Loan from '../models/Loan.js';
import { protect, adminOnly, adminOrLender } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/loans/apply
// @desc    Apply for a loan
// @access  Private (Borrower)
router.post('/apply', protect, async (req, res) => {
  try {
    const { amount, duration, purpose } = req.body;

    // Validate input
    if (!amount || !duration || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, duration, and purpose'
      });
    }

    // Check for existing pending loans
    const existingPendingLoan = await Loan.findOne({
      user: req.user.id,
      status: 'pending'
    });

    if (existingPendingLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending loan application'
      });
    }

    // Create loan application
    const loan = await Loan.create({
      user: req.user.id,
      amount,
      duration,
      purpose
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/loans/my-loans
// @desc    Get current user's loans
// @access  Private (Borrower)
router.get('/my-loans', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({
      success: true,
      count: loans.length,
      loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/loans
// @desc    Get all loans
// @access  Private (Admin/Lender)
router.get('/', protect, adminOrLender, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Get paginated results
    const loans = await Loan.find(filter)
      .populate('user', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Loan.countDocuments(filter);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/loans/:id
// @desc    Get loan by ID
// @access  Private (Owner or Admin/Lender)
router.get('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('user', 'name email')
      .populate('approvedBy', 'name');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Check if user owns the loan or is admin/lender
    const isOwner = loan.user._id.toString() === req.user.id;
    const isAdminOrLender = req.user.role === 'admin' || req.user.role === 'lender';
    
    if (!isOwner && !isAdminOrLender) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this loan'
      });
    }

    res.json({
      success: true,
      loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/loans/:id/status
// @desc    Update loan status (Approve/Reject)
// @access  Private (Admin/Lender)
router.put('/:id/status', protect, adminOrLender, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Update loan status
    loan.status = status;
    
    if (status === 'approved') {
      loan.approvedBy = req.user.id;
      loan.approvedAt = new Date();
    } else {
      loan.rejectionReason = rejectionReason || 'Not specified';
    }

    await loan.save();

    res.json({
      success: true,
      message: `Loan ${status} successfully`,
      loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/loans/stats/dashboard
// @desc    Get loan statistics for dashboard
// @access  Private (Admin/Lender)
router.get('/stats/dashboard', protect, adminOrLender, async (req, res) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const pendingLoans = await Loan.countDocuments({ status: 'pending' });
    const approvedLoans = await Loan.countDocuments({ status: 'approved' });
    const rejectedLoans = await Loan.countDocuments({ status: 'rejected' });

    // Get total amount requested
    const approvedLoansAmount = await Loan.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalAmount = approvedLoansAmount[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalLoans,
        pendingLoans,
        approvedLoans,
        rejectedLoans,
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
