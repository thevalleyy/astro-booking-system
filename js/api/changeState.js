import { promises as fs } from "node:fs";
import cookie from "cookie";

import passwords from "../../passwords.json" with { type: "json" };
const passKey = passwords["adminkey"];

/**
 * Validates the admin password and returns the table data
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns An object with a http status code, a success flag and a message
 */
export default async function changeState(req, res) {
    try {
        const cookies = cookie.parse(req.headers.cookie || "");
        const password = cookies.password || "";

        if (password !== passKey) {
            res.status(401).json({ code: 401, success: false, message: "Unauthorized" });
            return;
        }

        let config = JSON.parse(await fs.readFile("./config.json", "utf-8"));
        config.settings.enabled = !config.settings.enabled;
        await fs.writeFile("./config.json", JSON.stringify(config, null, 4));

        // send reload signal to all clients
        const passwords = JSON.parse(await fs.readFile("./passwords.json", "utf-8"));
        const key = passwords.websocketkey;

        const ws = new WebSocket("ws://localhost:8080");
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onopen = () => {
            ws.send(`${key}:reload`);
        };
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, success: false, message: "Error reading file. See server console for more information." });
        return;
    }

    res.status(200).json({ code: 200, success: true, message: "State toggled" });
}
