const router = require("express").Router();
const {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("./user.controller");
const {
  updateProfileValidator,
  addressValidator,
} = require("./user.validator");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");

// All user routes require authentication
router.use(authenticate);

// GET /api/users/profile
router.get("/profile", getProfile);

// PUT /api/users/profile
router.put("/profile", updateProfileValidator, validate, updateProfile);

// POST /api/users/address
router.post("/address", addressValidator, validate, addAddress);

// PUT /api/users/address/:addressId
router.put("/address/:addressId", addressValidator, validate, updateAddress);

// DELETE /api/users/address/:addressId
router.delete("/address/:addressId", deleteAddress);

module.exports = router;
