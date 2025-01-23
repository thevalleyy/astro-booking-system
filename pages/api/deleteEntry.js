import deleteEntry from "../../js/api/deleteEntry.js";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    const result = await deleteEntry(req, JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);
}
