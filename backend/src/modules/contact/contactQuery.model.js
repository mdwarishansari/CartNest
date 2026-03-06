const mongoose = require("mongoose");

const contactQuerySchema = new mongoose.Schema(
  {
    fromEmail: { type: String, required: true },
    fromName: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

contactQuerySchema.index({ status: 1 });

module.exports = mongoose.model("ContactQuery", contactQuerySchema);
