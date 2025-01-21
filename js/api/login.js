import cookie from "cookie";

import passwords from "../../passwords.json"  with { type: "json" };
const passKey = passwords["adminkey"];

/**
 * This function validates the login credentials
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns An object with a success flag and a message
 */
export default async function login(req, res) {
    const query = req.body;
    let password = query["password"];

    try {
        if (!password) {
            const cookies = cookie.parse(req.headers.cookie || "");
            password = cookies.password || "";
        }

        if (!password) {
            res.status(400).json({ code: 400, success: false, message: "No password provided" });
            return;
        }

        if (password !== passKey) { // wrong password, delete cookie
            res.setHeader(
                "Set-Cookie",
                cookie.serialize("password", "", {
                    path: "/",
                    expires: new Date(0),
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                })
            );

            res.status(401).json({ code: 401, success: false, message: "Unauthorized" });
            return;
        }
        // correct password
        res.setHeader(
            "Set-Cookie",
            cookie.serialize("password", password, {
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 1 week
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })
        );

        res.status(200).json({ code: 200, success: true, message: "Successfull login" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, success: false, message: "Serverside error. See server console for more information." });
    }
}
