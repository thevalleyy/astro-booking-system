import { promises as fs } from "node:fs";

import passwords from "../../passwords.json" with { type: "json" };
const passKey = passwords["adminkey"];

/**
 * Validates the admin password and returns the table data
 * @param {Object} query The request body as an json object
 * @returns An object with a http status code, a success flag and a message
 */
export default async function getAdminData(query) {
    const password = query["password"];

    try {
        if (password !== passKey) {
            return {
                code: 401,
                success: false,
                message: "Unauthorized",
            };
        }

        const table = JSON.parse(await fs.readFile("./data/table.json", "utf-8"));
        var data = table.data;
        var updated = table.updated;
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
        message: { data, updated },
    };
}
