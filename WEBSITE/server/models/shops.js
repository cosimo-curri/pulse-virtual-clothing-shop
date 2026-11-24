const mongoose = require("mongoose");

const shopSchema = mongoose.Schema({
    VAT: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        civic: {
            type: String,
            required: true
        },
        ZIP: {
            type: String,
            required: true
        }
    },
    clothings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clothing"
    }],
});

module.exports = mongoose.model("Shop", shopSchema);