const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    thumbnailImage: {
      type: String,
    },
    images: [{ type: String }],
    price: {
      type: Number,
      required: true,
    },
    size: [{ type: String }],
    stock: {
      type: Number,
      default: 0,
    },
    // ── Food-specific fields ──
    isAvailable: {
      type: Boolean,
      default: true, // false = hidden from public menu
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    discount:{
      type: Number,
      default:0
    },
    actualPrice :{
      type:Number,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);