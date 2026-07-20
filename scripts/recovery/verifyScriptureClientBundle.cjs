/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const chunkRoot = path.join(workspaceRoot, ".next", "static", "chunks");
const prohibited = [
  ["Scripture corpus registry", /teoyube-scripture-registry-2026-07-20\.1/],
  ["Scripture reference-index implementation", /createCanonicalScriptureRepository|collectReferenceLabels/],
  ["Scripture server repository error", /ScriptureRepositoryError/],
  ["legacy TIG KJV corpus seed", /scripture_romans_8_28|scripture_isaiah_40_31|scripture_joshua_1_9/],
  ["Scripture source checksum", /45dbec709a49fd5fe8a0c115c451ecf56ec5b2b538b72e31563606faa823bdf6/]
];

if (!fs.existsSync(chunkRoot)) {
  console.error("SCRIPTURE CLIENT BUNDLE CONTRACT: FAILED");
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
  console.error("SCRIPTURE CLIENT BUNDLE CONTRACT: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SCRIPTURE CLIENT BUNDLE CONTRACT: PASSED (${chunks.length} JavaScript chunks checked; no corpus, reference index, repository implementation, or blocked KJV seed found).`);
