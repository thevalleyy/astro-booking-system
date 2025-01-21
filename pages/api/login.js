import login from "../../js/api/login.js";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    await login(req, res);
}
