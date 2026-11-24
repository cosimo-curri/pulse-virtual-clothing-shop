const { body } = require("express-validator");

exports.emailValidator = [
    body("email").isEmail().withMessage("NOT_AN_EMAIL")
];

//AT LEAST 8 CHARACTERS: 1+ LOWERCASE LETTERS, 1+ UPPERCASE LETTERS, 1+ NUMBERS, 1+ SPECIAL CHARACTERS
exports.strongPasswordValidator = [
    body("password").isStrongPassword().withMessage("WEAK_PASSWORD")
];