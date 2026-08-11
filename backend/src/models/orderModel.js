const mongoose = require("mongoose");

const addressSchema = require("../utils/addressSchema");

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: { type: Number },
        size:     { type: String },
        price:    { type: Number },  
      },
    ],
    deliveryAddress: {
      type : addressSchema,
      required:true,
    },
    totalAmount:   { type: Number, required: true },
    deliveryCharge:{ type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    razorpay_order_id:   { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order",orderSchema);