import fs from "node:fs";
import { promises as fsl } from "node:fs";
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
export default async function deleteAll(req, query) {
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

        var filename = `./data/backup/table_${Date.now()}.json`;
        // backup file before writing
        fs.copyFileSync("./data/table.json", filename);

        // save all bookings to an array
        const bookings = [];
        const table = JSON.parse(await fsl.readFile("./data/table.json", "utf-8"));
        Object.keys(table.data).forEach((timeslot) => {
            Object.keys(table.data[timeslot]).forEach((index) => {
                const booking = table.data[timeslot][index];
                bookings.push({
                    firstname: booking.firstname,
                    lastname: booking.lastname,
                    email: booking.email,
                    timeslot: timeslot,
                    bookedSlots: booking.bookedSlots,
                });
            });

            table.data[timeslot] = {};
        });

        // write to file
        await fsl.writeFile("./data/table.json", JSON.stringify(table, null, 4));

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

        // notify all users about the change via email
        // try {
        //     const transporter = nodemailer.createTransport(confirmationEmailSettings);

        //     for (const booking of bookings) {
        //         try {
        //             const mailText = mailSettings.deleteMailText
        //                 .replaceAll("!FIRSTNAME", booking.firstname)
        //                 .replaceAll("!LASTNAME", booking.lastname)
        //                 .replaceAll("!TIMESLOT", booking.timeslot)
        //                 .replaceAll("!BOOKEDSLOTS", booking.bookedSlots)
        //                 .replaceAll("!EMAIL", booking.email);

        //             const mailSubject = mailSettings.deleteMailSubject;

        //             const info = await transporter.sendMail({
        //                 from: `"${mailSettings.sender}" <${confirmationEmailSettings.auth.user}>`,
        //                 to: booking.email, 
        //                 subject: mailSubject,
        //                 text: mailText,
        //             });

        //             console.log("Message sent: %s", info.messageId);
        //         } catch (emailError) {
        //             console.error(`Failed to send email to ${booking.email}:`, emailError);
        //             throw emailError; // Stop further processing if any email fails
        //         }
        //     }

        //     transporter.close();

            return {
                code: 200,
                success: true,
                updated: Date.now(),
                message: "Deleted all entries. A backup is available at " + filename,
            };
        // } catch (error) {
        //     console.error("Error sending emails:", error);
        //     return {
        //         code: 200,
        //         success: true,
        //         updated: Date.now(),
        //         message: "Your deletion was successful, but we couldn't send an email to all users. Check console. A backup is available at " + filename,
        //     };
        // }

    } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            updated: Date.now(),
            message: "Error writing to file. Refresh the page and try again.",
        };
    }
}
