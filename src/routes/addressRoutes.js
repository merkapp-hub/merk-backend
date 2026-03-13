const express = require('express');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('@controllers/addressController');

const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();

router.get('/user/addresses', authMiddleware(["user", "admin", "seller"]), getAddresses);
router.post('/user/addresses/add', authMiddleware(["user", "admin", "seller"]), addAddress);
router.post('/user/addresses/update', authMiddleware(["user", "admin", "seller"]), updateAddress);
router.post('/user/addresses/delete', authMiddleware(["user", "admin", "seller"]), deleteAddress);
router.post('/user/addresses/set-default', authMiddleware(["user", "admin", "seller"]), setDefaultAddress);

module.exports = router;