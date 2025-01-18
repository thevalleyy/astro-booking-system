import addEntry from "../../js/api/addEntry.js";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    const result = await addEntry(JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);
}
