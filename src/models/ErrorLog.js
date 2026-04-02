const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      trim: true,
    },
    endpoint: {
      type: String,
      trim: true,
    },
    statusCode: {
      type: Number,
      default: 500,
    },
    errorName: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    stack: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
      default: 'app',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically deletes documents 30 days after createdAt
errorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('ErrorLog', errorLogSchema);
