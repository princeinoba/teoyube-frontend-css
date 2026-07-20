/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const registryPath = path.join(workspaceRoot, "src", "server", "scripture", "corpus-registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const failures = [];

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const assets = [
  ...registry.referenceIndex.assets,
  ...registry.blockedTextSources.flatMap((source) => source.assets)
];

for (const asset of assets) {
  const fullPath = path.resolve(workspaceRoot, asset.path);
  if (!fullPath.startsWith(`${workspaceRoot}${path.sep}`)) {
    failures.push(`${asset.path}: path escapes the workspace.`);
    continue;
  }
  if (!fs.existsSync(fullPath)) {
    failures.push(`${asset.path}: file is missing.`);
    continue;
  }
  const buffer = fs.readFileSync(fullPath);
  if (buffer.length !== asset.bytes) failures.push(`${asset.path}: byte length changed.`);
  if (sha256(buffer) !== asset.sha256) failures.push(`${asset.path}: SHA-256 changed.`);
}

const composite = sha256(Buffer.from(assets.map((asset) => asset.sha256).join("\n"), "utf8"));
if (composite !== registry.compositeChecksum) failures.push("Composite registry checksum does not match the ordered asset checksums.");
if (registry.referenceIndex.displayPolicy !== "REFERENCE_ONLY") failures.push("The local reference index must remain REFERENCE_ONLY while no approved text corpus exists.");
if (registry.referenceIndex.fullTextDisplayApproved !== false) failures.push("The reference index must not approve full-text display.");
if (registry.completeApprovedFullTextCorpus !== null) failures.push("A complete corpus may not be recorded without an owner-reviewed source and licensing decision.");
if (registry.readiness !== "BLOCKED_NO_COMPLETE_APPROVED_FULL_TEXT_CORPUS") failures.push("Corpus readiness must remain blocked until the full-text gate is satisfied.");
for (const source of registry.blockedTextSources) {
  if (source.displayPolicy !== "DISPLAY_BLOCKED_LICENSE_UNKNOWN" || source.fullTextDisplayApproved !== false) {
    failures.push(`${source.id}: unknown-license text must remain display-blocked.`);
  }
}

if (failures.length) {
  console.error("SCRIPTURE CORPUS REGISTRY CONTRACT: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SCRIPTURE CORPUS REGISTRY CONTRACT: PASSED (${assets.length} source assets verified).`);
console.log(`Reference-only coverage: ${registry.referenceIndex.referenceCoverage} normalized local references.`);
console.log("CORPUS READINESS: BLOCKED_NO_COMPLETE_APPROVED_FULL_TEXT_CORPUS");
console.log("No local verse text is approved for canonical display, context retrieval, quotation validation, or excerpt search.");
