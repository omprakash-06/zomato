const Product = require("../models/productModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const Category = require("../models/CategoryModel");
const Seller = require("../models/sellerModel");
// ─── Create Product ───────────────────────────────────
const createProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const { name, description, category, brand, price, size, stock, discount, isVeg, isAvailable } = req.body;

        if (!name || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                message: "Name, description, category and price are required."
            });
        }

        // Category check
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(404).json({
                success: false,
                message: "Category nahi mili."
            });
        }

        // Actual price calculate
        const actualPrice = Math.floor(price - (price * ((discount || 0) / 100)));

        // Thumbnail upload
        let thumbnailImage = null;
        if (req.files?.thumbnail) {
            const result = await uploadToCloudinary(req.files.thumbnail[0].buffer);
            thumbnailImage = result.secure_url;
        }

        // Multiple images upload
        let images = [];
        if (req.files?.images) {
            for (const file of req.files.images) {
                const result = await uploadToCloudinary(file.buffer);
                images.push(result.secure_url);
            }
        }

        const product = await Product.create({
            sellerId,
            name,
            description,
            category: categoryDoc._id,
            brand,
            price:       Number(price),
            discount:    Number(discount) || 0,
            actualPrice,
            size:        size ? JSON.parse(size) : [],
            stock:       stock ? Number(stock) : 0,
            isVeg:       isVeg === undefined ? true : isVeg === "true" || isVeg === true,
            isAvailable: isAvailable === undefined ? true : isAvailable === "true" || isAvailable === true,
            thumbnailImage,
            images,
        });

        return res.status(201).json({
            success: true,
            message: "Product created.",
            data: product,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Get All Products (Public) ────────────────────────
const getAllProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, rating, search, sort } = req.query;

        // FIX: pagination added — page/limit query params, defaults 1 / 12
        const page  = Math.max(Number(req.query.page)  || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 12, 1);
        const skip  = (page - 1) * limit;

        // FIX: unavailable items public listing mein hide — CTO requirement
        const filter = { status: "active", isAvailable: true };

        if (category) filter.category = { $in: category.split(",") };
        if (minPrice || maxPrice) filter.actualPrice = {
            ...(minPrice && { $gte: Number(minPrice) }),
            ...(maxPrice && { $lte: Number(maxPrice) }),
        };
        if (rating)  filter.averageRating = { $gte: Number(rating) };
        if (search)  filter.name = { $regex: search, $options: "i" };

        // FIX: sort support (frontend already sends ?sort=price_asc etc.)
        const sortMap = {
            price_asc:  { actualPrice: 1 },
            price_desc: { actualPrice: -1 },
            newest:     { createdAt: -1 },
            rating:     { averageRating: -1 },
        };
        const sortBy = sortMap[sort] || {};

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("category", "name")
                .select("name price discount actualPrice thumbnailImage averageRating brand stock images size")
                .sort(sortBy)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + products.length < total,
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
// ─── Get Single Product (Public) ─────────────────────
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category", "name commissionPercent")
            .populate("sellerId", "name");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: product,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Get My Products (Seller) ─────────────────────────
const getMyProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const { status } = req.query;
        // FIX: pagination added, same pattern as getAllProducts
        const page  = Math.max(Number(req.query.page)  || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 12, 1);
        const skip  = (page - 1) * limit;

        const filter = { sellerId };
        if (status) filter.status = status;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("category", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + products.length < total,
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
// Upadate product (seller)
const updateProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const product = await Product.findOne({ _id: req.params.id, sellerId });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or permission not for update."
            });
        }

        // Stock, sellerId, averageRating update nahi hoga
        const { stock, sellerId: sid, averageRating, ...allowedUpdates } = req.body;

        // FIX: isVeg/isAvailable FormData se string aate hain, boolean me cast karo
        if (allowedUpdates.isVeg !== undefined) {
            allowedUpdates.isVeg = allowedUpdates.isVeg === "true" || allowedUpdates.isVeg === true;
        }
        if (allowedUpdates.isAvailable !== undefined) {
            allowedUpdates.isAvailable = allowedUpdates.isAvailable === "true" || allowedUpdates.isAvailable === true;
        }

        // FIX: size string ko parse karke proper array banao, warna
        // Mongoose raw JSON string ko array ke single element ki tarah
        // cast kar deta hai (double-encoding bug)
        if (allowedUpdates.size !== undefined) {
            try {
                const parsedSize = JSON.parse(allowedUpdates.size);
                allowedUpdates.size = Array.isArray(parsedSize) ? parsedSize : [];
            } catch {
                allowedUpdates.size = [];
            }
        }

        if (allowedUpdates.category) {
            const categoryDoc = await Category.findOne({ name: allowedUpdates.category });
            if (!categoryDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Category nahi mili."
                });
            }
            allowedUpdates.category = categoryDoc._id;
        }

        // Thumbnail update
        if (req.files?.thumbnail) {
            const result = await uploadToCloudinary(req.files.thumbnail[0].buffer);
            allowedUpdates.thumbnailImage = result.secure_url;
        }

        // Images update
        if (req.files?.images) {
            const newImages = [];
            for (const file of req.files.images) {
                const result = await uploadToCloudinary(file.buffer);
                newImages.push(result.secure_url);
            }
            allowedUpdates.images = newImages;
        }

        // Agar price ya discount update hua toh actualPrice recalculate karo
        const newPrice    = allowedUpdates.price    || product.price;
        const newDiscount = allowedUpdates.discount || product.discount;
        allowedUpdates.actualPrice = Math.floor(newPrice - (newPrice * (newDiscount / 100)));

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: allowedUpdates },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Product updated.",
            data: updated,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};
// ─── Delete Product (Seller) ──────────────────────────
const deleteProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const product = await Product.findOne({ _id: req.params.id, sellerId });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or permission not for delete."
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product deleted.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Get Menu for a Restaurant (Public) ───────────────────
const getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params; // this is the Seller document's _id (from the restaurant page URL)
        const { category, isVeg } = req.query;

        // FIX: Product.sellerId stores the seller's *User* _id, not the Seller
        // document's own _id — resolve via Seller.userId before querying.
        const seller = await Seller.findById(sellerId).select("userId");
        if (!seller) {
            return res.status(200).json({ success: true, data: [] });
        }

        const filter = { sellerId: seller.userId, status: "active", isAvailable: true };
        if (category) filter.category = { $in: category.split(",") };
        if (isVeg === "true") filter.isVeg = true;

        const menu = await Product.find(filter)
            .populate("category", "name")
            .select("name description category price actualPrice discount thumbnailImage isVeg averageRating")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: menu });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};
module.exports = { createProduct, getAllProducts, getProduct, getMyProducts, updateProduct, deleteProduct, getProductsBySeller };




