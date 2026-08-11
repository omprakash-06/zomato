const jwt = require('jsonwebtoken');

// ✅ Logged User Check - Access Token from Header
const isAdmin = (req, res, next) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ success: false, message: "Login required." });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
        if(decoded.role !== "admin"){
            return res.status(403).json({
                success : false,
                message : "admin acess only"
            });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
};

module.exports = isAdmin;