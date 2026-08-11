const express = require("express");
const router = express.Router();

const {isLoggedIn,isSeller} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { validate, validateObjectId } = require("../middleware/validate");
const { createProductSchema } = require("../validators/validation");

const {
    createProduct,
    getAllProducts,
    getMyProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsBySeller
} = require("../controllers/productController");


router.post("/",
    isLoggedIn, isSeller,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images",    maxCount: 5 },
    ]),
    validate(createProductSchema),
    createProduct
);

router.get("/",            getAllProducts);
router.get("/my-products", isLoggedIn, isSeller, getMyProducts);
router.get("/restaurant/:sellerId", validateObjectId("sellerId"), getProductsBySeller);
router.get("/:id",         validateObjectId("id"), getProduct);

router.put("/:id",
    isLoggedIn, isSeller,
    validateObjectId("id"),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images",    maxCount: 5 },
    ]),
    updateProduct
);

router.delete("/:id", isLoggedIn, isSeller, validateObjectId("id"), deleteProduct);

module.exports = router;