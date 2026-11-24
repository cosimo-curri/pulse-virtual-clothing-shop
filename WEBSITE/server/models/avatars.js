const mongoose = require("mongoose");

const avatarSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avatarRecipe: {
        type: String,
        required: true
    },
    allergies: {
        type: [String],
        enum: ["COTTON", "RUBBER", "WOOL", "LEATHER", "FUR", "POLYESTER", "VELVET"]
    }
});

module.exports = mongoose.model("Avatar", avatarSchema);