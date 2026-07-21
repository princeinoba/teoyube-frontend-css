/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const evidenceCommit = "4da2adfaa784039c5250a894fdcbd4c4aea64e82";
const decisionId = "TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B";
const inventoryPath = "docs/scripture/legacy-quotation-owner-review.json";
const outputPath = path.join(root, "tests", "visual", "contracts", "owner-approved-scripture-content-delta.json");
const writeSourceOverlays = process.argv.includes("--write-source-overlays");

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function replacement(recordIds, oldText, newText) {
  return Object.freeze({ recordIds: Object.freeze(recordIds), oldText, newText });
}

const ephesiansOld = "I pray that the eyes of your heart may be enlightened in order that you may know the hope to which he has called you.";
const ephesiansNew = "having the eyes of your hearts enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints,";
const promisePairs = Object.freeze([
  ["UI-PROMISE-001", "The eyes of your understanding being enlightened; that ye may know what is the hope of his calling, and what the riches of the glory of his inheritance in the saints, -Ephesians 1:18-", "having the eyes of your hearts enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints, -Ephesians 1:18 · WEB-"],
  ["UI-PROMISE-002", "We then, as workers together with him, beseech you also that ye receive not the grace of God in vain. -2Corinthians 6:1-", "Working together, we entreat also that you do not receive the grace of God in vain. -2 Corinthians 6:1 · WEB-"],
  ["UI-PROMISE-003", "(For he saith, I have heard thee in a time accepted, and in the day of salvation have I succored thee: behold, now is the day of salvation.) -2Corinthians 6:2-", "For he says, “At an acceptable time I listened to you. In a day of salvation I helped you.” Behold, now is the acceptable time. Behold, now is the day of salvation. -2 Corinthians 6:2 · WEB-"],
  ["UI-PROMISE-004", "Giving no offense in any thing, that the mininstry be not blamed: -2Corinthians 6:3-", "We give no occasion of stumbling in anything, that our service may not be blamed, -2 Corinthians 6:3 · WEB-"],
  ["UI-PROMISE-005", "But in all things approving ourselves as the misnisters of God, in much patience, in afflictions, in necessities, in distresses, -2Corinthians 6:4-", "but in everything commending ourselves as servants of God: in great endurance, in afflictions, in hardships, in distresses, -2 Corinthians 6:4 · WEB-"],
  ["UI-PROMISE-006", "In stripes, in imprisonments, in tum-ults, in labours, in watchings, in fastings, -2Corinthians 6:5-", "in beatings, in imprisonments, in riots, in labors, in watchings, in fastings, -2 Corinthians 6:5 · WEB-"],
  ["UI-PROMISE-007", "By pureness, by knowledge, by long-suffering, by kindness, by the Holy Ghost, by love unfeigned, -2Corinthians 6:6-", "in pureness, in knowledge, in perseverance, in kindness, in the Holy Spirit, in sincere love, -2 Corinthians 6:6 · WEB-"],
  ["UI-PROMISE-008", "By the word of truth, by the power of God, by the armour of righteousness on the right hand and on the left, -2Corinthians 6:7-", "in the word of truth, in the power of God, by the armor of righteousness on the right hand and on the left, -2 Corinthians 6:7 · WEB-"]
]);

const replacementsByFile = Object.freeze({
  "index.html": Object.freeze([
    replacement(["UI-TODAY-001"], "<blockquote>The Lord will keep you from all harm; He will watch over your life.</blockquote>", "<blockquote>The LORD will keep you from all evil. He will keep your soul.</blockquote>"),
    replacement(["UI-TODAY-001"], "<strong>Psalm 121:7</strong>", "<strong>Psalm 121:7 · WEB</strong>"),
    replacement(["UI-CALLING-001"], ephesiansOld, ephesiansNew),
    replacement(["UI-CALLING-001"], "<strong>Ephesians 1:18</strong>", "<strong>Ephesians 1:18 · WEB</strong>"),
    replacement(["UI-BOOK-001"], "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight.", "Trust in the LORD with all your heart, and don’t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight."),
    replacement(["UI-BOOK-001"], "<b>Proverbs 3:5-6</b>", "<b>Proverbs 3:5-6 · WEB</b>"),
    replacement(["UI-BOOK-002"], "I will remember the deeds of the Lord;<br />yes, I will remember your miracles of long ago.", "I will remember the LORD’s deeds;<br />for I will remember your wonders of old."),
    replacement(["UI-BOOK-002"], "<b>Psalm 77:11</b>", "<b>Psalm 77:11 · WEB</b>"),
    replacement(["UI-BOOK-003"], "Stay faithful in the little, God will entrust you with much.", "He who is faithful in a very little is faithful also in much. He who is dishonest in a very little is also dishonest in much."),
    replacement(["UI-BOOK-003"], "<b>Luke 16:10</b>", "<b>Luke 16:10 · WEB</b>"),
    replacement(["UI-LEXICON-001"], "Let the word of Christ dwell in you richly in all wisdom.", "Let the word of Christ dwell in you richly; in all wisdom teaching and admonishing one another with psalms, hymns, and spiritual songs, singing with grace in your heart to the Lord."),
    replacement(["UI-LEXICON-001"], "<b>Colossians 3:16</b>", "<b>Colossians 3:16 · WEB</b>"),
    replacement(["UI-LEXICON-002"], "The fear of the Lord is the beginning of wisdom.", "The fear of the LORD is the beginning of wisdom. The knowledge of the Holy One is understanding."),
    replacement(["UI-LEXICON-002"], "<b>Proverbs 9:10</b>", "<b>Proverbs 9:10 · WEB</b>"),
    replacement(["UI-GUIDE-001"], "Your word is a lamp to my feet and a light to my path.", "Your word is a lamp to my feet, and a light for my path."),
    replacement(["UI-GUIDE-001"], "<b>Psalm 119:105</b>", "<b>Psalm 119:105 · WEB</b>")
  ]),
  "app.js": Object.freeze([
    ...promisePairs.map(([id, oldText, newText]) => replacement([id], oldText, newText)),
    replacement(["UI-CANON-001"], `<blockquote>${ephesiansOld}<br><b>Ephesians 1:18</b></blockquote>`, `<blockquote>${ephesiansNew}<br><b>Ephesians 1:18 · WEB</b></blockquote>`),
    replacement(["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003", "UI-PROMISE-004", "UI-PROMISE-005", "UI-PROMISE-006", "UI-PROMISE-007", "UI-PROMISE-008"], "description.match(/-([A-Za-z0-9 ]+:\\d+)-?$/)", "description.match(/-([A-Za-z0-9 ]+:\\d+)(?: · WEB)?-?\\s*$/)"),
    replacement(["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003", "UI-PROMISE-004", "UI-PROMISE-005", "UI-PROMISE-006", "UI-PROMISE-007", "UI-PROMISE-008"], "return match ? `-${match[1]}-` : \"-Ephesians 1:18-\";", "return match ? `-${match[1]} · WEB-` : \"-Ephesians 1:18 · WEB-\";"),
    replacement(["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003", "UI-PROMISE-004", "UI-PROMISE-005", "UI-PROMISE-006", "UI-PROMISE-007", "UI-PROMISE-008"], "description.replace(/\\s*-[A-Za-z0-9 ]+:\\d+-?\\s*$/, \"\")", "description.replace(/\\s*-[A-Za-z0-9 ]+:\\d+(?: · WEB)?-?\\s*$/, \"\")"),
    replacement(["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003", "UI-PROMISE-004", "UI-PROMISE-005", "UI-PROMISE-006", "UI-PROMISE-007", "UI-PROMISE-008"], "rows = rows.sort((a, b) => getPromisePosition(a.description).localeCompare(getPromisePosition(b.description)));", "rows = rows.sort((a, b) => a.tableIndex - b.tableIndex);")
  ]),
  "scripts/seedDB.js": Object.freeze([
    replacement(["UI-PROMISE-001"], "\"The eyes of your understanding being enlightened; \",\n      \"that ye may know what is the hope of his calling, \",\n      \"and what the riches of the glory of his inheritance in the saints, \",\n      \"-Ephesians 1:18- \"", "\"having the eyes of your hearts enlightened, \",\n      \"that you may know what is the hope of his calling, \",\n      \"and what are the riches of the glory of his inheritance in the saints, \",\n      \"-Ephesians 1:18 · WEB- \""),
    replacement(["UI-PROMISE-002"], "\"We then, \",\n      \"as workers together with him, \",\n      \"beseech you also that ye receive not the grace of God in vain. \",\n      \"-2Corinthians 6:1- \"", "\"Working together, \",\n      \"we entreat also that you do not receive the grace of God in vain. \",\n      \"-2 Corinthians 6:1 · WEB- \""),
    replacement(["UI-PROMISE-003"], "\"(For he saith, \",\n      \"I have heard thee in a time accepted, \",\n      \"and in the day of salvation have I succored thee: behold, \",\n      \"now is the day of salvation.) \",\n      \"-2Corinthians 6:2- \"", "\"For he says, “At an acceptable time I listened to you. \",\n      \"In a day of salvation I helped you.” \",\n      \"Behold, now is the acceptable time. \",\n      \"Behold, now is the day of salvation. \",\n      \"-2 Corinthians 6:2 · WEB- \"")
  ]),
  "src/app/_today/ApprovedTodayView.tsx": Object.freeze([
    replacement(["UI-TODAY-001"], "<blockquote>The Lord will keep you from all harm; He will watch over your life.</blockquote><strong>Psalm 121:7</strong>", "<blockquote>The LORD will keep you from all evil. He will keep your soul.</blockquote><strong>Psalm 121:7 · WEB</strong>")
  ])
});

function gitSource(relativePath) {
  return execFileSync("git", ["-c", `safe.directory=${root.replaceAll("\\", "/")}`, "show", `${evidenceCommit}:${relativePath}`], {
    cwd: root,
    maxBuffer: 16 * 1024 * 1024
  });
}

function applyReplacement(source, item, relativePath) {
  const pieces = source.split(item.oldText);
  const count = pieces.length - 1;
  if (count < 1) throw new Error(`${relativePath}: approved old text was not found: ${item.oldText.slice(0, 100)}`);
  return { source: pieces.join(item.newText), count };
}

const inventoryBytes = fs.readFileSync(path.join(root, inventoryPath));
const inventory = JSON.parse(inventoryBytes.toString("utf8"));
if (inventory.visibleProductRecords.length !== 17 || inventory.visibleProductRecords.some((record) => record.classification !== "LEGACY_NON_WEB_WORDING")) {
  throw new Error("The bound Prompt 15A visible quotation inventory changed.");
}

const sourceFiles = [];
for (const [relativePath, replacements] of Object.entries(replacementsByFile)) {
  const originalBytes = gitSource(relativePath);
  const currentPath = path.join(root, relativePath);
  let currentBytes = fs.readFileSync(currentPath);
  let transformed = originalBytes.toString("utf8");
  const operations = [];
  for (const item of replacements) {
    const applied = applyReplacement(transformed, item, relativePath);
    transformed = applied.source;
    operations.push({
      recordIds: item.recordIds,
      expectedOccurrences: applied.count,
      authorizedOldTextSha256: sha256(Buffer.from(item.oldText, "utf8")),
      authorizedNewTextSha256: sha256(Buffer.from(item.newText, "utf8")),
      oldText: item.oldText,
      newText: item.newText
    });
  }
  const transformedBytes = Buffer.from(transformed, "utf8");
  if (!transformedBytes.equals(currentBytes) && writeSourceOverlays) {
    fs.writeFileSync(currentPath, transformedBytes);
    currentBytes = transformedBytes;
  }
  if (!transformedBytes.equals(currentBytes)) throw new Error(`${relativePath}: current bytes contain a change outside the declared record-aware replacements.`);
  sourceFiles.push({
    path: relativePath,
    originalSha256: sha256(originalBytes),
    originalBytes: originalBytes.length,
    approvedNewSha256: sha256(currentBytes),
    approvedNewBytes: currentBytes.length,
    recordIds: [...new Set(operations.flatMap((operation) => operation.recordIds))],
    operations
  });
}

function generatedMarkupPayload(bytes) {
  const source = bytes.toString("utf8");
  const prefix = "export const APPROVED_VIEW_MARKUP = ";
  const start = source.indexOf(prefix);
  const end = source.lastIndexOf(" as const;");
  if (start < 0 || end < 0) throw new Error("Approved preview markup has an unexpected module shape.");
  return JSON.parse(source.slice(start + prefix.length, end));
}

function generatedStructure(value, keyPath = "root", records = []) {
  if (typeof value === "string") {
    const tags = (value.match(/<\/?[a-z][^>]*>/gi) || []).map((tag) => {
      const name = tag.match(/^<\/?([a-z][a-z0-9-]*)/i)?.[1]?.toLowerCase() || "";
      const closing = /^<\//.test(tag);
      const id = tag.match(/\bid=["']([^"']*)["']/i)?.[1] || "";
      const classes = tag.match(/\bclass=["']([^"']*)["']/i)?.[1] || "";
      return `${closing ? "/" : ""}${name}#${id}.${classes}`;
    });
    if (tags.length) records.push([keyPath, tags]);
    return records;
  }
  if (Array.isArray(value)) value.forEach((child, index) => generatedStructure(child, `${keyPath}[${index}]`, records));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, child]) => generatedStructure(child, `${keyPath}.${key}`, records));
  return records;
}

const generatedPath = "src/app/_approved-source/approved-view-markup.generated.ts";
const generatedOriginalBytes = gitSource(generatedPath);
const generatedCurrentBytes = fs.readFileSync(path.join(root, generatedPath));
const generatedOriginal = generatedMarkupPayload(generatedOriginalBytes);
const generatedCurrent = generatedMarkupPayload(generatedCurrentBytes);
const generatedVisibleText = generatedCurrentBytes.toString("utf8").replace(/<[^>]+>/g, " ").replaceAll("\\n", " ").replace(/\s+/g, " ");
const digest = crypto.createHash("sha256");
for (const relativePath of ["index.html", "app.js", "phase116b1.js"]) {
  digest.update(relativePath);
  digest.update(fs.readFileSync(path.join(root, relativePath)));
}
if (generatedCurrent.sourceDigest !== digest.digest("hex")) throw new Error("Approved preview markup is not derived from the current exact static source overlay.");
const originalGeneratedStructure = generatedStructure(generatedOriginal);
const currentGeneratedStructure = generatedStructure(generatedCurrent);
if (JSON.stringify(originalGeneratedStructure) !== JSON.stringify(currentGeneratedStructure)) {
  const mismatchIndex = originalGeneratedStructure.findIndex((entry, index) => JSON.stringify(entry) !== JSON.stringify(currentGeneratedStructure[index]));
  const originalEntry = originalGeneratedStructure[mismatchIndex] || [];
  const currentEntry = currentGeneratedStructure[mismatchIndex] || [];
  const tagMismatch = (originalEntry[1] || []).findIndex((tag, index) => tag !== (currentEntry[1] || [])[index]);
  throw new Error(`Approved preview markup contains a DOM/tag/class/ID structural change at ${originalEntry[0]} versus ${currentEntry[0]} (tag ${tagMismatch}; ${originalEntry[1]?.length || 0} versus ${currentEntry[1]?.length || 0}; ${originalEntry[1]?.[tagMismatch]} versus ${currentEntry[1]?.[tagMismatch]}).`);
}
const generatedRecordIds = inventory.visibleProductRecords.filter((record) => generatedVisibleText.includes(record.exactWebText)).map((record) => record.id);
const expectedGeneratedRecordIds = ["UI-PROMISE-001", "UI-PROMISE-002", "UI-PROMISE-003", "UI-CANON-001", "UI-CALLING-001", "UI-BOOK-001", "UI-BOOK-002", "UI-BOOK-003", "UI-LEXICON-001", "UI-LEXICON-002", "UI-GUIDE-001"];
for (const record of inventory.visibleProductRecords) {
  if (expectedGeneratedRecordIds.includes(record.id) && !generatedRecordIds.includes(record.id)) throw new Error(`${record.id}: exact WEB wording is absent from the deterministic Next compatibility snapshot.`);
  if (generatedVisibleText.includes(record.currentText)) throw new Error(`${record.id}: legacy wording remains in the deterministic Next compatibility snapshot.`);
}
sourceFiles.push({
  path: generatedPath,
  originalSha256: sha256(generatedOriginalBytes),
  originalBytes: generatedOriginalBytes.length,
  approvedNewSha256: sha256(generatedCurrentBytes),
  approvedNewBytes: generatedCurrentBytes.length,
  recordIds: generatedRecordIds,
  operations: [],
  derivedFrom: ["index.html", "app.js", "scripts/seedDB.js"],
  derivation: "Fresh deterministic browser capture from the exact approved static source overlay; source digest and full tag/attribute structure are verified."
});

const records = inventory.visibleProductRecords.map((record) => ({
  id: record.id,
  routeOrSurface: record.routes,
  sourceLocations: record.sourceLocations,
  selector: record.selector || record.selectors,
  uiState: record.states,
  reference: record.reference,
  existingWording: record.currentText,
  existingWordingSha256: sha256(Buffer.from(record.currentText, "utf8")),
  exactWebWording: record.exactWebText,
  exactWebWordingSha256: sha256(Buffer.from(record.exactWebText, "utf8")),
  semanticRole: "verbatim_scripture_quotation",
  ownerDecision: "REPLACE_WITH_EXACT_WEB",
  translationLabelTreatment: `${record.reference} · WEB in the existing citation/reference element`,
  affectedViewports: ["desktop-wide", "desktop-standard", "tablet-landscape", "tablet-portrait", "mobile", "mobile-small"],
  expectedVisualImpact: "Exact WEB wording may wrap and increase fluid content height; no CSS, DOM/class, asset, font, dimension, truncation, or breakpoint change is authorized.",
  implementationResult: "IMPLEMENTED",
  validationResult: "PASS_EXACT_WEB_SOURCE_AND_CONTENT_DELTA"
}));

const artifactManifestPath = "tests/visual/baselines/owner-approved-scripture-content-delta/manifest.json";
const artifactManifestBytes = fs.readFileSync(path.join(root, artifactManifestPath));
const artifactManifest = JSON.parse(artifactManifestBytes.toString("utf8"));
if (artifactManifest.decisionId !== decisionId || artifactManifest.inventorySha256 !== sha256(inventoryBytes)) throw new Error("Scripture content-delta artifact evidence is not bound to this owner decision and inventory.");
if (artifactManifest.artifacts?.length !== 300 || artifactManifest.results?.length !== 60) throw new Error("Scripture content-delta artifact evidence is incomplete.");
if (artifactManifest.results.some((result) => result.nextSafety && result.staticNextAgreement?.passed !== true)) throw new Error("Scripture content-delta static/Next agreement is not complete.");

const contract = {
  schemaVersion: 1,
  decisionId,
  approvalDate: "2026-07-20",
  ownerRole: "Teoyube project owner",
  evidenceCommit,
  checkpointTag: "teoyube-prompt15a-quotation-gate-4da2adf",
  inventoryPath,
  inventorySha256: sha256(inventoryBytes),
  archiveSha256: "4253589697dc6b5e92695655f2f28792d50e7be7b9c8e212af4f4bd18e866c3b",
  translation: { id: "engwebp", name: "World English Bible", abbreviation: "WEB" },
  scopedVisualApproval: "Content-only wrapping, fluid height growth, and downstream vertical movement caused solely by the exact 17 WEB quotations and WEB citation labels.",
  prohibitedChanges: ["css", "dom_or_class_structure", "assets", "fonts", "fixed_dimensions", "truncation", "breakpoints", "immutable_baseline_overwrite"],
  records,
  sourceFiles,
  historicalBaselinesRemainReadOnly: true,
  contentDeltaArtifacts: [{
    manifestPath: artifactManifestPath,
    manifestSha256: sha256(artifactManifestBytes),
    artifactCount: artifactManifest.artifacts.length,
    stateCount: artifactManifest.results.length,
    immutableBaselineOverwrites: artifactManifest.immutableBaselinesOverwritten
  }],
  pgpSignatureVerification: "NOT_PERFORMED",
  ownerResidualRiskAcceptance: true,
  staticRuntime: "CANONICAL",
  nextRuntime: "PREVIEW_ONLY"
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
console.log(`Materialized ${path.relative(root, outputPath)} with ${records.length} records and ${sourceFiles.length} exact source overlays.`);
