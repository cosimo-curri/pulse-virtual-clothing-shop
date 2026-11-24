const express = require("express");
const router = express.Router();
const Clothing = require("../../models/clothings");
const Shop = require("../../models/shops");
const path = require("path");
const fs = require("fs").promises;
const { randomUUID } = require("crypto");
const clothingEvents = require("../../utils/clothingEvents");

const textureDirectory = path.join(__dirname, "..", "..", "pulse_cloud_storage", "T_SHIRT_TEXTURES");
const MAX_TEXTURE_BYTES = 10 * 1024 * 1024;

function parsePngTexture(base64) {
    if (typeof base64 !== "string" || !base64 || base64.length > MAX_TEXTURE_BYTES * 4 / 3 + 16 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
        return null;
    }
    const buffer = Buffer.from(base64, "base64");
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!buffer.length || buffer.length > MAX_TEXTURE_BYTES || buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) {
        return null;
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (!width || !height || width > 4096 || height > 4096 || width * height > 4_000_000) return null;
    return buffer;
}

router.post("/uploadClothing", async (req, res) => {
    const { price, type, material, quantity, gender, size, dimensions, texture } = req.body || {};
    if (!req.user.shop || !price || !material || !quantity || !gender || !size || type !== "T_SHIRT_1" ||
        !dimensions || !dimensions.length || !dimensions.width || !dimensions.neckWidth || !dimensions.sleeveWidth) {
        return res.json({ message: "UPLOAD_ERROR" });
    }
    if (![price, quantity, dimensions.length, dimensions.width, dimensions.neckWidth, dimensions.sleeveWidth]
        .every((value) => value !== "" && value !== null && Number.isFinite(Number(value)) && Number(value) > 0) ||
        !Number.isInteger(Number(quantity))) {
        return res.json({ message: "UPLOAD_ERROR" });
    }
    const imageBuffer = parsePngTexture(texture);
    if (!imageBuffer) {
        return res.json({ message: "UPLOAD_ERROR" });
    }

    let savedFile;
    let clothing;
    try {
        const shop = await Shop.findById(req.user.shop);
        if (!shop) {
            return res.json({ message: "UPLOAD_ERROR" });
        }
        const filename = `ADMIN_${req.user._id}_TIMESTAMP_${Date.now()}_${randomUUID()}.png`;
        const clothingJson = {
            price, gender, type, material, quantity, size,
            dimensions: {
                length: dimensions.length,
                width: dimensions.width,
                neckWidth: dimensions.neckWidth,
                sleeveWidth: dimensions.sleeveWidth
            },
            texturePath: `${process.env.BASE_URL}/textures/${filename}`
        };

        await fs.mkdir(textureDirectory, { recursive: true });
        savedFile = path.join(textureDirectory, filename);
        await fs.writeFile(savedFile, imageBuffer, { flag: "wx", mode: 0o600 });
        clothing = await Clothing.create(clothingJson);
        const linked = await Shop.updateOne({ _id: shop._id }, { $addToSet: { clothings: clothing._id } });
        if (linked.modifiedCount !== 1) throw new Error("Could not attach clothing to shop");

        const modifiedClothing = {
            _id: clothing._id, price: clothing.price, gender: clothing.gender,
            type: clothing.type, material: clothing.material, quantity: clothing.quantity,
            size: clothing.size, texturePath: clothing.texturePath,
            dimensions: clothing.dimensions, VAT: shop.VAT, shopId: shop._id
        };
        clothingEvents.emit("created", JSON.stringify(modifiedClothing));
        return res.json({ message: "UPLOAD_OK", clothing: JSON.stringify(modifiedClothing) });
    } catch (_) {
        if (clothing) {
            await Shop.updateOne({ _id: req.user.shop }, { $pull: { clothings: clothing._id } }).catch(() => {});
            await Clothing.findByIdAndDelete(clothing._id).catch(() => {});
        }
        if (savedFile) await fs.unlink(savedFile).catch(() => {});
        return res.json({ message: "UPLOAD_ERROR" });
    }
});

module.exports = router;
