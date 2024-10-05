// src/routes/paymentRoute.js
const express = require('express');
const { createOrRenewPayment, getPaymentsForBusinessOwner, getCurrentPaymentForBusinessOwner } = require('../controllers/paymentController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.post('/create-or-renew-payment', authenticateJWT, createOrRenewPayment);
router.get('/payments', authenticateJWT, getPaymentsForBusinessOwner);
router.get('/current-payment', authenticateJWT, getCurrentPaymentForBusinessOwner);

module.exports = router;
