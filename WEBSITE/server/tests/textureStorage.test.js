"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { uploadedTextureFilename } = require("../utils/textureStorage");

const valid = "ADMIN_507f1f77bcf86cd799439011_TIMESTAMP_1709744275473_123e4567-e89b-12d3-a456-426614174000.png";
test("allows removal only of locally uploaded PNG names", () => {
    assert.equal(uploadedTextureFilename(`http://localhost:3000/textures/${valid}`), valid);
    assert.equal(uploadedTextureFilename(`https://example.com/textures/../settings.json`), null);
    assert.equal(uploadedTextureFilename("https://example.com/anything.png"), null);
    assert.equal(uploadedTextureFilename(`https://example.com/textures/${valid}?download=1`), null);
});
