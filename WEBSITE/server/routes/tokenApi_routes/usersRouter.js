const express = require("express");
const router = express.Router();

const shopsController = require("../../controllers/shops");
const avatarsController = require("../../controllers/avatars");
const clothingsController = require("../../controllers/clothings");

router.get("/getShopsList", shopsController.getShopsList);
router.get("/getAllClothingsByShopVAT/:VAT", shopsController.getAllClothingsByShopVAT);
router.post("/createAvatar", avatarsController.createAvatar);
router.get("/getAllUserAvatars", avatarsController.getAllUserAvatars);
router.get("/getAllClothingsByShopId/:shopId", shopsController.getAllClothingsByShopId);
router.delete("/deleteClothing", clothingsController.deleteClothing);
router.put("/updateClothing", clothingsController.updateClothing);

///////////
/// LLM ///
///////////

const { GoogleGenerativeAI } = require("@google/generative-ai");
const gTTS = require("gtts");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const execFileAsync = promisify(execFile);
ffmpeg.setFfmpegPath(ffmpegPath);

function saveMp3(text, target) {
    return new Promise((resolve, reject) => {
        new gTTS(text, "en").save(target, (error) => error ? reject(error) : resolve());
    });
}
function convertToWav(source, target) {
    return new Promise((resolve, reject) => {
        ffmpeg(source).toFormat("wav")
            .on("error", reject)
            .on("end", resolve)
            .save(target);
    });
}
async function createSpeech(message, directory, index) {
    const stem = path.join(directory, String(index));
    const mp3 = `${stem}.mp3`;
    const wav = `${stem}.wav`;
    const json = `${stem}.json`;
    await saveMp3(message.text, mp3);
    await convertToWav(mp3, wav);
    await execFileAsync(process.env.RHUBARB_EXECUTABLE || "rhubarb", ["-f", "json", "-o", json, wav, "-r", "phonetic"], {
        timeout: 30_000,
        windowsHide: true
    });
    const lipsync = JSON.parse(await fs.readFile(json, "utf8"));
    if (!Array.isArray(lipsync.mouthCues)) throw new Error("Invalid lip-sync output");
    message.audio = (await fs.readFile(wav)).toString("base64");
    message.lipsync = lipsync;
}

router.post("/virtualAssistant", async (req, res) => {
    if (typeof req.body?.userPrompt !== "string" || !req.body.userPrompt.trim() ||
        req.body.userPrompt.length > 2000 || !process.env.GOOGLE_API_KEY) {
        return res.json({ message: "LOCATION_ERROR" });
    }
    let directory;
    try {
        const prompt = `
        Your name is Selma.

        You are a virtual assistant of a software called VCS, that stands for Virtual Clothing Shop.
        To add a garment for sale, shop owners can use the Pulse Android app from the separate Unity source project: sign in, photograph the front and back of the t-shirt, then enter the product details. The web control panel does not provide an APK download.

        You will always reply with a JSON array of messages. With a maximum of 10 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
        The user has just said: ${req.body.userPrompt}
        `;
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_MODEL || "gemini-pro" });
        const result = await model.generateContent(prompt);
        // The SDK may return plain JSON or a JSON Markdown code fence.
        const output = result.response.text().trim();
        const fenced = output.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
        const messages = JSON.parse(fenced ? fenced[1] : output);
        const validExpressions = new Set(["smile", "sad", "angry", "surprised", "funnyFace", "default"]);
        const validAnimations = new Set(["Talking_0", "Talking_1", "Talking_2", "Crying", "Laughing", "Rumba", "Idle", "Terrified", "Angry"]);
        if (!Array.isArray(messages) || !messages.length || messages.length > 10 ||
            !messages.every((item) => item && typeof item.text === "string" && item.text.length > 0 &&
                item.text.length <= 1500 && validExpressions.has(item.facialExpression) && validAnimations.has(item.animation))) {
            throw new Error("Invalid assistant response");
        }
        directory = await fs.mkdtemp(path.join(os.tmpdir(), "pulse-audio-"));
        // Generate one clip at a time to avoid simultaneous speech-provider requests
        // and to keep temporary files consistent on failure.
        for (let index = 0; index < messages.length; index++) {
            await createSpeech(messages[index], directory, index);
        }
        return res.json({ message: "AI_RESPONSE_OK", messages });
    } catch (error) {
        console.error("Virtual assistant request failed:", error.message);
        return res.json({ message: "LOCATION_ERROR" });
    } finally {
        if (directory) await fs.rm(directory, { recursive: true, force: true }).catch(() => {});
    }
});

module.exports = router;