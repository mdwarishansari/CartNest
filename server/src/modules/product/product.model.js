const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProfile",
      required: true,
    },
    sellerEmail: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    verified: { type: Boolean, default: false },
    verificationState: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

// Indexes (slug index created via unique:true in schema)
productSchema.index({ sellerId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ verificationState: 1 });
productSchema.index({ status: 1, verified: 1 });
productSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
