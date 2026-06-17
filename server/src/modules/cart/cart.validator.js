const { body } = require("express-validator");

const addToCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId(),
  body("qty")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

const updateCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId(),
  body("qty").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

module.exports = { addToCartValidator, updateCartValidator };
