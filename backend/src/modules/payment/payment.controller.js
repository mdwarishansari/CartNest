const crypto = require("crypto");
const Order = require("../order/order.model");
const Product = require("../product/product.model");
const SellerProfile = require("../seller/sellerProfile.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature after frontend checkout.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderId
  ) {
    throw ApiError.badRequest("Missing payment details");
  }

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    // Mark payment as failed
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    throw ApiError.badRequest(
      "Payment verification failed — invalid signature",
    );
  }

  // Find order and check idempotency
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");

  if (order.paymentStatus === "paid") {
    return res.json({
      success: true,
      message: "Payment already verified",
      data: { order },
    });
  }

  // Update order
  order.paymentStatus = "paid";
  order.orderStatus = "placed";
  order.razorpay = {
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id,
    signature: razorpay_signature,
  };
  await order.save();

  // Finalize reserved stock: decrement reserved count
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { reserved: -item.qty },
    });
  }

  // Update seller metrics with 10% commission
  const COMMISSION_RATE = 0.10;
  const sellerAmounts = {};
  for (const item of order.items) {
    const sid = item.sellerId.toString();
    sellerAmounts[sid] = (sellerAmounts[sid] || 0) + item.price * item.qty;
  }

  for (const [sellerId, amount] of Object.entries(sellerAmounts)) {
    const commissionAmount = Math.round(amount * COMMISSION_RATE * 100) / 100;
    const netAmount = amount - commissionAmount;
    await SellerProfile.findByIdAndUpdate(sellerId, {
      $inc: {
        "metrics.totalSales": amount,
        "metrics.totalOrders": 1,
        "metrics.commission": commissionAmount,
        "metrics.netEarnings": netAmount,
        "metrics.currentBalance": netAmount,
      },
    });
  }

  res.json({
    success: true,
    message: "Payment verified successfully",
    data: { order },
  });
});

/**
 * POST /api/webhooks/razorpay
 * Razorpay webhook handler for payment events.
 */
const razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("⚠️  Razorpay webhook secret not configured");
    return res.status(200).json({ success: true });
  }

  // Verify webhook signature
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.warn("⚠️  Invalid webhook signature");
    return res.status(400).json({ success: false });
  }

  const event = req.body.event;
  const payment = req.body.payload?.payment?.entity;

  if (event === "payment.captured" && payment) {
    const razorpayOrderId = payment.order_id;

    // Find order by Razorpay order ID
    const order = await Order.findOne({ "razorpay.order_id": razorpayOrderId });

    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.orderStatus = "placed";
      order.razorpay.payment_id = payment.id;
      await order.save();

      // Finalize stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { reserved: -item.qty },
        });
      }

      console.log(`✅ Webhook: Order ${order.orderId} payment confirmed`);
    }
  }

  // Always return 200 to Razorpay
  res.status(200).json({ success: true });
});

module.exports = { verifyPayment, razorpayWebhook };
