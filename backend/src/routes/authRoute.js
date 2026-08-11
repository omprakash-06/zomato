const express = require("express");

const router = express.Router();

const { isLoggedIn }= require("../middleware/authMiddleware");

const {registerUser,
    loginUser ,
    logoutAllUser,
    logoutUser,
    refreshTokens,
    updatePassword,
    deleteAccount,
    getMyProfile}
 = require("../controllers/authController");

const {registerLimiter,loginLimiter} = require("../middleware/ratelimiterMiddleware");

router.post("/register",registerLimiter,registerUser);
router.post("/login",loginLimiter,loginUser);
router.post("/logout",isLoggedIn,logoutUser);
router.post("/logout/all",isLoggedIn,logoutAllUser);
router.post("/refresh",refreshTokens);
router.put("/password",isLoggedIn,updatePassword);
router.delete("/delete/account",isLoggedIn,deleteAccount);
router.get("/profile",isLoggedIn,getMyProfile);

module.exports = router;
