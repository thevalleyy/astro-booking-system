/**
 * Get the number of booked slots for a specific time slot
 * @returns An object with the time slots and the number of already booked slots
 */
export default async function getBookings() {
    try {
        const json = await import("../../data/table.json");
        const table = json.data;
        const response = {};

        // check the current index of booked slots for the time slot
        Object.keys(table).forEach((timeslot) => {
            response[timeslot] = 0;

            Object.keys(table[timeslot]).forEach((booking) => {
                // console.log(timeslot, booking, table[timeslot][booking]["bookedSlots"]);
                response[timeslot] += table[timeslot][booking]["bookedSlots"];
            });
        });

        const updated = json.updated;

        // console.log(response);

        return {
            code: 200,
            success: true,
            message: { updated: updated, data: response },
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
