const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/generateToken");

/**
 * Authenticate middleware — verifies JWT from Authorization header or cookie.
 * Attaches req.user = { id, email, role }
 */
const authenticate = (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fallback to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw ApiError.unauthorized("No token provided");
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      next(ApiError.unauthorized("Invalid or expired token"));
    } else {
      next(error);
    }
  }
};

module.exports = authenticate;
