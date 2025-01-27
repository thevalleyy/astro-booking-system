import { promises as fs } from "node:fs";

import addEntry from "../../js/api/addEntry.js";
import request from "../../js/request.js";

let isLocked = false;

async function acquireLock() {
    while (isLocked) {
        await new Promise((resolve) => setTimeout(resolve, 10));
    }

    isLocked = true;
}

function releaseLock() {
    isLocked = false;
}

export default async function handler(req, res) {
    request(req);

    const enabled = JSON.parse(await fs.readFile("./config.json", "utf-8")).settings.enabled;
    if (!enabled) {
        res.status(423).json({ code: 423, success: false, message: "Booking is currently disabled" });
        return;
    }

    // acquire lock
    await acquireLock();

    // pass elemtents to the function
    const result = await addEntry(JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);

    // release lock
    releaseLock();
}
