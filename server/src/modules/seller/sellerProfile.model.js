const mongoose = require("mongoose");

const sellerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    userEmail: { type: String, required: true },
    shopName: { type: String, required: true, trim: true },
    shopSlug: { type: String, required: true, unique: true, lowercase: true },
    logo: {
      public_id: { type: String },
      url: { type: String },
    },
    description: { type: String, default: "" },
    metrics: {
      totalSales: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      commission: { type: Number, default: 0 },
      netEarnings: { type: Number, default: 0 },
      currentBalance: { type: Number, default: 0 },
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    lastPayoutDate: { type: Date },
  },
  {
    timestamps: true,
  },
);

// shopSlug index created automatically via unique:true in schema

module.exports = mongoose.model("SellerProfile", sellerProfileSchema);
