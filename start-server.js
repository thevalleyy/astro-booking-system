import config from "./config.json" with { type: "json" };
import cli from "next/dist/cli/next-start.js";

cli.nextStart({
    port: config.settings.port,
});
