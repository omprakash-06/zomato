// Custom error class — controllers ise throw kar sakte hain for known/expected errors
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true; // vs unexpected/programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
