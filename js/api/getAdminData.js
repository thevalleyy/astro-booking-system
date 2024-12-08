const passKey = require("../../passwords.json")["adminkey"];

/**
 * Validates the admin password and returns the table data
 * @param {Object} query The request body as an json object
 * @returns An object with a http status code, a success flag and a message
 */
function getAdminData(query) {
    const password = query["password"];

    try {
        console.log(password, passKey);

        if (password !== passKey) {
            return {
                code: 401,
                success: false,
                message: "Unauthorized",
            };
        }

        var data = require("../../data/table.json");
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Error writing to file. See server console for more information.",
        };
    }

    return {
        code: 200,
        success: true,
        message: { data },
    };
}

module.exports = getAdminData;
