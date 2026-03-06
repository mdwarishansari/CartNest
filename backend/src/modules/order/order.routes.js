const router = require("express").Router();
const {
  checkout,
  getOrders,
  getOrderById,
  cancelOrder,
} = require("./order.controller");
const { checkoutValidator } = require("./order.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");

// All order routes require authentication
router.use(authenticate);

// POST /api/orders/checkout — reserve stock + create Razorpay order
router.post("/checkout", checkoutValidator, validate, checkout);

// GET /api/orders — list user's orders
router.get("/", getOrders);

// GET /api/orders/:orderId — single order
router.get("/:orderId", getOrderById);

// POST /api/orders/:orderId/cancel — cancel order
router.post("/:orderId/cancel", cancelOrder);

module.exports = router;
