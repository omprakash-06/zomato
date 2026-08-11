const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");
const Seller = require("../models/sellerModel");

const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, rating, comment } = req.body;

        if (!orderId || !rating) {
            return res.status(400).json({ success: false, message: "orderId and rating are required." });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        if (order.buyerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized." });
        }
        if (order.orderStatus !== "delivered") {
            return res.status(400).json({ success: false, message: "You can only review after the order is delivered." });
        }

        const alreadyReviewed = await Review.findOne({ userId, orderId });
        if (alreadyReviewed) {
            return res.status(409).json({ success: false, message: "You have already reviewed this order." });
        }

        // FIX: order.sellerId is the seller's *User* _id, but Review.sellerId
        // (like Like.sellerId) should point at the Seller document's own _id,
        // since that's what the restaurant pages/URLs use. Resolve it here.
        const seller = await Seller.findOne({ userId: order.sellerId });
        if (!seller) {
            return res.status(404).json({ success: false, message: "Restaurant not found for this order." });
        }

        const review = await Review.create({
            userId,
            sellerId: seller._id,
            orderId,
            rating: Number(rating),
            comment: comment || "",
        });

        const newCount = seller.ratingCount + 1;
        const newAvg = (seller.avgRating * seller.ratingCount + Number(rating)) / newCount;
        seller.ratingCount = newCount;
        seller.avgRating = Math.round(newAvg * 10) / 10;
        await seller.save();

        const populated = await review.populate("userId", "name");

        return res.status(201).json({
            success: true,
            message: "Review submitted.",
            data: populated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "You have already reviewed this order." });
        }
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// ─── Get Reviews for a Restaurant (public) ─────────────────
const getSellerReviews = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ sellerId })
                .populate("userId", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ sellerId }),
        ]);

        return res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// ─── Check if current user can review an order ─────────────
const getReviewableStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order || order.buyerId.toString() !== userId) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        const existing = await Review.findOne({ userId, orderId });

        return res.status(200).json({
            success: true,
            canReview: order.orderStatus === "delivered" && !existing,
            alreadyReviewed: !!existing,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

module.exports = { createReview, getSellerReviews, getReviewableStatus };
