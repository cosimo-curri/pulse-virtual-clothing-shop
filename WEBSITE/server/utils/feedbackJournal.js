"use strict";
const fs = require("fs").promises;
const { createHash } = require("crypto");
const { csvRow } = require("./feedbackData");

async function readRecords(filePath, allowMissing = false) {
    let content;
    try {
        content = await fs.readFile(filePath, "utf8");
    } catch (error) {
        if (allowMissing && error.code === "ENOENT") return [];
        throw error;
    }
    return content.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
        const record = JSON.parse(line);
        const normalizedRow = csvRow(record.fields);
        // Permit records from an existing queue without an explicit identifier.
        const id = typeof record.id === "string" && record.id ? record.id :
            createHash("sha256").update(line).digest("hex");
        return { id, receivedAt: record.receivedAt, userId: record.userId, fields: record.fields, normalizedRow };
    });
}

function mergeRecords(approved, pending) {
    const merged = new Map();
    for (const record of [...approved, ...pending]) {
        if (merged.has(record.id) && merged.get(record.id).normalizedRow !== record.normalizedRow) {
            throw new Error("Conflicting feedback record identifiers");
        }
        merged.set(record.id, record);
    }
    return [...merged.values()];
}

module.exports = { readRecords, mergeRecords };
