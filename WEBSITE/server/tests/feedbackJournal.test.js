"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { CSV_COLUMNS } = require("../utils/feedbackData");
const { readRecords, mergeRecords } = require("../utils/feedbackJournal");

function entry(id, base) {
    return { id, receivedAt: "2026-11-01T00:00:00Z", userId: "test-user",
        fields: Object.fromEntries(CSV_COLUMNS.map((column, index) => [column, base + index])) };
}

test("Cumulative feedback preserves previous approvals across multiple batches", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pulse-feedback-test-"));
    try {
        const approvedPath = path.join(dir, "approved.jsonl");
        const pendingPath = path.join(dir, "pending.jsonl");
        const first = entry("first", 1);
        const second = entry("second", 5);
        await fs.writeFile(approvedPath, JSON.stringify(first) + "\n");
        await fs.writeFile(pendingPath, JSON.stringify(second) + "\n");
        const approved = await readRecords(approvedPath);
        const pending = await readRecords(pendingPath);
        const merged = mergeRecords(approved, pending);
        assert.deepEqual(merged.map((row) => row.id), ["first", "second"]);
        assert.equal(merged.length, 2);
        // If the already-approved row is left in the queue after a cleanup failure,
        // it must not be incorporated into the training data a second time.
        assert.equal(mergeRecords(merged, [approved[0]]).length, 2);
        const third = entry("third", 9);
        const next = mergeRecords(merged, [{ ...third, normalizedRow: CSV_COLUMNS.map((_, i) => 9 + i).join(",") }]);
        assert.deepEqual(next.map((row) => row.id), ["first", "second", "third"]);
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
});

test("Conflicting or malformed feedback cannot enter the approved journal", async () => {
    const record = { ...entry("same-id", 5), normalizedRow: "not-the-same" };
    const other = { ...record, normalizedRow: "different" };
    assert.throws(() => mergeRecords([record], [other]), /Conflicting/);
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pulse-feedback-test-"));
    try {
        const file = path.join(dir, "pending.jsonl");
        await fs.writeFile(file, JSON.stringify({ id: "invalid", fields: {} }) + "\n");
        await assert.rejects(readRecords(file), /Invalid feedback row/);
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
});
