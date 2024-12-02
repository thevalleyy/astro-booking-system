const build = require("next/dist/cli/next-build");
require("./js/generateTable.js")();

build.nextBuild({});
