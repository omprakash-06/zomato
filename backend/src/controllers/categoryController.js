const Category = require("../models/CategoryModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

const createCategory = async (req, res) => {
    try {
        const { name, commissionPercent } = req.body;

        if (!name || !commissionPercent) {
            return res.status(400).json({
                success: false,
                message: "Name or commissionPercent is required ."
            });
        }

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Category is already existed."
            });
        }

        // FIX: upload icon file to Cloudinary if provided (upload.single("icon"))
        let image = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            image = result.secure_url;
        }

        const category = await Category.create({ name, commissionPercent, image });

        return res.status(201).json({
            success: true,
            message: "Category is  created.",
            data: category,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// Get All Categories — Public
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// Update Category — Admin only
const updateCategory = async (req, res) => {
    try {
        const updates = { ...req.body };

        // FIX: upload new icon file to Cloudinary if provided, and replace
        // the stored image URL with it.
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            updates.image = result.secure_url;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        return res.status(200).json({ success: true, message: "Category is updated .", data: category });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// Delete Category — Admin only
const deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: "Category deleted ." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };