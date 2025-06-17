const express = require('express');
const withdrawreq = require('@controllers/withdrawreq');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.post("/createWithdrawreq", authMiddleware(["user", "admin", "seller", "driver"]), withdrawreq.createWithdrawreq);
router.get("/getWithdrawreq", authMiddleware(["user", "admin", "seller", "driver"]), withdrawreq.getWithdrawreq);
router.get("/getWithdrawreqbyseller", authMiddleware(["user", "admin", "seller", "driver"]), withdrawreq.getWithdrawreqbyseller);
router.post("/updateWithdrawreq", authMiddleware(["user", "admin", "seller", "driver"]), withdrawreq.updateWithdrawreq);

module.exports = router;