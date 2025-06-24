'use strict';
 
const mongoose = require('mongoose');
const productchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    theme: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theme",
    }],
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    categoryName: {
        type: String,
    },
    gender: {
        type: String,
    },
    origin: {
        type: String,
    },
    manufacturername: {
        type: String,
    },
    manufactureradd: {
        type: String,
    },
    expirydate: {
        type: Date,
    },
    name: {
        type: String,
    },
    slug: {
        type: String,
    },
    image: {
        type: String,
    },
    short_description: {
        type: String,
    },
    long_description: {
        type: String,
    },
 
    pieces: {
        type: Number,
    },
    sold_pieces: {
        type: Number,
        default: 0
    },
    varients: {
        type: [],
    },
    minQuantity: {
        type: Number
    },
    parameter_type: {
        type: String
    },
    price_slot: [{
        value: {
            type: String,
        },
        Offerprice: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            default: 0
        },
    }],
    is_verified: {
        type: Boolean,
        default: false
    },
    is_quality: {
        type: Boolean,
        default: false
    },
    sponsered: {
        type: Boolean
    },
    status: {
        type: String,
        enum: ["verified", "suspended"],
        default: "verified",
    },
    attributes: [
        {
            name: { type: String },
            value: { type: String, default: '' }
        }
    ]
}, {
    timestamps: true
});
 
productchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});
 
const Product = mongoose.model('Product', productchema);
 
module.exports = Product;