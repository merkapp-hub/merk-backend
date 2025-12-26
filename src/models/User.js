const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'seller'],
      default: 'user',
    },
     status: {
      type: String,
      default: "Pending",
    },
    // Seller balance for payouts/withdrawals
    wallet: {
      type: Number,
      default: 0,
    },
    // Admin collected commissions from orders
    cashReceive: {
      type: Number,
      default: 0,
    },
    // Commission percentage for seller (set by admin)
    commissionRate: {
      type: Number,
      default: 15, // Default 15% commission
      min: 0,
      max: 100,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: ''
    },
    number: {
      type: String,
      default: ''
    },
    mobile: {
      type: String,
      default: ''
    },
   
    shiping_address: {
      firstName: { type: String },
      lastName: { type: String },
      address: { type: String },
      pinCode: { type: String },
      phoneNumber: { type: String },
      city: { type: String },
      state: { 
        value: { type: String },
        label: { type: String }
      },
      country: {
        value: { type: String },
        label: { type: String }
      },
      companyName: { type: String },
      apartment: { type: String }
    },
    // type: {
    //   type: String,
    //   enum: ['user', 'admin', 'seller'],
    //   default: 'user',
    // },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;