const { body } = require("express-validator");

const sessionValidator = [
  body("idToken")
    .notEmpty()
    .withMessage("Firebase ID token is required")
    .isString()
    .withMessage("Token must be a string"),
];

module.exports = { sessionValidator };
