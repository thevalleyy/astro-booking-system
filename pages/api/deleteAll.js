import deleteAll from "../../js/api/deleteAll.js";
import request from "../../js/request.js";

let isLocked = false;

async function acquireLock() {
    isLocked = true;
}

function releaseLock() {
    isLocked = false;
}

export default async function handler(req, res) {
    request(req);

    // check if locked
    if (isLocked) {
        res.status(503).json({ code: 503, message: "Another admin is performing this action right now", success: false });
    }

    // acquire lock
    acquireLock();

    // pass elemtents to the function
    const result = await deleteAll(req, JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);

    // release lock
    releaseLock();
}
