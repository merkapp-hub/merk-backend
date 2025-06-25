const express = require('express');

const authMiddleware = require('@middlewares/authMiddleware');
const { addProductReview, getProductReviews } = require('@controllers/reviewController');

const router = express.Router();

router.post('/addreview',authMiddleware(["user", "admin", "seller"]),addProductReview)
router.get("/getProductReviews/:productId",authMiddleware(["user", "admin", "seller"]),getProductReviews)

module.exports = router;