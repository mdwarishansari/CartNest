const router = require("express").Router();
const {
  getProducts,
  getProductBySlug,
  deleteProductImage,
} = require("./product.controller");
const { productQueryValidator } = require("./product.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");

// Public routes
router.get("/", productQueryValidator, validate, getProducts);
router.get("/:slug", getProductBySlug);

// Authenticated routes
router.delete("/:id/images/:publicId", authenticate, deleteProductImage);

module.exports = router;
