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
    console.log(query);

    for (i = 0; i < keys.length; i++) {
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
        const emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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

    // TODO: check if timeSlot is available
    // TODO: check if number of booked slots is available for the time slot
    // TODO: check if the user has already booked a slot
    // TODO: check if the time slot is currently being booked by another user
    // TODO: build check tool
    // TODO: backup file before writing
    // TODO: mail confirmation

    // at this point, all checks are successful
    // write changes to file

    try {
        const data = require("../../data/table.json")["data"];
        data[query["timeSlot"]] = {
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
