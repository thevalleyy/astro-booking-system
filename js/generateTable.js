const generateTableHeaders = require("./tableHeaders.js");
const fs = require("node:fs");

/**
 * Generates a json table at data/table.json based on the config file
 */
function generateTable() {
    const config = require("../config.json");
    const headers = generateTableHeaders(config.settings.start, config.settings.end, config.settings.increment);

    const table = {
        updated: new Date().getTime(),
        data: {},
    };

    for (let i = 0; i < headers.length; i++) {
        table.data[headers[i]] = { 0: config.settings.default };
    }

    fs.access("../data/table.json", fs.constants.F_OK, (err) => {
        // don't overwrite the file if it exists
        if (err) {
            try {
                fs.mkdirSync("../data").catch();
            } catch (e) {} // the directory already exists, so ignore the error

            fs.writeFileSync("../data/table.json", JSON.stringify(table, null, 4));
        }
    });
}

module.exports = generateTable;
