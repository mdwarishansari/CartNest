const VALID_ROLES = ["customer", "seller", "admin", "verifier"];

const isValidRole = (role) => VALID_ROLES.includes(role);

const hasRole = (userRole, ...allowedRoles) => allowedRoles.includes(userRole);

module.exports = {
  VALID_ROLES,
  isValidRole,
  hasRole,
};
