const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// Ek user ek restaurant ko ek hi baar like kare (toggle logic controller mein)
likeSchema.index({ userId: 1, sellerId: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
