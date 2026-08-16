const jwt = require('jsonwebtoken');

// ✅ Logged User Check - Access Token from Header
const isLoggedIn = (req, res, next) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ success: false, message: "Login required." });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"session expired"
        })
    }
};

// ✅ Seller Check - Role verify karo
const isSeller = (req, res, next) => {
    if (!req.user?.roles?.includes('seller')) {

        return res.status(403).json({ success: false, message: "Seller access only." });
    }
    next();
};

module.exports = { isLoggedIn, isSeller };
