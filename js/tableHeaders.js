/**
 *
 * @param {String} start Start time in HH:MM format
 * @param {String} end End time in HH:MM format
 * @param {String} inc Increment time in HH:MM format
 * @returns Returns an array of time strings
 */
export default function createTableHeaders(start = "18:00", end = "21:00", inc = "00:20") {
    const headers = [];
    const startJoined = start.split(":").join("");
    const endJoined = end.split(":").join("");

    const startTime = new Date(`01/01/2000 ${start}`);
    const endTime = new Date(`01/${endJoined < startJoined ? "02" : "01"}/2000 ${end}`);
    const incrementH = parseInt(inc.split(":")[0]);
    const incrementM = parseInt(inc.split(":")[1]);

    while (startTime.getTime() <= endTime.getTime()) {
        headers.push(startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        startTime.setMinutes(startTime.getMinutes() + incrementM);
        startTime.setHours(startTime.getHours() + incrementH);
    }

    return headers;
}
