const User = require("./user.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

/**
 * GET /api/users/profile
 * Get current user's full profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-__v -firebaseUid")
    .populate("sellerProfileId");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json({ success: true, data: { user } });
});

/**
 * PUT /api/users/profile
 * Update user profile fields (name, phone).
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated",
    data: { user },
  });
});

/**
 * POST /api/users/address
 * Add a new address to address book.
 */
const addAddress = asyncHandler(async (req, res) => {
  const {
    label,
    name,
    phone,
    house,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");

  // If isDefault, unset other defaults
  if (isDefault) {
    user.addressBook.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addressBook.push({
    label,
    name,
    phone,
    house,
    city,
    state,
    pincode,
    country,
    isDefault,
  });
  await user.save();

  res.status(201).json({
    success: true,
    message: "Address added",
    data: { addressBook: user.addressBook },
  });
});

/**
 * PUT /api/users/address/:addressId
 * Update an existing address.
 */
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");

  const address = user.addressBook.id(addressId);
  if (!address) throw ApiError.notFound("Address not found");

  const {
    label,
    name,
    phone,
    house,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  if (isDefault) {
    user.addressBook.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  if (label) address.label = label;
  if (name) address.name = name;
  if (phone) address.phone = phone;
  if (house) address.house = house;
  if (city) address.city = city;
  if (state) address.state = state;
  if (pincode) address.pincode = pincode;
  if (country) address.country = country;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await user.save();

  res.json({
    success: true,
    message: "Address updated",
    data: { addressBook: user.addressBook },
  });
});

/**
 * DELETE /api/users/address/:addressId
 * Remove an address from address book.
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound("User not found");

  const address = user.addressBook.id(addressId);
  if (!address) throw ApiError.notFound("Address not found");

  address.deleteOne();
  await user.save();

  res.json({
    success: true,
    message: "Address deleted",
    data: { addressBook: user.addressBook },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};
