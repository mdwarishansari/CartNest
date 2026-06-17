const router = require("express").Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./category.controller");
const { categoryValidator } = require("./category.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

// Public routes
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin-only routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  categoryValidator,
  validate,
  createCategory,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  categoryValidator,
  validate,
  updateCategory,
);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

module.exports = router;
