const express = require('express');
const content = require('@controllers/contentManagementController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.post('/content', authMiddleware(["user", "admin", "seller"]), content.createContent);
router.get('/content', content.getContent);
router.post('/content/update', authMiddleware(["user", "admin", "seller"]), content.updateContent);

module.exports = router;