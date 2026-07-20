/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const chunkRoot = path.join(workspaceRoot, ".next", "static", "chunks");
const prohibited = [
  ["TIG journey seed export", /TIG_JOURNEY_SEEDS/],
  ["TIG calling seed export", /TIG_CALLING_SEEDS/],
  ["TIG prayer-sequence seed export", /TIG_PRAYER_SEQUENCE_SEEDS/],
  ["TIG action-step seed export", /TIG_ACTION_STEP_SEEDS/],
  ["TIG graph dataset", /journey_waiting_to_renewal|rel_calling_builder_to_journey_purpose_to_calling/],
  ["TIG end-to-end implementation", /runTigEndToEndRecommendation/],
  ["TIG server cache implementation", /TigVersionedCache|production-cache/]
];

if (!fs.existsSync(chunkRoot)) {
  console.error("TIG CLIENT BUNDLE CONTRACT: FAILED");
  console.error("- .next/static/chunks is missing; run npm run app:build before this check.");
  process.exit(1);
}

const chunks = fs.readdirSync(chunkRoot)
  .filter((name) => name.endsWith(".js"))
  .map((name) => path.join(chunkRoot, name));
const failures = [];
for (const file of chunks) {
  const source = fs.readFileSync(file, "utf8");
  for (const [label, pattern] of prohibited) {
    if (pattern.test(source)) failures.push(`${path.relative(workspaceRoot, file)} contains ${label}.`);
  }
}

if (failures.length) {
  console.error("TIG CLIENT BUNDLE CONTRACT: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`TIG CLIENT BUNDLE CONTRACT: PASSED (${chunks.length} JavaScript chunks checked; no TIG seeds, graph datasets, traversal, or server cache implementation found).`);
