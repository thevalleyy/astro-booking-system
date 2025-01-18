import cookie from "cookie";

/**
 * This function deletes the password cookie, if there is one
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns An object with a success flag and a message
 */
export default async function login(req, res) {
    try {
        res.setHeader(
            "Set-Cookie",
            cookie.serialize("password", "", {
                path: "/",
                expires: new Date(0),
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            })
        );

        res.status(200).json({ code: 200, success: true, message: "Successfull logout" });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, success: false, message: "Serverside error. See server console for more information." });
    }
}
