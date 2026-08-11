const rateLimit = require("express-rate-limit");

const  loginLimiter = rateLimit({
    windowMs : 15*60*1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message : {
        success:false,
        message:"too many attemps try after 15 minute.",
    }
})

const registerLimiter = rateLimit({
    windowMs : 1*60*60*1000,
    max:5,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        success:false,
        message:"too many wrong attams try again after 1 hour."
    }
})

// ── General API limiter — sab /api routes pe lagta hai (DDoS/abuse se basic protection) ──
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // per IP, 15 min window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

// ── Write-heavy actions ka tighter limiter (review/like/order create) ──
const writeLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, slow down a bit.",
    },
});

module.exports = {registerLimiter,loginLimiter,apiLimiter,writeLimiter};