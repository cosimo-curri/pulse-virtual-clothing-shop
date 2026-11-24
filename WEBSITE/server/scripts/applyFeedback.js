"use strict";

// Apply reviewed observations locally while the API is stopped.
require("dotenv").config();
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const RegressionParameter = require("../models/regressionParameters");
const runPython = require("../utils/runPython");
const { readRecords, mergeRecords } = require("../utils/feedbackJournal");

const labels = ["ARM", "LEG", "SHOULDERS", "ARM_LENGTH", "LEG_LENGTH", "CHEST", "BUST", "GLUTEUS", "BELLY"];
const feedbackDir = path.join(__dirname, "..", "pulse_cloud_storage", "feedback");
const pendingPath = path.join(feedbackDir, "pending.jsonl");
const approvedPath = path.join(feedbackDir, "approved.jsonl");


async function main() {
    if (process.argv.length !== 3 || process.argv[2] !== "--confirm") {
        throw new Error("Usage: npm run regression:feedback-apply -- --confirm (review feedback and stop the API first)");
    }
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
    const source = process.env.FEEDBACK_DATASET_PATH || path.join(__dirname, "..", "MACHINE_LEARNING_DATASETS", "human.csv");
    const [pending, approved] = await Promise.all([
        readRecords(pendingPath), readRecords(approvedPath, true)
    ]);
    const reviewed = mergeRecords(approved, pending);
    const approvedIds = new Set(approved.map((record) => record.id));
    const addedCount = reviewed.filter((record) => !approvedIds.has(record.id)).length;
    if (!addedCount) {
        // Complete cleanup if a previous run saved the journal before removing the queue.
        await fs.unlink(pendingPath);
        console.log("No new feedback to apply; pending queue cleared.");
        return;
    }

    const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "pulse-regression-"));
    const working = path.join(temporaryDirectory, "human.csv");
    try {
        const initial = await fs.readFile(source, "utf8");
        await fs.writeFile(working, initial.trimEnd() + "\n" + reviewed.map((record) => record.normalizedRow).join("\n") + "\n", { mode: 0o600 });
        const trained = await runPython("initialTraining", {}, [working]);
        for (const [index, label] of labels.entries()) {
            const params = trained?.[label];
            const coefficientCount = index < 5 ? 1 : 5;
            if (!Array.isArray(params?.coefficients) || params.coefficients.length !== coefficientCount ||
                params.coefficients.some((value) => !Number.isFinite(value)) || !Number.isFinite(params.intercept)) {
                throw new Error(`Invalid coefficients for ${label}`);
            }
        }
        await mongoose.connect(process.env.MONGODB_URI);
        try {
            const existing = await RegressionParameter.find({ label: { $in: labels } }).lean();
            if (existing.length !== labels.length || new Set(existing.map((p) => p.label)).size !== labels.length) {
                throw new Error("Initialize all nine regression models first");
            }
            const updateResult = await RegressionParameter.bulkWrite(labels.map((label) => ({
                updateOne: { filter: { label }, update: { $set: {
                    coefficients: trained[label].coefficients,
                    intercept: trained[label].intercept
                } } }
            })), { ordered: true });
            if (updateResult.matchedCount !== labels.length) {
                throw new Error("Not all regression models were updated");
            }

            // Keep a durable, private journal so subsequent runs train on every approved batch.
            // If cleanup fails, record IDs prevent replaying pending rows twice.
            const journalTemp = `${approvedPath}.${randomUUID()}.tmp`;
            try {
                const journal = reviewed.map(({ normalizedRow, ...record }) => JSON.stringify(record)).join("\n") + "\n";
                await fs.writeFile(journalTemp, journal, { mode: 0o600, flag: "wx" });
                await fs.rename(journalTemp, approvedPath);
            } finally {
                await fs.unlink(journalTemp).catch((error) => { if (error.code !== "ENOENT") throw error; });
            }
            await fs.unlink(pendingPath);
            console.log(`Applied ${addedCount} new feedback rows; ${reviewed.length} approved rows retained for future training.`);
        } finally {
            await mongoose.disconnect();
        }
    } finally {
        await fs.rm(temporaryDirectory, { recursive: true, force: true });
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error(`Feedback application failed: ${error.message}`);
        process.exitCode = 1;
    });
}

module.exports = { readRecords, mergeRecords, main };
