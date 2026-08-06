/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { computeRuntimeSourceIdentity } = require("../runtime/runtime-source-identity.cjs");
const { verifyPhase5c2Delta } = require("./phase5c2DeltaContract.cjs");

const projectRoot = path.resolve(__dirname, "../..");
const contractPath = path.join(projectRoot, "config/accessibility/approved-phase-5c1-deltas.json");
const expectedDecisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const expectedStart = "1d74ff7a8b995a0f1461d8dd7a6731541d29eb4f";
const expectedIssues = ["A11Y-001", "A11Y-002", "A11Y-004"];
const expectedProposalHashes = {
  "A11Y-001": "11aef30ee50faf3b9c61b744bdb867dfeb1d0a8cafe3569a831f011d9cc52afe",
  "A11Y-002": "d09fd6540f400937f1b797e122e80455c3d7909a1ac80059c77cbc32b25bb61b",
  "A11Y-004": "c001c4a48c70289c2a111c1f57f78dad1fdd4f3b5e98123e7b4b4738b38718e1"
};
const expectedFiles = new Map([
  ["app.js", [585321, "e1275c4d62561002cef5cca25b1a31e5a728637e37fef8d328913caa4a73495e", 585385, "06f70a1e45320f6fc80bbfab6d0362324a2a8751ebc03fd65213d31350efa0ee"]],
  ["src/app/_lexicon/LexiconPageController.tsx", [7849, "58216c950cc0a0b00c036600209e2defa85736a11f16a4551be99a0f89d24229", 7786, "21793ab3d522fb121842d962a4cf2a8ede969da7318a14bad542388ce7edef82"]],
  ["src/app/_today/ApprovedTodayView.tsx", [18362, "566b8dbc57f84068159d067cc8f370653f001524328009e15049253faa371639", 18394, "a5d0cf4c9d2ec8a295dd5017bf64531f5b5b7d4febe66a635592b24e82478b97"]],
  ["src/app/_approved-source/approved-view-markup.generated.ts", [1730131, "c20110b92d23d6d1652e9a9d3295527fae21d845391ba8c02efa100b9236f3c0", 1729529, "a3581921ad78179b89dc7c048ba2fba52357ad9eda416d32e47cab25d827738f"]],
  ["config/runtime/canonical-runtime-manifest.json", [8366, "48c87436db2c53eddb1932c240ab3ae7a24c31c08de189298530a1b66d06a908", 8366, "120645c136037d95f0437ba5c7fc96fcf7da3423cac2c416faca0ee9a3b9d55a"]]
]);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function gitSource(relativePath) {
  return execFileSync("git", ["show", `${expectedStart}:${relativePath}`], {
    cwd: projectRoot,
    maxBuffer: 8 * 1024 * 1024
  });
}

function count(value, needle) {
  return value.split(needle).length - 1;
}

function verifySemantics(failures, currentBytesByPath = new Map()) {
  const readSource = (relativePath) => (currentBytesByPath.get(relativePath) || fs.readFileSync(path.join(projectRoot, relativePath))).toString("utf8");
  const app = readSource("app.js");
  const lexicon = readSource("src/app/_lexicon/LexiconPageController.tsx");
  const today = readSource("src/app/_today/ApprovedTodayView.tsx");
  const generated = readSource("src/app/_approved-source/approved-view-markup.generated.ts");
  const runtime = JSON.parse(readSource("config/runtime/canonical-runtime-manifest.json"));

  if (count(app, 'role="option" aria-selected="${isActive}" aria-pressed=') !== 0) failures.push("A11Y-001: static Lexicon options still expose aria-pressed.");
  if (count(app, 'role="option" aria-selected="${isActive}" aria-label=') !== 1) failures.push("A11Y-001: static Lexicon option contract changed outside the approved removal.");
  if (lexicon.includes("aria-pressed")) failures.push("A11Y-001: Next Lexicon controller still manages the unsupported attribute.");
  if (count(lexicon, 'button.setAttribute("aria-selected", String(active))') !== 1) failures.push("A11Y-001: Next Lexicon selected-state contract changed.");
  if (count(today, "inert={!active}") !== 2) failures.push("A11Y-002: Next Today must inert exactly two inactive carousel surfaces.");
  if (count(app, '? "" : " inert"') !== 1 || count(app, '${active ? "" : "inert"}') !== 1) failures.push("A11Y-002: static Today inert transitions changed.");
  if (count(app, 'class="canon-watchman-story-copy" aria-hidden="true" inert') !== 1) failures.push("A11Y-004: static hidden Canon story copy is not inert.");
  if (/role=\\?"option\\?" aria-selected=\\?"(?:true|false)\\?" aria-pressed=/.test(generated)) failures.push("A11Y-001: approved Lexicon capture still exposes aria-pressed.");
  if (count(generated, 'class=\\"canon-watchman-story-copy\\" aria-hidden=\\"true\\" inert') !== 3) failures.push("A11Y-004: approved Canon capture must inert exactly three captured hidden wrappers.");

  if (currentBytesByPath.size === 0) {
    const identity = computeRuntimeSourceIdentity({ root: projectRoot });
    if (runtime.runtimeSourceDigest !== identity.digest || runtime.nextBuildId !== identity.buildId) failures.push("Derived canonical runtime identity is stale.");
  }
  if (runtime.nextBuildId !== "teoyube-9bb3f8b63a7e671b613cbf7f") failures.push("Derived build identity differs from the exact approved Phase 5C-1 value.");
}

function verifyPhase5c1Delta(options = {}) {
  const failures = [];
  const currentBytesByPath = options.currentBytesByPath || new Map();
  if (currentBytesByPath.size === 0 && options.includeLaterDelta !== false) {
    const phase5c2Delta = verifyPhase5c2Delta();
    if (phase5c2Delta.valid) {
      for (const [relativePath, approved] of phase5c2Delta.approvedByPath) currentBytesByPath.set(relativePath, approved.beforeBytes);
    }
  }
  if (!fs.existsSync(contractPath)) return { valid: false, failures: ["Phase 5C-1 delta contract is missing."], approvedByPath: new Map() };
  const contractBytes = fs.readFileSync(contractPath);
  const contract = JSON.parse(contractBytes.toString("utf8"));
  if (contract.phase !== "5C-1" || contract.batch !== "critical-and-fail-closed") failures.push("Phase or batch changed.");
  if (contract.ownerDecisionId !== expectedDecisionId || contract.startingCommit !== expectedStart) failures.push("Owner decision or starting commit changed.");
  if (JSON.stringify(contract.issueIds) !== JSON.stringify(expectedIssues)) failures.push("Approved issue inventory changed.");
  if (JSON.stringify(contract.proposalHashes) !== JSON.stringify(expectedProposalHashes)) failures.push("Proposal-hash binding changed.");
  const constraints = contract.constraints || {};
  for (const key of ["attributeOnly"]) if (constraints[key] !== true) failures.push(`${key} constraint changed.`);
  for (const key of ["visibleCopyChanged", "cssChanged", "classOrIdChanged", "assetChanged", "baselineChanged", "phase5c2Started", "phase5c3Started"]) if (constraints[key] !== false) failures.push(`${key} must remain false.`);
  if (constraints.manualEvidenceExecuted !== 0) failures.push("Manual evidence must remain unexecuted in Phase 5C-1.");

  const approvedByPath = new Map();
  const records = contract.sourceFiles || [];
  if (records.length !== expectedFiles.size || new Set(records.map((record) => normalizePath(record.path))).size !== expectedFiles.size) failures.push("Source-file inventory changed.");
  for (const record of records) {
    const relativePath = normalizePath(record.path || "");
    const expected = expectedFiles.get(relativePath);
    if (!expected) {
      failures.push(`${relativePath}: file is outside the approved Phase 5C-1 scope.`);
      continue;
    }
    if ([record.beforeBytes, record.beforeSha256, record.afterBytes, record.afterSha256].some((value, index) => value !== expected[index])) failures.push(`${relativePath}: hard-bound byte contract changed.`);
    let before;
    try {
      before = gitSource(relativePath);
    } catch (error) {
      failures.push(`${relativePath}: cannot read starting source (${error.message}).`);
      continue;
    }
    const absolutePath = path.resolve(projectRoot, relativePath);
    if (!absolutePath.startsWith(`${projectRoot}${path.sep}`) || !fs.existsSync(absolutePath)) {
      failures.push(`${relativePath}: current source is missing or unsafe.`);
      continue;
    }
    const after = currentBytesByPath.get(relativePath) || fs.readFileSync(absolutePath);
    if (before.length !== expected[0] || sha256(before) !== expected[1]) failures.push(`${relativePath}: starting bytes differ from the authorized commit.`);
    if (after.length !== expected[2] || sha256(after) !== expected[3]) failures.push(`${relativePath}: current bytes differ from the exact approved remediation.`);
    approvedByPath.set(relativePath, { bytes: after.length, sha256: sha256(after), beforeBytes: before });
  }
  for (const relativePath of expectedFiles.keys()) if (!records.some((record) => normalizePath(record.path) === relativePath)) failures.push(`${relativePath}: approved source binding is missing.`);
  if (failures.length === 0) verifySemantics(failures, currentBytesByPath);
  return { valid: failures.length === 0, failures, approvedByPath, contract, contractSha256: sha256(contractBytes) };
}

function revertApprovedPhase5c1Source(relativePath, currentBytes, verification) {
  const result = verification || verifyPhase5c1Delta();
  if (!result.valid) return currentBytes;
  const approved = result.approvedByPath.get(normalizePath(relativePath));
  if (!approved || approved.bytes !== currentBytes.length || approved.sha256 !== sha256(currentBytes)) return currentBytes;
  return approved.beforeBytes;
}

function isApprovedPhase5c1SourceDelta(relativePath, actualHash, actualBytes, verification) {
  const result = verification || verifyPhase5c1Delta();
  if (!result.valid) return false;
  const approved = result.approvedByPath.get(normalizePath(relativePath));
  return Boolean(approved && approved.sha256 === actualHash && approved.bytes === actualBytes);
}

if (require.main === module) {
  const result = verifyPhase5c1Delta();
  console.log(JSON.stringify({
    status: result.valid ? "PASS" : "FAIL",
    ownerDecisionId: result.contract?.ownerDecisionId || null,
    issueIds: result.contract?.issueIds || [],
    sourceFileCount: result.approvedByPath.size,
    contractSha256: result.contractSha256 || null,
    failures: result.failures
  }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

module.exports = {
  contractPath,
  isApprovedPhase5c1SourceDelta,
  revertApprovedPhase5c1Source,
  verifyPhase5c1Delta
};
