const fs = require("node:fs");
const prompt = require("prompt-sync")({ sigint: true });
const metaData = require("../config.json")["html-meta-data"];

const consent = prompt("\x1b[41mDo you agree to reset the data? (type 'yes' to confirm):\x1b[0m ").toLowerCase() == "yes";
if (!consent) return console.log("\x1b[42mReset aborted\x1b[0m");

// empty /data/backup/

fs.readdirSync("./data/backup").forEach((file) => {
    if (!file.endsWith(".json")) return;
    fs.rmSync(`./data/backup/${file}`);
});

// remove /data/table.json
try {
    fs.rmSync("./data/table.json");
} catch (error) {} // already removed

console.log("\x1b[41mData reset successful\x1b[0m");
