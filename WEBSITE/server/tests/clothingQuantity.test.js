"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Exercise the custom validator without requiring a running MongoDB instance.
test("Clothing quantity must be a positive integer", () => {
    const file = path.join(__dirname, "..", "models", "clothings.js");
    const schema = {};
    const mockMongoose = {
        Schema: (definition) => {
            Object.assign(schema, definition);
            return schema;
        },
        model: (_, definition) => definition
    };
    const moduleStub = { exports: {} };
    vm.runInNewContext(fs.readFileSync(file, "utf8"), {
        module: moduleStub,
        require: (name) => {
            assert.equal(name, "mongoose");
            return mockMongoose;
        }
    }, { filename: file });

    const quantity = moduleStub.exports.quantity;
    assert.equal(quantity.min, 1);
    for (const value of [1, 2, 100]) {
        assert.equal(quantity.validate.validator(value), true);
    }
    for (const value of [0, -1, 0.5, 1.2, 2.75, NaN, Infinity]) {
        assert.equal(quantity.validate.validator(value) && value >= quantity.min, false);
    }
});
