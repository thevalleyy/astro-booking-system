import addEntry from "../../js/api/addEntry.js";
import request from "../../js/request.js";

const handler = (req, res) => {
    request(req);

    // pass elemtents to the function
    const result = addEntry(req.query);
    if (!result.success) {
        res.status(400).json(result); // bad request
        return;
    }

    res.status(200).json(result); // ok
};

export default handler;
