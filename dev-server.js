const config = require("./config.json");
const cli = require("next/dist/cli/next-dev");

cli.nextDev({
    port: config.settings.port,
    turbopack: true,
});
