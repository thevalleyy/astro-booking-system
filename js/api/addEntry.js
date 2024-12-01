const fs = require("node:fs");

const keys = Object.keys(require("../../config.json")["settings"]["default"]);
const checks = require("../../config.json")["settings"]["checks"];
const validSlots = Object.keys(require("../../data/table.json")["data"]);

/**
 * Adds a new entry to the json file
 * @param {Object} query The request body as an json object
 * @returns An object with a success flag and a message
 */
function addEntry(query) {
    for (let i = 0; i < keys.length; i++) {
        // check if all fields are present
        if (!query[keys[i]]) {
            return {
                code: 200,
                success: false,
                message: "Missing field: " + keys[i],
            };
        }
    }

    if (!query["timeSlot"]) {
        // check if timeSlot is present
        return {
            code: 200,
            success: false,
            message: "Missing field: timeSlot",
        };
    }

    // at this point, all fields are present
    // perform checks
    if (query["firstname"].length > checks.firstname) {
        // check if firstname is too long
        return {
            code: 200,
            success: false,
            message: `Firstname too long. Maximum is ${checks.firstname}`,
        };
    }

    if (query["lastname"].length > checks.lastname) {
        // check if lastname is too long
        return {
            code: 200,
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
                code: 200,
                success: false,
                message: "Invalid email",
            };
        }
    }

    if (isNaN(query["bookedSlots"]) || Number(query["bookedSlots"]) < 0) {
        // check if bookedSlots is a number
        return {
            code: 200,
            success: false,
            message: "Invalid number of booked slots",
        };
    }

    if (Number(query["bookedSlots"]) > checks.maxBookedSlots) {
        // check if bookedSlots is too high
        return {
            code: 200,
            success: false,
            message: `Too many booked slots. Maximum is ${checks.maxBookedSlots}`,
        };
    }

    if (!validSlots.includes(query["timeSlot"])) {
        // check if timeSlot is valid
        return {
            code: 200,
            success: false,
            message: "Invalid time slot",
        };
    }

    // TODO: check if the user has already booked a slot
    // TODO: check if the time slot is currently being booked by another user
    // TODO: build tool for users to check their bookings
    // TODO: backup file before writing
    // TODO: mail confirmation

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

        if (slotsBooked + Number(query["bookedSlots"]) > checks.maxBookedSlots) {
            return {
                code: 200,
                success: false,
                message: "Not enough slots available",
            };
        }

        data[query["timeSlot"]][currentIndex] = {
            firstname: query["firstname"],
            lastname: query["lastname"],
            email: query["email"],
            bookedSlots: Number(query["bookedSlots"]),
        };

        fs.writeFileSync("./data/table.json", JSON.stringify({ updated: Date.now(), data: data }, null, 4));
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Error writing to file",
        };
    }

    return {
        code: 200,
        success: true,
        message: "Test successful",
    };
}

module.exports = addEntry;
