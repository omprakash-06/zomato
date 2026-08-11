const z = require("zod");

const registerSchema = z.object({
    name: z.string().min(2,"name atleast have  two character."),
    email: z.string().email("provide a valid email."),
    password: z.string().min(6,"provide valid password."),
});

const loginSchema = z.object({
    email: z.string().email("provide a valid email."),
    password : z.string().min(1,"passwor require."),
})

const updatePasswordSchema = z.object({
    currentPassword : z.string().min(6,"provide valid password."),
    newPassword : z.string().min(1,"provide valid password"),
})

// ── Review ──
const createReviewSchema = z.object({
    orderId: z.string().min(1, "orderId is required."),
    rating: z.coerce.number().int().min(1, "Rating must be 1-5.").max(5, "Rating must be 1-5."),
    comment: z.string().max(500, "Comment too long (max 500 chars).").optional().default(""),
});

// ── Seller apply (restaurant registration) ──
// NOTE: address is a JSON-stringified object at this stage (from FormData) — parsed by controller
const registerSellerSchema = z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/, "Provide a valid 10-digit phone number."),
    shopname: z.string().min(2, "Restaurant name must be at least 2 characters.").max(100),
    address: z.string().min(1, "Address is required."),
});

// ── Product / Menu item create ──
const createProductSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters.").max(100),
    description: z.string().min(5, "Description too short.").max(1000),
    category: z.string().min(1, "Category is required."),
    price: z.coerce.number().positive("Price must be greater than 0."),
    discount: z.coerce.number().min(0).max(100).optional().default(0),
    isVeg: z.union([z.boolean(), z.enum(["true", "false"])]).optional(),
    isAvailable: z.union([z.boolean(), z.enum(["true", "false"])]).optional(),
}).passthrough(); // brand, size, stock jaise optional fields controller khud handle karta hai

// ── Restaurant listing query params ──
const restaurantQuerySchema = z.object({
    cuisine: z.string().optional(),
    search: z.string().max(100).optional(),
    sort: z.enum(["rating", "likes", "newest"]).optional(),
    isOpen: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    createReviewSchema,
    registerSellerSchema,
    createProductSchema,
    restaurantQuerySchema,
};