"use strict";
const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/users");
const usersController = require("../controllers/users");
const regressionParametersController = require("../controllers/regressionParameters");
const managePasswordRouter = require("./api_routes/managePassword");
const validators = require("../utils/validators");
const nodemailer = require("../utils/nodemailer");
const authenticateToken = require("../utils/authenticateToken");
const runPython = require("../utils/runPython");
const { decodePngDataUrl } = require("../utils/imageData");
const { normalizeFeedback } = require("../utils/feedbackData");
const { createRateLimit } = require("../utils/rateLimit");
const path = require("path");
const fs = require("fs").promises;
const { randomUUID } = require("crypto");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.use("/managePassword", managePasswordRouter);
router.post("/signup", validators.emailValidator, validators.strongPasswordValidator, usersController.signup, nodemailer.signupConfirmEmail);
router.get("/activeUser/:activationToken", usersController.activeUser);
router.post("/signin", createRateLimit({ max: 15, windowMs: 15 * 60_000 }), usersController.signin);
router.get("/logout", authenticateToken, usersController.logout);

const measurementFields = [
    "shouldersPx", "chestFrontPx", "bustFrontPx", "gluteusFrontPx", "bellyFrontPx", "armPx",
    "chestSidePx", "bustSidePx", "gluteusSidePx", "legPx", "bellySidePx", "armLengthPx", "legLengthPx"
];
function positiveFields(obj, fields) {
    return obj && typeof obj === "object" && fields.every((key) => {
        const value = Number(obj[key]);
        return obj[key] !== "" && obj[key] !== null && obj[key] !== undefined && Number.isFinite(value) && value > 0 && value < 1_000_000;
    });
}

router.post("/predict", createRateLimit({ max: 60, windowMs: 60_000 }), authenticateToken, regressionParametersController.getRegressionParametersMiddleware, async (req, res) => {
    const params = req.body.regressionParameters;
    if (params?.message !== "GET_REGRESSION_PARAMETERS_OK" || !positiveFields(req.body.measurements, measurementFields)) {
        return res.json({ message: "PREDICT_ERROR" });
    }
    try {
        const output = await runPython("predict", {
            bodyMeasurements: req.body.measurements,
            regressionParameters: JSON.parse(params.rps)
        });
        return res.json({ message: "PREDICT_OK", predictedMeasurements: output });
    } catch (_) {
        return res.json({ message: "PREDICT_ERROR" });
    }
});

// Store user feedback for explicit offline review. Never use unreviewed input
// to change regression coefficients shared by all application users.
router.post("/trainingByFeedback", createRateLimit({ max: 20, windowMs: 60 * 60_000 }), authenticateToken, async (req, res) => {
    const fields = normalizeFeedback(req.body?.csvFields);
    if (!fields) {
        return res.json({ message: "UPDATE_REGRESSION_PARAMETERS_ERROR" });
    }
    const target = path.join(__dirname, "..", "pulse_cloud_storage", "feedback");
    try {
        await fs.mkdir(target, { recursive: true, mode: 0o700 });
        const row = JSON.stringify({ id: randomUUID(), receivedAt: new Date().toISOString(), userId: String(req.user._id), fields });
        await fs.appendFile(path.join(target, "pending.jsonl"), row + "\n", { encoding: "utf8", mode: 0o600, flag: "a" });
        return res.json({ message: "FEEDBACK_RECEIVED" });
    } catch (_) {
        return res.json({ message: "UPDATE_REGRESSION_PARAMETERS_ERROR" });
    }
});

router.post("/svd", createRateLimit({ max: 20, windowMs: 60 * 60_000 }), authenticateToken, async (req, res) => {
    const input = req.body || {};
    const images = [input.imageUrlFront1, input.imageUrlFront2, input.imageUrlSide].map(decodePngDataUrl);
    if (images.some((data) => !data)) return res.json({ message: "SVD_ERROR" });

    const target = path.join(__dirname, "..", "pulse_cloud_storage", "HUMAN_ACQUISITION_SVD", String(req.user._id));
    try {
        await fs.mkdir(target, { recursive: true, mode: 0o700 });
        await runPython("svd", {
            imageBase64Front1: images[0], imageBase64Front2: images[1], imageBase64Side: images[2],
            uniqueFilenameFront1: randomUUID(), uniqueFilenameFront2: randomUUID(), uniqueFilenameSide: randomUUID()
        }, [target]);
        return res.json({ message: "SVD_OK" });
    } catch (_) {
        return res.json({ message: "SVD_ERROR" });
    }
});

module.exports = router;
