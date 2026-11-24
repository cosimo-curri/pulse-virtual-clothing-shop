"use strict";

// A small per-process guard for development/demo endpoints. Deployments with
// multiple server replicas should use a shared limiter at the API gateway.
function createRateLimit({ max, windowMs, now = Date.now }) {
    const records = new Map();
    return (req, res, next) => {
        const time = now();
        if (records.size > 5000) {
            for (const [key, value] of records) {
                if (time >= value.expires) records.delete(key);
            }
            if (records.size > 5000) records.clear();
        }
        const key = String(req.ip || req.socket?.remoteAddress || "unknown");
        let record = records.get(key);
        if (!record || time >= record.expires) {
            record = { count: 0, expires: time + windowMs };
            records.set(key, record);
        }
        record.count += 1;
        if (record.count > max) return res.status(429).json({ message: "RATE_LIMITED" });
        next();
    };
}
module.exports = { createRateLimit };
