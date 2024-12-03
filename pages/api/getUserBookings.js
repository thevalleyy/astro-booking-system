import getUserBookings from "../../js/api/getUserBookings.js";
import request from "../../js/request.js";

const handler = (req, res) => {
    request(req);

    // pass elemtents to the function
    const result = getUserBookings(JSON.parse(JSON.stringify(req.body)));
    res.status(result.code).json(result);
};

export default handler;
