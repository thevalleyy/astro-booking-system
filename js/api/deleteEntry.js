import fs from "node:fs";
import { promises as fsl } from "node:fs"
import cookie from "cookie";
import nodemailer from "nodemailer";

import config from "../../config.json" with { type: "json" };
import passwords from "../../passwords.json" with { type: "json" };

const confirmationEmailSettings = passwords.confirmationEmail;
const mailSettings = config.mail;

/**
 * Validates and edits an entry in the json file and refreshes the websocket
 * Needs: timeSlot, SlotIndex, firstname, lastname, email, bookedSlots and shouldEntryBeDeleted to edit the entry
 * @param {Object} query The request body as an json object
 * @returns An object with a http status code, a success flag and a message
 */
export default async function deleteEntry(req, query) {
    //check admin login credentials
    const passKey = passwords["adminkey"];

    //get cookie
    const cookies = cookie.parse(req.headers.cookie) || "";
    const password = cookies.password;

    try {
        if (password !== passKey) {
            return {
                code: 401,
                success: false,
                message: "Unauthorized",
            };
        }

        // does the booking exist?
        const table = JSON.parse(await fsl.readFile("./data/table.json", "utf-8"));

        if (!table.data[query["timeSlot"]][query["id"]]) {
            return {
                code: 400,
                success: false,
                message: `Booking ${query["timeSlot"]}.${query["id"]} does not exist`,
            };
        }

        try {
            const data = table.data;

            const firstname = data[query["timeSlot"]][query["id"]].firstname;
            const lastname = data[query["timeSlot"]][query["id"]].lastname;
            const bookedSlots = data[query["timeSlot"]][query["id"]].bookedSlots;
            const timeslot = query["timeSlot"];
            const email = data[query["timeSlot"]][query["id"]].email;

            try {
                // delete entry
                delete data[query["timeSlot"]][query["id"]];
            } catch (error) {
                console.error(error);
                return {
                    code: 500,
                    success: false,
                    message: "Error deleting entry",
                };
            }
            
            // backup file before writing
            fs.copyFileSync("./data/table.json", `./data/backup/table_${Date.now()}.json`);
            fs.writeFileSync("./data/table.json", JSON.stringify({ updated: Date.now(), data: data }, null, 4));

            
             // send refresh signal to all clients
             const passwords = JSON.parse(await fsl.readFile("./passwords.json", "utf-8"));
             const key = passwords.websocketkey;

             const ws = new WebSocket(config.settings.wsURL);
             ws.onerror = (error) => {
                 console.error("WebSocket error:", error);
             };
         
             ws.onopen = () => {
                 ws.send(`${key}:refresh`);
             };

            // notify user about the change via email
            try {
                    const transporter = nodemailer.createTransport(confirmationEmailSettings);

                    const mailText = mailSettings.deleteMailText
                    .replaceAll("!FIRSTNAME", firstname)
                    .replaceAll("!LASTNAME", lastname)
                    .replaceAll("!TIMESLOT", timeslot)
                    .replaceAll("!BOOKEDSLOTS", bookedSlots)
                    .replaceAll("!EMAIL", email);

                    const mailSubject = mailSettings.deleteMailSubject;

                    const info = await transporter.sendMail({
                        from: `"${mailSettings.sender}" <${confirmationEmailSettings.auth.user}>`,
                        to: email,
                        subject: mailSubject,
                        text: mailText,
                    });

                    console.log("Message sent: %s", info.messageId);
                    transporter.close();
                } catch (error) {
                    console.error(error);
                    return {
                        code: 200,
                        success: true,
                        updated: Date.now(),
                        message: "Your deletion was successful, but the confirmation email could not be sent to the user. (" + query["email"] + ")",
                    };
                }
        } catch (error) {
            console.error(error);
            return {
                code: 500,
                success: false,
                message: "Error writing to file. Refresh the page and try again.",
            };
        }
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
        message: "Booking edited successfully"
    };
}
