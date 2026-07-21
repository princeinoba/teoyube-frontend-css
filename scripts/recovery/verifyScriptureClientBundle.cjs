/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const chunkRoot = path.join(workspaceRoot, ".next", "static", "chunks");
const prohibited = [
  ["Scripture corpus registry", /teoyube-scripture-registry-2026-07-20\.2/],
  ["Scripture corpus/importer implementation", /createCanonicalScriptureRepository|collectReferenceLabels|teoyube-web-usfm-importer-1\.0\.0|engwebp-2020-stable-2026-07-10\.p15b\.1/],
  ["Scripture server repository error", /ScriptureRepositoryError/],
  ["legacy TIG KJV corpus seed", /scripture_romans_8_28|scripture_isaiah_40_31|scripture_joshua_1_9/],
  ["Scripture source/corpus checksum", /4253589697dc6b5e92695655f2f28792d50e7be7b9c8e212af4f4bd18e866c3b|6e6b3f95b5d61c83c06534ee4281f10b6e4e02c878b75141dcdd4403bf42d77f|544b67548c04a36e2445fa6601f07f6cdb7b8d044ae2691591629609b2eeeeb2/]
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

console.log(`SCRIPTURE CLIENT BUNDLE CONTRACT: PASSED (${chunks.length} JavaScript chunks checked; no corpus/index/importer internals, server repository implementation, or blocked KJV seed found).`);
