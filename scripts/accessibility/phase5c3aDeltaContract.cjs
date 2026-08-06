/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { computeRuntimeSourceIdentity } = require("../runtime/runtime-source-identity.cjs");

const projectRoot = path.resolve(__dirname, "../..");
const contractPath = path.join(projectRoot, "config/accessibility/approved-phase-5c3a-deltas.json");
const expectedDecisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001";
const expectedStart = "8f01138907a9c76439bd725662097bb6106dea52";
const expectedIssue = "A11Y-007";
const expectedProposalHash = "e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717";
const expectedRoutes = ["/", "/book", "/canon", "/explore"];
const expectedStates = ["default", "carousel-pagination", "memory-filtering", "explore-tab-selection"];
const expectedViewports = [
  { name: "desktop-wide", width: 1440, height: 900 },
  { name: "desktop-standard", width: 1280, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-small", width: 360, height: 800 }
];
const expectedSelectors = [
  "#promiseCarouselDots button[data-slide-index]",
  ".featured-story-dots button[data-featured-story-index]",
  "#book .book-toolbar .phase116-chip-row button.phase116-chip",
  "#phase115BookMemory .phase115-memory-filters button",
  ".canon-watchman-story-card .canon-watchman-video-dots button[data-watchman-video-index]",
  ".tab-list button.tab"
];
const expectedVisualContractAdditions = {
  cssIds: ["promiseCarouselDots"],
  mediaQueries: ["(min-width: 769px) and (max-width: 1024px)"]
};
const expectedFiles = new Map([
  ["styles/pages/today.css", [25805, "2aa08aa4459085e929be440ec1e8839e483abec95f94d08725a3bdcca67e59da", 26363, "f4006f6c2ee70943b877f2dac54013d80a765b4c4c39f6575436bbca9a3f5b96"]],
  ["styles/pages/book.css", [51104, "af8554160868a1960428df2118c8dfc0a27555fce52fd2788128765f69b1e2de", 51426, "b9a949a8e05ee6118bcc1cabd7e404cdacf5bd1f92ded27dece4c6f83c1ef56c"]],
  ["styles/pages/canon.css", [80779, "340251e77dd7ee8c4f4afd905be75188a4218987832bd0e301293eae4ba1c116", 81018, "8634b45893645849a042f0382b2522557203d53547117c737b34c646fd8e04fa"]],
  ["src/app/globals.css", [27354, "9c3304ffed2520d57d28d44d5321ac8cf9bb38f69b6c2ad17e86c293c297d1db", 27354, "9c3304ffed2520d57d28d44d5321ac8cf9bb38f69b6c2ad17e86c293c297d1db"]],
  ["src/components/teoyube/ExploreTabs.tsx", [5757, "e2caba8c6d0948a195fba0d1f568a6a3feda4b12f497dd6417a8362a8103668e", 5809, "2c2052c2568c179d13a354f3c36bffef2f7f21bd60f1313fdd5195837ae1e64b"]],
  ["config/runtime/canonical-runtime-manifest.json", [8366, "23adaae0c5f44a7396934e359e09a16012d12a2e0dbc6a778c60aedc3cbd0825", 8366, "94b926f8b5efff045d431b1b569af87dbd7e72e84fa04ac65e408347ed443333"]]
]);

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizePath = (value) => value.replaceAll("\\", "/");
const gitSource = (relativePath) => execFileSync("git", ["show", `${expectedStart}:${relativePath}`], { cwd: projectRoot, maxBuffer: 8 * 1024 * 1024 });

function verifySemantics(failures) {
  const today = fs.readFileSync(path.join(projectRoot, "styles/pages/today.css"), "utf8");
  const book = fs.readFileSync(path.join(projectRoot, "styles/pages/book.css"), "utf8");
  const canon = fs.readFileSync(path.join(projectRoot, "styles/pages/canon.css"), "utf8");
  const explore = fs.readFileSync(path.join(projectRoot, "src/components/teoyube/ExploreTabs.tsx"), "utf8");

  if (!today.includes("min-width: 24px;") || !today.includes("min-height: 24px;") || !today.includes("#promiseCarouselDots button[data-slide-index]")) failures.push("A11Y-007: Today target-size rules are incomplete.");
  const mobileIndex = today.indexOf("@media (max-width: 430px)");
  const reducedMotionIndex = today.indexOf("@media (prefers-reduced-motion: reduce)");
  if (mobileIndex < 0 || reducedMotionIndex < 0 || mobileIndex > reducedMotionIndex) failures.push("A11Y-007: the mobile target rule must apply independently of reduced-motion preference.");
  if (!book.includes("#phase115BookMemory .phase115-memory-filters button") || !book.includes("#book .book-toolbar .phase116-chip-row button.phase116-chip")) failures.push("A11Y-007: Book target selectors changed.");
  if (!canon.includes(".canon-watchman-story-card .canon-watchman-video-dots button[data-watchman-video-index]")) failures.push("A11Y-007: Canon Watchman selector changed.");
  if (!explore.includes("style={{ minHeight: 24, minWidth: 24 }}")) failures.push("A11Y-007: Explore tab target-size contract changed.");
  const runtime = JSON.parse(fs.readFileSync(path.join(projectRoot, "config/runtime/canonical-runtime-manifest.json"), "utf8"));
  const identity = computeRuntimeSourceIdentity({ root: projectRoot });
  if (runtime.runtimeSourceDigest !== identity.digest || runtime.nextBuildId !== identity.buildId || runtime.nextBuildId !== "teoyube-22d584c6c4ff4037a7e5021c") failures.push("A11Y-007: deterministic runtime identity is stale.");
  for (const source of [today, book, canon, explore]) if (/tabIndex\s*=\s*["'{]?\s*[1-9]/i.test(source) || /tabindex\s*:\s*[1-9]/i.test(source)) failures.push("A11Y-007: positive tabindex is forbidden.");
}

function verifyEvidence(failures) {
  const afterPath = path.join(projectRoot, "tests/accessibility/evidence/phase-5c3a/after/manifest.json");
  if (!fs.existsSync(afterPath)) { failures.push("Phase 5C-3A after-evidence manifest is missing."); return; }
  const report = JSON.parse(fs.readFileSync(afterPath, "utf8"));
  const summary = report.summary || {};
  if (report.phase !== "5C-3A" || report.ownerDecisionId !== expectedDecisionId || JSON.stringify(report.issueIds) !== JSON.stringify([expectedIssue])) failures.push("After-evidence scope changed.");
  if (JSON.stringify(report.viewports) !== JSON.stringify(expectedViewports)) failures.push("After-evidence viewport matrix changed.");
  if (summary.cellCount !== 42 || summary.nextCells !== 24 || summary.staticCells !== 18 || summary.targetGroupCount !== 66 || summary.targetCount !== 570) failures.push("After-evidence coverage changed.");
  if (summary.minimumWidth < 24 || summary.minimumHeight < 24 || summary.targetSizePassCount !== 570 || summary.targetViolationNodes !== 0) failures.push("Target-size remediation evidence is incomplete.");
  if (summary.overlappingPairCount !== 0 || report.targetInteractionComparison?.passedGroups !== 66 || report.targetInteractionComparison?.comparedGroups !== 66) failures.push("Target overlap or center-hit regression evidence is incomplete.");
  if (report.behaviorComparison?.passedCells !== 42 || report.behaviorComparison?.comparedCells !== 42 || summary.unexpectedErrorCount !== 0) failures.push("Behavior or runtime regression evidence is incomplete.");
  if ((report.validationFailures || []).length !== 0) failures.push("Phase 5C-3A validation contains failures.");
}

function verifyPhase5c3aDelta() {
  const failures = [];
  if (!fs.existsSync(contractPath)) return { valid: false, failures: ["Phase 5C-3A delta contract is missing."], approvedByPath: new Map() };
  const contractBytes = fs.readFileSync(contractPath);
  const contract = JSON.parse(contractBytes.toString("utf8"));
  if (contract.phase !== "5C-3A" || contract.batch !== "narrow-a11y-007-target-size-remediation") failures.push("Phase or batch changed.");
  if (contract.ownerDecisionId !== expectedDecisionId || contract.startingCommit !== expectedStart) failures.push("Owner decision or starting commit changed.");
  if (JSON.stringify(contract.issueIds) !== JSON.stringify([expectedIssue]) || contract.proposalHashes?.[expectedIssue] !== expectedProposalHash) failures.push("Approved issue or proposal-hash binding changed.");
  if (JSON.stringify(contract.routes) !== JSON.stringify(expectedRoutes) || JSON.stringify(contract.states) !== JSON.stringify(expectedStates)) failures.push("Approved route or state inventory changed.");
  if (JSON.stringify(contract.viewports) !== JSON.stringify(expectedViewports) || JSON.stringify(contract.selectors) !== JSON.stringify(expectedSelectors)) failures.push("Approved viewport or selector inventory changed.");
  const constraints = contract.constraints || {};
  if (constraints.minimumTargetWidthCssPixels !== 24 || constraints.minimumTargetHeightCssPixels !== 24) failures.push("Minimum target-size contract changed.");
  for (const key of ["visibleCopyChanged", "domHierarchyChanged", "classOrIdChanged", "ariaChanged", "assetChanged", "baselineChanged", "a11y008Changed"]) if (constraints[key] !== false) failures.push(`${key} must remain false.`);
  if (constraints.controlsRemoved !== 0 || constraints.manualEvidenceExecuted !== 0) failures.push("Controls removed or manual evidence was claimed.");
  if (JSON.stringify(contract.geometry) !== JSON.stringify({ before: { targetCount: 570, minimumWidth: 12, minimumHeight: 5.4, targetSizePassCount: 284, targetViolationNodes: 286, centerHitPassCount: 260, overlappingPairCount: 0 }, after: { targetCount: 570, minimumWidth: 24, minimumHeight: 24, targetSizePassCount: 570, targetViolationNodes: 0, centerHitPassCount: 284, overlappingPairCount: 0 } })) failures.push("Before/after target geometry binding changed.");
  if (contract.allowedDifference?.cssByteDelta !== 1119 || contract.allowedDifference?.tsxByteDelta !== 52 || contract.allowedDifference?.domHierarchyDelta !== 0 || contract.allowedDifference?.classIdDelta !== 0 || contract.allowedDifference?.ariaDelta !== 0 || contract.allowedDifference?.visibleCopyDelta !== 0 || contract.allowedDifference?.assetDelta !== 0 || contract.allowedDifference?.controlRemovalDelta !== 0) failures.push("Approved delta budget changed.");
  if (contract.allowedDifference?.expectedPixelRegion !== "approved target boxes and their direct responsive reflow only") failures.push("Approved pixel region changed.");
  if (JSON.stringify(contract.visualContractAdditions) !== JSON.stringify(expectedVisualContractAdditions)) failures.push("Approved visual-contract additions changed.");

  const approvedByPath = new Map();
  const records = contract.sourceFiles || [];
  if (records.length !== expectedFiles.size || new Set(records.map((record) => normalizePath(record.path))).size !== expectedFiles.size) failures.push("Source-file inventory changed.");
  for (const record of records) {
    const relativePath = normalizePath(record.path || "");
    const expected = expectedFiles.get(relativePath);
    if (!expected) { failures.push(`${relativePath}: file is outside the approved Phase 5C-3A scope.`); continue; }
    if ([record.beforeBytes, record.beforeSha256, record.afterBytes, record.afterSha256].some((value, index) => value !== expected[index])) failures.push(`${relativePath}: hard-bound byte contract changed.`);
    let before;
    try { before = gitSource(relativePath); } catch (error) { failures.push(`${relativePath}: cannot read starting source (${error.message}).`); continue; }
    const absolutePath = path.resolve(projectRoot, relativePath);
    if (!absolutePath.startsWith(`${projectRoot}${path.sep}`) || !fs.existsSync(absolutePath)) { failures.push(`${relativePath}: current source is missing or unsafe.`); continue; }
    const after = fs.readFileSync(absolutePath);
    if (before.length !== expected[0] || sha256(before) !== expected[1]) failures.push(`${relativePath}: starting bytes differ from the authorized commit.`);
    if (after.length !== expected[2] || sha256(after) !== expected[3]) failures.push(`${relativePath}: current bytes differ from the exact approved remediation.`);
    approvedByPath.set(relativePath, { bytes: after.length, sha256: sha256(after), beforeBytes: before });
  }
  if (failures.length === 0) { verifySemantics(failures); verifyEvidence(failures); }
  return { valid: failures.length === 0, failures, approvedByPath, contract, contractSha256: sha256(contractBytes) };
}

function revertApprovedPhase5c3aSource(relativePath, currentBytes, verification) {
  const result = verification || verifyPhase5c3aDelta();
  if (!result.valid) return currentBytes;
  const approved = result.approvedByPath.get(normalizePath(relativePath));
  if (!approved || approved.bytes !== currentBytes.length || approved.sha256 !== sha256(currentBytes)) return currentBytes;
  return approved.beforeBytes;
}

function isApprovedPhase5c3aSourceDelta(relativePath, actualHash, actualBytes, verification) {
  const result = verification || verifyPhase5c3aDelta();
  if (!result.valid) return false;
  const approved = result.approvedByPath.get(normalizePath(relativePath));
  return Boolean(approved && approved.sha256 === actualHash && approved.bytes === actualBytes);
}

if (require.main === module) {
  const result = verifyPhase5c3aDelta();
  console.log(JSON.stringify({ status: result.valid ? "PASS" : "FAIL", ownerDecisionId: result.contract?.ownerDecisionId || null, issueIds: result.contract?.issueIds || [], sourceFileCount: result.approvedByPath.size, contractSha256: result.contractSha256 || null, failures: result.failures }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

module.exports = { contractPath, isApprovedPhase5c3aSourceDelta, revertApprovedPhase5c3aSource, verifyPhase5c3aDelta };
