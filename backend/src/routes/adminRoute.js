const express = require("express");

const router = express.Router();

const {registerAdmin,loginAdmin,getPendingSellers,getApprovedSellers,approveSeller,rejectSeller,getAdminProfile} = require("../controllers/adminController");
const {getAllOrders} = require("../controllers/orderController");
const isAdmin = require("../middleware/isAdmin");

router.post("/register",registerAdmin);
router.post("/login", loginAdmin);
router.get("/sellers/pending",isAdmin, getPendingSellers);
router.get("/sellers/approved",isAdmin, getApprovedSellers);
router.put("/seller/:id/approve",isAdmin, approveSeller);
router.put("/seller/:id/reject",isAdmin, rejectSeller);
router.get("/orders",isAdmin, getAllOrders);   // was "/admin/all" — fixed double prefix
router.get("/profile", isAdmin, getAdminProfile);

module.exports = router;

