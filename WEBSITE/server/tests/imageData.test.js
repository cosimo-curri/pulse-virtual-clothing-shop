"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { decodePngDataUrl } = require("../utils/imageData");

const pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/hXcAAAAASUVORK5CYII=";

test("accepts a small PNG canvas data URL", () => {
    assert.equal(decodePngDataUrl(`data:image/png;base64,${pixel}`), pixel);
});
test("rejects arbitrary external URLs to prevent SSRF", () => {
    for (const value of ["http://localhost:27017", "http://169.254.169.254/latest/meta-data", "file:///etc/passwd", "https://example.com/image.png"]) {
        assert.equal(decodePngDataUrl(value), null);
    }
});
test("rejects non-PNG input and malformed data", () => {
    assert.equal(decodePngDataUrl("data:image/jpeg;base64," + pixel), null);
    assert.equal(decodePngDataUrl("data:image/png;base64,@@@@"), null);
    assert.equal(decodePngDataUrl(null), null);
});
test("rejects PNG dimensions over the accepted limit", () => {
    const payload = Buffer.from(pixel, "base64");
    payload.writeUInt32BE(3000, 16);
    assert.equal(decodePngDataUrl(`data:image/png;base64,${payload.toString("base64")}`), null);
});
