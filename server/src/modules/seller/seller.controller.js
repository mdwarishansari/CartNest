const User = require("../user/user.model");
const SellerProfile = require("./sellerProfile.model");
const Product = require("../product/product.model");
const Order = require("../order/order.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { generateSlug, generateCleanSlug } = require("../../utils/slugify");
const { cloudinary } = require("../../config/cloudinary");

/**
 * POST /api/seller/register
 * Register the current user as a seller.
 */
const registerSeller = asyncHandler(async (req, res) => {
  const { shopName, description, logo } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");

  if (user.isSeller) {
    throw ApiError.conflict("You are already registered as a seller");
  }

  // Generate shop slug
  let shopSlug = generateCleanSlug(shopName);
  const existing = await SellerProfile.findOne({ shopSlug });
  if (existing) {
    shopSlug = generateSlug(shopName); // add random suffix
  }

  const sellerProfile = await SellerProfile.create({
    userId: user._id,
    userEmail: user.email,
    shopName,
    shopSlug,
    description: description || "",
    logo: logo || {},
  });

  // Update user
  user.isSeller = true;
  user.role = "seller";
  user.sellerProfileId = sellerProfile._id;
  await user.save();

  res.status(201).json({
    success: true,
    message: "Seller registration successful",
    data: { sellerProfile },
  });
});

/**
 * GET /api/seller/dashboard
 * Get seller dashboard data.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const sellerProfile = await SellerProfile.findById(user.sellerProfileId);
  if (!sellerProfile) throw ApiError.notFound("Seller profile not found");

  // Get counts
  const [productCount, orderCount, recentOrders] = await Promise.all([
    Product.countDocuments({
      sellerId: sellerProfile._id,
      status: { $ne: "deleted" },
    }),
    Order.countDocuments({ "items.sellerId": sellerProfile._id }),
    Order.find({ "items.sellerId": sellerProfile._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId totalAmount orderStatus paymentStatus createdAt"),
  ]);

  res.json({
    success: true,
    data: {
      profile: sellerProfile,
      stats: {
        totalProducts: productCount,
        totalOrders: orderCount,
        totalSales: sellerProfile.metrics.totalSales,
        currentBalance: sellerProfile.metrics.currentBalance,
      },
      recentOrders,
    },
  });
});

/**
 * GET /api/seller/products
 * List all products for the current seller.
 */
const getSellerProducts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const { page = 1, limit = 20, status, verificationState } = req.query;

  const filter = { sellerId: user.sellerProfileId, status: { $ne: "deleted" } };
  if (status) filter.status = status;
  if (verificationState) filter.verificationState = verificationState;

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("categoryId", "name slug");

  const total = await Product.countDocuments(filter);

  res.json({
    success: true,
    data: {
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/seller/product
 * Create a new product.
 */
const createProduct = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const { title, description, price, mrp, categoryId, stock, images, tags } =
    req.body;

  const slug = generateSlug(title);

  const product = await Product.create({
    sellerId: user.sellerProfileId,
    sellerEmail: user.email,
    title,
    slug,
    description,
    price,
    mrp: mrp || price,
    categoryId,
    stock: stock || 0,
    images: images || [],
    tags: tags || [],
  });

  res.status(201).json({
    success: true,
    message: "Product created",
    data: { product },
  });
});

/**
 * PUT /api/seller/product/:productId
 * Update a product owned by the seller.
 */
const updateProduct = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const product = await Product.findOne({
    _id: req.params.productId,
    sellerId: user.sellerProfileId,
    status: { $ne: "deleted" },
  });

  if (!product) throw ApiError.notFound("Product not found");

  const allowedFields = [
    "title",
    "description",
    "price",
    "mrp",
    "categoryId",
    "stock",
    "images",
    "tags",
    "status",
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // Regenerate slug if title changed
  if (req.body.title) {
    product.slug = generateSlug(req.body.title);
  }

  // Reset verification when product is modified
  if (
    req.body.title ||
    req.body.description ||
    req.body.price ||
    req.body.images
  ) {
    product.verified = false;
    product.verificationState = "pending";
    product.verificationNotes = "";
  }

  await product.save();

  res.json({
    success: true,
    message: "Product updated",
    data: { product },
  });
});

/**
 * DELETE /api/seller/product/:productId
 * Soft-delete a product and remove Cloudinary images.
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const product = await Product.findOne({
    _id: req.params.productId,
    sellerId: user.sellerProfileId,
  });

  if (!product) throw ApiError.notFound("Product not found");

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    const deletePromises = product.images.map((img) =>
      cloudinary.uploader.destroy(img.public_id).catch((err) => {
        console.warn(
          `⚠️  Failed to delete Cloudinary image ${img.public_id}:`,
          err.message,
        );
      }),
    );
    await Promise.all(deletePromises);
  }

  product.status = "deleted";
  await product.save();

  res.json({ success: true, message: "Product deleted" });
});

/**
 * GET /api/seller/orders
 * List orders containing products from this seller.
 */
const getSellerOrders = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const { page = 1, limit = 20, orderStatus } = req.query;

  const filter = { "items.sellerId": user.sellerProfileId };
  if (orderStatus) filter.orderStatus = orderStatus;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * PUT /api/seller/order/:orderId/status
 * Update order status (seller can move: processing → shipped → out_for_delivery).
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const allowedTransitions = {
    placed: ["processing"],
    processing: ["shipped"],
    shipped: ["out_for_delivery"],
    out_for_delivery: ["delivered"],
  };

  const order = await Order.findOne({
    _id: orderId,
    "items.sellerId": user.sellerProfileId,
  });

  if (!order) throw ApiError.notFound("Order not found");

  const allowed = allowedTransitions[order.orderStatus];
  if (!allowed || !allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition from '${order.orderStatus}' to '${status}'`,
    );
  }

  order.orderStatus = status;

  // Set return window on delivery
  if (status === "delivered") {
    order.returnWindowEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  await order.save();

  res.json({
    success: true,
    message: `Order status updated to '${status}'`,
    data: { order },
  });
});

/**
 * PUT /api/seller/profile
 * Update seller profile (shopName, description, logo).
 */
const updateSellerProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isSeller)
    throw ApiError.forbidden("Seller access required");

  const sellerProfile = await SellerProfile.findById(user.sellerProfileId);
  if (!sellerProfile) throw ApiError.notFound("Seller profile not found");

  const { shopName, description, logo } = req.body;

  if (shopName) {
    sellerProfile.shopName = shopName;
    let shopSlug = generateCleanSlug(shopName);
    const existing = await SellerProfile.findOne({
      shopSlug,
      _id: { $ne: sellerProfile._id },
    });
    if (existing) shopSlug = generateSlug(shopName);
    sellerProfile.shopSlug = shopSlug;
  }
  if (description !== undefined) sellerProfile.description = description;
  if (logo) sellerProfile.logo = logo;

  await sellerProfile.save();

  res.json({
    success: true,
    message: "Seller profile updated",
    data: { sellerProfile },
  });
});

module.exports = {
  registerSeller,
  getDashboard,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerOrders,
  updateOrderStatus,
  updateSellerProfile,
};
