const mongoose = require("mongoose");
const response = require("./../responses");
const Withdrawreq = require("@models/Withdrawreq");
const User = require("@models/User");
const paypalPayoutService = require("@services/paypalPayoutService");
const { saveErrorLog } = require("@responses/error");

module.exports = {
  createWithdrawreq: async (req, res) => {
    try {
      const { amount, note, paymentMethod } = req.body;
      
      const withdrawRequest = new Withdrawreq({
        request_by: req.user.id,
        amount,
        note,
        type: 'debit',
        description: `Withdrawal request for ${amount}$ via ${paymentMethod || 'bank transfer'}`,
        referenceId: `WD-${Date.now()}`
      });
      
      const savedRequest = await withdrawRequest.save();
      return response.success(res, savedRequest);
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      return response.error(res, error);
    }
  },

  getWithdrawreq: async (req, res) => {
    try {
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      
      // Add status filter if provided
      if (req.query.status && req.query.status !== 'all') {
        query.settle = req.query.status;
      } else {
        // Default to showing all statuses if not specified
        query.settle = { $in: ['Pending', 'Completed', 'Rejected'] };
      }

      // Get paginated results with complete seller information
      const reqlist = await Withdrawreq.find(query)
        .populate({
          path: 'request_by',
          select: 'username number email firstName lastName name mobile',
          options: { lean: true }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Add index to each item
      const indexedList = reqlist.map((item, index) => ({
        ...item,
        index: skip + index + 1,
      }));

      // Get total count for pagination
      const totalItems = await Withdrawreq.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        status: true,
        data: indexedList,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error('Error in getWithdrawreq:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Internal server error'
      });
    }
  },
  getWithdrawreqbyseller: async (req, res) => {
    try {
      // Get seller ID from params or user token
      const sellerId = req.params.id || req.user?.id;
      
      // If no seller ID is provided and user is not authenticated
      if (!sellerId) {
        return res.status(400).json({
          status: false,
          message: 'Seller ID is required or user must be authenticated'
        });
      }
      
      // Check if the seller exists
      const seller = await User.findById(sellerId);
      if (!seller) {
        return res.status(404).json({
          status: false,
          message: 'Seller not found'
        });
      }
      
      // Get withdrawal requests for the seller
      const reqlist = await Withdrawreq.find({ request_by: sellerId })
        .populate('request_by', 'username number email')
        .sort({ createdAt: -1 });
        
      return res.status(200).json({
        status: true,
        data: reqlist
      });
      
    } catch (error) {
      console.error('Error in getWithdrawreqbyseller:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  updateWithdrawreq: async (req, res) => {
    try {
      const { id, action } = req.body;
      
      if (!id) {
        return res.status(400).json({
          status: false,
          message: 'Withdrawal request ID is required'
        });
      }

      const withdrawdata = await Withdrawreq.findById(id).populate('request_by', 'email firstName lastName wallet');
      
      if (!withdrawdata) {
        return res.status(404).json({
          status: false,
          message: 'Withdrawal request not found'
        });
      }

      if (withdrawdata.settle !== 'Pending') {
        return res.status(400).json({
          status: false,
          message: `Request already ${withdrawdata.settle}`
        });
      }

      if (action === 'approve') {
        const seller = withdrawdata.request_by;
        
        if (!seller || !seller.email) {
          return res.status(400).json({
            status: false,
            message: 'Seller email not found'
          });
        }

        if (seller.wallet < withdrawdata.amount) {
          return res.status(400).json({
            status: false,
            message: 'Insufficient wallet balance'
          });
        }

        const payoutResult = await paypalPayoutService.createPayout(
          seller.email,
          withdrawdata.amount,
          withdrawdata.note || `Withdrawal for ${seller.firstName} ${seller.lastName}`,
          withdrawdata._id
        );

        if (payoutResult.success) {
          await Withdrawreq.findByIdAndUpdate(id, {
            settle: 'Completed',
            paypalBatchId: payoutResult.batchId,
            paypalStatus: payoutResult.batchStatus
          });

          await User.findByIdAndUpdate(
            seller._id,
            { $inc: { wallet: -withdrawdata.amount } }
          );

          return res.status(200).json({
            status: true,
            message: 'Withdrawal approved and payout initiated',
            data: {
              batchId: payoutResult.batchId,
              status: payoutResult.batchStatus
            }
          });
        } else {
          await Withdrawreq.findByIdAndUpdate(id, {
            settle: 'Rejected',
            note: `${withdrawdata.note || ''} - PayPal Error: ${payoutResult.error}`
          });

          saveErrorLog(req, new Error(payoutResult.error || 'Payout failed'), {
            source: 'paypal_payout',
            statusCode: 400,
            meta: { action: 'approveWithdrawal', withdrawalId: id },
          });

          return res.status(400).json({
            status: false,
            message: `Payout failed: ${payoutResult.error}`
          });
        }
      } else if (action === 'reject') {
        await Withdrawreq.findByIdAndUpdate(id, {
          settle: 'Rejected'
        });

        return res.status(200).json({
          status: true,
          message: 'Withdrawal request rejected'
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Invalid action. Use "approve" or "reject"'
        });
      }
    } catch (error) {
      console.error('Error updating withdrawal request:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  // Get all withdrawal requests for admin with filtering and pagination
  getAllWithdrawals: async (req, res) => {
    try {
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      
      // Add status filter if provided
      if (req.query.status && req.query.status !== 'all') {
        query.settle = req.query.status;
      } else {
        // Default to showing all statuses if not specified
        query.settle = { $in: ['Pending', 'Completed', 'Rejected'] };
      }

      // Get paginated results with user information
      const withdrawals = await Withdrawreq.find(query)
        .populate({
          path: 'request_by',
          select: 'username email firstName lastName name mobile number',
          options: { lean: true }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const totalItems = await Withdrawreq.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        status: true,
        data: withdrawals,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error('Error in getAllWithdrawals:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Internal server error'
      });
    }
  }
};
