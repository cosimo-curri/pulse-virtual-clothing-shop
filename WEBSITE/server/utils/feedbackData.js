"use strict";

// Regression dataset column order (23 numeric measurements).
const CSV_COLUMNS = [
    "armCircumferenceCmRef", "armLengthCmRef", "chestCircumferenceCmRef", "legLengthCmRef",
    "pelvisCircumferenceCmRef", "shouldersWidthCmRef", "thighCircumferenceCmRef",
    "underChestCircumferenceCmRef", "waistCircumferenceCmRef", "height",
    "armPx", "chestFrontPx", "chestSidePx", "bustFrontPx", "bustSidePx",
    "gluteusFrontPx", "gluteusSidePx", "legPx", "bellyFrontPx", "bellySidePx",
    "shouldersPx", "armLengthPx", "legLengthPx"
];
function normalizeFeedback(fields) {
    if (!fields || typeof fields !== "object" || Array.isArray(fields)) return null;
    const result = {};
    for (const name of CSV_COLUMNS) {
        const raw = fields[name];
        if (raw === "" || raw === undefined || raw === null || typeof raw === "boolean") return null;
        const number = Number(raw);
        if (!Number.isFinite(number) || number <= 0 || number >= 1_000_000) return null;
        result[name] = number;
    }
    return result;
}
function csvRow(fields) {
    const values = normalizeFeedback(fields);
    if (!values) throw new Error("Invalid feedback row");
    return CSV_COLUMNS.map((name) => String(values[name])).join(",");
}
module.exports = { CSV_COLUMNS, normalizeFeedback, csvRow };
