const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  house: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["customer", "seller", "admin", "verifier"],
      default: "customer",
    },
    firebaseUid: { type: String, sparse: true },
    isSeller: { type: Boolean, default: false },
    sellerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProfile",
    },
    phone: { type: String },
    addressBook: [addressSchema],
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  },
);

// Indexes (firebaseUid index via sparse:true in schema)
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
