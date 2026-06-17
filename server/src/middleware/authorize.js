const ApiError = require("../utils/ApiError");

/**
 * Authorization middleware — checks if user has one of the allowed roles.
 * Must be used AFTER authenticate middleware.
 * Usage: authorize('admin', 'seller')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`,
        ),
      );
    }

    next();
  };
};

module.exports = authorize;
