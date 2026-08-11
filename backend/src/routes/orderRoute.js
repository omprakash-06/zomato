const express = require("express");
const router = express.Router();
const { isLoggedIn,isSeller} = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const {
  getMyOrders,        // buyer ke orders
  getOrderById,       // single order detail
  cancelOrder,        // buyer cancel       
} = require("../controllers/orderController");

const {createOrder,verifyPayment} = require("../controllers/paymentController");


// ─── Buyer Routes ───────────────────────────────────────
router.post("/create/:type/:productId", isLoggedIn, createOrder);
router.post("/create/:type", isLoggedIn, createOrder);   // cart flow: no productId
router.post("/verify-payment", isLoggedIn, verifyPayment);
router.get("/my-orders", isLoggedIn, getMyOrders);
router.get("/:id", isLoggedIn, getOrderById);
router.patch("/:id/cancel", isLoggedIn, cancelOrder);

module.exports = router;
