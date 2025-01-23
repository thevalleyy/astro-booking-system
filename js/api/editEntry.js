import fs from "node:fs";
import { promises as fsl } from "node:fs"
import cookie from "cookie";
import nodemailer from "nodemailer";

import config from "../../config.json" with { type: "json" };
import passwords from "../../passwords.json" with { type: "json" };
import validSlots from "../../data/headers.json" with { type: "json" };
import getUserBookings from "./getUserBookings";

const keys = Object.keys(config.settings.default);
const checks = config.settings.checks;
const slotsPerColumn = config.settings.slotsPerColumn;
const confirmationEmailSettings = passwords.confirmationEmail;
const mailSettings = config.mail;

/**
 * Validates and edits an entry in the json file and refreshes the websocket
 * Needs: timeSlot, SlotIndex, firstname, lastname, email, bookedSlots and shouldEntryBeDeleted to edit the entry
 * @param {Object} query The request body as an json object
 * @returns An object with a http status code, a success flag and a message
 */
export default async function editEntry(req, query) {
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

        for (let i = 0; i < keys.length; i++) {
            // check if all neccessary fields are present -> firstname, lastname, email, bookedSlots
            if (!query[keys[i]]) {
                return {
                    code: 400,
                    success: false,
                    message: "Missing field: " + keys[i],
                };
            }
        }

        // does the booking exist?
        const table = JSON.parse(await fsl.readFile("./data/table.json", "utf-8"));

        if (!query["new"]) {
            if (!table.data[query["timeSlot"]][query["id"]]) {
                return {
                    code: 400,
                    success: false,
                    message: `Booking ${query["timeSlot"]}.${query["id"]} does not exist`,
                };
            }
        }

        // at this point, all fields are present
        // perform checks

        if (checks.email) {
            // check if email is valid
            const email = query["email"];
            const emailRegEx =
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

            if (!emailRegEx.test(email)) {
                // check if email is valid
                return {
                    code: 400,
                    success: false,
                    message: "Invalid email",
                };
            }
        }
        
        if (isNaN(query["bookedSlots"]) || Number(query["bookedSlots"]) < 0) {
            // check if bookedSlots is a number
            return {
                code: 400,
                success: false,
                message: "Invalid number of booked slots",
            };
        }

        if (!validSlots.includes(query["newTimeSlot"])) {
            // check if timeSlot is valid
            return {
                code: 400,
                success: false,
                message: "Invalid time slot",
            };
        }

        try {
            const data = table.data;

            // check the current index of booked slots for the time slot
            const placedBookings = data[query["newTimeSlot"]];  // all bookings for the time slot
            const currentIndex = Object.keys(placedBookings); // array of all bookings

            // are there enough slots available?
            let slotsBooked = 0;
            currentIndex.forEach(index => {
                slotsBooked += placedBookings[index]["bookedSlots"];
            });

            const bookingsResponse = await getUserBookings(query);
            const bookings = bookingsResponse.message.bookedSlots; // [ '18:00', 4, 0 ] -> slot, number, index
    
            if (query["new"]) {
                if (bookings.length > 0) { 
                    
                        return {
                            code: 400,
                            success: false,
                            message: `User has already booked ${bookings[1]} slots in ${bookings[0]}`,
                        };
                    }
            }

            // are enough total slots availible
            if (slotsBooked + Number(query["bookedSlots"]) > slotsPerColumn) {
                return {
                    code: 400,
                    success: false,
                    message: "Not enough slots available at " + query["newTimeSlot"],
                };
            }

            if (!query["new"]) {
                // old values
                var firstname = data[query["timeSlot"]][query["id"]].firstname;
                var lastname = data[query["timeSlot"]][query["id"]].lastname;
                var email = data[query["timeSlot"]][query["id"]].email;
                var bookedSlots = data[query["timeSlot"]][query["id"]].bookedSlots;
                var time = data[query["timeSlot"]][query["id"]].time;
 
                if (query["timeSlot"] === query["newTimeSlot"] && firstname === query["firstname"] && lastname === query["lastname"] && email === query["email"] && bookedSlots === Number(query["bookedSlots"])) {
                    return {
                        code: 200,
                        success: true,
                        message: "No changes made",
                    };
                }

                if (query["newTimeSlot"] !== query["timeSlot"]) {
                    // the booking needs to be moved to a different time slot
                    // remove the booking from the old time slot
                    delete data[query["timeSlot"]][query["id"]];

                    // add the booking to the new time slot
                    data[query["newTimeSlot"]][currentIndex.length == 0 ? "0" : Number.parseInt(currentIndex[currentIndex.length - 1]) + 1] = {
                        firstname: query["firstname"],
                        lastname: query["lastname"],
                        email: query["email"],
                        bookedSlots: Number(query["bookedSlots"]),
                        time: time,
                        updatedAt: Date.now(),
                    };
                } else {
                    // the booking stays in the same time slot
                    data[query["timeSlot"]][query["id"]] = {
                        firstname: query["firstname"],
                        lastname: query["lastname"],
                        email: query["email"],
                        bookedSlots: Number(query["bookedSlots"]),
                        time: data[query["timeSlot"]][query["id"]].time,
                        updatedAt: Date.now(),
                    };
                }
            } else {
                // the booking is edited
                data[query["newTimeSlot"]][currentIndex.length == 0 ? "0" : Number.parseInt(currentIndex[currentIndex.length - 1]) + 1] = {
                    firstname: query["firstname"],
                    lastname: query["lastname"],
                    email: query["email"],
                    bookedSlots: Number(query["bookedSlots"]),
                    time: Date.now(),
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
                
                let mailText = "";
                let mailSubject = "";

                if (!query["new"]) {
                    // a booking was edited
                    mailText = mailSettings.editMailText
                    .replaceAll("!FIRSTNAME", firstname)
                    .replaceAll("!LASTNAME", lastname)
                    .replaceAll("!EMAIL", email)
                    .replaceAll("!BOOKEDSLOTS", bookedSlots)
                    .replaceAll("!TIMESLOT", query["timeSlot"])
                    .replaceAll("!NEWBOOKEDSLOTS", query["bookedSlots"])
                    .replaceAll("!NEWFIRSTNAME", query["firstname"])
                    .replaceAll("!NEWLASTNAME", query["lastname"])
                    .replaceAll("!NEWEMAIL", query["email"])
                    .replaceAll("!NEWTIMESLOT", query["newTimeSlot"]);

                    mailSubject = mailSettings.editMailSubject;
                } else {
                    // a new booking was made
                    mailText = mailSettings.mailText
                    .replaceAll("!FIRSTNAME", query["firstname"])
                    .replaceAll("!LASTNAME", query["lastname"])
                    .replaceAll("!BOOKEDSLOTS", query["bookedSlots"])
                    .replaceAll("!TIMESLOT", query["newTimeSlot"])
                    .replaceAll("!EMAIL", query["email"]);

                    mailSubject = mailSettings.mailSubject.replaceAll("!BOOKEDSLOTS", query["bookedSlots"]);
                }

                const info = await transporter.sendMail({
                    from: `"${mailSettings.sender}" <${confirmationEmailSettings.auth.user}>`,
                    to: query["email"],
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
                        message: "Your action was successful, but the confirmation email could not be sent to the user. (" + query["email"] + ")",
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
