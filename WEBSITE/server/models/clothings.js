const mongoose = require("mongoose");

const clothingSchema = mongoose.Schema({
    price: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "UNISEX"],
        required: true
    },
    type: {
        type: String,
        enum: ["T_SHIRT_1"],
        required: true
    },
    material: {
        type: String,
        enum: ["COTTON", "RUBBER", "WOOL", "LEATHER", "FUR", "POLYESTER", "VELVET"],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: "Clothing quantity must be a whole number"
        }
    },
    size: {
        type: String,
        enum: ["S", "M", "L"],
        required: true
    },
    texturePath: {
        type: String,
        unique: true,
        required: true
    },
    dimensions: {
        length: Number,
        width: Number,
        neckWidth: Number,
        sleeveWidth: Number
    }
});

module.exports = mongoose.model("Clothing", clothingSchema);