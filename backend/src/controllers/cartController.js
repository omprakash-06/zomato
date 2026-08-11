const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// ─── Add to Cart ──────────────────────────────────────
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity, size } = req.body;

        // Product exist karta hai?
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found ."
            });
        }

        if (!product.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "This item is currently out of stock."
            });
        }

        // Cart dhundho ya banao
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        // Product already cart mein hai?
        const existingItem = cart.items.find(
            item => item.productId.toString() === productId && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            cart.items.push({ productId, quantity: quantity || 1, size });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product is added on cart .",
            data: cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Get Cart ─────────────────────────────────────────
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId })
            .populate("items.productId", "name price actualPrice discount brand thumbnailImage stock");

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { items: [] },
            });
        }

        return res.status(200).json({
            success: true,
            data: cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Update Quantity ──────────────────────────────────
const updateQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity, size } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Give Valid quantity ."
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found."
            });
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId && item.size === size
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item is not found in cart ."
            });
        }

        item.quantity = quantity;
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product Quantity is updated.",
            data: cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Remove Item ──────────────────────────────────────
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { size } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found."
            });
        }

        cart.items = cart.items.filter(
            item => !(item.productId.toString() === productId && item.size === size)
        );

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item is removed.",
            data: cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Clear Cart ───────────────────────────────────────
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } }
        );

        return res.status(200).json({
            success: true,
            message: "Cart clear .",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart, clearCart };