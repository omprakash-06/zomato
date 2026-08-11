const Admin = require("../models/adminModel");
const Seller = require("../models/sellerModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ─── Register Admin ───────────────────────────────────
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, secretKey } = req.body;

        // Secret key check
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({
                success: false,
                message: "Invalid secret key."
            });
        }

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Sab fields required hain."
            });
        }

        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Admin already exist karta hai."
            });
        }

        const hashedpassword = await bcrypt.hash(password,10);

        const admin = await Admin.create({ name, email, password : hashedpassword });

        return res.status(201).json({
            success: true,
            message: "Admin registered.",
            data: { id: admin._id, name: admin.name },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Login Admin ──────────────────────────────────────
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email aur password required hai."
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin nahi mila."
            });
        }

        const isMatch = await  bcrypt.compare(password,admin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        const accessToken = jwt.sign(
            { id: admin._id, email: admin.email, role: "admin" },
            process.env.JWT_ACCESS_TOKEN,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken,
            data: { id: admin._id, name: admin.name,earnings:admin.earnings },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Get Pending Sellers ──────────────────────────────
const getPendingSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({ status: "pending" })
            .populate("userId", "name email");

        return res.status(200).json({
            success: true,
            data: sellers,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Approve Seller ───────────────────────────────────
const approveSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller nahi mila."
            });
        }

        // Seller status update
        seller.status = "approved";
        await seller.save();

        // User ke roles mein seller add
        await User.findByIdAndUpdate(seller.userId, {
            $addToSet: { roles: "seller" }
        });

        return res.status(200).json({
            success: true,
            message: "Seller approved.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Reject Seller ────────────────────────────────────
const rejectSeller = async (req, res) => {
    try {
        const { reason } = req.body;

        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller nahi mila."
            });
        }

        // FIX: schema enum only allows "reject", not "rejected" — the old
        // value here failed Mongoose validation on save() and silently
        // never actually rejected anyone.
        seller.status = "reject";
        seller.rejectionReason = reason || "Admin ne reject kiya.";
        await seller.save();

        return res.status(200).json({
            success: true,
            message: "Seller rejected.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

// ─── Get Admin Profile ─────────────────────────────────
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select("-password");
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role , earnings: admin.earnings},
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

const getApprovedSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({ status: "approved" })
            .populate("userId", "name email");

        return res.status(200).json({
            success: true,
            data: sellers,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

module.exports = { registerAdmin, loginAdmin, getPendingSellers, approveSeller,getAdminProfile, rejectSeller,getApprovedSellers };
// ─── Get Approved Sellers ─────────────────────────────
