import generateTableHeaders from "./tableHeaders.js";
import fs from "node:fs";

/**
 * Generates a json table at data/table.json based on the config file
 *
 * Note that this function has to be called from the root directory of the project!
 */
export default async function generateTable() {
    const { default: config } = await import("../config.json", { with: { type: "json" } });

    const headers = generateTableHeaders(config.settings.start, config.settings.end, config.settings.increment);

    const table = {
        updated: new Date().getTime(),
        data: {},
    };

    for (let i = 0; i < headers.length; i++) {
        table.data[headers[i]] = {};
    }

    fs.access("./data/table.json", fs.constants.F_OK, (err) => {
        // don't overwrite the file if it exists
        if (err) {
            try {
                fs.mkdirSync("./data");
            } catch (e) {} // the directory already exists, so ignore the error

            fs.writeFileSync("./data/table.json", JSON.stringify(table, null, 4));
        }
    });
}
