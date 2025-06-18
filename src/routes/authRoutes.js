const express = require('express');
const { login, register, sendOTP, verifyOTP, changePassword, fileUpload } = require('@controllers/authController');
const { upload } = require('@services/fileUpload');

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.post("/changePassword", changePassword);
router.post(
    "/user/fileupload",
    upload.single("file"),
    fileUpload
);

module.exports = router;
