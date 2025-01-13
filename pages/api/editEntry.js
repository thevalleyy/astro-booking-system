import addEntry from "../../js/api/editEntry.js";
import request from "../../js/request.js";

export default function handler(req, res) {
    request(req);

    // pass elemtents to the function
    const result = addEntry(JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);
}
