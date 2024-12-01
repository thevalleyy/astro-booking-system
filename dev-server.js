const config = require("./config.json");
const cli = require("next/dist/cli/next-dev");

require("./js/generateTable.js")();

cli.nextDev({
    port: config.settings.port,
    turbopack: true,
});
