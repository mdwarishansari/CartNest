const router = require("express").Router();
const {
  registerSeller,
  getDashboard,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerOrders,
  updateOrderStatus,
  updateSellerProfile,
} = require("./seller.controller");
const {
  registerSellerValidator,
  createProductValidator,
  updateProductValidator,
  updateOrderStatusValidator,
  updateProfileValidator,
} = require("./seller.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

// All seller routes require authentication
router.use(authenticate);

// POST /api/seller/register — Register as seller (any authenticated user)
router.post("/register", registerSellerValidator, validate, registerSeller);

// Seller-only routes
router.use(authorize("seller", "admin"));

// GET /api/seller/dashboard
router.get("/dashboard", getDashboard);

// PUT /api/seller/profile
router.put("/profile", updateProfileValidator, validate, updateSellerProfile);

// GET /api/seller/products
router.get("/products", getSellerProducts);

// POST /api/seller/product
router.post("/product", createProductValidator, validate, createProduct);

// PUT /api/seller/product/:productId
router.put(
  "/product/:productId",
  updateProductValidator,
  validate,
  updateProduct,
);

// DELETE /api/seller/product/:productId
router.delete("/product/:productId", deleteProduct);

// GET /api/seller/orders
router.get("/orders", getSellerOrders);

// PUT /api/seller/order/:orderId/status
router.put(
  "/order/:orderId/status",
  updateOrderStatusValidator,
  validate,
  updateOrderStatus,
);

module.exports = router;
