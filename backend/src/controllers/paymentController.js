const razorpay = require("../config/razorpay");
const Product = require("../models/productModel");
const Buyer = require("../models/buyerModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Seller = require("../models/sellerModel");
const Admin  = require("../models/adminModel");

const crypto = require("crypto");

const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type,productId } = req.params;
        const {quantity, size, addressType, address } = req.body;

        if (!["buyNow", "cart"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order type."
            });
        }

        const buyer = await Buyer.findOne({ userId });
        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: "Buyer profile nahi mila."
            });
        }

        let items = [];
        let totalAmount = 0;

        // ── Buy Now ──────────────────────────────────
        if (type === "buyNow") {
            if (!productId || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: "productId aur quantity required hai."
                });
            }

            const product = await Product.findById(productId)
                .populate("category", "commissionPercent");

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product nahi mila."
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Stock available nahi hai."
                });
            }

            items = [{ productId: product, quantity: Number(quantity), size }];
            totalAmount = product.actualPrice * Number(quantity);
        }

        // ── Cart ─────────────────────────────────────
        else {
            const cart = await Cart.findOne({ userId })
                .populate({
                    path: "items.productId",
                    populate: { path: "category", select: "commissionPercent" }
                });

            if (!cart || cart.items.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Cart khali hai."
                });
            }

            for (const item of cart.items) {
                const product = item.productId;
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.name} ka stock available nahi hai.`
                    });
                }
                totalAmount += product.actualPrice * item.quantity;
            }

            items = cart.items;
        }

        // ── Address ───────────────────────────────────
        let deliveryAddress;
        if (addressType === "permanent") {
            if (!buyer.permanentAddress) {
                return res.status(400).json({
                    success: false,
                    message: "Permanent address set nahi hai."
                });
            }
            deliveryAddress = buyer.permanentAddress;
        } else if (addressType === "new") {
            if (!address) {
                return res.status(400).json({
                    success: false,
                    message: "Address required hai."
                });
            }
            deliveryAddress = address;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid addressType."
            });
        }

        // ── Razorpay Order ────────────────────────────
        const razorpayOrder = await razorpay.orders.create({
            amount:   totalAmount * 100,
            currency: "INR",
            receipt:  `ORDER_${Date.now()}`,
            notes: {
                userId:      userId.toString(),
                type,
                productId:   productId || "",
                quantity:    String(quantity || ""),
                size:        size || "",
                addressType,
                address:     JSON.stringify(deliveryAddress),
            }
        });

        return res.status(200).json({
            success: true,
            message: "Payment order created.",
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount:          totalAmount,
                currency:        "INR",
                key:             process.env.RAZORPAY_KEY_ID,
                deliveryAddress,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment details missing.",
      });
    }

    // Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Duplicate payment check
    const alreadyPaid = await Order.findOne({
      razorpay_payment_id,
    });

    if (alreadyPaid) {
      return res.status(409).json({
        success: false,
        message: "Payment already verified.",
      });
    }

    // Fetch Razorpay payment
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const notes = payment.notes;

    const userId = notes.userId;
    const type = notes.type;

    let items = [];

    if (type === "buyNow") {

      const product = await Product.findById(notes.productId)
        .populate("category", "commissionPercent");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      if (product.stock < Number(notes.quantity)) {
        return res.status(400).json({
          success: false,
          message: "Product out of stock.",
        });
      }

      items.push({
        productId: product,
        quantity: Number(notes.quantity),
        size: notes.size,
      });

    } else {

      const cart = await Cart.findOne({ userId }).populate({
        path: "items.productId",
        populate: {
          path: "category",
          select: "commissionPercent",
        },
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty.",
        });
      }

      items = cart.items;
    }

    const deliveryAddress = JSON.parse(notes.address);

    // Group seller wise
    const sellerMap = {};

    for (const item of items) {

      const sellerId = item.productId.sellerId.toString();

      if (!sellerMap[sellerId]) {
        sellerMap[sellerId] = [];
      }

      sellerMap[sellerId].push(item);
    }

    const orders = [];

    // Create seller-wise orders 
    for (const sellerId in sellerMap) {
      
      const sellerItems = sellerMap[sellerId];
      
      let totalAmount = 0;
      let commission = 0;
      
      const seller = await Seller.findOne({ userId: sellerId });
      if (!seller) {
        return res.status(404).json({ success: false, message: "Seller not found." });
      }
      
      const admin = await Admin.findOne({});
      if (!admin) {
        return res.status(404).json({ success: false, message: "Admin not found." });
      }

      const orderItems = [];

      for (const item of sellerItems) {

      const product = item.productId;

      if (product.stock < item.quantity) {
       return res.status(400).json({
        success: false,
        message: `${product.name} stock not available.`,
       });
      }

      const itemTotal = product.actualPrice * item.quantity;
      const itemCommission = Math.floor(
        (itemTotal * product.category.commissionPercent) / 100
      );

      totalAmount += itemTotal;
      commission += itemCommission;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        size: item.size,
        price: product.actualPrice,
      });

    await Product.findByIdAndUpdate(product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  const sellerAmount = totalAmount - commission;

  // ✅ Fix 3: Increment correctly, no double-add
  seller.earnings += sellerAmount;
  await seller.save();

  // ✅ Fix 4: Increment on fetched admin doc instance
  admin.earnings += commission;
  await admin.save();

  const order = await Order.create({
    buyerId: userId,
    sellerId,
    items: orderItems,
    deliveryAddress,
    totalAmount,
    paymentMethod: "online",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  orders.push(order);
}

  // Clear cart
    if (type === "cart") {
      await Cart.findOneAndUpdate(
        { userId },
        {
          $set: {
            items: [],
          },
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: "Payment verified successfully.",
      data: orders,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server Error.",
      error: error.message,
    });

  }
};


module.exports = {createOrder,verifyPayment};