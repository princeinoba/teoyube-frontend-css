/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const registryPath = path.join(workspaceRoot, "src/server/scripture/corpus-registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const failures = [];

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const active = registry.activeCorpus;
const assets = [
  ...registry.referenceIndex.assets,
  ...(active?.assets || []),
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
if (registry.readiness !== "READY" || registry.completeApprovedFullTextCorpus !== "engwebp") failures.push("The verified WEB corpus must be the one active complete corpus.");
if (!active || active.id !== "engwebp" || active.translationId !== "engwebp" || active.translationName !== "World English Bible" || active.displayAbbreviation !== "WEB") failures.push("Active WEB identity metadata changed.");
if (active?.displayPolicy !== "FULL_TEXT_ALLOWED" || active?.fullTextDisplayApproved !== true || active?.copyrightStatus !== "public_domain") failures.push("Active WEB licensing/display policy changed.");
if (active?.readiness !== "READY" || active?.verseCoverage !== 31098 || active?.sourceVerseMarkerCoverage !== 31103 || active?.sourceFootnoteOnlyVerseMarkers !== 5 || active?.referenceCoverage !== 356) failures.push("Active WEB coverage/readiness metadata changed.");
if (active?.archiveSha256 !== "4253589697dc6b5e92695655f2f28792d50e7be7b9c8e212af4f4bd18e866c3b" || active?.archiveBytes !== 2907330) failures.push("Owner-approved archive identity changed.");
if (active?.pgpSignatureVerification !== "NOT_PERFORMED" || active?.ownerResidualRiskDecisionId !== "TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B") failures.push("PGP status or scoped residual-risk decision changed.");
if (active?.sourceHashes?.embeddedChecksumsVerified !== 70 || active?.sourceHashes?.embeddedChecksumCount !== 70 || active?.sourceHashes?.sourceFileCount !== 68) failures.push("WEB source-hash verification counts changed.");
if (!Array.isArray(active?.limitations) || !active.limitations.some((item) => item.includes("PGP signature verification was not performed"))) failures.push("The PGP limitation must remain explicit.");
for (const source of registry.blockedTextSources) {
  if (source.displayPolicy !== "DISPLAY_BLOCKED_LICENSE_UNKNOWN" || source.fullTextDisplayApproved !== false || source.translationId === "engwebp") failures.push(`${source.id}: unknown-license legacy text must remain blocked and must not be relabeled WEB.`);
}

if (failures.length) {
  console.error("SCRIPTURE CORPUS REGISTRY CONTRACT: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SCRIPTURE CORPUS REGISTRY CONTRACT: PASSED (${assets.length} registered assets verified).`);
console.log("WEB coverage: 66 books, 1,189 chapters, 31,103 source verse markers, 31,098 displayable verses.");
console.log("Existing Teoyube references accounted for: 356/356.");
console.log("PGP signature verification: NOT PERFORMED; exact-archive residual risk accepted by the owner.");
