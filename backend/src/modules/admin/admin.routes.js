const router = require("express").Router();
const {
  getDashboard,
  getProducts,
  verifyProduct,
  getOrders,
  getUsers,
  createVerifier,
  getReports,
  getContactQueries,
  updateContactStatus,
  replyToContact,
  deleteContact,
  deleteUser,
  updateOrderStatus,
} = require("./admin.controller");
const {
  verifyProductValidator,
  createVerifierValidator,
} = require("./admin.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

// All admin routes require admin role
router.use(authenticate);

// Verifier gets access to products list + verification
router.get("/products", authorize("admin", "verifier"), getProducts);
router.put(
  "/products/:id/verify",
  authorize("admin", "verifier"),
  verifyProductValidator,
  validate,
  verifyProduct,
);

// Admin-only routes
router.use(authorize("admin"));

// GET /api/admin/dashboard
router.get("/dashboard", getDashboard);

// GET /api/admin/orders
router.get("/orders", getOrders);

// PUT /api/admin/orders/:id/status
router.put("/orders/:id/status", updateOrderStatus);

// GET /api/admin/users
router.get("/users", getUsers);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

// POST /api/admin/verifier
router.post("/verifier", createVerifierValidator, validate, createVerifier);

// GET /api/admin/reports
router.get("/reports", getReports);

// Contact queries (admin)
router.get("/contacts", getContactQueries);
router.put("/contacts/:id/status", updateContactStatus);
router.post("/contacts/:id/reply", replyToContact);
router.delete("/contacts/:id", deleteContact);

module.exports = router;
