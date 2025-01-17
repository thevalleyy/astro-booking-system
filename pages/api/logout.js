import logout from "../../js/api/logout.js";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    await logout(req, res);
}
