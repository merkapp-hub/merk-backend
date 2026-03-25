"use strict";

const mongoose = require("mongoose");
const crypto = require('crypto');

const generateShortTimestamp = () => {
  const now = Date.now();
  return now.toString(36).toUpperCase();
};

const generateUniqueOrderId = () => {
  const timestampPart = generateShortTimestamp();
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${timestampPart}-${randomPart}`;
};

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
  },
});

const productrequestchema = new mongoose.Schema(
  {
    // category: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Category",
    // }],
    productDetail: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        image: [
          {
            type: String,
          },
        ],
        total: {
          type: Number,
        },
        qty: {
          type: Number,
        },
        price: {
          type: Number,
        },
        price_slot: {
          value: { type: Number },
          unit: { type: String },
          our_price: { type: Number },
          other_price: { type: Number },
        },
        color: { type: String, default: "" },
        size: { type: String, default: "" },
        // return and refund related
        isReturnable: { type: Boolean }, // capture it from product at order time
        returnDetails: {
          isReturned: { type: Boolean, default: false }, // for return request
          isRefunded: { type: Boolean, default: false }, // for refund request
          returnRequestDate: Date, // for return request date
          returnDate: Date, // for return date when product is picked up again by seller
          returnStatus: {
            type: String,
            enum: [
              "Pending",
              "Approved",
              "Rejected",
              "Refunded",
              "Auto-Refunded",
              "Return-requested",
              "Completed",
            ],
          }, 
          reason: String, // reason for return and refund
          proofImages: [String], // images for proof of return and refund
          refundAmount: Number, // amount to be refunded
          refundedAt: Date, // date when refund is processed
          refundWithoutReturn: { type: Boolean }, // for refund without return ----> for auto-refund
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Pending", "SellerApproved", "Preparing", "Shipped", "OutForDelivery", "Delivered", "Cancelled", "SellerRejected", "Return Requested", "Returned"],
      default: "Pending",
    },
    sellerApprovalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    onthewaytodelivery: {
      type: Boolean,
      default: false,
    },
    shipping_address: {
      type: Object,
    },
    tax: {
      type: Number,
      default: 0,
    },
    servicefee: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
    },
    deliveryCharge: {
      type: Number,
    },
    deliveryTip: {
      type: Number,
    },
    finalAmount: {
      type: Number,
    },
    // Currency information for PDF generation
    userCurrency: {
      type: String,
      default: 'USD'
    },
    currencySymbol: {
      type: String,
      default: '$'
    },
    exchangeRate: {
      type: Number,
      default: 1
    },
    displayTotal: {
      type: Number  // Total in user's currency
    },
    
    adminFee: {
      type: Number,
      default: 0,
    },
    sellerEarnings: {
      type: Number,
      default: 0,
    },
    location: {
      type: pointSchema,
    },
    paymentmode: {
      type: String,
    },
    paymentDetails: {
      paypalOrderId: String,
      paypalPayerId: String,
      paymentStatus: String,
      captureId: String,
      transactionId: String,
    },
    timeslot: {
      type: String,
    },
    cashcollected: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    amountreceivedbyadmin: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveredAt: {
      type: Date,
    },
    orderId: {
      type: String,
      maxlength: 100,
      unique: true,
      index: true,
    },
    forzaShipping: {
      trackingNumber: String,
      shipmentId: String,
      status: String,
      estimatedDelivery: Date,
      currentLocation: String,
      history: [
        {
          status: String,
          location: String,
          timestamp: Date,
          description: String
        }
      ],
      createdAt: Date,
      error: String
    },
    oneSignalNotifications: [
      {
        type: String,
        sentAt: Date,
        success: Boolean,
        error: String
      }
    ],


    // return: {
    //   type: Boolean,
    // },
    // refund: {
    //   type: Boolean,
    // },
    // returnAmount: {
    //   type: Number,
    // },
    // returnreason: { type: String },
    // returnproof: [{ type: String }],
    // returnStatus: {
    //   type: String,
    //   enum: ["Pending", "Approved", "Rejected", "Refunded"],
    // },
    // productId: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Product",
    // }],
    // returndate: {
    //   type: Date,
    // },
  },
  {
    timestamps: true,
  }
);

productrequestchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
productrequestchema.index({ location: "2dsphere" });
productrequestchema.index({ orderId: 1 }, { unique: true });

// Add index for PayPal order ID to prevent duplicates
productrequestchema.index({ 'paymentDetails.paypalOrderId': 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { 
    'paymentDetails.paypalOrderId': { $exists: true, $ne: null, $ne: '' } 
  }
});

productrequestchema.pre('save', async function (next) {
  const ProductRequest = this.constructor;

  // Check for duplicate PayPal order ID
  if (this.paymentDetails?.paypalOrderId && this.paymentmode === 'paypal') {
    const existing = await ProductRequest.findOne({ 
      'paymentDetails.paypalOrderId': this.paymentDetails.paypalOrderId,
      _id: { $ne: this._id } // Exclude current document if updating
    });
    
    if (existing) {
      const error = new Error('Order already exists for this PayPal payment');
      error.code = 'DUPLICATE_PAYPAL_ORDER';
      error.existingOrderId = existing.orderId;
      return next(error);
    }
  }

  if (!this.orderId) {
    let newOrderId;
    let existing;

    do {
      newOrderId = generateUniqueOrderId();
      existing = await ProductRequest.findOne({ orderId: newOrderId });
    } while (existing);

    this.orderId = newOrderId;
  }

  next();
});

productrequestchema.post('save', async function(doc) {
  try {
    const oneSignalService = require('../services/oneSignalService');
    
    if (this.isNew) {
      // New order created - send notification to customer
      const User = require('./User');
      const user = await User.findById(doc.user);
      
      if (user) {
        const result = await oneSignalService.orderReceived(doc, user);
        
        if (!doc.oneSignalNotifications) doc.oneSignalNotifications = [];
        doc.oneSignalNotifications.push({
          type: 'order_received',
          sentAt: new Date(),
          success: result.success,
          error: result.error || null
        });
        
        await doc.save({ validateBeforeSave: false });
      }

      // Send notification to seller
      if (doc.seller_id) {
        const seller = await User.findById(doc.seller_id);
        if (seller) {
          await oneSignalService.newOrderForSeller(doc, seller);
        }
      }
    }
  } catch (error) {
    console.error('OneSignal post-save hook error:', error);
  }
});

productrequestchema.pre('findOneAndUpdate', async function() {
  this._previousDoc = await this.model.findOne(this.getQuery());
});

productrequestchema.post('findOneAndUpdate', async function(doc) {
  try {
    if (!doc || !this._previousDoc) return;
    
    const oneSignalService = require('../services/oneSignalService');
    const User = require('./User');
    const previousStatus = this._previousDoc.status;
    const newStatus = doc.status;
    
    if (previousStatus !== newStatus) {
      const user = await User.findById(doc.user);
      
      if (user) {
        let result;
        
        if (newStatus === 'Cancelled') {
          result = await oneSignalService.orderCancelled(doc, user, doc.rejectionReason);
        } else if (newStatus === 'Delivered') {
          result = await oneSignalService.orderDelivered(doc, user);
        } else {
          result = await oneSignalService.orderStatusChanged(doc, user, newStatus);
        }
        
        if (!doc.oneSignalNotifications) doc.oneSignalNotifications = [];
        doc.oneSignalNotifications.push({
          type: newStatus === 'Cancelled' ? 'order_cancelled' : 
                newStatus === 'Delivered' ? 'order_delivered' : 'order_status_changed',
          sentAt: new Date(),
          success: result.success,
          error: result.error || null
        });
        
        await doc.save({ validateBeforeSave: false });
      }
    }
  } catch (error) {
    console.error('OneSignal update hook error:', error);
  }
});

const ProductRequest = mongoose.model("ProductRequest", productrequestchema);

module.exports = ProductRequest;
