const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validate");
const { writeLimiter } = require("../middleware/ratelimiterMiddleware");
const { toggleLike, getMyLikes, getLikeStatus } = require("../controllers/likeController");

router.post("/:sellerId/toggle", isLoggedIn, writeLimiter, validateObjectId("sellerId"), toggleLike);
router.get("/my", isLoggedIn, getMyLikes);
router.get("/:sellerId/status", isLoggedIn, validateObjectId("sellerId"), getLikeStatus);

module.exports = router;
