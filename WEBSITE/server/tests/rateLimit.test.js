"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimit } = require("../utils/rateLimit");

test("limits a single client within a window and resets after expiry", () => {
    let time = 100;
    const limit = createRateLimit({ max: 2, windowMs: 1000, now: () => time });
    const response = { status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
    let passed = 0;
    for (let i = 0; i < 3; i++) limit({ ip: "127.0.0.1" }, response, () => passed++);
    assert.equal(passed, 2);
    assert.equal(response.code, 429);
    assert.deepEqual(response.body, { message: "RATE_LIMITED" });
    time = 1100;
    limit({ ip: "127.0.0.1" }, response, () => passed++);
    assert.equal(passed, 3);
});
