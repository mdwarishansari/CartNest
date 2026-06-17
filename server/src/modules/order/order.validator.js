const { body } = require("express-validator");

const checkoutValidator = [
  body("shippingAddress")
    .isObject()
    .withMessage("Shipping address is required"),
  body("shippingAddress.name").notEmpty().withMessage("Name is required"),
  body("shippingAddress.phone").notEmpty().withMessage("Phone is required"),
  body("shippingAddress.house").notEmpty().withMessage("Address is required"),
  body("shippingAddress.city").notEmpty().withMessage("City is required"),
  body("shippingAddress.state").notEmpty().withMessage("State is required"),
  body("shippingAddress.pincode").notEmpty().withMessage("Pincode is required"),
];

module.exports = { checkoutValidator };
