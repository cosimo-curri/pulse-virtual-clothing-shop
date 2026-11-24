"use strict";

// Clients send images produced by canvas.toDataURL(). URLs and server-side
// network fetching are deliberately not supported.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function decodePngDataUrl(value) {
    if (typeof value !== "string" || value.length > MAX_IMAGE_BYTES * 4 / 3 + 80) return null;
    const prefix = "data:image/png;base64,";
    if (!value.startsWith(prefix)) return null;
    const content = value.slice(prefix.length);
    if (!content || content.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) return null;
    const buffer = Buffer.from(content, "base64");
    if (buffer.length < 24 || buffer.length > MAX_IMAGE_BYTES || !buffer.subarray(0, 8).equals(SIGNATURE)) return null;
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    // Prevent resource exhaustion by huge image dimensions.
    if (!width || !height || width > 1024 || height > 1024 || width * height > 400_000) return null;
    return content;
}

module.exports = { decodePngDataUrl, MAX_IMAGE_BYTES };
