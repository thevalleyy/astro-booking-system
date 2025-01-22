import { promises as fs } from "fs";
import request from "../../js/request.js";

export default async function handler(req, res) {
    request(req);

    // pass elemtents to the function
    res.status(200).json({ enabled: JSON.parse(await fs.readFile("./config.json", "utf-8")).settings.enabled });
}
