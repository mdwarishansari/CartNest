const router = require("express").Router();
const { verifyPayment, razorpayWebhook } = require("./payment.controller");
const authenticate = require("../../middleware/authenticate");

// POST /api/payments/verify — verify payment (authenticated)
router.post("/verify", authenticate, verifyPayment);

// POST /api/webhooks/razorpay — webhook (no auth — Razorpay calls this)
// Mounted at /api/payments/webhook but also aliased in app.js for /api/webhooks/razorpay
router.post("/webhook", razorpayWebhook);

module.exports = router;
