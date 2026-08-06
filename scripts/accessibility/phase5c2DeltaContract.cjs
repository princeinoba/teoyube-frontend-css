/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { computeRuntimeSourceIdentity } = require("../runtime/runtime-source-identity.cjs");

const projectRoot = path.resolve(__dirname, "../..");
const contractPath = path.join(projectRoot, "config/accessibility/approved-phase-5c2-deltas.json");
const expectedDecisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const expectedStart = "621aac4d70858c823e44b1f5df6f43688c68f451";
const expectedIssues = ["A11Y-003", "A11Y-005", "A11Y-006"];
const expectedProposalHashes = {
  "A11Y-003": "512755ac81b5cf4961c9c548a8a7eea12c7677564762635d589d26de1656a1ca",
  "A11Y-005": "048ab643249f468aedd9d9db15205a762d2789c40ddd2936ccbd763ede2ac5ce",
  "A11Y-006": "0ba9a5fb8e12da2e3f26176e168ee3255d64d0033b9467ac6ff35fb48bde0a61"
};
const expectedAriaLabels = ["Search Teoyube tables", "Search embedded videos", "Search the Teoyube Lexicon", "Testimony milestones"];
const expectedFiles = new Map([
  ["app.js", [585385, "06f70a1e45320f6fc80bbfab6d0362324a2a8751ebc03fd65213d31350efa0ee", 590833, "c3b3f5d4e20a4a60dfd3bae9c9aa3949cf6fc2fbf6d8f4b352249fca079c778c"]],
  ["index.html", [92485, "44be7b485457a22e6c39407861c34c57300bc6d25733c342207c77f5edc787d8", 92657, "f7a603ffb41fd0beee496861d4ec969900990127e2cc5f0e451d091c2d2b649b"]],
  ["src/app/_approved-source/approved-view-markup.generated.ts", [1729529, "a3581921ad78179b89dc7c048ba2fba52357ad9eda416d32e47cab25d827738f", 1729824, "13abe4ad215849108a0ff31a9551362146cf17bd58a5ef7cc912e8df29653bb7"]],
  ["src/app/_canon/CanonPageController.tsx", [12429, "5071668deea958e12498206ba81bbab9e92a9b9ac2710548e57c51fa85cfc844", 12429, "5071668deea958e12498206ba81bbab9e92a9b9ac2710548e57c51fa85cfc844"]],
  ["src/features/scripture/canon-youtube.ts", [5166, "a5c054df3e5f6daa4972ab8f5b4403d690bec346d5a44b143395fc6d5b4b7973", 5166, "a5c054df3e5f6daa4972ab8f5b4403d690bec346d5a44b143395fc6d5b4b7973"]],
  ["config/runtime/canonical-runtime-manifest.json", [8366, "120645c136037d95f0437ba5c7fc96fcf7da3423cac2c416faca0ee9a3b9d55a", 8366, "23adaae0c5f44a7396934e359e09a16012d12a2e0dbc6a778c60aedc3cbd0825"]]
]);

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizePath = (value) => value.replaceAll("\\", "/");
const count = (value, needle) => value.split(needle).length - 1;
const gitSource = (relativePath) => execFileSync("git", ["show", `${expectedStart}:${relativePath}`], { cwd: projectRoot, maxBuffer: 8 * 1024 * 1024 });

function verifySemantics(failures) {
  const app = fs.readFileSync(path.join(projectRoot, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const generated = fs.readFileSync(path.join(projectRoot, "src/app/_approved-source/approved-view-markup.generated.ts"), "utf8");
  const canon = fs.readFileSync(path.join(projectRoot, "src/app/_canon/CanonPageController.tsx"), "utf8");
  const media = fs.readFileSync(path.join(projectRoot, "src/features/scripture/canon-youtube.ts"), "utf8");
  const runtime = JSON.parse(fs.readFileSync(path.join(projectRoot, "config/runtime/canonical-runtime-manifest.json"), "utf8"));

  if (count(app, '"canon-map-D02": "local-rooted-in-truth"') !== 1 || count(app, '"canon-map-D12": "local-daily-assignment"') !== 1) failures.push("A11Y-003: static Canon media mapping changed.");
  if (count(app, 'stage.setAttribute("role", "button")') !== 1 || count(app, 'stage.setAttribute("tabindex", "0")') !== 1 || count(app, 'stage.setAttribute("aria-pressed", "false")') !== 1) failures.push("A11Y-003: static Canon name/role/state configuration is incomplete.");
  if (count(app, 'handleStaticCanonMediaActivation(event)') !== 5 || !app.includes('event.key !== "Enter" && event.key !== " "')) failures.push("A11Y-003: click, Enter, and Space activation wiring changed.");
  if (count(canon, 'root.querySelectorAll<HTMLElement>(".canon-project-media, .canon-recent-media")') !== 1 || count(canon, 'stage.setAttribute("role", "button")') !== 1 || count(canon, 'stage.setAttribute("tabindex", "0")') !== 1) failures.push("A11Y-003: existing Next Canon controls were not preserved.");
  if (count(media, '"canon-map-D') !== 11) failures.push("A11Y-003: Next Canon must retain exactly 11 verified mappings.");

  const names = [
    ['id="lexiconSearchInput"', 'aria-label="Search the Teoyube Lexicon"'],
    ['id="uiVideoSearch"', 'aria-label="Search embedded videos"'],
    ['id="teoyubeTableSearch"', 'aria-label="Search Teoyube tables"']
  ];
  for (const [id, label] of names) if (!html.includes(id) || !html.includes(label) || !generated.includes(label.replaceAll('"', '\\"'))) failures.push(`A11Y-005: missing durable name for ${id}.`);
  const milestone = 'class="testimony-milestones" tabindex="0" role="region" aria-label="Testimony milestones"';
  if (count(html, milestone) !== 1 || count(generated, milestone.replaceAll('"', '\\"')) !== 1) failures.push("A11Y-006: testimony milestones focusable region contract changed.");

  const identity = computeRuntimeSourceIdentity({ root: projectRoot });
  if (runtime.runtimeSourceDigest !== identity.digest || runtime.nextBuildId !== identity.buildId) failures.push("Derived canonical runtime identity is stale.");
  if (runtime.nextBuildId !== "teoyube-f092197a8ef278a541125617") failures.push("Derived build identity differs from the exact Phase 5C-2 value.");
}

function verifyPhase5c2Delta() {
  const failures = [];
  if (!fs.existsSync(contractPath)) return { valid: false, failures: ["Phase 5C-2 delta contract is missing."], approvedByPath: new Map() };
  const contractBytes = fs.readFileSync(contractPath);
  const contract = JSON.parse(contractBytes.toString("utf8"));
  if (contract.phase !== "5C-2" || contract.batch !== "high-severity-keyboard-focus-name-role-state") failures.push("Phase or batch changed.");
  if (contract.ownerDecisionId !== expectedDecisionId || contract.startingCommit !== expectedStart) failures.push("Owner decision or starting commit changed.");
  if (JSON.stringify(contract.issueIds) !== JSON.stringify(expectedIssues)) failures.push("Approved issue inventory changed.");
  if (JSON.stringify(contract.proposalHashes) !== JSON.stringify(expectedProposalHashes)) failures.push("Proposal-hash binding changed.");
  if (JSON.stringify(contract.allowedAriaLabels) !== JSON.stringify(expectedAriaLabels)) failures.push("Approved ARIA-label inventory changed.");
  const constraints = contract.constraints || {};
  if (constraints.behaviorParityOnly !== true || constraints.nextCanonControlsPreserved !== 11 || constraints.staticCanonControlsAdded !== 11) failures.push("Approved behavior-parity constraints changed.");
  for (const key of ["visibleCopyChanged", "cssChanged", "classOrIdChanged", "assetChanged", "baselineChanged", "phase5c3Started"]) if (constraints[key] !== false) failures.push(`${key} must remain false.`);
  if (constraints.manualEvidenceExecuted !== 0) failures.push("Manual evidence must remain unexecuted in Phase 5C-2.");

  const approvedByPath = new Map();
  const records = contract.sourceFiles || [];
  if (records.length !== expectedFiles.size || new Set(records.map((record) => normalizePath(record.path))).size !== expectedFiles.size) failures.push("Source-file inventory changed.");
  for (const record of records) {
    const relativePath = normalizePath(record.path || "");
    const expected = expectedFiles.get(relativePath);
    if (!expected) { failures.push(`${relativePath}: file is outside the approved Phase 5C-2 scope.`); continue; }
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
  if (failures.length === 0) verifySemantics(failures);
  return { valid: failures.length === 0, failures, approvedByPath, contract, contractSha256: sha256(contractBytes) };
}

function revertApprovedPhase5c2Source(relativePath, currentBytes, verification) {
  const result = verification || verifyPhase5c2Delta();
  if (!result.valid) return currentBytes;
  const approved = result.approvedByPath.get(normalizePath(relativePath));
  if (!approved || approved.bytes !== currentBytes.length || approved.sha256 !== sha256(currentBytes)) return currentBytes;
  return approved.beforeBytes;
}

function isApprovedPhase5c2SourceDelta(relativePath, actualHash, actualBytes, verification) {
  const result = verification || verifyPhase5c2Delta();
  if (!result.valid) return false;
  const approved = result.approvedByPath.get(normalizePath(relativePath));
  return Boolean(approved && approved.sha256 === actualHash && approved.bytes === actualBytes);
}

if (require.main === module) {
  const result = verifyPhase5c2Delta();
  console.log(JSON.stringify({ status: result.valid ? "PASS" : "FAIL", ownerDecisionId: result.contract?.ownerDecisionId || null, issueIds: result.contract?.issueIds || [], sourceFileCount: result.approvedByPath.size, contractSha256: result.contractSha256 || null, failures: result.failures }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

module.exports = { contractPath, isApprovedPhase5c2SourceDelta, revertApprovedPhase5c2Source, verifyPhase5c2Delta };
