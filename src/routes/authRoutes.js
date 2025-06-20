const express = require('express');
const { login, register, sendOTP, verifyOTP, changePassword, fileUpload, getProfile } = require('@controllers/authController');
const { upload } = require('@services/fileUpload');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.post("/changePassword", changePassword);
router.post("/user/fileupload", upload.single("file"), fileUpload);
router.get("/getProfile", authMiddleware(["user", "admin", "seller", "driver", "employee"]), getProfile);

module.exports = router;
