const fs = require("node:fs");
const nodemailer = require("nodemailer");
const getUserBookings = require("./getUserBookings.js");

const keys = Object.keys(require("../../config.json")["settings"]["default"]);
const checks = require("../../config.json")["settings"]["checks"];
const slotsPerColumn = require("../../config.json")["settings"]["slotsPerColumn"];
const validSlots = Object.keys(require("../../data/table.json")["data"]);
const confirmationEmailSettings = require("../../passwords.json")["confirmationEmail"];
const mailSender = require("../../passwords.json")["sender"];
const passwords = require("../../passwords.json")["default"];

/**
 * Validates and adds a new entry to the json file, sends a confirmation email and refreshes the websocket
 * @param {Object} query The request body as an json object
 * @returns An object with a http status code, a success flag and a message
 */
function addEntry(query) {
    for (let i = 0; i < keys.length; i++) {
        // check if all fields are present
        if (!query[keys[i]]) {
            return {
                code: 400,
                success: false,
                message: "Missing field: " + keys[i],
            };
        }
    }

    if (!query["timeSlot"]) {
        // check if timeSlot is present
        return {
            code: 400,
            success: false,
            message: "Missing field: timeSlot",
        };
    }

    // at this point, all fields are present
    // perform checks
    if (query["firstname"].length > checks.firstname) {
        // check if firstname is too long
        return {
            code: 400,
            success: false,
            message: `Firstname too long. Maximum is ${checks.firstname}`,
        };
    }

    if (query["lastname"].length > checks.lastname) {
        // check if lastname is too long
        return {
            code: 400,
            success: false,
            message: `Lastname too long. Maximum is ${checks.lastname}`,
        };
    }

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

    if (Number(query["bookedSlots"]) > checks.maxBookedSlots) {
        // check if bookedSlots is too high
        return {
            code: 400,
            success: false,
            message: `Too many booked slots. Maximum is ${checks.maxBookedSlots}`,
        };
    }

    if (!validSlots.includes(query["timeSlot"])) {
        // check if timeSlot is valid
        return {
            code: 400,
            success: false,
            message: "Invalid time slot",
        };
    }

    try {
        const data = require("../../data/table.json")["data"];

        // check the current index of booked slots for the time slot
        const placedBookings = data[query["timeSlot"]];
        const currentIndex = Object.keys(placedBookings).length;

        // are there enough slots available?
        let slotsBooked = 0;
        for (let i = 0; i < currentIndex; i++) {
            slotsBooked += placedBookings[i]["bookedSlots"];
        }

        // are enough total slots availible
        if (slotsBooked + Number(query["bookedSlots"]) > slotsPerColumn) {
            return {
                code: 400,
                success: false,
                message: "Not enough slots available.",
            };
        }

        // Check if user would exceed max booking limit & check if user wants to book in seperate time slots
        bookings = getUserBookings(query).message.bookedSlots; // [ [ '18:00', 4 ] ]
        
        if (bookings.length > 0) {
            // user has already booked a time slot and requests another one
            if (bookings[0][0] !== query["timeSlot"]) {
                // user has bookings and tries to book in another time slot
                return {
                    code: 400,
                    success: false,
                    message: `You cannot book slots in more than one timeslot. You have already booked ${bookings[0][1]} slots in ${bookings[0][0]}` 
                }
            }

            // user exceeds max booking limit
            if(bookings[0][1] + Number(query["bookedSlots"]) > checks.maxBookedSlots) {
                return {
                    code: 400,
                    success: false,
                    message: `Bookings limit exceeded. You can only book ${checks.maxBookedSlots} slots in general.`
                }
            }
        }

        data[query["timeSlot"]][currentIndex] = {
                firstname: query["firstname"],
                lastname: query["lastname"],
                email: query["email"],
                bookedSlots: Number(query["bookedSlots"]),
                time: Date.now(),
        };

        // backup file before writing
        fs.copyFileSync("./data/table.json", `./data/backup/table_${Date.now()}.json`);
        fs.writeFileSync("./data/table.json", JSON.stringify({ updated: Date.now(), data: data }, null, 4));
        } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Error writing to file. Refresh the page and try again.",
        };
    }

    // send refresh signal to all clients
    const key = require("../../passwords.json")["websocketkey"];
    const ws = new WebSocket("ws://localhost:8080");
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.onopen = () => {
        ws.send(`${key}:refresh`);
    };

    // At this point, the entry has been added to the json file
    // Send confirmation E-Mail to user
    const transporter = nodemailer.createTransport(confirmationEmailSettings);

    async function main() {
        let confirmationMailText = passwords.mailText.replace("!BOOKEDSLOTS", query["bookedSlots"])
        confirmationMailText.replace("!TIMESLOT", query["timeSlot"]);
        const info = await transporter.sendMail({
            from: `"${mailSender}" <${confirmationEmailSettings.auth.user}>`,
            to: query["email"],
            subject: passwords.mailSubject.replace("!BOOKEDSLOTS", query["bookedSlots"]),
            text: confirmationMailText,
        });

        console.log("Message sent: %s", info.messageId);
        transporter.close();
    }

    main().catch((error) => {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Your booking was successful, but we could not send you a confirmation email.",
        };
    });

    return {
        code: 200,
        success: true,
        message: { updated: Date.now() },
    };
}

module.exports = addEntry;
