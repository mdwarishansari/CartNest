const admin = require("firebase-admin");
const User = require("../user/user.model");
const Product = require("../product/product.model");
const Order = require("../order/order.model");
const SellerProfile = require("../seller/sellerProfile.model");
const ContactQuery = require("../contact/contactQuery.model");
const Category = require("../category/category.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * GET /api/admin/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalSellers,
    totalProducts,
    pendingVerification,
    totalOrders,
    paidOrders,
    totalRevenue,
    totalCategories,
    openQueries,
    totalVerifiers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isSeller: true }),
    Product.countDocuments({ status: { $ne: "deleted" } }),
    Product.countDocuments({ verificationState: "pending" }),
    Order.countDocuments(),
    Order.countDocuments({ paymentStatus: "paid" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Category.countDocuments(),
    ContactQuery.countDocuments({ status: { $ne: "resolved" } }),
    User.countDocuments({ role: "verifier" }),
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select(
      "orderId userEmail totalAmount paymentStatus orderStatus createdAt",
    );

  const topSellers = await SellerProfile.find()
    .sort({ "metrics.totalSales": -1 })
    .limit(5)
    .select("shopName userEmail metrics");

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        pendingVerification,
        totalOrders,
        paidOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCategories,
        openQueries,
        totalVerifiers,
      },
      recentOrders,
      topSellers,
    },
  });
});

/**
 * GET /api/admin/products
 */
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, verificationState, status, search } = req.query;

  const filter = {};
  if (verificationState) filter.verificationState = verificationState;
  if (status) filter.status = status;
  else filter.status = { $ne: "deleted" };
  if (search) filter.$text = { $search: search };

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate("categoryId", "name slug")
    .populate("sellerId", "shopName shopSlug userEmail");

  const total = await Product.countDocuments(filter);

  res.json({
    success: true,
    data: {
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * PUT /api/admin/products/:id/verify
 */
const verifyProduct = asyncHandler(async (req, res) => {
  const { verificationState, verificationNotes } = req.body;

  if (!["verified", "rejected"].includes(verificationState)) {
    throw ApiError.badRequest(
      'verificationState must be "verified" or "rejected"',
    );
  }

  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");

  product.verificationState = verificationState;
  product.verified = verificationState === "verified";
  product.verificationNotes = verificationNotes || "";

  await product.save();

  res.json({
    success: true,
    message: `Product ${verificationState}`,
    data: { product },
  });
});

/**
 * GET /api/admin/orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, paymentStatus, orderStatus } = req.query;

  const filter = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (orderStatus) filter.orderStatus = orderStatus;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

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
 * PUT /api/admin/orders/:id/status
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  if (!orderStatus) throw ApiError.badRequest("orderStatus is required");

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found");

  order.orderStatus = orderStatus;
  if (orderStatus === "delivered") {
    order.returnWindowEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  await order.save();

  res.json({
    success: true,
    message: `Order status updated to '${orderStatus}'`,
    data: { order },
  });
});

/**
 * GET /api/admin/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .select("-__v -firebaseUid");

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "admin")
    throw ApiError.forbidden("Cannot delete admin user");

  // Delete from Firebase if firebaseUid exists
  if (user.firebaseUid) {
    try {
      await admin.auth().deleteUser(user.firebaseUid);
    } catch (fbErr) {
      console.warn("⚠️  Firebase delete failed:", fbErr.message);
    }
  } else if (user.email) {
    // Try to find by email
    try {
      const fbUser = await admin.auth().getUserByEmail(user.email);
      await admin.auth().deleteUser(fbUser.uid);
    } catch (fbErr) {
      // User may not exist in Firebase, that's ok
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: "User deleted" });
});

/**
 * POST /api/admin/verifier
 */
const createVerifier = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === "verifier") {
      throw ApiError.conflict("Verifier already exists");
    }
    existing.role = "verifier";
    await existing.save();
    return res.json({
      success: true,
      message: "User promoted to verifier",
      data: { user: existing },
    });
  }

  // Create Firebase auth user so verifier can log in
  let firebaseUid = null;
  if (password) {
    try {
      let fbUser;
      try {
        fbUser = await admin.auth().getUserByEmail(email);
      } catch {
        fbUser = await admin.auth().createUser({
          email,
          password,
          displayName: name || email.split("@")[0],
          emailVerified: true,
        });
      }
      firebaseUid = fbUser.uid;
    } catch (fbErr) {
      console.error(
        "Failed to create Firebase user for verifier:",
        fbErr.message,
      );
    }
  }

  const verifier = await User.create({
    email,
    name: name || email.split("@")[0],
    role: "verifier",
    firebaseUid,
  });

  res.status(201).json({
    success: true,
    message:
      "Verifier created" + (firebaseUid ? " with login credentials" : ""),
    data: { user: verifier },
  });
});

/**
 * GET /api/admin/reports
 */
const getReports = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const dailySales = await Order.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const categorySales = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: startDate } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category.name",
        totalSales: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
  ]);

  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: startDate } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        title: { $first: "$items.title" },
        totalQty: { $sum: "$items.qty" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
  ]);

  const verificationStats = await Product.aggregate([
    { $match: { status: { $ne: "deleted" } } },
    { $group: { _id: "$verificationState", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      dailySales,
      categorySales,
      topProducts,
      verificationStats,
      period: { days: Number(days), startDate },
    },
  });
});

// ── Contact Query management (admin) ──

/**
 * GET /api/admin/contacts
 */
const getContactQueries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const queries = await ContactQuery.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await ContactQuery.countDocuments(filter);

  res.json({
    success: true,
    data: {
      queries,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * PUT /api/admin/contacts/:id/status
 */
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const query = await ContactQuery.findById(req.params.id);
  if (!query) throw ApiError.notFound("Query not found");

  query.status = status;
  query.handledBy = req.user.id;
  await query.save();

  res.json({
    success: true,
    message: `Query status updated to '${status}'`,
    data: { query },
  });
});

/**
 * POST /api/admin/contacts/:id/reply
 */
const replyToContact = asyncHandler(async (req, res) => {
  const { replyMessage } = req.body;
  if (!replyMessage) throw ApiError.badRequest("Reply message is required");

  const query = await ContactQuery.findById(req.params.id);
  if (!query) throw ApiError.notFound("Query not found");

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${process.env.SITE_NAME || "CartNest"}" <${process.env.SMTP_USER}>`,
      to: query.fromEmail,
      subject: `Re: ${query.subject}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">CartNest Support</h2>
        <p>Hi ${query.fromName},</p>
        <p>${replyMessage}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">This is in response to your query: "${query.subject}"</p>
      </div>`,
    });
  }

  query.status = "resolved";
  query.handledBy = req.user.id;
  await query.save();

  res.json({ success: true, message: "Reply sent", data: { query } });
});

/**
 * DELETE /api/admin/contacts/:id
 */
const deleteContact = asyncHandler(async (req, res) => {
  const query = await ContactQuery.findById(req.params.id);
  if (!query) throw ApiError.notFound("Query not found");

  await ContactQuery.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: "Query deleted" });
});

module.exports = {
  getDashboard,
  getProducts,
  verifyProduct,
  getOrders,
  updateOrderStatus,
  getUsers,
  deleteUser,
  createVerifier,
  getReports,
  getContactQueries,
  updateContactStatus,
  replyToContact,
  deleteContact,
};
