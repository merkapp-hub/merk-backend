const express = require('express');
const { login, register, sendOTP, verifyOTP, changePassword } = require('@controllers/authController');

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.post("/changePassword", changePassword);

module.exports = router;
