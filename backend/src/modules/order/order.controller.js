const mongoose = require("mongoose");
const Order = require("./order.model");
const Cart = require("../cart/cart.model");
const Product = require("../product/product.model");
const SellerProfile = require("../seller/sellerProfile.model");
const { getRazorpay } = require("../../config/razorpay");
const { withLock } = require("../../utils/redisLock");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * POST /api/orders/checkout
 * Reserve stock, create order, create Razorpay order.
 */
const checkout = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress || !shippingAddress.name || !shippingAddress.pincode) {
    throw ApiError.badRequest("Valid shipping address is required");
  }

  // Get user's cart
  const cart = await Cart.findOne({ userId: req.user.id }).populate({
    path: "items.productId",
    select: "title price stock reserved images slug sellerId",
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest("Cart is empty");
  }

  // Validate all items are available
  for (const item of cart.items) {
    if (!item.productId) {
      throw ApiError.badRequest(
        "A product in your cart is no longer available",
      );
    }
    if (item.productId.stock < item.qty) {
      throw ApiError.badRequest(
        `Insufficient stock for "${item.productId.title}". Available: ${item.productId.stock}`,
      );
    }
  }

  // Calculate total
  let totalAmount = 0;
  const orderItems = cart.items.map((item) => {
    const product = item.productId;
    const itemTotal = product.price * item.qty;
    totalAmount += itemTotal;

    return {
      productId: product._id,
      title: product.title,
      price: product.price,
      qty: item.qty,
      sellerId: item.sellerId,
      productSnapshot: {
        price: product.price,
        title: product.title,
        images: product.images?.slice(0, 1) || [],
        slug: product.slug,
      },
    };
  });

  // Reserve stock using Mongo transaction + Redis locks
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of cart.items) {
      const product = item.productId;

      // Use Redis lock for extra safety
      await withLock(`lock:product:${product._id}`, async () => {
        const result = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty, reserved: item.qty } },
          { session, new: true },
        );

        if (!result) {
          throw ApiError.badRequest(
            `Failed to reserve stock for "${product.title}"`,
          );
        }
      });
    }

    // Create order document
    const order = new Order({
      userId: req.user.id,
      userEmail: req.user.email,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    await order.save({ session });

    // Create Razorpay order
    const razorpay = getRazorpay();
    let razorpayOrder = null;

    if (razorpay) {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: order.orderId,
        notes: { orderId: order._id.toString() },
      });

      order.razorpay = { order_id: razorpayOrder.id };
      await order.save({ session });
    }

    await session.commitTransaction();

    // Clear cart after successful checkout
    await Cart.findOneAndDelete({ userId: req.user.id });

    res.status(201).json({
      success: true,
      message: "Order created",
      data: {
        order: {
          _id: order._id,
          orderId: order.orderId,
          totalAmount: order.totalAmount,
          items: order.items,
        },
        razorpay: razorpayOrder
          ? {
              order_id: razorpayOrder.id,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              key_id: process.env.RAZORPAY_KEY_ID,
            }
          : null,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * GET /api/orders
 * List current user's orders.
 */
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const orders = await Order.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Order.countDocuments({ userId: req.user.id });

  res.json({
    success: true,
    data: {
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * GET /api/orders/:orderId
 * Get single order detail.
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user.id,
  });

  if (!order) throw ApiError.notFound("Order not found");

  res.json({ success: true, data: { order } });
});

/**
 * POST /api/orders/:orderId/cancel
 * Cancel a pending/placed order.
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user.id,
  });

  if (!order) throw ApiError.notFound("Order not found");

  if (!["pending", "placed"].includes(order.orderStatus)) {
    throw ApiError.badRequest("Order cannot be cancelled at this stage");
  }

  // Restore stock
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { _id: item.productId },
        { $inc: { stock: item.qty, reserved: -item.qty } },
        { session },
      );
    }

    order.orderStatus = "cancelled";
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
    await order.save({ session });

    await session.commitTransaction();

    res.json({ success: true, message: "Order cancelled", data: { order } });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = { checkout, getOrders, getOrderById, cancelOrder };
