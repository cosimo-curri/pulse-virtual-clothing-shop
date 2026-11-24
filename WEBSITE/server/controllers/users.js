const passport = require("passport");
const User = require("../models/users");

const jsonWebToken = require("jsonwebtoken");

const { validationResult } = require("express-validator");

exports.signup = (req, res, next) => {
    const errors = validationResult(req);

    if(errors.errors[0])
        res.json({ message: errors.errors[0].msg });
    else {
        if (typeof req.body.firstName !== "string" || !req.body.firstName.trim() ||
            typeof req.body.lastName !== "string" || !req.body.lastName.trim()) {
            return res.json({ message: "ValidationError" });
        }
        req.body.firstName = req.body.firstName.trim();
        req.body.lastName = req.body.lastName.trim();
        req.body.email = req.body.email.toLowerCase().trim();
        let activationToken = jsonWebToken.sign({
            data: req.body.email
        }, process.env.USER_ACTIVATION_TOKEN_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });

        //FOR THE NEXT MIDDLEWARE
        req.body.activationToken = activationToken;

        const newUser = new User({
            email: req.body.email.toLowerCase(),
            firstName: req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1),
            lastName: req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1),
            secureSignUp: {
                activationToken: activationToken
            }
        });
    
        User.register(newUser, req.body.password, (error, user) => {
            if(user)
                next();
            else
                res.json({ message: error?.name || "ValidationError" });
        });
    }
};

exports.activeUser = (req, res) => {
    User.findOne({ "secureSignUp.activationToken": req.params.activationToken })
    .then(async user => {
        if(user && isValidActivationToken(req.params.activationToken, user.email)) {
            await User.findOneAndUpdate({ _id: user._id }, {
                "secureSignUp.activationToken": null, "secureSignUp.active": true
            });

            res.redirect("/signup_confirm.html");
        } else
            res.redirect("/error.html");
    })
    .catch(() => res.redirect("/error.html"));
};

exports.signin = async (req, res) => {
    passport.authenticate("local", (errors, user) => {
        if(user) {
            if(user.secureSignUp.active) {
                let signedToken = jsonWebToken.sign({
                    data: user._id
                }, process.env.AUTH_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });

                user.currentValidToken = signedToken;
                user.save().then(() => {
                const dataJSON = {
                    message: "SIGNIN_OK",
                    user: {
                        _id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        shop: user.shop,
                        avatars: user.avatars,
                        currentValidToken: signedToken
                    }
                };

                res.json(dataJSON);
                }).catch(() => res.json({ message: "USER_NOT_EXISTS" }));
            } else
                res.json({ message: "USER_NOT_ACTIVE" });
        } else
            res.json({ message: "USER_NOT_EXISTS" });
    })(req, res);
};

exports.logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { currentValidToken: null });
        res.json({ message: "LOGOUT_OK" });
    } catch (_) {
        res.json({ message: "USER_NOT_LOGGED" });
    }
};

exports.findUser = (req, res) => {
    const value = req.params.value;
    if (typeof value !== "string" || !value || value.length > 100) {
        return res.json({ message: "FIND_USER_QUERY_ERROR" });
    }
    const safeValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    //ONLY THE FIRST 5 OCCURRENCES
    const searchQuery = User.find({
        email: {
            $regex: `^${safeValue}`,
            $options: "i"
        }
    })
    .where({ email: { $ne: req.user.email } }) //EXCLUDING ADMIN FROM THE QUERY
    .limit(5)
    .select("email firstName lastName role shop");

    searchQuery.exec()
    .then(users => {
        res.json(users);
    })
    .catch(() => {
        res.json({ message: "FIND_USER_QUERY_ERROR" });
    });
};

exports.deleteUserMiddleware = async (req, res, next) => {
    const email = req.body?.email;
    if (typeof email !== "string" || !email.includes("@") ||
        email.toLowerCase() === req.user.email.toLowerCase()) {
        return res.json({ message: "DELETE_USER_ERROR" });
    }
    try {
        const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (!targetUser) return res.json({ message: "DELETE_USER_ERROR" });
        req.targetUser = targetUser;
        return next();
    } catch (_) {
        return res.json({ message: "DELETE_USER_ERROR" });
    }
};

exports.getUserByEmailMiddleware = (req, res, next) => {
    if(req.body.adminEmail) {
        User.findOne({ email: String(req.body.adminEmail).toLowerCase().trim() })
        .then(user => {
            if (!user) return res.json({ message: "FIND_USER_ERROR" });
            if(user.shop && user.shop !== "")
                res.json({ message: "USER_ALREADY_SHOP" });
            else {
                req.body.user = user;
                next();
            }
        })
        .catch(() => {
            res.json({ message: "FIND_USER_ERROR" });
        });
    } else
        res.json({ message: "FIND_USER_ERROR" });
};
function isValidActivationToken(token, email) {
    try {
        return jsonWebToken.verify(token, process.env.USER_ACTIVATION_TOKEN_SECRET_ENCODING_PASSPHRASE).data === email;
    } catch (_) {
        return false;
    }
}
