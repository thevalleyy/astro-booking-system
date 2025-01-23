import {promises as fsl} from "node:fs";
import fs from "node:fs";
import nodemailer from "nodemailer";
import getUserBookings from "./getUserBookings.js";
import config from "../../config.json" with { type: "json" };
import passwords from "../../passwords.json" with { type: "json" };

const keys = Object.keys(config.settings.default);
const checks = config.settings.checks;
const slotsPerColumn = config.settings.slotsPerColumn;
import validSlots from "../../data/headers.json" with { type: "json" };
const confirmationEmailSettings = passwords.confirmationEmail;
const mailSettings = config.mail;

/**
 * Validates and adds a new entry to the json file, sends a confirmation email and refreshes the websocket
 * @param {Object} query The request body as an json object
 * @returns An object with a http status code, a success flag and a message
 */
export default async function addEntry(query) {
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
        const data = JSON.parse(await fsl.readFile("./data/table.json", "utf-8")).data;

        // check the current index of booked slots for the time slot
        const placedBookings = data[query["timeSlot"]];
        const currentIndex = Object.keys(placedBookings);

        // are there enough slots available?
        let slotsBooked = 0;
        currentIndex.forEach((index) => {
            slotsBooked += placedBookings[index]["bookedSlots"];
        });

        // are enough total slots availible
        if (slotsBooked + Number(query["bookedSlots"]) > slotsPerColumn) {
            return {
                code: 400,
                success: false,
                message: "Not enough slots available.",
            };
        }

        // Check if user would exceed max booking limit & check if user wants to book in seperate time slots
        const bookingsResponse = await getUserBookings(query);
        const bookings = bookingsResponse.message.bookedSlots; // [ '18:00', 4, 0 ] -> slot, number, index
        const date = Date.now();

        if (bookings.length > 0) { // user has already booked something
            if (bookings[0] !== query["timeSlot"]) {
                // user has bookings and tries to book in another time slot
                return {
                    code: 400,
                    success: false,
                    message: `You cannot book slots in more than one timeslot. You have already booked ${bookings[1]} slots in ${bookings[0]}`,
                };
            }

            // user exceeds max booking limit
            if (bookings[1] + Number(query["bookedSlots"]) > checks.maxBookedSlots) {
                return {
                    code: 400,
                    success: false,
                    message: `Bookings limit exceeded. You can only book ${checks.maxBookedSlots} slots in general.`,
                };
            }

            data[bookings[0]][bookings[2]] = {
                firstname: query["firstname"],
                lastname: query["lastname"],
                email: query["email"],
                bookedSlots: Number(query["bookedSlots"]) + bookings[1],
                time: date,
            };
        } else {
            // user books for the first time
            data[query["timeSlot"]][currentIndex.length == 0 ? "0" : Number.parseInt(currentIndex[currentIndex.length - 1]) + 1] = {
                firstname: query["firstname"],
                lastname: query["lastname"],
                email: query["email"],
                bookedSlots: Number(query["bookedSlots"]),
                time: date,
            };
        }
        
        // backup file before writing
        fs.copyFileSync("./data/table.json", `./data/backup/table_${date}.json`);
        fs.writeFileSync("./data/table.json", JSON.stringify({ updated: date, data: data }, null, 4));
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Error writing to file. Refresh the page and try again.",
        };
    }

    // send refresh signal to all clients
    const passwords = JSON.parse(await fsl.readFile("./passwords.json", "utf-8"));
    const key = passwords.websocketkey;

    const ws = new WebSocket("ws://localhost:8080");
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.onopen = () => {
        ws.send(`${key}:refresh`);
    };

    // At this point, the entry has been added to the json file
    // Send confirmation E-Mail to user
    try {
        const transporter = nodemailer.createTransport(confirmationEmailSettings);

        let confirmationMailText = mailSettings.mailText
            .replace("!FIRSTNAME", query["firstname"])
            .replace("!BOOKEDSLOTS", query["bookedSlots"])
            .replace("!TIMESLOT", query["timeSlot"]);
        const info = await transporter.sendMail({
            from: `"${mailSettings.sender}" <${confirmationEmailSettings.auth.user}>`,
            to: query["email"],
            subject: mailSettings.mailSubject.replace("!BOOKEDSLOTS", query["bookedSlots"]),
            text: confirmationMailText,
        });

        console.log("Message sent: %s", info.messageId);
        transporter.close();
    } catch (error) {
        console.error(error);
        return {
            code: 200,
            success: true,
            updated: Date.now(),
            message: "Your booking was successful, but the confirmation email could not be sent.",
        };
    }

    // wait 2 seconds to simulate a slow connection
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
        code: 200,
        success: true,
        updated: Date.now(),
        message: "Booking successful. You will receive a confirmation email shortly",
    };
}
