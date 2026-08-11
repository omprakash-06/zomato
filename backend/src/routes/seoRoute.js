const express = require("express");
const router = express.Router();
const Seller = require("../models/sellerModel");
const asyncHandler = require("../utils/asyncHandler");

// Frontend site's public base URL (set FRONTEND_URL in .env)
const SITE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── GET /sitemap.xml ─────────────────────────────────────
// Har approved restaurant ka page search engines ko batata hai
router.get("/sitemap.xml", asyncHandler(async (req, res) => {
    const restaurants = await Seller.find({ status: "approved" }).select("slug updatedAt");

    const staticUrls = [
        { loc: `${SITE_URL}/`, priority: "1.0" },
        { loc: `${SITE_URL}/restaurants`, priority: "0.9" },
    ];

    const restaurantUrls = restaurants
        .filter((r) => r.slug)
        .map((r) => ({
            loc: `${SITE_URL}/restaurant/${r.slug}`,
            lastmod: r.updatedAt.toISOString().split("T")[0],
            priority: "0.8",
        }));

    const allUrls = [...staticUrls, ...restaurantUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
    .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    return res.send(xml);
}));

// ─── GET /robots.txt ───────────────────────────────────────
router.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(
        `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`
    );
});

module.exports = router;
