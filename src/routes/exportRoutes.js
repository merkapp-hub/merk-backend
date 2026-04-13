const express = require('express');
const exportController = require('@controllers/exportController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();

router.post('/detailed-seller-report', authMiddleware(['admin']), exportController.detailedSellerReport);

module.exports = router;
