const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Process EcoCash payment - requires authentication
router.post('/initiate', authMiddleware, PaymentController.processEcocashPayment);

// Check payment status - no authentication needed (public endpoint)
router.get('/:reference/status', PaymentController.checkPaymentStatus);

// Paynow webhook - must be public for PayNow to call it
router.post('/webhook', PaymentController.handlePaynowWebhook);

// Get payment history - requires authentication
router.get('/user/history', authMiddleware, PaymentController.getPaymentHistory);

// Test configuration - public endpoint
router.get('/test-config', PaymentController.testConfiguration);

module.exports = router;