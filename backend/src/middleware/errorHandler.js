const ApiError = require("../utils/ApiError");

// ─── 404 handler — koi route match nahi hua ─────────────────
const notFound = (req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// ─── Global error handler — app.js mein sabse last use hota hai ──
// Express 5 async errors ko khud next() tak forward kar deta hai,
// isliye ye handler purane aur naye dono controllers ke errors pakadega.
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error.";
    let details = err.details || null;

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed.";
        details = Object.values(err.errors).map((e) => e.message);
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongo duplicate key
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = field ? `${field} already exists.` : "Duplicate value.";
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token.";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired.";
    }

    if (!err.isOperational && statusCode === 500) {
        // Unexpected/programming error — server console pe poora log karo
        console.error("UNEXPECTED ERROR:", err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };
