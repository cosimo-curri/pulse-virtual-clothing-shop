"use strict";

const path = require("path");
const { spawn } = require("child_process");

const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 120_000;

// Pass JSON on stdin; never interpolate user input into a shell command.
function runPython(operation, input, extraArgs = []) {
    return new Promise((resolve, reject) => {
        const executable = process.env.PYTHON_EXECUTABLE || "python3";
        const script = path.join(__dirname, "..", "python", "script.py");
        const child = spawn(executable, [script, operation, ...extraArgs], {
            stdio: ["pipe", "pipe", "pipe"], windowsHide: true
        });
        let stdout = "";
        let stderr = "";
        let byteCount = 0;
        let finished = false;
        const rejectOnce = () => {
            if (finished) return;
            finished = true;
            reject(new Error("Python processing failed"));
        };
        const timer = setTimeout(() => {
            child.kill();
            rejectOnce();
        }, TIMEOUT_MS);
        const accumulate = (which, chunk) => {
            byteCount += chunk.length;
            if (byteCount > MAX_OUTPUT_BYTES) {
                child.kill();
                rejectOnce();
                return;
            }
            if (which === "out") stdout += chunk.toString("utf8");
            else stderr += chunk.toString("utf8");
        };
        child.stdout.on("data", (chunk) => accumulate("out", chunk));
        child.stderr.on("data", (chunk) => accumulate("err", chunk));
        child.on("error", () => { clearTimeout(timer); rejectOnce(); });
        child.on("close", (code, signal) => {
            clearTimeout(timer);
            if (finished) return;
            if (code !== 0 || signal) return rejectOnce();
            try {
                const result = stdout.trim() ? JSON.parse(stdout) : null;
                finished = true;
                resolve(result);
            } catch (_) { rejectOnce(); }
        });
        child.stdin.on("error", () => {}); // Child exit is handled by close/error.
        child.stdin.end(JSON.stringify(input));
    });
}

module.exports = runPython;
