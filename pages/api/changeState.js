import changeState from "../../js/api/changeState.js";
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
    await changeState(req, res);

    // release lock
    releaseLock();
}
