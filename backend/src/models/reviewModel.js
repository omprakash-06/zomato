const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

// Ek order pe ek hi review — duplicate review rok do
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });
// Restaurant page pe reviews fetch fast ho, isliye index
reviewSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
