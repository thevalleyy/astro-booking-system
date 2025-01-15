import passwords from "../../passwords.json" with { type: "json" };
const passKey = passwords["adminkey"];

/**
 * This function validates the login credentials
 * @param {Object} query The request body as an json object
 * @returns An object with a success flag and a message
 */
export default async function login(query) {
    const password = query["password"];
    
    try {
        if (password !== passKey) {
            return {
                code: 401,
                success: false,
                message: "Unauthorized",
            };
        }

        return {
            code: 200,
            success: true,
            message: "Successfull login",
        };
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Serverside error. See server console for more information.",
        };
    }
}
