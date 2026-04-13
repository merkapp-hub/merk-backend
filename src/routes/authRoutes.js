const express = require('express');
const { login, register, sendOTP, verifyOTP, changePassword, fileUpload, getProfile, updateProfile, updatePassword, getSellerList, deleteAccount, uploadProfileImage, updateSellerCommission, sendAdminLoginOTP, verifyAdminLoginOTP, updateAdminDetails } = require('@controllers/authController');

const authMiddleware = require('@middlewares/authMiddleware');
const { upload } = require('@services/fileUpload');

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.post("/changePassword", changePassword);
router.post("/user/fileupload", upload.single("file"), fileUpload);
router.get("/getProfile", authMiddleware(["user", "admin", "seller", "driver", "employee"]), getProfile);
router.put('/updateProfile',authMiddleware(["user", "admin", "seller", "driver", "employee"]), updateProfile);
router.put('/updatePassword',authMiddleware(["user", "admin", "seller", "driver", "employee"]),updatePassword)
router.get("/getSellerListt", authMiddleware(["user", "admin", "seller", "driver", "employee"]),getSellerList);
router.delete('/delete-account', authMiddleware(["user", "admin", "seller", "driver", "employee"]), deleteAccount);
router.post('/uploadProfileImage', authMiddleware(["user", "admin", "seller", "driver", "employee"]), upload.single('profileImage'), uploadProfileImage);
router.put('/updateSellerCommission', authMiddleware(["admin"]), updateSellerCommission);

// Admin 2FA routes
router.post('/admin/sendLoginOTP', sendAdminLoginOTP);
router.post('/admin/verifyLoginOTP', verifyAdminLoginOTP);

// Admin profile update
router.patch('/updateAdminDetails/:id', authMiddleware(["admin", "seller"]), updateAdminDetails);

module.exports = router;
