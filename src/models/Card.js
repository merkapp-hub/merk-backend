const mongoose = require('mongoose');
const crypto = require('crypto');

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    set: function (value) {
      return this.encrypt(value);
    },
    get: function (value) {
      return this.decrypt(value);
    }
  },
  lastFour: {
    type: String,
    required: true
  },
  maskedCardNumber: {
    type: String,
    required: true
  },
  expiryMonth: {
    type: String,
    required: true
  },
  expiryYear: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true,
    set: function (value) {
      return this.encrypt(value);
    },
    get: function (value) {
      return this.decrypt(value);
    }
  },
  cardholderName: {
    type: String,
    required: true,
    trim: true
  },
  cardType: {
    type: String,
    required: true,
    enum: ['Visa', 'Mastercard', 'American Express', 'Discover', 'Card']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  paypalToken: {
    type: String,
  },
  paypalCustomerId: {
    type: String,
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// const ENCRYPTION_KEY = process.env.CARD_ENCRYPTION_KEY;
// const ALGORITHM = 'aes-256-cbc';

const ALGORITHM = "aes-256-cbc";

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(String(process.env.CARD_ENCRYPTION_KEY))
  .digest("base64")
  .substring(0, 32);


// cardSchema.methods.encrypt = function (text) {
//   if (!text) return text;
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
//   let encrypted = cipher.update(text, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return iv.toString('hex') + ':' + encrypted;
// };

// cardSchema.methods.decrypt = function (text) {
//   if (!text || !text.includes(':')) return text;
//   const textParts = text.split(':');
//   const iv = Buffer.from(textParts.shift(), 'hex');
//   const encryptedText = textParts.join(':');
//   const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
//   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// };


cardSchema.methods.encrypt = function (text) {
  if (!text) return text;

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

cardSchema.methods.decrypt = function (text) {
  if (!text || !text.includes(":")) return text;

  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = parts.join(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
cardSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await mongoose.model('Card').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

cardSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  // delete obj.cardNumber;
  // delete obj.cvv;
  return obj;
};

cardSchema.index({ userId: 1 });
cardSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('Card', cardSchema);