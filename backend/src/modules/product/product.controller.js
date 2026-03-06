const Product = require("./product.model");
const { cloudinary } = require("../../config/cloudinary");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * GET /api/products
 * Public product listing with filters, search, and pagination.
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    search,
    sort = "-createdAt",
    verified,
  } = req.query;

  const filter = {
    status: "active",
    verificationState: "verified",
    verified: true,
  };

  // Allow admin/verifier to see unverified
  if (
    verified === "false" &&
    req.user &&
    ["admin", "verifier"].includes(req.user.role)
  ) {
    delete filter.verificationState;
    delete filter.verified;
  }

  if (category) filter.categoryId = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  const products = await Product.find(filter)
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate("categoryId", "name slug")
    .populate("sellerId", "shopName shopSlug logo")
    .select("-__v");

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
 * GET /api/products/:slug
 * Get single product by slug (public).
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    status: { $ne: "deleted" },
  })
    .populate("categoryId", "name slug")
    .populate("sellerId", "shopName shopSlug logo description");

  if (!product) throw ApiError.notFound("Product not found");

  // Increment view count (fire-and-forget)
  Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).exec();

  res.json({ success: true, data: { product } });
});

/**
 * DELETE /api/products/:id/images/:publicId
 * Delete a specific image from product and Cloudinary.
 */
const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, publicId } = req.params;

  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Product not found");

  // Verify ownership or admin
  const isSeller =
    product.sellerId.toString() === req.user.sellerProfileId?.toString();
  const isAdmin = req.user.role === "admin";

  if (!isSeller && !isAdmin) {
    throw ApiError.forbidden("Not authorized to modify this product");
  }

  // Find the image
  const decodedPublicId = decodeURIComponent(publicId);
  const imageIndex = product.images.findIndex(
    (img) => img.public_id === decodedPublicId,
  );
  if (imageIndex === -1) throw ApiError.notFound("Image not found");

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(decodedPublicId);
  } catch (err) {
    console.warn("⚠️  Cloudinary delete failed:", err.message);
  }

  // Remove from product doc
  product.images.splice(imageIndex, 1);
  await product.save();

  res.json({
    success: true,
    message: "Image deleted",
    data: { images: product.images },
  });
});

module.exports = { getProducts, getProductBySlug, deleteProductImage };
