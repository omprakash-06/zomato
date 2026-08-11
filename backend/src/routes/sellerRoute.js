const express = require("express");

const router = express.Router();
const upload = require("../middleware/upload");
const { validateQuery, validateObjectId, validate } = require("../middleware/validate");
const { restaurantQuerySchema, registerSellerSchema } = require("../validators/validation");
const {
    registerSeller,
    getSellerProfile,
    getDashboardStats,
    updateSellerProfile,
    getAllRestaurants,
    getRestaurantPublicProfile,
} = require("../controllers/sellerController");
const {isLoggedIn,isSeller} = require("../middleware/authMiddleware");
const {getSellerOrders,updateOrderStatus} = require("../controllers/orderController");

// ── Public restaurant browsing (User side) ──
router.get("/restaurants", validateQuery(restaurantQuerySchema), getAllRestaurants);
router.get("/restaurants/:id", validateObjectId("id"), getRestaurantPublicProfile);

router.post("/apply",isLoggedIn,upload.array("documents",2),validate(registerSellerSchema),registerSeller);
router.get("/profile",isLoggedIn,getSellerProfile);
router.get("/orders",isLoggedIn, isSeller, getSellerOrders);
router.patch("/:id/status",isLoggedIn,isSeller, updateOrderStatus); 
router.get("/dashboard-stats", isLoggedIn, isSeller, getDashboardStats);
router.put("/profile", isLoggedIn, isSeller, upload.single("coverImage"), updateSellerProfile);
module.exports = router;