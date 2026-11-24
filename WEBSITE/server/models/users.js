const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

//THE PASSWORD FIELD IS NOT REQUIRED DUE TO ITS AUTOMATIC MANAGEMENT BY passport-local-mongoose
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    currentValidToken: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    secureSignUp: {
        active: {
            type: Boolean,
            default: false
        },
        activationToken: String
    },
    changePasswordToken: String,
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    avatars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Avatar"
    }]
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

module.exports = mongoose.model("User", userSchema);