const router = require("express").Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("./cart.controller");
const { addToCartValidator, updateCartValidator } = require("./cart.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart
router.get("/", getCart);

// POST /api/cart — add item
router.post("/", addToCartValidator, validate, addToCart);

// PUT /api/cart — update qty
router.put("/", updateCartValidator, validate, updateCartItem);

// DELETE /api/cart/clear — clear entire cart
router.delete("/clear", clearCart);

// DELETE /api/cart/:productId — remove single item
router.delete("/:productId", removeFromCart);

module.exports = router;
