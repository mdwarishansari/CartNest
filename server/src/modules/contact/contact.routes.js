const router = require("express").Router();
const {
  createQuery,
  getQueries,
  updateQueryStatus,
  replyToQuery,
} = require("./contact.controller");
const {
  createQueryValidator,
  updateStatusValidator,
  replyValidator,
} = require("./contact.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

// POST /api/contact — submit query (public)
router.post("/", createQueryValidator, validate, createQuery);

// Admin-only routes
router.get("/", authenticate, authorize("admin"), getQueries);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin"),
  updateStatusValidator,
  validate,
  updateQueryStatus,
);
router.post(
  "/:id/reply",
  authenticate,
  authorize("admin"),
  replyValidator,
  validate,
  replyToQuery,
);

module.exports = router;
