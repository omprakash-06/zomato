const Seller = require("../models/sellerModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");

const registerSeller = async (req, res) => {
    try {
        const userId = req.user.id;

        const { phone, shopname } = req.body;
        const address = JSON.parse(req.body.address);

        if (!phone || !shopname || !address) {
            return res.status(400).json({
                success: false,
                message: "Phone, shopName or address are required ."
            });
        }

        // FIX: only block re-applying if there's a pending/approved application.
        // Rejected sellers should be able to re-apply.
        const existingSeller = await Seller.findOne({ userId, status: { $ne: "reject" } });
        if (existingSeller) {
            return res.status(409).json({
                success: false,
                message: "Already applied for seller."
            });
        }

        const documentUrls = [];

        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer);
            documentUrls.push(result.secure_url);
        }

        // FIX: if a rejected application already exists, update it in place
        // instead of creating a duplicate Seller doc (userId is unique).
        const rejectedSeller = await Seller.findOne({ userId, status: "reject" });

        let seller;
        if (rejectedSeller) {
            rejectedSeller.phone = phone;
            rejectedSeller.shopname = shopname;
            rejectedSeller.address = address;
            rejectedSeller.documents = documentUrls;
            rejectedSeller.status = "pending";
            rejectedSeller.rejectionReason = null;
            seller = await rejectedSeller.save();
        } else {
            seller = await Seller.create({
                userId,
                phone,
                shopname,
                address,
                documents: documentUrls,
                status: "pending",
                razorpayAccountId: null,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Application submitted. Wait for approval.",
            data: {
                sellerId: seller._id,
                shopname: seller.shopname,
                status:   seller.status,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error:error.message,
        });
    }
};


const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id }).populate(
      "userId",
      "name email roles"
    );
    
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller profile not found." });
    }

    return res.status(200).json({ success: true, data: seller });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// GET /seller/dashboard-stats
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const seller = await Seller.findOne({ userId });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller profile not found."
            });
        }

        const [ordersCount, productsCount] = await Promise.all([
            Order.countDocuments({ sellerId: userId }),
            Product.countDocuments({ sellerId: userId }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                earnings: seller.earnings,
                ordersCount,
                productsCount,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

const updateSellerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            shopname, phone, address,
            description, cuisines, openingTime, closingTime, isOpen,
        } = req.body;

        const seller = await Seller.findOne({ userId });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller profile not found."
            });
        }

        if (shopname) seller.shopname = shopname;
        if (phone) seller.phone = phone;
        if (address) seller.address = typeof address === "string" ? JSON.parse(address) : address;
        if (description !== undefined) seller.description = description;
        if (cuisines !== undefined) {
            seller.cuisines = typeof cuisines === "string" ? cuisines.split(",").map((c) => c.trim()).filter(Boolean) : cuisines;
        }
        if (openingTime !== undefined) seller.openingTime = openingTime;
        if (closingTime !== undefined) seller.closingTime = closingTime;
        if (isOpen !== undefined) seller.isOpen = isOpen === "true" || isOpen === true;

        // Cover image upload (optional, multipart)
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            seller.coverImage = result.secure_url;
        }

        await seller.save();

        return res.status(200).json({
            success: true,
            message: "Shop profile updated.",
            data: seller,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Get All Restaurants (Public listing) ─────────────────
// Zomato-style: search, filter by cuisine, sort by rating
const getAllRestaurants = async (req, res) => {
    try {
        const { cuisine, search, sort, isOpen } = req.query;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 12, 1);
        const skip = (page - 1) * limit;

        const filter = { status: "approved" };

        if (cuisine) filter.cuisines = { $in: cuisine.split(",") };
        if (search) filter.shopname = { $regex: search, $options: "i" };
        if (isOpen === "true") filter.isOpen = true;

        const sortMap = {
            rating: { avgRating: -1 },
            likes: { likesCount: -1 },
            newest: { createdAt: -1 },
        };
        const sortBy = sortMap[sort] || { avgRating: -1 };

        const [restaurants, total] = await Promise.all([
            Seller.find(filter)
                .select("shopname slug coverImage description cuisines avgRating ratingCount likesCount isOpen address openingTime closingTime")
                .sort(sortBy)
                .skip(skip)
                .limit(limit),
            Seller.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: restaurants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + restaurants.length < total,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// ─── Get Single Restaurant + Menu + Recent Reviews (Public) ─
const getRestaurantPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const seller = await Seller.findOne({ _id: id, status: "approved" })
            .select("userId shopname slug coverImage description cuisines avgRating ratingCount likesCount isOpen address openingTime closingTime");

        if (!seller) {
            return res.status(404).json({ success: false, message: "Restaurant not found." });
        }

        // FIX: Product.sellerId and Review.sellerId store the seller's *User* _id
        // (seller.userId), not the Seller document's own _id (`id` here) — these
        // are two different ids. Must query by seller.userId, not by `id`.
        const [menu, recentReviews] = await Promise.all([
            Product.find({ sellerId: seller.userId, status: "active", isAvailable: true })
                .populate("category", "name")
                .select("name description category price actualPrice discount thumbnailImage isVeg averageRating"),
            Review.find({ sellerId: id })
                .populate("userId", "name")
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        return res.status(200).json({
            success: true,
            data: { restaurant: seller, menu, recentReviews },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};
module.exports = {
    registerSeller,
    getSellerProfile,
    getDashboardStats,
    updateSellerProfile,
    getAllRestaurants,
    getRestaurantPublicProfile,
};

