const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

// ── Validate req.body against a zod schema ──
// Usage: router.post("/", validate(reviewSchema), createReview)
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const details = result.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
        }));
        return next(new ApiError(400, "Validation failed.", details));
    }
    req.body = result.data;
    next();
};

// ── Validate req.query against a zod schema ──
const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        const details = result.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
        }));
        return next(new ApiError(400, "Invalid query params.", details));
    }
    req.query = result.data;
    next();
};

// ── Validate a route param is a real Mongo ObjectId ──
// Usage: router.get("/:sellerId", validateObjectId("sellerId"), handler)
const validateObjectId = (paramName) => (req, res, next) => {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return next(new ApiError(400, `Invalid ${paramName}.`));
    }
    next();
};

module.exports = { validate, validateQuery, validateObjectId };
