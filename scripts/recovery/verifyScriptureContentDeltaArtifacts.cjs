/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifestPath = path.join(root, "tests/visual/baselines/owner-approved-scripture-content-delta/manifest.json");
const failures = [];
function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
if (!fs.existsSync(manifestPath)) {
  console.error("SCRIPTURE CONTENT-DELTA ARTIFACT CONTRACT: FAILED\n- Manifest is missing.");
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.decisionId !== "TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B") failures.push("Owner decision ID changed.");
if (manifest.evidenceCommit !== "4da2adfaa784039c5250a894fdcbd4c4aea64e82" || manifest.inventorySha256 !== "f6108e8617786464888dcbabb3f48899ed5a113d4d3851af947ced776d91d68c") failures.push("Evidence binding changed.");
const baselineManifestBytes = fs.readFileSync(path.join(root, "tests/visual/baselines/static-runtime/manifest.json"));
if (sha256(baselineManifestBytes) !== manifest.historicalBaselineManifestSha256) failures.push("Historical baseline manifest changed.");
if (manifest.immutableBaselinesOverwritten !== 0 || manifest.cssChangesAuthorized !== 0 || manifest.domClassChangesAuthorized !== 0 || manifest.assetChangesAuthorized !== 0) failures.push("Protection policy changed.");
if ((manifest.scenarios || []).length !== 8 || Object.keys(manifest.viewports || {}).length !== 6 || (manifest.results || []).length !== 60) failures.push("Expected eight normal scenarios, two fallback scenarios, six viewports, and 60 state results.");
for (const result of manifest.results || []) {
  if (result.staticSafety && (result.staticSafety.quotationHorizontalOverflow || result.staticSafety.recordsVerified < 1 || result.staticSafety.matchedRecords !== result.staticSafety.recordsVerified)) failures.push(`${result.viewport}/${result.scenario}: static text safety failed.`);
  if (result.nextSafety && (result.nextSafety.quotationHorizontalOverflow || result.nextSafety.recordsVerified < 1 || result.nextSafety.matchedRecords !== result.nextSafety.recordsVerified)) failures.push(`${result.viewport}/${result.scenario}: Next text safety failed.`);
  if (result.nextSafety && result.staticNextAgreement?.passed !== true) failures.push(`${result.viewport}/${result.scenario}: static/Next structural, asset, quotation, or visible-control agreement failed.`);
  if (result.staticNextPixelDifference && (result.staticNextPixelDifference.channelDelta !== 16 || result.staticNextPixelDifference.strictRatio !== 0.005)) failures.push(`${result.viewport}/${result.scenario}: raster evidence policy changed.`);
}
for (const artifact of manifest.artifacts || []) {
  if (!artifact.path.startsWith("tests/visual/baselines/owner-approved-scripture-content-delta/") || artifact.path.includes("../")) { failures.push(`${artifact.path}: unsafe artifact path.`); continue; }
  const fullPath = path.resolve(root, artifact.path);
  if (!fs.existsSync(fullPath)) { failures.push(`${artifact.path}: missing.`); continue; }
  const bytes = fs.readFileSync(fullPath);
  if (bytes.length !== artifact.bytes || sha256(bytes) !== artifact.sha256) failures.push(`${artifact.path}: hash or size changed.`);
}
const expectedArtifacts = 8 * 6 * 6 + 2 * 6;
if ((manifest.artifacts || []).length !== expectedArtifacts) failures.push(`Expected ${expectedArtifacts} content-delta artifacts; found ${(manifest.artifacts || []).length}.`);
if (failures.length) {
  console.error("SCRIPTURE CONTENT-DELTA ARTIFACT CONTRACT: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
const rasterRows = (manifest.results || []).filter((result) => result.staticNextPixelDifference);
const maxRaster = rasterRows.reduce((maximum, result) => Math.max(maximum, result.staticNextPixelDifference.ratio), 0);
console.log(`SCRIPTURE CONTENT-DELTA ARTIFACT CONTRACT: PASSED (${manifest.artifacts.length} new artifacts; exact static/Next structure, assets, quotation presentation, and visible-control geometry; maximum recorded raster ratio ${(maxRaster * 100).toFixed(4)}%; 72 immutable screenshots and 12 immutable DOM snapshots remain separately protected).`);
