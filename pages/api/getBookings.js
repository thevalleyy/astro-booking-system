import getBookings from "../../js/api/getBookings.js";
import request from "../../js/request.js";

const handler = (req, res) => {
    request(req);

    // pass elemtents to the function
    const result = getBookings();
    res.status(result.code).json(result);
};

export default handler;
