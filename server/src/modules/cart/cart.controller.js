const Cart = require("./cart.model");
const Product = require("../product/product.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * GET /api/cart
 * Get the current user's cart with populated product details.
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id })
    .populate({
      path: "items.productId",
      select:
        "title slug price mrp stock images status verified verificationState",
    })
    .populate({
      path: "items.sellerId",
      select: "shopName shopSlug",
    });

  if (!cart) {
    cart = { items: [], userId: req.user.id };
  }

  res.json({ success: true, data: { cart } });
});

/**
 * POST /api/cart
 * Add an item to cart. If product already exists, increment qty.
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;

  // Validate product
  const product = await Product.findOne({
    _id: productId,
    status: "active",
    verified: true,
  });
  if (!product) throw ApiError.notFound("Product not found or unavailable");

  if (product.stock < qty) {
    throw ApiError.badRequest(`Only ${product.stock} items in stock`);
  }

  let cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    cart = new Cart({
      userId: req.user.id,
      userEmail: req.user.email,
      items: [],
    });
  }

  // Check if product already in cart
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (existingItem) {
    existingItem.qty += qty;
    if (existingItem.qty > product.stock) {
      throw ApiError.badRequest(`Only ${product.stock} items in stock`);
    }
  } else {
    cart.items.push({
      productId,
      qty,
      priceAtAdd: product.price,
      sellerId: product.sellerId,
    });
  }

  await cart.save();

  // Populate for response
  await cart.populate([
    {
      path: "items.productId",
      select: "title slug price mrp stock images status",
    },
    { path: "items.sellerId", select: "shopName shopSlug" },
  ]);

  res.json({
    success: true,
    message: "Item added to cart",
    data: { cart },
  });
});

/**
 * PUT /api/cart
 * Update item qty in cart.
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;

  if (qty < 1) {
    throw ApiError.badRequest("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) throw ApiError.notFound("Cart not found");

  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) throw ApiError.notFound("Item not in cart");

  // Check stock
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");
  if (qty > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} items in stock`);
  }

  item.qty = qty;
  await cart.save();

  await cart.populate([
    {
      path: "items.productId",
      select: "title slug price mrp stock images status",
    },
    { path: "items.sellerId", select: "shopName shopSlug" },
  ]);

  res.json({
    success: true,
    message: "Cart updated",
    data: { cart },
  });
});

/**
 * DELETE /api/cart/:productId
 * Remove an item from cart.
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) throw ApiError.notFound("Cart not found");

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId,
  );

  await cart.save();

  await cart.populate([
    {
      path: "items.productId",
      select: "title slug price mrp stock images status",
    },
    { path: "items.sellerId", select: "shopName shopSlug" },
  ]);

  res.json({
    success: true,
    message: "Item removed from cart",
    data: { cart },
  });
});

/**
 * DELETE /api/cart
 * Clear entire cart.
 */
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user.id });

  res.json({ success: true, message: "Cart cleared" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
