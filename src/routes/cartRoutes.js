const express = require('express');
const cart = require('@controllers/cartController');

const router = express.Router();

// No auth required - cart can work without login
router.post("/getCartItems", cart.getCartItems);
router.post("/getWishlistItems", cart.getWishlistItems);

module.exports = router;
