"use strict";

// Only files named by the garment-upload handler may be removed from storage.
function uploadedTextureFilename(textureUrl) {
    if (typeof textureUrl !== "string") return null;
    try {
        const url = new URL(textureUrl);
        if (!["http:", "https:"].includes(url.protocol) || url.search || url.hash) return null;
        const match = url.pathname.match(/^\/textures\/(ADMIN_[a-zA-Z0-9]+_TIMESTAMP_\d+_[0-9a-f-]{36}\.png)$/);
        return match ? match[1] : null;
    } catch (_) { return null; }
}
module.exports = { uploadedTextureFilename };
