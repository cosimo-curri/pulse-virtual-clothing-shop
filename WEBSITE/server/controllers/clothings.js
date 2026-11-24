"use strict";
const Clothing = require("../models/clothings");
const Shop = require("../models/shops");
const path = require("path");
const fs = require("fs").promises;
const { uploadedTextureFilename } = require("../utils/textureStorage");

function inShop(shop, clothingId) {
    return Boolean(shop && shop.clothings.some((id) => String(id) === String(clothingId)));
}

exports.deleteClothing = async (req, res) => {
    const clothingId = req.body?.clothingId;
    if (!clothingId || !req.user.shop) return res.json({ message: "DELETE_CLOTHING_ERROR" });
    try {
        const shop = await Shop.findById(req.user.shop);
        if (!inShop(shop, clothingId)) return res.json({ message: "DELETE_CLOTHING_ERROR" });
        const clothing = await Clothing.findById(clothingId);
        if (!clothing) return res.json({ message: "DELETE_CLOTHING_ERROR" });
        const update = await Shop.updateOne({ _id: shop._id, clothings: clothingId },
            { $pull: { clothings: clothingId } });
        if (update.modifiedCount !== 1) return res.json({ message: "DELETE_CLOTHING_ERROR" });
        try {
            await Clothing.findByIdAndDelete(clothingId);
        } catch (error) {
            await Shop.updateOne({ _id: shop._id }, { $addToSet: { clothings: clothingId } }).catch(() => {});
            throw error;
        }
        // Remove only locally uploaded textures, never external asset URLs.
        const filename = uploadedTextureFilename(clothing.texturePath);
        if (filename) {
            const target = path.join(__dirname, "..", "pulse_cloud_storage", "T_SHIRT_TEXTURES", filename);
            await fs.unlink(target).catch(() => {}); // A missing file must not undo DB deletion.
        }
        return res.json({ message: "DELETE_CLOTHING_OK" });
    } catch (_) {
        return res.json({ message: "DELETE_CLOTHING_ERROR" });
    }
};

exports.updateClothing = async (req, res) => {
    const { clothingId, price, gender, type, material, quantity, size,
        length, width, neckWidth, sleeveWidth } = req.body || {};
    const numbers = [price, quantity, length, width, neckWidth, sleeveWidth];
    if (!clothingId || !req.user.shop || !gender || !type || !material || !size ||
        numbers.some((value) => value === "" || value === null || value === undefined ||
            !Number.isFinite(Number(value)) || Number(value) <= 0) ||
        !Number.isInteger(Number(quantity))) {
        return res.json({ message: "UPDATE_CLOTHING_ERROR" });
    }
    try {
        const shop = await Shop.findById(req.user.shop);
        if (!inShop(shop, clothingId)) return res.json({ message: "UPDATE_CLOTHING_ERROR" });
        const clothing = await Clothing.findById(clothingId);
        if (!clothing) return res.json({ message: "UPDATE_CLOTHING_ERROR" });
        Object.assign(clothing, { price, gender, type, material, quantity, size });
        Object.assign(clothing.dimensions, { length, width, neckWidth, sleeveWidth });
        await clothing.save();
        return res.json({ message: "UPDATE_CLOTHING_OK", clothingUpdated: clothing });
    } catch (_) {
        return res.json({ message: "UPDATE_CLOTHING_ERROR" });
    }
};
