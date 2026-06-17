const { body } = require("express-validator");

const categoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .trim()
    .isLength({ min: 2, max: 100 }),
  body("description").optional().isString().trim(),
];

module.exports = { categoryValidator };
