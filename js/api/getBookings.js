const fs = require("node:fs");

/**
 * Get the number of booked slots for a specific time slot
 * @returns An object with the time slots and the number of already booked slots
 */
function addEntry() {
    try {
        const table = require("../../data/table.json")["data"];
        const response = {};

        // check the current index of booked slots for the time slot
        Object.keys(table).forEach((timeslot) => {
            response[timeslot] = 0;

            Object.keys(table[timeslot]).forEach((booking) => {
                response[timeslot] += table[timeslot][booking]["bookedSlots"];
            });
        });

        return {
            code: 200,
            success: true,
            message: response,
        };
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            success: false,
            message: "Error reading file. See server console for more information.",
        };
    }
}

module.exports = addEntry;
