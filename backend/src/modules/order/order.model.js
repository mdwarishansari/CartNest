const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellerProfile",
    required: true,
  },
  productSnapshot: {
    price: Number,
    title: String,
    images: [{ public_id: String, url: String }],
    slug: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => `CN-${nanoid(10).toUpperCase()}`,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: { type: String, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "placed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    razorpay: {
      order_id: { type: String },
      payment_id: { type: String },
      signature: { type: String },
    },
    shippingAddress: {
      name: String,
      phone: String,
      house: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    returnWindowEndsAt: { type: Date },
    payouts: {
      released: { type: Boolean, default: false },
      releasedAt: { type: Date },
      amount: { type: Number },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
orderSchema.index({ userId: 1 });
// orderId index created automatically via unique:true in schema
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "items.sellerId": 1 });

module.exports = mongoose.model("Order", orderSchema);
