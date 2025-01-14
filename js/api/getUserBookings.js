import config from "../../config.json" with { type: "json" };
const checks = config.settings.checks;

/**
 * Get the booked slots of a user
 * @param {Object} query The request body as an json object
 * @returns An object with the time slots and the number of already booked slots of a specified user
 */
export default async function getUserBookings(query) {
    if (!query["firstname"]) {
        return {
            code: 400,
            success: false,
            message: "Missing field: firstname",
        };
    }

    if (!query["lastname"]) {
        return {
            code: 400,
            success: false,
            message: "Missing field: lastname",
        };
    }

    if (!query["email"]) {
        return {
            code: 400,
            success: false,
            message: "Missing field: email",
        };
    }

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

    // the input is valid
    const firstname = query["firstname"].toLowerCase();
    const lastname = query["lastname"].toLowerCase();
    const email = query["email"].toLowerCase();

    try {
        const table = await import("../../data/table.json")
        const data = table.data;

        // find the user
        const bookedSlots = [];

        Object.keys(data).forEach((slot) => {
            Object.keys(data[slot]).forEach((booking) => {
                if (
                    data[slot][booking].firstname.toLowerCase() === firstname &&
                    data[slot][booking].lastname.toLowerCase() === lastname &&
                    data[slot][booking].email.toLowerCase() === email
                ) {
                    bookedSlots[0] = slot;
                    bookedSlots[1] = bookedSlots[1] ? bookedSlots[1] + data[slot][booking].bookedSlots : data[slot][booking].bookedSlots;
                }
            });
            if (bookedSlots[0]) return; // break the loop if the user was found
        });

        return {
            code: 200,
            success: true,
            message: { bookedSlots },
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
