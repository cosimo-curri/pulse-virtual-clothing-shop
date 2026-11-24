const mongoose = require("mongoose");

const regressionParameterSchema = mongoose.Schema({
    regressionType: {
        type: String,
        enum: ["LINEAR_UNIVARIATE", "POLYNOMIAL_2_BIVARIATE"],
        required: true
    },
    label: {
        type: String,
        enum: ["ARM", "CHEST", "BUST", "GLUTEUS", "LEG", "BELLY", "SHOULDERS", "ARM_LENGTH", "LEG_LENGTH"],
        required: true,
        unique: true
    },
    coefficients: [{
        type: Number,
        required: true
    }],
    intercept: {
        type: Number,
        required: true
    }
}, { collection: "regressionParameters" });

module.exports = mongoose.model("RegressionParameter", regressionParameterSchema);