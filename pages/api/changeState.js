import changeState from "../../js/api/changeState.js";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    await changeState(req, res);
}
