const User = require("../models/users");
const Clothing = require("../models/clothings");
const Avatar = require("../models/avatars");
const fs = require("fs").promises;
const path = require("path");
const { uploadedTextureFilename } = require("../utils/textureStorage");
const Shop = require("../models/shops");

exports.createShop = async (req, res) => {
    if (!req.body?.VAT || !req.body.name || !req.body.address?.street ||
        !req.body.address.civic || !req.body.address.ZIP || !req.body.user) {
        return res.json({ message: "CREATE_SHOP_ERROR" });
    }
    let shop;
    try {
        shop = await Shop.create({
            VAT: req.body.VAT,
            name: req.body.name,
            address: {
                street: req.body.address.street,
                civic: req.body.address.civic,
                ZIP: req.body.address.ZIP
            }
        });
        // Prevent concurrent requests from assigning multiple shops to one account.
        const result = await User.updateOne({
            _id: req.body.user._id,
            $or: [{ shop: { $exists: false } }, { shop: null }]
        }, { $set: { shop: shop._id } });
        if (result.modifiedCount !== 1) throw new Error("User is already associated with a shop");
        return res.json({ message: "CREATE_SHOP_OK" });
    } catch (_) {
        if (shop) await Shop.findByIdAndDelete(shop._id).catch(() => {});
        return res.json({ message: "CREATE_SHOP_ERROR" });
    }
};

exports.deleteShopFromUser = async (req, res) => {
    const targetUser = req.targetUser;
    if (!targetUser) return res.json({ message: "DELETE_USER_ERROR" });
    let removedShop = null;
    try {
        // Deleting the shop first permits restoration if account removal fails.
        if (targetUser.shop) removedShop = await Shop.findByIdAndDelete(targetUser.shop);
        const removedUser = await User.findByIdAndDelete(targetUser._id);
        if (!removedUser) throw new Error("Account was changed during deletion");
    } catch (error) {
        if (removedShop) {
            try {
                await Shop.collection.insertOne(removedShop.toObject({ depopulate: true }));
            } catch (restoreError) {
                console.error("Shop recovery requires administrator attention:", restoreError.message);
            }
        }
        return res.json({ message: "DELETE_USER_ERROR" });
    }
    // Child records are independent documents; remove them after the account
    // and shop are gone, and preserve an observable error if cleanup fails.
    try {
        const clothingIds = removedShop?.clothings || [];
        const clothings = clothingIds.length ? await Clothing.find({ _id: { $in: clothingIds } }).lean() : [];
        if (clothingIds.length) await Clothing.deleteMany({ _id: { $in: clothingIds } });
        if (targetUser.avatars?.length) await Avatar.deleteMany({ _id: { $in: targetUser.avatars } });
        for (const clothing of clothings) {
            const filename = uploadedTextureFilename(clothing.texturePath);
            if (!filename) continue;
            await fs.unlink(path.join(__dirname, "..", "pulse_cloud_storage", "T_SHIRT_TEXTURES", filename))
                .catch((error) => { if (error.code !== "ENOENT") throw error; });
        }
        return res.json({ message: "DELETE_USER_OK" });
    } catch (error) {
        console.error("Post-deletion cleanup requires administrator attention:", error.message);
        return res.json({ message: "DELETE_USER_ERROR" });
    }
};

exports.getShopsList = (req, res) => {
    Shop.find()
    .then(shops => {
        res.json({
            message: "GET_SHOPS_OK",
            shops: shops
        });
    })
    .catch(() => {
        res.json({ message: "GET_SHOPS_ERROR" });
    })
};

exports.getAllClothingsByShopId = (req, res) => {
    if(req.params.shopId) {
        Shop.findById(req.params.shopId)
        .populate("clothings")
        .then(shop => {
            if (!shop) return res.json({ message: "GET_CLOTHINGS_ERROR_NO_SHOP" });
            res.json({
                message: "GET_CLOTHINGS_OK",
                clothings: shop.clothings
            });
        })
        .catch(() => {
            res.json({ message: "GET_CLOTHINGS_ERROR_NO_SHOP" });
        });
    } else
        res.json({ message: "GET_CLOTHINGS_ERROR" });
};

exports.getAllClothingsByShopVAT = (req, res) => {
    const VAT = req.params.VAT;

    if(VAT) {
        Shop.findOne({ VAT: VAT })
        .populate("clothings")
        .then(shop => {
            if (!shop) return res.json({ message: "GET_CLOTHINGS_ERROR" });
            const filteredClothings = shop.clothings.filter(clothing => {
                return clothing.quantity > 0;
            });

            res.json({
                message: "GET_CLOTHINGS_OK",
                clothings: filteredClothings
            });
        })
        .catch(() => {
            res.json({ message: "GET_CLOTHINGS_ERROR" });
        });
    } else
        res.json({ message: "GET_CLOTHINGS_ERROR" });
};