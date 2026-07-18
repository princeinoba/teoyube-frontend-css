"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const enginePath = path.join(root, "src/lib/teoyube/calling/calling-engine.ts");
const seedPath = path.join(root, "src/lib/tig/seed/callings.seed.ts");
const callingPath = path.join(root, "src/lib/tig/calling-compass.ts");
const typesPath = path.join(root, "src/lib/tig/types.ts");

const failures = [];
for (const filePath of [enginePath, seedPath, callingPath, typesPath]) {
  if (!fs.existsSync(filePath)) failures.push(`Missing required TIG file: ${path.relative(root, filePath)}`);
}

if (!failures.length) {
  const engine = fs.readFileSync(enginePath, "utf8");
  const seed = fs.readFileSync(seedPath, "utf8");
  const calling = fs.readFileSync(callingPath, "utf8");
  const types = fs.readFileSync(typesPath, "utf8");

  if (!engine.includes('from "../../tig/seed/callings.seed"')) {
    failures.push("calling-engine.ts must import TIG_CALLING_SEEDS from the owning seed module.");
  }
  if (engine.includes('TIG_CALLING_SEEDS,\n  type CallingProfileNode\n} from "../../tig"')) {
    failures.push("calling-engine.ts still relies on the unstable broad TIG barrel for calling seeds.");
  }
  if (!engine.includes('from "../../tig/calling-compass"')) {
    failures.push("calling-engine.ts must import calling functions from the owning calling-compass module.");
  }
  if (!engine.includes('from "../../tig/types"')) {
    failures.push("calling-engine.ts must import CallingProfileNode from the owning types module.");
  }
  if (!/export const TIG_CALLING_SEEDS\s*:/.test(seed)) {
    failures.push("callings.seed.ts does not export TIG_CALLING_SEEDS.");
  }
  if (!/export function detectCallingMatches\s*\(/.test(calling)) {
    failures.push("calling-compass.ts does not export detectCallingMatches.");
  }
  if (!/export function getScripturesFromCallings\s*\(/.test(calling)) {
    failures.push("calling-compass.ts does not export getScripturesFromCallings.");
  }
  if (!/(export type CallingProfileNode|export interface CallingProfileNode)/.test(types)) {
    failures.push("types.ts does not export CallingProfileNode.");
  }
}

if (failures.length) {
  console.error("TIG CALLING SEED CONTRACT: FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("TIG CALLING SEED CONTRACT: PASSED");
console.log("The missing TIG_CALLING_SEEDS barrel-export regression is isolated by narrow imports.");
