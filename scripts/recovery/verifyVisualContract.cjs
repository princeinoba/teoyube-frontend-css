"use strict";

const fs = require("fs");
const { CONTRACT_PATH, buildVisualContract } = require("./visualContractLib.cjs");
const { isApprovedSourceDelta, verifyScriptureContentDelta } = require("./scriptureContentDeltaOverlay.cjs");

function mapByPath(records) {
  return new Map(records.map((record) => [record.path, record]));
}

function compareArrays(label, expected, actual, failures) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const removed = expected.filter((value) => !actualSet.has(value));
  const added = actual.filter((value) => !expectedSet.has(value));
  if (removed.length || added.length) {
    failures.push(`${label} changed: removed=${JSON.stringify(removed.slice(0, 20))} added=${JSON.stringify(added.slice(0, 20))}`);
  }
}

if (!fs.existsSync(CONTRACT_PATH)) {
  console.error(`Missing visual contract: ${CONTRACT_PATH}`);
  process.exit(1);
}

const expected = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const actual = buildVisualContract();
const failures = [];
const scriptureDelta = verifyScriptureContentDelta();
if (!scriptureDelta.valid) scriptureDelta.failures.forEach((failure) => failures.push(`Owner-approved Scripture content delta: ${failure}`));

const expectedFiles = mapByPath(expected.protectedFiles);
const actualFiles = mapByPath(actual.protectedFiles);

for (const [relativePath, expectedRecord] of expectedFiles) {
  const actualRecord = actualFiles.get(relativePath);
  if (!actualRecord) {
    failures.push(`Protected visual file missing: ${relativePath}`);
    continue;
  }
  if (expectedRecord.bytes !== actualRecord.bytes || expectedRecord.sha256 !== actualRecord.sha256) {
    if (!isApprovedSourceDelta(relativePath, actualRecord.sha256, actualRecord.bytes, scriptureDelta)) failures.push(`Protected visual file changed: ${relativePath}`);
  }
}

for (const relativePath of actualFiles.keys()) {
  if (!expectedFiles.has(relativePath)) failures.push(`New file appeared inside a protected visual path: ${relativePath}`);
}

const expectedRefs = mapByPath(expected.referenceScreenshots);
const actualRefs = mapByPath(actual.referenceScreenshots);
for (const [relativePath, expectedRecord] of expectedRefs) {
  const actualRecord = actualRefs.get(relativePath);
  if (!actualRecord || expectedRecord.bytes !== actualRecord.bytes || expectedRecord.sha256 !== actualRecord.sha256) {
    failures.push(`Owner design reference changed or disappeared: ${relativePath}`);
  }
}

const expectedMarkup = expected.markupContract;
const actualMarkup = actual.markupContract;
const approvedPhase5c2AriaLabels = scriptureDelta.phase5c2Delta?.valid
  ? scriptureDelta.phase5c2Delta.contract.allowedAriaLabels
  : [];
const approvedPhase5c3aVisualAdditions = scriptureDelta.phase5c3aDelta?.valid
  ? scriptureDelta.phase5c3aDelta.contract.visualContractAdditions
  : {};
for (const key of [
  "classes",
  "ids",
  "dataViews",
  "ariaLabels",
  "assetReferences",
  "cssClasses",
  "cssIds",
  "animationNames",
  "mediaQueries"
]) {
  const additions = key === "ariaLabels"
    ? approvedPhase5c2AriaLabels
    : approvedPhase5c3aVisualAdditions[key] || [];
  const expectedValues = [...(expectedMarkup[key] || []), ...additions];
  compareArrays(`Markup contract ${key}`, expectedValues, actualMarkup[key] || [], failures);
}
if (expectedMarkup.orderedTagSignatureCount !== actualMarkup.orderedTagSignatureCount) {
  failures.push(
    `Ordered tag count changed: expected ${expectedMarkup.orderedTagSignatureCount}, actual ${actualMarkup.orderedTagSignatureCount}`
  );
}
if (expectedMarkup.orderedTagSignatureSha256 !== actualMarkup.orderedTagSignatureSha256) {
  failures.push("Ordered DOM/template tag signature changed.");
}

if (failures.length) {
  console.error("VISUAL CONTRACT: FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Do not regenerate the baseline to hide this failure. Restore the approved source or obtain explicit owner approval.");
  process.exit(1);
}

console.log("VISUAL CONTRACT: PASSED");
console.log(`Protected files verified: ${actual.protectedFiles.length}`);
console.log(`Owner design references verified: ${actual.referenceScreenshots.length}`);
console.log(`DOM classes verified: ${actualMarkup.classes.length}`);
console.log(`DOM IDs verified: ${actualMarkup.ids.length}`);
console.log(`CSS classes verified: ${actualMarkup.cssClasses.length}`);
console.log(`Animation names verified: ${actualMarkup.animationNames.length}`);
console.log(`Exact owner-approved Scripture source overlays replayed: ${scriptureDelta.approvedByPath.size}.`);
console.log(`Exact owner-approved Phase 5C-2 ARIA labels replayed: ${approvedPhase5c2AriaLabels.length}.`);
console.log(`Exact owner-approved Phase 5C-3A CSS tokens replayed: ${(approvedPhase5c3aVisualAdditions.cssIds || []).length + (approvedPhase5c3aVisualAdditions.mediaQueries || []).length}.`);
