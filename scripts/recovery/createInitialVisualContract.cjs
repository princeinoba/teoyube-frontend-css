"use strict";

const fs = require("fs");
const path = require("path");
const { CONTRACT_PATH, buildVisualContract, stableJson } = require("./visualContractLib.cjs");

if (!process.argv.includes("--initial-owner-baseline")) {
  console.error("Refusing to regenerate the visual contract without --initial-owner-baseline.");
  console.error("Future baseline changes require explicit owner approval and must not be automated merely to pass tests.");
  process.exit(2);
}

fs.mkdirSync(path.dirname(CONTRACT_PATH), { recursive: true });
fs.writeFileSync(CONTRACT_PATH, stableJson(buildVisualContract()), "utf8");
console.log(`Created initial visual contract: ${CONTRACT_PATH}`);
