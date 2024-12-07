const passKey = require("../../passwords.json")["adminkey"];

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
