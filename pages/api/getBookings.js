import getBookings from "../../js/api/getBookings.js";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    const result = await getBookings();
    res.status(result.code).json(result);
}
