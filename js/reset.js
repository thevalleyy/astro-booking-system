import fs from "node:fs";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

const consent = prompt("\x1b[41mDo you agree to reset the data? (type 'yes' to confirm):\x1b[0m ").toLowerCase() == "yes";
if (!consent) {
    console.log("\x1b[42mReset aborted\x1b[0m");
    process.exit();
}

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
