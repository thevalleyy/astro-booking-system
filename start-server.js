const config = require("./config.json");
const cli = require("next/dist/cli/next-start");

require("./js/generateTable.js")();

cli.nextStart({
    port: config.settings.port,
});
