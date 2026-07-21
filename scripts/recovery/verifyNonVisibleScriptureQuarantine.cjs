/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const inventoryPath = path.join(root, "docs/scripture/legacy-quotation-owner-review.json");
const inventoryBytes = fs.readFileSync(inventoryPath);
const inventory = JSON.parse(inventoryBytes.toString("utf8"));
const failures = [];
const expectedInventoryHash = "f6108e8617786464888dcbabb3f48899ed5a113d4d3851af947ced776d91d68c";
const nonVisible = inventory.nonVisibleLegacySourceRecords || [];
const prayers = inventory.notScriptureQuotationRecords || [];

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

if (sha256(inventoryBytes) !== expectedInventoryHash) failures.push("Prompt 15A inventory bytes changed.");
if (nonVisible.length !== 20 || nonVisible.some((record) => record.classification !== "LEGACY_NON_WEB_WORDING")) failures.push("Expected exactly 20 non-visible LEGACY_NON_WEB_WORDING records.");
if (prayers.length !== 5 || prayers.some((record) => record.classification !== "NOT_SCRIPTURE_QUOTATION")) failures.push("Expected exactly five NOT_SCRIPTURE_QUOTATION prayer/paraphrase records.");

const sourceCache = new Map();
for (const record of [...nonVisible, ...prayers]) {
  const sourceLocation = record.sourceLocation || "";
  const relativePath = sourceLocation.replace(/:\d+(?:-\d+)?$/, "");
  const absolutePath = path.resolve(root, relativePath);
  if (!absolutePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(absolutePath)) {
    failures.push(`${record.id}: source file is missing or unsafe.`);
    continue;
  }
  const source = sourceCache.get(relativePath) || fs.readFileSync(absolutePath, "utf8");
  sourceCache.set(relativePath, source);
  const text = record.currentText || record.text;
  if (!source.includes(text)) failures.push(`${record.id}: classified source text moved or changed without a migration-ledger update.`);
  if (source.includes(`${text} · WEB`) || source.includes(`${text} (WEB)`)) failures.push(`${record.id}: quarantined/non-Scripture wording was mislabeled WEB.`);
}

const appSource = sourceCache.get("app.js") || fs.readFileSync(path.join(root, "app.js"), "utf8");
const renderStart = appSource.indexOf("function renderClientsPromiseTable()");
const returnBarrier = appSource.indexOf("\n  return;", renderStart);
const legacyRender = appSource.indexOf("target.innerHTML = clientsPromiseRows", renderStart);
if (!(renderStart >= 0 && returnBarrier > renderStart && legacyRender > returnBarrier)) failures.push("The static legacy client-row display quarantine barrier is missing.");

const canonicalBoundaryFiles = [
  "src/server/scripture/canonical-scripture-repository.ts",
  "src/server/scripture/index.ts",
  "src/app/api/teoyube/scripture/route.ts",
  "src/domain/scripture/scripture-repository.ts",
  "src/app/_approved-source/approved-view-markup.generated.ts"
];
const canonicalSource = canonicalBoundaryFiles.map((relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8")).join("\n");
for (const record of nonVisible) if (canonicalSource.includes(record.currentText)) failures.push(`${record.id}: legacy wording entered a canonical Scripture DTO/rendering boundary.`);
for (const forbiddenImport of ["scriptures.seed", "offline-readonly-strategy", "phase-11-2-screenshot-guided-functionality", "clientsPromiseRows"]) if (canonicalSource.includes(forbiddenImport)) failures.push(`Canonical Scripture boundary imports or references quarantined source: ${forbiddenImport}.`);

const prayerSource = sourceCache.get("src/lib/tig/seed/prayer-sequences.seed.ts") || "";
if (!prayerSource.includes("TIG_PRAYER_SEQUENCE_SEEDS") || !prayerSource.includes("PrayerSequenceNode")) failures.push("Prayer/paraphrase records lost their typed prayer-sequence boundary.");
for (const record of prayers) if (canonicalSource.includes(record.text)) failures.push(`${record.id}: prayer/paraphrase entered canonical Scripture output.`);

if (failures.length) {
  console.error("NON-VISIBLE SCRIPTURE QUARANTINE: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("NON-VISIBLE SCRIPTURE QUARANTINE: PASSED");
console.log("20 legacy records remain source-bound, unlabeled as WEB, and excluded from canonical Scripture DTO/rendering boundaries.");
console.log("5 prayer/paraphrase records remain typed prayer-sequence content, unlabeled as WEB, and separate from verbatim Scripture.");
