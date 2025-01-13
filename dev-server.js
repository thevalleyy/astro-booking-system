import config from "./config.json" with { type: "json" };
import cli from "next/dist/cli/next-dev.js";
import generateTable from "./js/generateTable.js";

generateTable();

cli.nextDev({
    port: config.settings.port,
    turbopack: true,
});
