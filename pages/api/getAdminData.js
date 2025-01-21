import getAdminData from "../../js/api/getAdminData.js";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    const result = await getAdminData(req, res);
    res.status(result.code).json(result);
}
