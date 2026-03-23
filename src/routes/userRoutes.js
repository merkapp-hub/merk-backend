const express = require('express');
const router = express.Router();
const userController = require('@controllers/userController');
const authMiddleware = require('@middlewares/authMiddleware');

router.get('/test-users', authMiddleware(['admin']), userController.testUsers);
router.get('/users', authMiddleware(['admin']), userController.getAllUsers);
router.get('/users/stats', authMiddleware(['admin']), userController.getUserStats);
router.get('/users/:userId', authMiddleware(['admin']), userController.getUserById);

module.exports = router;