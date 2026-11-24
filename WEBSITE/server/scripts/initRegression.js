"use strict";

// Local, opt-in initialization of regression coefficients from the bundled CSV.
// Existing MongoDB models, including those updated through feedback, are preserved.
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const RegressionParameter = require("../models/regressionParameters");
const runPython = require("../utils/runPython");

const univariateLabels = ["ARM", "LEG", "SHOULDERS", "ARM_LENGTH", "LEG_LENGTH"];
const bivariateLabels = ["CHEST", "BUST", "GLUTEUS", "BELLY"];
const labels = [...univariateLabels, ...bivariateLabels];

async function getInitialModels() {
    const csvPath = path.join(__dirname, "..", "MACHINE_LEARNING_DATASETS", "human.csv");
    const trained = await runPython("initialTraining", {}, [csvPath]);
    if (!trained || typeof trained !== "object" ||
        Object.keys(trained).length !== labels.length) {
        throw new Error("Training did not produce the nine expected regression models.");
    }

    return labels.map((label) => {
        const parameters = trained[label];
        const expectedLength = univariateLabels.includes(label) ? 1 : 5;
        if (!parameters || !Array.isArray(parameters.coefficients) ||
            parameters.coefficients.length !== expectedLength ||
            parameters.coefficients.some((value) => !Number.isFinite(value)) ||
            !Number.isFinite(parameters.intercept)) {
            throw new Error(`Invalid trained parameters for ${label}.`);
        }
        return {
            label,
            regressionType: univariateLabels.includes(label)
                ? "LINEAR_UNIVARIATE" : "POLYNOMIAL_2_BIVARIATE",
            coefficients: parameters.coefficients,
            intercept: parameters.intercept
        };
    });
}

async function main() {
    if (process.argv.length !== 3 || process.argv[2] !== "--confirm") {
        console.error("Usage: npm run regression:init -- --confirm");
        process.exitCode = 2;
        return;
    }
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing. Configure the private .env first.");
    }

    const models = await getInitialModels();
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        let inserted = 0;
        let retained = 0;
        for (const model of models) {
            const result = await RegressionParameter.updateOne(
                { label: model.label },
                { $setOnInsert: model },
                { upsert: true, runValidators: true }
            );
            if (result.upsertedCount) inserted += 1;
            else retained += 1;
        }
        console.log(`Regression initialization complete: ${inserted} inserted, ${retained} preserved.`);
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error(`Unable to initialize regression parameters: ${error.message}`);
    process.exitCode = 1;
});
