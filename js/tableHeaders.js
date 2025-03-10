import { promises as fs } from "node:fs";

/**
 *
 * @param {String} start Start time in HH:MM format
 * @param {String} end End time in HH:MM format
 * @param {String} inc Increment time in HH:MM format
 * @returns Returns an array of time strings
 */
export default async function createTableHeaders() {
    const config = JSON.parse(await fs.readFile("./config.json", "utf-8"));

    const start = config.settings.start;
    const end = config.settings.end;
    const inc = config.settings.increment;

    const headers = [];
    const startJoined = start.split(":").join("");
    const endJoined = end.split(":").join("");

    const startTime = new Date(`01/01/2000 ${start}`);
    const endTime = new Date(`01/${endJoined < startJoined ? "02" : "01"}/2000 ${end}`);
    const incrementH = parseInt(inc.split(":")[0]);
    const incrementM = parseInt(inc.split(":")[1]);

    while (startTime.getTime() <= endTime.getTime()) {
        headers.push(startTime.toLocaleTimeString(["de"], { hour: "2-digit", minute: "2-digit" }).replaceAll("PM", "").replaceAll("AM", "").trim());
        startTime.setMinutes(startTime.getMinutes() + incrementM);
        startTime.setHours(startTime.getHours() + incrementH);
    }

    await fs.writeFile("./data/headers.json", JSON.stringify(headers, null, 4));

    return headers;
}
