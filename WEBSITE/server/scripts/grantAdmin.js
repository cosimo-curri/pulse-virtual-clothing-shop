"use strict";

// One-time local operator command. Never assign administrator privileges via
// registration or a public API, and never embed an administrative password.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/users");

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[1] !== "--confirm" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args[0])) {
        console.error("Usage: npm run admin:grant -- registered@example.com --confirm");
        process.exitCode = 2;
        return;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing. Configure the private .env file first.");
    }

    const email = args[0].trim().toLowerCase();
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("The specified account does not exist. Register it first.");
        }
        if (!user.secureSignUp || !user.secureSignUp.active) {
            throw new Error("The account must confirm its email address before promotion.");
        }
        if (user.role === "admin") {
            console.log("The specified account already has the admin role.");
            return;
        }

        const result = await User.updateOne(
            { _id: user._id, "secureSignUp.active": true },
            { $set: { role: "admin" } }
        );
        if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
            throw new Error("Administrator promotion was not applied.");
        }
        console.log("Administrator role assigned to the specified verified account.");
        console.log("Sign out and sign in again to refresh the user profile.");
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error(`Unable to grant administrator privileges: ${error.message}`);
    process.exitCode = 1;
});
