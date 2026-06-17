const { body } = require("express-validator");

const updateProfileValidator = [
  body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("phone").optional().isString().trim(),
];

const addressValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("house").notEmpty().withMessage("House/Street is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("pincode").notEmpty().withMessage("Pincode is required"),
  body("label").optional().isString(),
  body("country").optional().isString(),
  body("isDefault").optional().isBoolean(),
];

module.exports = { updateProfileValidator, addressValidator };
