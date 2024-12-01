import addEntry from "../../js/api/addEntry.js";
import request from "../../js/request.js";

const handler = (req, res) => {
    request(req);

    // pass elemtents to the function
    const result = addEntry(JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);
};

export default handler;
