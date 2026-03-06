const router = require("express").Router();
const { createSession, getMe, logout } = require("./auth.controller");
const { sessionValidator } = require("./auth.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");

// POST /api/auth/session — Verify Firebase token, create app JWT
router.post("/session", sessionValidator, validate, createSession);

// GET /api/auth/me — Get current user (requires auth)
router.get("/me", authenticate, getMe);

// POST /api/auth/logout — Clear auth cookie
router.post("/logout", authenticate, logout);

module.exports = router;
