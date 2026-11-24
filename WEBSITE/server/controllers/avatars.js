const Avatar = require("../models/avatars");
const User = require("../models/users");

exports.createAvatar = (req, res) => {
    if(req.body.name && req.body.avatarRecipe && req.body.allergies) {
        Avatar.create({
            name: req.body.name,
            avatarRecipe: req.body.avatarRecipe,
            allergies: req.body.allergies
        })
        .then(async avatar => {
            req.user.avatars.push(avatar._id);
            try {
                await req.user.save();
                res.json({ message: "CREATE_AVATAR_OK" });
            } catch (_) {
                await Avatar.findByIdAndDelete(avatar._id).catch(() => {});
                res.json({ message: "CREATE_AVATAR_ERROR" });
            }
        })
        .catch(() => {
            res.json({ message: "CREATE_AVATAR_ERROR" });
        });
    } else
        res.json({ message: "CREATE_AVATAR_ERROR" });
};

exports.getAllUserAvatars = (req, res) => {
    User.findById(req.user._id)
    .populate("avatars")
    .then(user => {
        if (!user) return res.json({ message: "GET_ALL_AVATARS_ERROR" });
        res.json({
            message: "GET_ALL_AVATARS_OK",
            avatars: user.avatars
        });
    })
    .catch(() => {
        res.json({ message: "GET_ALL_AVATARS_ERROR" });
    });
};