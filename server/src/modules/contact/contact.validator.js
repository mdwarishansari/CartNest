const { body } = require("express-validator");

const createQueryValidator = [
  body("fromEmail").isEmail().withMessage("Valid email is required"),
  body("fromName").notEmpty().withMessage("Name is required").trim(),
  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .trim()
    .isLength({ max: 200 }),
  body("message").notEmpty().withMessage("Message is required").trim(),
  body("productId").optional().isMongoId(),
];

const updateStatusValidator = [
  body("status")
    .notEmpty()
    .isIn(["new", "in_progress", "resolved"])
    .withMessage("Status must be new, in_progress, or resolved"),
];

const replyValidator = [
  body("replyMessage")
    .notEmpty()
    .withMessage("Reply message is required")
    .trim(),
];

module.exports = {
  createQueryValidator,
  updateStatusValidator,
  replyValidator,
};
