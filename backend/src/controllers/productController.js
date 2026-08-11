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
// Zomato-style dish search: lets buyers search/browse food items directly
// across all restaurants, without opening a restaurant page first.
const getAllProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, rating, search, sort, isVeg } = req.query;

        // FIX: pagination added — page/limit query params, defaults 1 / 12
        const page  = Math.max(Number(req.query.page)  || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 12, 1);
        const skip  = (page - 1) * limit;

        // FIX: unavailable items public listing mein hide — CTO requirement
        const match = { status: "active", isAvailable: true };

        if (category) match.category = { $in: category.split(",").map((c) => new (require("mongoose").Types.ObjectId)(c)) };
        if (minPrice || maxPrice) match.actualPrice = {
            ...(minPrice && { $gte: Number(minPrice) }),
            ...(maxPrice && { $lte: Number(maxPrice) }),
        };
        if (rating)  match.averageRating = { $gte: Number(rating) };
        if (isVeg === "true")  match.isVeg = true;
        if (isVeg === "false") match.isVeg = false;
        if (search)  match.name = { $regex: search, $options: "i" };

        // FIX: sort support (frontend already sends ?sort=price_asc etc.)
        const sortMap = {
            price_asc:  { actualPrice: 1 },
            price_desc: { actualPrice: -1 },
            newest:     { createdAt: -1 },
            rating:     { averageRating: -1 },
        };
        const sortBy = sortMap[sort] || { createdAt: -1 };

        // FIX: earlier this used Product.find() directly, which meant a product
        // from a *pending/rejected* seller (or one whose restaurant is closed)
        // could still show up in public dish search. We now $lookup the Seller
        // doc (Product.sellerId is the seller's User _id, matched against
        // Seller.userId) and only keep items whose restaurant is "approved" —
        // and attach the restaurant's name/id so the UI can show/link it.
        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: "sellers",
                    localField: "sellerId",
                    foreignField: "userId",
                    as: "restaurant",
                },
            },
            { $unwind: "$restaurant" },
            { $match: { "restaurant.status": "approved" } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    price: 1,
                    discount: 1,
                    actualPrice: 1,
                    thumbnailImage: 1,
                    averageRating: 1,
                    brand: 1,
                    stock: 1,
                    images: 1,
                    size: 1,
                    isVeg: 1,
                    description: 1,
                    "category._id": 1,
                    "category.name": 1,
                    "restaurant._id": 1,
                    "restaurant.shopname": 1,
                    "restaurant.isOpen": 1,
                },
            },
            { $sort: sortBy },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const result = await Product.aggregate(pipeline);
        const products = result[0]?.data || [];
        const total = result[0]?.totalCount?.[0]?.count || 0;

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
            .populate("category", "name commissionPercent");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        // FIX: product.sellerId is the seller's *User* _id, not the Seller
        // document's own _id — the shop name/rating live on the Seller doc,
        // so we look it up separately by userId to attach to the response.
        const restaurant = await Seller.findOne({ userId: product.sellerId, status: "approved" })
            .select("shopname coverImage avgRating ratingCount isOpen cuisines address");

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: { ...product.toObject(), restaurant },
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