const fs = require("node:fs");
const config = require("../config.json");

async function writeLog(req) {
    if (!config.log.enabled) return;

    // create log folder if it doesn't exist
    if (!fs.existsSync(`${config.log.log_path}/`)) fs.mkdirSync(`${config.log.log_path}/`, { recursive: true });

    const json = {
        time: Date.now(),
        ip: config.log.ips ? req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.connection.remoteAddress : "IP",
        url: config.log.requests ? req.url : "URL",
    };

    const dateString = new Date().toISOString().substring(0, 10);
    fs.appendFile(`${config.log.log_path}/${dateString}${config.log.log_extension}`, `\n${JSON.stringify(json)}`, (err) => {
        if (err) console.warn(err);
    });
}

module.exports = writeLog;