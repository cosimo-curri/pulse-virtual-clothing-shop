"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { CSV_COLUMNS, normalizeFeedback, csvRow } = require("../utils/feedbackData");

test("Feedback validation accepts positive finite fields and preserves CSV column order", () => {
    const fields = Object.fromEntries(CSV_COLUMNS.map((name, index) => [name, String(index + 1)]));
    assert.equal(CSV_COLUMNS.length, 23);
    const normalized = normalizeFeedback(fields);
    assert.equal(normalized.armCircumferenceCmRef, 1);
    assert.equal(csvRow(normalized), Array.from({ length: 23 }, (_, i) => i + 1).join(","));
});

test("Feedback validation rejects missing, NaN, negative and huge measurements", () => {
    const fields = Object.fromEntries(CSV_COLUMNS.map((name) => [name, 1]));
    for (const invalid of [undefined, "NaN", -1, 0, 1_000_000, true]) {
        assert.equal(normalizeFeedback({ ...fields, armPx: invalid }), null);
    }
});
