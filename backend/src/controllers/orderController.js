const Order = require("../models/orderModel");

// ─── Get My Orders (Buyer) ──────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    // FIX: pagination added — page/limit query params, defaults 1 / 10
    const page  = Math.max(Number(req.query.page)  || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip  = (page - 1) * limit;

    // FIX: optional status filter so tabs (All/Placed/Shipped/...) filter
    // the full dataset server-side, not just whatever happens to be on
    // the current page.
    const { status } = req.query;
    const filter = { buyerId: req.user.id };
    if (status && status !== "all") filter.orderStatus = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("items.productId", "name images thumbnailImage")
        .populate("sellerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Get Seller Orders ──────────────────────────────────
const getSellerOrders = async (req, res) => {
  try {
    // FIX: pagination added, same pattern as getMyOrders
    const page  = Math.max(Number(req.query.page)  || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip  = (page - 1) * limit;

    const filter = { sellerId: req.user.id };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("items.productId", "name images thumbnailImage")
        .populate("buyerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Get Order By ID (admin)────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId", "name images price thumbnailImage")
      .populate("buyerId",  "name email phone")
      .populate("sellerId", "name email phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const userId   = req.user.id;
    const isBuyer  = order.buyerId._id.toString()  === userId;
    const isSeller = order.sellerId._id.toString() === userId;
    const isAdmin  = req.admin?.role?.includes("admin") || false;   // FIX: safe-guard, req.admin doesn't exist for buyer/seller requests

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Update Order Status (Seller) ───────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["confirmed", "shipped", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: confirmed, shipped, delivered",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ success: false, message: "Cannot update a cancelled order." });
    }

    order.orderStatus = status;
    await order.save();

    return res.status(200).json({ success: true, message: "Order status updated.", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Cancel Order (Buyer) ───────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = "cancelled";

    if (order.paymentMethod === "online" && order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
      // TODO: Razorpay refund API
    }

    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled successfully.", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// ─── Get All Orders (Admin) ─────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status)        filter.orderStatus   = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("buyerId",         "name email phone")
      .populate("sellerId",        "name email phone")
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

module.exports = {
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};





