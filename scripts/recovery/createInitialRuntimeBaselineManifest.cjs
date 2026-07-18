"use strict";
const fs = require("fs");
const { MANIFEST_PATH, buildManifest } = require("./runtimeBaselineLib.cjs");
if (!process.argv.includes("--initial-owner-baseline")) {
  console.error("Refusing to create or update runtime baseline manifest without --initial-owner-baseline.");
  process.exit(2);
}
fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(buildManifest(), null, 2)}\n`, "utf8");
console.log(`Created runtime baseline manifest: ${MANIFEST_PATH}`);
