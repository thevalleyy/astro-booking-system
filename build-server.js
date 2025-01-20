import build from "next/dist/cli/next-build.js";
import generateTable from "./js/generateTable.js";
generateTable();

process.env.NODE_ENV = "production";

build.nextBuild({});
