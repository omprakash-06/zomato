const mongoose = require ("mongoose");
const addressSchema = require("../utils/addressSchema");

const sellerSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true,
        unique :true,
    },
    phone:{
        type: Number,
        required: true,
        unique :true,
    },
    shopname:{
        type: String,
        required: true,
    },
    // ── SEO-friendly slug for /restaurant/:slug style URLs ──
    slug: {
        type: String,
        unique: true,
        sparse: true, // pending sellers won't have one yet
        index: true,
    },
    documents :[{
        type:String
    }],
    address : {
        type:addressSchema,
    },
    status :{
        type:String,
        enum : ["pending","approved","reject"],
        default:"pending",
    },
    razorpayAccountId :{
        type: String,
        default:null,
    },
    rejectionReason: { 
        type: String, 
        default: null 
    },
    earnings:{
        type:Number,
        default:0,
    },

    // ── Restaurant profile fields ──
    coverImage: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    cuisines: [{
        type: String,
        trim: true,
    }],
    openingTime: {
        type: String, // "10:00"
        default: null,
    },
    closingTime: {
        type: String, // "23:00"
        default: null,
    },
    isOpen: {
        type: Boolean,
        default: true,
    },

    // ── Rating & likes (denormalized for fast listing queries) ──
    avgRating: {
        type: Number,
        default: 0,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
    likesCount: {
        type: Number,
        default: 0,
    },

},{timestamps:true});

// ── Auto-generate a URL-safe slug from shopname (e.g. "Pizza Hut" -> "pizza-hut-a1b2") ──
// Suffix ensures uniqueness even if two restaurants share a name.
// FIX: Mongoose 9 no longer supports callback-style ("next") sync middleware —
// plain synchronous function (no next) is the correct form now.
sellerSchema.pre("save", function () {
    if (this.isModified("shopname") || !this.slug) {
        const base = this.shopname
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");
        const suffix = this._id.toString().slice(-5);
        this.slug = `${base}-${suffix}`;
    }
});

module.exports = mongoose.model("Seller",sellerSchema)