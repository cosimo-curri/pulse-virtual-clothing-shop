"use strict";

const express = require("express");
const router = express.Router();
const User = require("../../models/users");
const jwt = require("jsonwebtoken");
const nodemailer = require("../../utils/nodemailer");
const validators = require("../../utils/validators");
const { validationResult } = require("express-validator");
const { promisify } = require("util");

function isValidResetToken(token, email) {
    try {
        return jwt.verify(token, process.env.USER_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE).data === email;
    } catch (_) {
        return false;
    }
}

router.post("/requestRestorePassword", async (req, res, next) => {
    if (typeof req.body?.email !== "string" || !req.body.email.trim()) {
        return res.json({ message: "RESTORE_PASSWORD_ERROR" });
    }
    try {
        const email = req.body.email.trim().toLowerCase();
        const user = await User.findOne({ email });
        if (!user) return res.json({ message: "USER_NOT_FOUND" });
        const token = jwt.sign({ data: email }, process.env.USER_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE, { expiresIn: "1d" });
        user.changePasswordToken = token;
        await user.save();
        Object.assign(req.body, {
            email, changePasswordToken: token,
            firstName: user.firstName, lastName: user.lastName
        });
        return next();
    } catch (_) {
        return res.json({ message: "RESTORE_PASSWORD_ERROR" });
    }
}, nodemailer.changePasswordRequest);

router.get("/restorePassword/:changePasswordToken", async (req, res) => {
    try {
        const token = req.params.changePasswordToken;
        const user = await User.findOne({ changePasswordToken: token });
        if (user && isValidResetToken(token, user.email)) {
            return res.redirect(`/changePassword.html?changePasswordToken=${encodeURIComponent(token)}`);
        }
    } catch (_) { /* Invalid or expired recovery link. */ }
    return res.redirect("/error.html");
});

router.post("/restorePassword", (req, res, next) => {
    if (!req.body?.changePasswordToken || !req.body?.password1 || !req.body?.password2) {
        return res.json({ message: "RESTORE_PASSWORD_ERROR" });
    }
    if (req.body.password1 !== req.body.password2) {
        return res.json({ message: "PASSWORDS_NOT_MATCH" });
    }
    req.body.password = req.body.password1;
    return next();
}, validators.strongPasswordValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json(errors.array().map((item) => ({ message: item.msg })));
    }
    try {
        const token = req.body.changePasswordToken;
        const user = await User.findOne({ changePasswordToken: token });
        if (!user || !isValidResetToken(token, user.email)) {
            return res.json({ message: "RESTORE_PASSWORD_ERROR" });
        }
        await promisify(user.setPassword.bind(user))(req.body.password);
        user.changePasswordToken = null;
        user.currentValidToken = null;
        await user.save();
        return res.json({ message: "RESTORE_PASSWORD_OK" });
    } catch (_) {
        return res.json({ message: "RESTORE_PASSWORD_ERROR" });
    }
});

module.exports = router;
