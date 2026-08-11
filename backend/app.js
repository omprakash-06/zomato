require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.set("trust proxy", 1);
const connectDB = require("./src/config/db");

const authroute = require("./src/routes/authRoute");
const sellerRoute = require("./src/routes/sellerRoute");
const productRoute = require("./src/routes/productRoute");
const categoryRoute = require("./src/routes/categoryRoute");
const buyerRoute = require("./src/routes/buyerRoute");
const adminRoute = require("./src/routes/adminRoute");
const orderRoute = require("./src/routes/orderRoute");
const reviewRoute = require("./src/routes/reviewRoute");
const likeRoute = require("./src/routes/likeRoute");
const seoRoute = require("./src/routes/seoRoute");

const { apiLimiter } = require("./src/middleware/ratelimiterMiddleware");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

// ── Security headers ──
app.use(helmet());

app.use(cookieParser());
app.use(express.json({ limit: "10kb" })); // FIX: body size cap — basic DoS/payload abuse protection
app.use(cors({
    origin:process.env.FRONTEND_URL,
    methods :["GET","POST","PUT","PATCH","DELETE"],
    credentials:true,
}))

connectDB();

// ── General rate limiting on all API routes (per-route limiters like
// loginLimiter/registerLimiter still apply on top of this) ──
app.use("/api", apiLimiter);

app.use("/api/auth",authroute);
app.use("/api/seller",sellerRoute);
app.use("/api/product",productRoute);
app.use("/api/category",categoryRoute);
app.use("/api/buyer",buyerRoute);
app.use("/api/admin",adminRoute);
app.use("/api/order",orderRoute);
app.use("/api/review",reviewRoute);
app.use("/api/like",likeRoute);

// ── SEO: sitemap.xml + robots.txt (served at domain root, not under /api) ──
app.use("/", seoRoute);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ── 404 + centralized error handler — always LAST ──
app.use(notFound);
app.use(errorHandler);

app.listen(3000)
