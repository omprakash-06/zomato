const User = require("../models/userModel");
const Buyer = require("../models/buyerModel");
const Session = require("../models/sessionModel");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UAParser = require("ua-parser-js");

const { registerSchema, loginSchema, updatePasswordSchema } = require("../validators/validation");

// ✅ FIX: single source of truth for cookie options.
// sameSite: "strict" blocked the cookie on cross-site requests
// (frontend on vercel.app, backend on onrender.com are different sites),
// so refresh silently failed in production -> user appeared logged out on refresh.
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const registerUser = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.errors,
            });
        }

        const { name, email, password } = result.data;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists.",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            roles: ["buyer"],
        });

        const buyer = await Buyer.create({
            userId: user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            data: {
                id: user._id,
                buyerId: buyer._id,
                name: user.name,
                roles: user.roles,
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

const loginUser = async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.errors, 
            });
        }

        const { email, password } = result.data;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        const isMatch = await user.isPasswordCorrect(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, roles: user.roles },
            process.env.JWT_ACCESS_TOKEN,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_REFRESH_TOKEN,
            { expiresIn: "7d" }
        );

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const parser = new UAParser(req.headers["user-agent"]);

        await Session.create({
            userId: user._id,
            refreshToken: refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            os: parser.getOS().name || "Unknown",
            browser: parser.getBrowser().name || "Unknown",
            deviceType: parser.getDevice().type || "desktop",
            ipAddress: req.ip,
            isActive: true,
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken,
            data: {
                user
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

const logoutUser = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Login required.",
            });
        }

        const hashToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        await Session.findOneAndDelete({ refreshToken: hashToken });

        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logout successful.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

const logoutAllUser = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Login required.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);

        await Session.deleteMany({ userId: decoded.id });

        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out from all devices.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

const refreshTokens = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Login required.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const session = await Session.findOne({
            userId: decoded.id,
            refreshToken: tokenHash,
            isActive: true,
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Invalid session.",
            });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, roles: user.roles },
            process.env.JWT_ACCESS_TOKEN,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_REFRESH_TOKEN,
            { expiresIn: "7d" }
        );

        const newHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        session.refreshToken = newHash;
        session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await session.save();

        res.cookie("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Token refreshed.",
            accessToken,
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token.",
            error: error.message,
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId); 

        if (!user) { 
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const result = updatePasswordSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.errors,
            });
        }

        const { currentPassword, newPassword } = result.data;

        const isMatch = await user.isPasswordCorrect(currentPassword);  

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password.",
            });
        }

        user.password = newPassword; 
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        await Session.deleteMany({ userId: req.user.id });
        await Buyer.findOneAndDelete({ userId: req.user.id });

        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const buyer = await Buyer.findOne({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      data: { user, buyer },
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutAllUser, logoutUser, refreshTokens, updatePassword, deleteAccount ,getMyProfile};