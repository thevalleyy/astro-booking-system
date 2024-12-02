const config = require("./config.json");
const cli = require("next/dist/cli/next-start");

cli.nextStart({
    port: config.settings.port,
});
