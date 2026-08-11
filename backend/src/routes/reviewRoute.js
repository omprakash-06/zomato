const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/authMiddleware");
const { validate, validateObjectId } = require("../middleware/validate");
const { writeLimiter } = require("../middleware/ratelimiterMiddleware");
const { createReviewSchema } = require("../validators/validation");
const {
    createReview,
    getSellerReviews,
    getReviewableStatus,
} = require("../controllers/reviewController");

router.post("/", isLoggedIn, writeLimiter, validate(createReviewSchema), createReview);
router.get("/restaurant/:sellerId", validateObjectId("sellerId"), getSellerReviews);
router.get("/can-review/:orderId", isLoggedIn, validateObjectId("orderId"), getReviewableStatus);

module.exports = router;
