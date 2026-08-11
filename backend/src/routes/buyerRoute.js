const express = require("express");

const router = express.Router();

const {isLoggedIn} = require("../middleware/authMiddleware");

const{updateAddress,buyer} = require("../controllers/buyerController");
const {addToCart,getCart,updateQuantity,removeFromCart,clearCart} = require("../controllers/cartController");

router.put("/address",isLoggedIn,updateAddress);
router.post("/:productId",    isLoggedIn, addToCart);
router.get("/cart/items",               isLoggedIn, getCart);
router.put("/:productId",     isLoggedIn, updateQuantity);
router.delete("/:productId",  isLoggedIn, removeFromCart);
router.delete("/",            isLoggedIn, clearCart);
router.get("/me",isLoggedIn,buyer)
module.exports = router;