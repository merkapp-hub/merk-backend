const express = require('express');
const router = express.Router();
const paypalController = require('@controllers/paypalController');
const passport = require('passport');


const authenticate = passport.authenticate('jwt', { session: false });


router.post('/paypal/create-order', authenticate, paypalController.createOrder);


router.post('/paypal/capture-order', authenticate, paypalController.captureOrder);


router.get('/paypal/order/:orderID', authenticate, paypalController.getOrderDetails);


router.post('/paypal/refund', authenticate, paypalController.refundPayment);

// Card Payment (In-App)
router.post('/paypal/process-card-payment', authenticate, paypalController.processCardPayment);
router.post('/paypal/process-card-payment/new', authenticate, paypalController.processCardPaymentNew);

router.post('/setup-token', paypalController.setupToken);
router.post('/save-payment-token', paypalController.savePaymentToken);

module.exports = router;
