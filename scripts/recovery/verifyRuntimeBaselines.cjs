"use strict";
const fs = require("fs");
const { MANIFEST_PATH, buildManifest } = require("./runtimeBaselineLib.cjs");

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Missing runtime baseline manifest: ${MANIFEST_PATH}`);
  process.exit(1);
}
const expected = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
let actual;
try {
  actual = buildManifest();
} catch (error) {
  console.error(`RUNTIME VISUAL BASELINES: FAILED\n- ${error.message}`);
  process.exit(1);
}
const expectedMap = new Map(expected.artifacts.map((item) => [item.path, item]));
const actualMap = new Map(actual.artifacts.map((item) => [item.path, item]));
const failures = [];
for (const [filePath, expectedItem] of expectedMap) {
  const actualItem = actualMap.get(filePath);
  if (!actualItem) failures.push(`Missing baseline artifact: ${filePath}`);
  else if (actualItem.bytes !== expectedItem.bytes || actualItem.sha256 !== expectedItem.sha256) {
    failures.push(`Baseline artifact changed: ${filePath}`);
  }
}
for (const filePath of actualMap.keys()) {
  if (!expectedMap.has(filePath)) failures.push(`Unapproved baseline artifact added: ${filePath}`);
}
if (failures.length) {
  console.error("RUNTIME VISUAL BASELINES: FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Restore the original baseline. Do not update snapshots merely to pass tests.");
  process.exit(1);
}
console.log("RUNTIME VISUAL BASELINES: PASSED");
console.log(`Screenshots verified: ${actual.artifacts.filter((item) => item.kind === "screenshot").length}`);
console.log(`Desktop DOM snapshots verified: ${actual.artifacts.filter((item) => item.kind === "dom").length}`);
