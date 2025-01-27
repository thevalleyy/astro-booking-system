import deleteEntry from "../../js/api/deleteEntry.js";
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

    // acquire lock
    await acquireLock();

    // pass elemtents to the function
    const result = await deleteEntry(req, JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);

    // release lock
    releaseLock();
}
