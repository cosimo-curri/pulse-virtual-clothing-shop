const jwt = require("jsonwebtoken");
const User = require("../models/users");

// Used by both protected API routes and the logout endpoint.
module.exports = async function authenticateToken(req, res, next) {
    const token = req.headers.token;
    if (typeof token !== "string" || !token) {
        return res.json({ message: "TOKEN_NOT_PROVIDED" });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.AUTH_SECRET_ENCODING_PASSPHRASE);
    } catch (_) {
        return res.json({ message: "CANNOT_VERIFY_TOKEN" });
    }

    if (!payload || !payload.data) {
        return res.json({ message: "CANNOT_VERIFY_TOKEN" });
    }
    try {
        const user = await User.findById(payload.data);
        if (!user || !user.secureSignUp.active || !user.currentValidToken || user.currentValidToken !== token) {
            return res.json({ message: "USER_NOT_LOGGED" });
        }
        req.user = user;
        next();
    } catch (_) {
        return res.json({ message: "CANNOT_VERIFY_TOKEN" });
    }
};
