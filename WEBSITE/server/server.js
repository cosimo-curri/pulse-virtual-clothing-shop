require("dotenv").config();

const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const WebSocket = require("ws");
const clothingEvents = require("./utils/clothingEvents");

const app = express();
app.disable("x-powered-by");
const port = Number(process.env.PORT || 3000);
const socketPort = Number(process.env.SOCKET_PORT || 3002);
const databaseUri = process.env.MONGODB_URI;
if (!databaseUri || !process.env.SESSION_SECRET_PASSCODE || !process.env.AUTH_SECRET_ENCODING_PASSPHRASE || !process.env.USER_ACTIVATION_TOKEN_SECRET_ENCODING_PASSPHRASE || !process.env.USER_CHANGE_PASSWORD_TOKEN_SECRET_ENCODING_PASSPHRASE) {
    throw new Error("Missing required backend configuration. See .env.example.");
}

const apiRouter = require("./routes/api");
const tokenApiRouter = require("./routes/tokenApi");

app.use(cors({ origin: (process.env.CORS_ORIGIN || "http://localhost:3001").split(",").map((origin) => origin.trim()) }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));

app.use(expressSession({
    secret: process.env.SESSION_SECRET_PASSCODE,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", apiRouter);
app.use("/tokenApi", tokenApiRouter);
app.use("/textures", express.static(path.join(__dirname, "pulse_cloud_storage", "T_SHIRT_TEXTURES")));

async function start() {
    await mongoose.connect(databaseUri);
    console.log("SERVER: MongoDB/Mongoose successfully connected");
    app.listen(port, () => console.log(`SERVER: listening on port ${port}`));

    const wss = new WebSocket.Server({ port: socketPort });
    // Clients subscribe to catalog changes; incoming client messages are ignored.
    wss.on("connection", (ws) => {
        ws.on("message", () => {});
    });
    clothingEvents.on("created", (message) => {
        for (const ws of wss.clients) {
            if (ws.readyState === WebSocket.OPEN) ws.send(message);
        }
    });
    console.log(`SERVER (CLOTHING SOCKET): listening on port ${socketPort}`);
}

if (require.main === module) {
    start().catch((error) => {
        console.error("Failed to start server:", error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, start };
