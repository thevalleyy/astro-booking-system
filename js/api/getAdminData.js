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
export default async function getAdminData(req, res) {
    try {
        const cookies = cookie.parse(req.headers.cookie || "");
        const password = cookies.password || "";

        if (password !== passKey) {
            return {
                code: 401,
                success: false,
                message: "Unauthorized",
            };
        }

        var table = JSON.parse(await fs.readFile("./data/table.json", "utf-8"));
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Error reading file. See server console for more information.",
        };
    }

    return {
        code: 200,
        success: true,
        message: { table },
    };
}
