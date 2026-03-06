const { body } = require("express-validator");

const registerSellerValidator = [
  body("shopName")
    .notEmpty()
    .withMessage("Shop name is required")
    .trim()
    .isLength({ min: 2, max: 100 }),
  body("description").optional().isString().trim(),
  body("logo").optional().isObject(),
  body("logo.public_id").optional().isString(),
  body("logo.url").optional().isString(),
];

const createProductValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 2, max: 200 }),
  body("description").optional().isString(),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("mrp").optional().isFloat({ min: 0 }),
  body("categoryId").notEmpty().withMessage("Category is required").isMongoId(),
  body("stock").optional().isInt({ min: 0 }),
  body("images").optional().isArray(),
  body("images.*.public_id").optional().isString(),
  body("images.*.url").optional().isString(),
  body("images.*.alt").optional().isString(),
  body("tags").optional().isArray(),
];

const updateProductValidator = [
  body("title").optional().isString().trim().isLength({ min: 2, max: 200 }),
  body("description").optional().isString(),
  body("price").optional().isFloat({ min: 0 }),
  body("mrp").optional().isFloat({ min: 0 }),
  body("categoryId").optional().isMongoId(),
  body("stock").optional().isInt({ min: 0 }),
  body("images").optional().isArray(),
  body("tags").optional().isArray(),
  body("status").optional().isIn(["active", "inactive"]),
];

const updateOrderStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["processing", "shipped", "out_for_delivery", "delivered"])
    .withMessage("Invalid status"),
];

const updateProfileValidator = [
  body("shopName").optional().isString().trim().isLength({ min: 2, max: 100 }),
  body("description").optional().isString(),
  body("logo").optional().isObject(),
];

module.exports = {
  registerSellerValidator,
  createProductValidator,
  updateProductValidator,
  updateOrderStatusValidator,
  updateProfileValidator,
};
