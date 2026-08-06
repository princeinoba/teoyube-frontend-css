#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const command = process.argv[2] || "verify";
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001";
const priorDecisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const startingCommit = "8f01138907a9c76439bd725662097bb6106dea52";
const prePhaseTag = "teoyube-9of10-phase5c3a-start-8f01138";
const proposalHash = "e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717";
const issueId = "A11Y-007";
const authorizedSelectors = [
  "#promiseCarouselDots button[data-slide-index]",
  ".featured-story-dots button[data-featured-story-index]",
  "#book .book-toolbar .phase116-chip-row button.phase116-chip",
  "#phase115BookMemory .phase115-memory-filters button",
  ".canon-watchman-story-card .canon-watchman-video-dots button[data-watchman-video-index]",
  ".tab-list button.tab"
];
const paths = {
  request: "docs/accessibility/owner-review/requests/A11Y-007.json",
  splitDecision: `docs/owner-approvals/accessibility/${decisionId}.json`,
  priorDecision: `docs/owner-approvals/accessibility/${priorDecisionId}.json`,
  ownerLedger: "docs/accessibility/owner-review/phase-5b-owner-decisions.json",
  batches: "docs/accessibility/phase-5c-proposed-batches.json",
  narrowManifest: "docs/accessibility/phase-5c3a-batch-manifest.json",
  issueRegister: "docs/accessibility/accessibility-issue-register.json",
  priorScope: "docs/accessibility/phase-5c3-approved-scope.json",
  priorCharacterization: "docs/accessibility/phase-5c3-before-characterization.json",
  priorReport: "docs/recovery/9of10-phase-5c3-medium-accessibility-report.json",
  program: "docs/recovery/9of10-program-status.json"
};
const protectedContracts = [
  "tests/visual/contracts/protected-visual-source-manifest.json",
  "tests/visual/contracts/static-dom-contract.json",
  "tests/visual/contracts/original-static-visual-contract.json",
  "tests/visual/baselines/static-runtime/manifest.json",
  "tests/visual/baselines/owner-approved-next-support/manifest.json"
];

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), "utf8"));
const write = (file, value) => {
  const target = abs(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  fs.writeFileSync(target, `${text.trimEnd()}\n`, "utf8");
};
const stable = (value) => Array.isArray(value) ? value.map(stable) : value && typeof value === "object"
  ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])) : value;
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const hashObject = (value) => sha256(JSON.stringify(stable(value)));
const proposalBinding = (request) => ({
  issueEvidence: request.phase5aEvidence,
  proposedAction: request.proposedAction,
  affectedFiles: request.proposedFiles,
  protectedContracts: request.protectedContractsAffected,
  testPlan: request.tests,
  rollback: request.rollback
});
const identity = (file) => {
  const bytes = fs.readFileSync(abs(file));
  return { path: file, bytes: bytes.length, sha256: sha256(bytes) };
};

function validateInputs() {
  const errors = [];
  const request = readJson(paths.request);
  const split = readJson(paths.splitDecision);
  const prior = readJson(paths.priorDecision);
  const ledger = readJson(paths.ownerLedger);
  const batches = readJson(paths.batches);
  const narrow = readJson(paths.narrowManifest);
  const issueRegister = readJson(paths.issueRegister);
  const program = readJson(paths.program);
  const decision = ledger.decisions.find((entry) => entry.id === issueId);
  const issue = issueRegister.issues.find((entry) => entry.id === issueId);
  const batch = batches.batches.find((entry) => entry.batchId === "5C-3A");
  const phase5 = program.phases.find((entry) => entry.phaseId === "5");
  const status = (id) => phase5?.subphases?.find((entry) => entry.subphaseId === id)?.status;
  const recomputed = hashObject(proposalBinding(request));
  if (request.issueId !== issueId || request.ownerDecision !== "APPROVE_RECOMMENDED_PHASE5C_FIX") errors.push("A11Y-007 request is not approved.");
  if (request.proposalHash !== proposalHash || recomputed !== proposalHash || decision?.proposalHash !== proposalHash || issue?.proposalHash !== proposalHash) errors.push("A11Y-007 proposal hash mismatch.");
  if (split.decisionId !== decisionId || split.decisions.find((entry) => entry.issueId === issueId)?.status !== "APPROVED_FOR_PHASE_5C_3A") errors.push("Split owner decision mismatch.");
  if (prior.decisionId !== priorDecisionId) errors.push("Prior owner decision mismatch.");
  if (JSON.stringify(batch?.issueIds) !== JSON.stringify([issueId]) || batch?.status !== "READY_NOT_STARTED" || batch?.started !== false) errors.push("Phase 5C-3A is not A11Y-007-only and ready/not-started.");
  if (!batch?.excludedIssueIds?.includes("A11Y-008") || !narrow.excludedIssueIds.includes("A11Y-008")) errors.push("A11Y-008 is not excluded.");
  if (status("5C-1") !== "PASS" || status("5C-2") !== "PASS" || status("5C-3A") !== "READY_NOT_STARTED") errors.push("Prior batches or Phase 5C-3A status mismatch.");
  if (JSON.stringify(request.proposedFiles) !== JSON.stringify(narrow.request.affectedFiles)) errors.push("Authorized file list mismatch.");
  if (request.expectedDomImpact !== "none" || request.expectedPixelImpact !== "possible" || !request.tests.length || !request.rollback) errors.push("Expected impact/tests/rollback mismatch.");
  for (const file of [...Object.values(paths), ...request.proposedFiles, ...protectedContracts]) if (!fs.existsSync(abs(file))) errors.push(`Missing required path: ${file}`);
  if (errors.length) throw new Error(errors.join("\n"));
  return { request, split, prior, narrow };
}

function lock() {
  const data = validateInputs();
  const generatedAt = new Date().toISOString();
  const approvedBatch = {
    schemaVersion: 1,
    generatedAt,
    status: "LOCKED_BEFORE_SOURCE_CHANGES",
    batchId: "5C-3A",
    started: false,
    ownerDecisionIds: [priorDecisionId, decisionId],
    issueIds: [issueId],
    excludedIssueIds: ["A11Y-008"],
    proposalHashes: { [issueId]: proposalHash },
    sourceManifest: paths.narrowManifest
  };
  write("docs/accessibility/phase-5c3a-approved-batch.json", approvedBatch);
  write("docs/accessibility/phase-5c3a-approved-batch.md", `# Phase 5C-3A approved batch\n\n- Status: **LOCKED BEFORE SOURCE CHANGES**\n- Issue: **A11Y-007 only**\n- Proposal hash: \`${proposalHash}\`\n- A11Y-008: **EXCLUDED**\n- Manual evidence tasks: **EXCLUDED**\n- Phase 6A and every other phase: **EXCLUDED**\n`);

  const scope = {
    schemaVersion: 1,
    generatedAt,
    status: "LOCKED_BEFORE_SOURCE_CHANGES",
    batch: "5C-3A",
    ownerDecisionIds: [priorDecisionId, decisionId],
    issue: {
      issueId,
      proposalHash,
      decision: "APPROVE_RECOMMENDED_PHASE5C_FIX",
      proposedAction: data.request.proposedAction,
      files: data.request.proposedFiles,
      selectors: authorizedSelectors,
      routes: data.request.affectedRoutes,
      states: data.request.affectedStates,
      viewports: data.request.affectedViewports,
      expectedPixelImpact: data.request.expectedPixelImpact,
      expectedCssImpact: "Selector-scoped minimum 24 by 24 CSS-pixel target geometry or approved spacing exception only.",
      expectedDomImpact: data.request.expectedDomImpact,
      expectedBehaviorImpact: data.request.expectedBehaviorImpact,
      tests: data.request.tests,
      rollback: data.request.rollback
    },
    protectedContracts,
    exclusions: ["A11Y-008", "manual accessibility evidence tasks", "Phase 6A", "Phase 4D", "baseline replacement", "unlisted issues"],
    invariants: { controlsRemoved: 0, visibleCopyChanges: 0, classIdChanges: 0, assetChanges: 0, baselineWrites: 0 }
  };
  write("docs/accessibility/phase-5c3a-approved-scope.json", scope);
  write("docs/accessibility/phase-5c3a-approved-scope.md", `# Phase 5C-3A approved accessibility scope\n\n- Status: **LOCKED BEFORE SOURCE CHANGES**\n- Owner decisions: \`${priorDecisionId}\`, \`${decisionId}\`\n- Issue: **A11Y-007 only**\n- Proposal hash: \`${proposalHash}\`\n- Authorized files: ${data.request.proposedFiles.map((file) => `\`${file}\``).join(", ")}\n- Routes: ${data.request.affectedRoutes.join(", ")}\n- States: ${data.request.affectedStates.join(", ")}\n- Viewports: ${data.request.affectedViewports.join(", ")}\n- Expected pixel impact: **possible**, within the six recorded selectors only\n- Expected DOM impact: **none**\n- Behavior: ${data.request.expectedBehaviorImpact}\n- A11Y-008 and all manual tasks: **EXCLUDED**\n- Rollback: ${data.request.rollback}\n`);

  const startingManifest = {
    schemaVersion: 1,
    generatedAt,
    phase: "5C-3A",
    status: "LOCKED_BEFORE_SOURCE_CHANGES",
    branch: "recovery/visual-source-of-truth",
    startingCommit,
    prePhaseTag,
    ownerDecisionIds: [priorDecisionId, decisionId],
    issueIds: [issueId],
    proposalHashes: { [issueId]: proposalHash },
    authorizedFiles: data.request.proposedFiles.map(identity),
    protectedContracts: protectedContracts.map(identity),
    requiredEvidence: [paths.priorCharacterization, paths.priorReport].map(identity),
    exclusions: scope.exclusions,
    invariants: { a11y008ProductChanges: 0, manualTasksCompleted: 0, baselineWrites: 0, paidCalls: 0 }
  };
  write("docs/accessibility/phase-5c3a-starting-manifest.json", startingManifest);
  console.log(JSON.stringify({ status: "PASS", batch: "5C-3A", issueIds: [issueId], proposalHash, deliverables: ["phase-5c3a-approved-batch", "phase-5c3a-approved-scope", "phase-5c3a-starting-manifest"] }, null, 2));
}

function verify() {
  validateInputs();
  const approved = readJson("docs/accessibility/phase-5c3a-approved-batch.json");
  const scope = readJson("docs/accessibility/phase-5c3a-approved-scope.json");
  const manifest = readJson("docs/accessibility/phase-5c3a-starting-manifest.json");
  const errors = [];
  if (approved.status !== "LOCKED_BEFORE_SOURCE_CHANGES" || JSON.stringify(approved.issueIds) !== JSON.stringify([issueId])) errors.push("Approved-batch mismatch.");
  if (scope.issue.proposalHash !== proposalHash || JSON.stringify(scope.issue.selectors) !== JSON.stringify(authorizedSelectors)) errors.push("Approved scope mismatch.");
  if (manifest.startingCommit !== startingCommit || manifest.prePhaseTag !== prePhaseTag || manifest.proposalHashes[issueId] !== proposalHash) errors.push("Starting manifest mismatch.");
  for (const item of manifest.protectedContracts) if (identity(item.path).sha256 !== item.sha256) errors.push(`Protected contract changed: ${item.path}`);
  console.log(JSON.stringify({ status: errors.length ? "FAIL" : "PASS", batch: "5C-3A", issueIds: [issueId], proposalHash: errors.length ? "FAIL" : "PASS", errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

if (command === "lock") lock();
else if (command === "verify") verify();
else throw new Error("Usage: node scripts/accessibility/prepare-phase5c3a.cjs [lock|verify]");
