const { body } = require("express-validator");

const verifyProductValidator = [
  body("verificationState")
    .notEmpty()
    .isIn(["verified", "rejected"])
    .withMessage('Must be "verified" or "rejected"'),
  body("verificationNotes").optional().isString().trim(),
];

const createVerifierValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("name").optional().isString().trim().isLength({ min: 2 }),
];

module.exports = { verifyProductValidator, createVerifierValidator };
