const admin = require("firebase-admin");
const User = require("../user/user.model");
const { signToken } = require("../../utils/generateToken");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * POST /api/auth/session
 * Verify Firebase ID token and create app JWT session.
 */
const createSession = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw ApiError.badRequest("Firebase ID token is required");
  }

  // Verify Firebase token
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw ApiError.unauthorized("Invalid Firebase token");
  }

  const { uid, email, name, email_verified } = decodedToken;

  // Check sign-in provider
  const signInProvider = decodedToken.firebase?.sign_in_provider || "password";
  const isGoogleLogin = signInProvider === "google.com";

  // Block unverified email for email/password signups (not Google)
  if (!isGoogleLogin && !email_verified) {
    throw ApiError.forbidden(
      "Please verify your email before logging in. Check your inbox for the verification link.",
    );
  }

  // Find or create user
  let user = await User.findOne({ email });

  if (!user) {
    // Auto-assign admin role if email matches seed
    const isAdmin =
      process.env.ADMIN_SEED_EMAIL && email === process.env.ADMIN_SEED_EMAIL;

    user = await User.create({
      email,
      name: name || decodedToken.name || email.split("@")[0],
      firebaseUid: uid,
      role: isAdmin ? "admin" : "customer",
    });

    if (isAdmin) {
      console.log(`✅ Admin auto-promoted on first login: ${email}`);
    }
  } else {
    // Update firebaseUid if not set
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
    }

    // Auto-promote to admin if email matches seed and user isn't already admin
    if (
      process.env.ADMIN_SEED_EMAIL &&
      email === process.env.ADMIN_SEED_EMAIL &&
      user.role !== "admin"
    ) {
      user.role = "admin";
      console.log(`✅ Existing user promoted to admin: ${email}`);
    }

    user.lastLogin = new Date();
    await user.save();
  }

  // Generate app JWT
  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: "Session created",
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSeller: user.isSeller,
      },
    },
  });
});

/**
 * POST /api/auth/refresh-token
 * Generate a new JWT with current user role from DB.
 * Used after role changes (e.g., seller registration).
 */
const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");

  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSeller: user.isSeller,
      },
    },
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-__v")
    .populate("sellerProfileId");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * POST /api/auth/logout
 * Clear auth cookie.
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = { createSession, refreshToken, getMe, logout };
