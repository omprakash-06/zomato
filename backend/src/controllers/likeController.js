const Like = require("../models/likeModel");
const Seller = require("../models/sellerModel");

// ─── Toggle Like (like if not liked, unlike if already liked) ───
const toggleLike = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sellerId } = req.params;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ success: false, message: "Restaurant not found." });
        }

        const existing = await Like.findOne({ userId, sellerId });

        if (existing) {
            await Like.deleteOne({ _id: existing._id });
            seller.likesCount = Math.max(0, seller.likesCount - 1);
            await seller.save();
            return res.status(200).json({
                success: true,
                liked: false,
                likesCount: seller.likesCount,
                message: "Removed from favorites.",
            });
        }

        await Like.create({ userId, sellerId });
        seller.likesCount += 1;
        await seller.save();

        return res.status(200).json({
            success: true,
            liked: true,
            likesCount: seller.likesCount,
            message: "Added to favorites.",
        });
    } catch (error) {
        if (error.code === 11000) {
            // race condition — already liked, treat as success
            return res.status(200).json({ success: true, liked: true, message: "Already liked." });
        }
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// ─── Get My Liked Restaurants ───────────────────────────────
const getMyLikes = async (req, res) => {
    try {
        const userId = req.user.id;

        const likes = await Like.find({ userId })
            .populate("sellerId", "shopname coverImage cuisines avgRating ratingCount isOpen address")
            .sort({ createdAt: -1 });

        const restaurants = likes
            .filter((l) => l.sellerId) // seller ho sake delete ho gaya ho
            .map((l) => l.sellerId);

        return res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// ─── Check like status for one restaurant (for detail page) ─
const getLikeStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sellerId } = req.params;

        const existing = await Like.findOne({ userId, sellerId });
        return res.status(200).json({ success: true, liked: !!existing });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

module.exports = { toggleLike, getMyLikes, getLikeStatus };
