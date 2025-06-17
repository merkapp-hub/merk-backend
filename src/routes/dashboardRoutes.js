const express = require('express');
const dashboard = require('@controllers/dashboard');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.get("/getDashboardStats", dashboard.getDashboardData);
router.get("/getSalesStats", dashboard.getMonthlyProductSales);
router.get("/getTopProductSales", dashboard.getTopProductSales);
router.get("/getDailyTopSellingProduct", dashboard.getDailyTopSellingProduct);

module.exports = router;