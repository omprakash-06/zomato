const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");

const { createCategory, getAllCategories,
    updateCategory, deleteCategory } = require("../controllers/categoryController");

router.post("/", isLoggedIn, isAdmin, upload.single("icon"), createCategory);
router.get("/", getAllCategories);
router.put("/:id", isLoggedIn, isAdmin, upload.single("icon"), updateCategory);
router.delete("/:id", isLoggedIn, isAdmin, deleteCategory);

module.exports = router;