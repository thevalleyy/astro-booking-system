const generateTableHeaders = require("./tableHeaders.js");

function generateTable() {
    const config = require("../config.json");

    const headers = generateTableHeaders(config.settings.start, config.settings.end, config.settings.increment);
    console.log(headers);
}

generateTable();

module.exports = generateTable;
