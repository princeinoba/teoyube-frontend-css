#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const generatedAt = new Date().toISOString();
const finalCommitPlaceholder = "FINAL_PHASE5B_REVIEW_COMMIT_REPORTED_IN_FINAL_HANDOFF";
const startingCommit = "0a98a0ba498315442823dc5469074cd2d8d3ed10";

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function write(relativePath, value) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  fs.writeFileSync(absolute(relativePath), text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

function sha256(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absolute(relativePath))).digest("hex");
}

function identity(relativePath) {
  return { path: relativePath, sha256: sha256(relativePath) };
}

function replaceExact(text, before, after, label) {
  const count = text.split(before).length - 1;
  if (count === 1) return text.replace(before, after);
  const updatedCount = text.split(after).length - 1;
  if (count === 0 && updatedCount === 1) return text;
  throw new Error(`${label}: expected one original or updated exact match, found ${count}/${updatedCount}`);
}

function appendSection(text, heading, section) {
  if (text.includes(heading)) return text;
  return `${text.trimEnd()}\n\n${section.trim()}\n`;
}

const decisionLedgerPath = "docs/accessibility/owner-review/phase-5b-owner-decisions.json";
const decisionLedger = readJson(decisionLedgerPath);
const decisionIds = decisionLedger.decisions.map((entry) => entry.id);
const issueIds = decisionLedger.decisions.filter((entry) => entry.kind === "issue").map((entry) => entry.id);
const taskIds = decisionLedger.decisions.filter((entry) => entry.kind === "manual_task").map((entry) => entry.id);

if (decisionIds.length !== 20 || issueIds.length !== 11 || taskIds.length !== 9) {
  throw new Error("Phase 5B decision counts do not match 11 issues plus 9 manual tasks");
}
if (decisionLedger.decisions.some((entry) => entry.decision !== "PENDING")) {
  throw new Error("Phase 5B ledger updater may run only while every decision is PENDING");
}

const programPath = "docs/recovery/9of10-program-status.json";
const program = readJson(programPath);
const phase5 = program.phases.find((phase) => phase.phaseId === "5");
if (!phase5) throw new Error("Phase 5 program record is missing");

program.currentCommit = finalCommitPlaceholder;
phase5.currentCommit = finalCommitPlaceholder;
phase5.deliverables = [
  "current accessibility audit: COMPLETE",
  "issue-specific owner-review package: COMPLETE_WAITING_OWNER",
  "approved fixes: NOT_STARTED"
];
phase5.currentEvidence = [
  "311 current audit cells across 23 routes and six protected viewports; zero harness errors",
  "11 registered findings: 1 critical, 8 high, 2 medium",
  "8 confirmed product/accessibility or parity issues and 3 manual evidence gaps",
  "11 issue-specific hash-bound requests and 9 hash-bound manual tasks; all 20 decisions pending",
  "dedicated Canon focus decision and three proposed Phase 5C batches; Phase 5C not started",
  "72 immutable screenshots and 12 desktop DOM snapshots unchanged",
  "no WCAG conformance claim; real assistive-technology output remains unproved"
];
phase5.currentBlockers = [
  "All critical/high issue decisions remain pending owner review",
  "All manual-evidence task decisions remain pending owner review",
  "protected DOM, attribute, copy, layout, or visible fixes require matching proposal-hash owner approval",
  "manual assistive-technology, contrast, focus-obscuration, physical-device, and external-media evidence remains",
  "inherited release accessibility aggregator has no current 216-cell controller input"
];
phase5.ownerDecisionIds = decisionIds.map((id) => `PENDING:${id}`);
phase5.nextReviewTrigger = "Owner returns one allowed, issue-specific decision per A11Y issue and manual-task ID; a blanket approval is invalid and does not start Phase 5C";
for (const subphase of phase5.subphases) {
  if (subphase.subphaseId === "5B") subphase.status = "WAITING_OWNER";
  if (subphase.subphaseId === "5C") subphase.status = "NOT_READY";
}
program.nextReadyPhase = "6A";
program.otherReadyIndependentSubphases = ["6A"];
program.nextWaitingPhase = "PHASE5B_WAITING_OWNER_PHASE4_WAITING_OWNER_SESSION_DATA_PHASE3_WAITING_OWNER_PHASE2A_BLOCKED";
write(programPath, program);

const evidencePath = "docs/recovery/9of10-evidence-ledger.json";
const evidence = readJson(evidencePath);
const artifactPaths = [
  "docs/accessibility/phase-5b-starting-manifest.json",
  "docs/accessibility/owner-review/phase-5b-owner-review-package.json",
  "docs/accessibility/owner-review/phase-5b-owner-decisions.json",
  "docs/accessibility/owner-review/canon-focus-owner-decision.json",
  "docs/accessibility/owner-review/manual-evidence-plan.json",
  "docs/accessibility/phase-5c-proposed-batches.json",
  "docs/recovery/9of10-phase-5b-accessibility-owner-review-report.json"
];
const phase5bEvidence = {
  phase: "5B",
  status: "WAITING_OWNER",
  executedAt: generatedAt,
  startingCommit,
  prePhaseTag: "teoyube-9of10-phase5b-start-0a98a0b",
  finalCommit: finalCommitPlaceholder,
  sourceIssueCount: 11,
  confirmedIssues: 8,
  manualEvidenceGaps: 3,
  severity: { critical: 1, high: 8, medium: 2, low: 0 },
  issueReviewRequests: 11,
  manualTasks: 9,
  proposalHashes: 20,
  ownerDecisions: "ALL_PENDING",
  canonDecision: "PENDING",
  proposedImplementationBatches: 3,
  phase5c: "NOT_READY_NOT_STARTED",
  conformanceClaim: false,
  productFixes: 0,
  productSourceFilesChanged: 0,
  protectedVisualFilesChanged: 0,
  cssFilesChanged: 0,
  domClassAriaTabindexChanges: 0,
  assetFilesChanged: 0,
  baselineFilesChanged: 0,
  packageLockFilesChanged: 0,
  paidCalls: 0,
  artifacts: artifactPaths.map(identity)
};
const phase5bIndex = evidence.phaseUpdates.findIndex((entry) => entry.phase === "5B");
if (phase5bIndex === -1) evidence.phaseUpdates.push(phase5bEvidence);
else evidence.phaseUpdates[phase5bIndex] = phase5bEvidence;
evidence.generatedAt = generatedAt;
evidence.workspaceAfterPhase5b = {
  recordedAt: generatedAt,
  head: finalCommitPlaceholder,
  productSourceFilesChanged: 0,
  protectedVisualFilesChanged: 0,
  immutableBaselineFilesChanged: 0,
  ownerApprovedBaselineFilesChanged: 0,
  packageJsonChanged: false,
  packageLockFilesChanged: 0,
  paidCalls: 0,
  phase2a: "BLOCKED",
  phase3: "WAITING_OWNER",
  phase4: "WAITING_OWNER_SESSION_DATA",
  phase5a: "PASS",
  phase5b: "WAITING_OWNER",
  phase5c: "NOT_READY",
  phase5Overall: "IN_PROGRESS",
  program: "IN_PROGRESS"
};
write(evidencePath, evidence);

const ownerPath = "docs/recovery/9of10-owner-decisions.json";
const owner = readJson(ownerPath);
owner.updatedAt = generatedAt;
const groupIndex = owner.pendingDecisionGroups.findIndex((entry) => entry.phase === "5B");
const phase5bGroup = {
  phase: "5B",
  status: "WAITING_OWNER",
  decision: "11 issue decisions and 9 manual-task decisions, each bound to its current proposal hash",
  source: decisionLedgerPath,
  issueIds,
  manualTaskIds: taskIds,
  allowedValues: decisionLedger.allowedDecisions,
  restrictions: [
    "one decision line per ID",
    "no blanket approval",
    "approval must bind the current proposal hash",
    "approval does not start Phase 5C or update baselines"
  ]
};
if (groupIndex === -1) owner.pendingDecisionGroups.push(phase5bGroup);
else owner.pendingDecisionGroups[groupIndex] = phase5bGroup;
write(ownerPath, owner);

const statusMdPath = "docs/recovery/9of10-program-status.md";
let statusMd = read(statusMdPath);
statusMd = replaceExact(
  statusMd,
  "| 5 - Accessibility remediation | **IN_PROGRESS** | Phase 5A audit PASS; Phase 5B READY but not started or authorized. |",
  "| 5 - Accessibility remediation | **IN_PROGRESS** | Phase 5A audit PASS; Phase 5B review package complete and WAITING_OWNER; all 20 issue/task decisions pending; Phase 5C NOT READY. |",
  "program status phase 5 row"
);
statusMd = replaceExact(
  statusMd,
  "Phase 3A is **PASS** and Phase 3B is **NOT READY**. Phase 2B remains locked until Phase 2A composite gates pass. Phase 4A, Phase 4B, and Phase 4C are **PASS**. Phase 4 overall is **WAITING_OWNER_SESSION_DATA** and Phase 4D is **NOT READY**. Independent next-ready engineering choices are **5A or 6A**; neither was executed.",
  "Phase 3A is **PASS** and Phase 3B is **NOT READY**. Phase 2B remains locked until Phase 2A composite gates pass. Phase 4A, Phase 4B, and Phase 4C are **PASS**. Phase 4 overall is **WAITING_OWNER_SESSION_DATA** and Phase 4D is **NOT READY**. Phase 5A is **PASS**; Phase 5B is **WAITING_OWNER**; Phase 5C is **NOT READY**. Phase 6A remains independently **READY** and was not executed.",
  "program status summary"
);
statusMd = replaceExact(
  statusMd,
  "Phase 5 is **IN_PROGRESS**. Phase 5B is **READY but not started or authorized**. Phase 2A remains **BLOCKED**, Phase 3 remains **WAITING_OWNER**, and Phase 4 remains **WAITING_OWNER_SESSION_DATA**. No protected visual source, CSS, DOM/class/ARIA production code, asset, baseline, package, or lockfile changed.",
  "Phase 5 is **IN_PROGRESS**. Phase 5B is **WAITING_OWNER** with 11 hash-bound issue requests and 9 hash-bound manual tasks; every decision remains pending. Phase 5C is **NOT READY** and no fix was implemented. Phase 2A remains **BLOCKED**, Phase 3 remains **WAITING_OWNER**, and Phase 4 remains **WAITING_OWNER_SESSION_DATA**. No protected visual source, CSS, DOM/class/ARIA production code, asset, baseline, package, or lockfile changed.",
  "program status Phase 5B narrative"
);
write(statusMdPath, statusMd);

const evidenceMdPath = "docs/recovery/9of10-evidence-ledger.md";
let evidenceMd = read(evidenceMdPath);
evidenceMd = appendSection(evidenceMd, "## Phase 5B update", `## Phase 5B update

| Evidence | Current Phase 5B identity/result |
| --- | --- |
| Starting commit/tag | \`${startingCommit}\`; \`teoyube-9of10-phase5b-start-0a98a0b\` |
| Review requests | 11 issue-specific Markdown/JSON pairs; all owner decisions PENDING |
| Manual evidence | 9 executable tasks covering all 3 Phase 5A manual gaps; all task decisions PENDING |
| Proposal hashes | 20 validated hashes binding evidence, scope, files, contracts, tests, and rollback |
| Canon focus decision | Dedicated decision complete; PENDING owner response |
| Proposed Phase 5C batches | 3; NOT AUTHORIZED and NOT STARTED |
| Product/protected/CSS/DOM/ARIA/assets/baselines/package/lock/paid calls | 0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 |
| Phase state | Phase 5A PASS; Phase 5B WAITING_OWNER; Phase 5C NOT READY; Phase 5 IN_PROGRESS; Program IN_PROGRESS |

Phase 2A remains BLOCKED, Phase 3 remains WAITING_OWNER, and Phase 4 remains WAITING_OWNER_SESSION_DATA. WCAG conformance is not claimed.`);
write(evidenceMdPath, evidenceMd);

const ownerMdPath = "docs/recovery/9of10-owner-decisions.md";
let ownerMd = read(ownerMdPath);
ownerMd = replaceExact(
  ownerMd,
  "- Phase 5B: each protected accessibility change by path/issue.",
  "- Phase 5B: **WAITING_OWNER** for 11 issue decisions and 9 manual-task decisions in `docs/accessibility/owner-review/phase-5b-owner-decisions.json`; each decision is proposal-hash-bound, one line per ID, and a blanket approval is invalid. Phase 5C is not authorized.",
  "owner decision Phase 5B pending group"
);
write(ownerMdPath, ownerMd);

const riskPath = "docs/recovery/9of10-risk-register.md";
let riskMd = read(riskPath);
riskMd = replaceExact(
  riskMd,
  "| 9R-06 | Accessibility conformance unproved | Phase 5A completed 311 current cells and registered 11 findings: 1 critical, 8 high, 2 medium; no conformance claim; manual and assistive-technology evidence remains | Phase 5 and Phase 2A recheck | Critical issue resolved; high issues fixed or explicitly accepted with evidence; required manual/AT evidence completed |",
  "| 9R-06 | Accessibility conformance unproved | Phase 5A completed 311 current cells and registered 11 findings; Phase 5B created 11 issue requests and 9 manual tasks, all 20 decisions pending; no fix or conformance claim | Phase 5 and Phase 2A recheck | Matching owner decisions, approved Phase 5C remediation, critical/high closure, required manual/AT evidence, and full verification |",
  "risk 9R-06"
);
write(riskPath, riskMd);

const historyPath = "docs/recovery/9of10-phase-history.md";
let historyMd = read(historyPath);
historyMd = appendSection(historyMd, "## Phase 5B - issue-specific accessibility owner review", `## Phase 5B - issue-specific accessibility owner review

Status: **WAITING_OWNER**
Started from: \`${startingCommit}\`
Pre-phase tag: \`teoyube-9of10-phase5b-start-0a98a0b\`

### Actions

1. Revalidated all 11 Phase 5A findings, their route/state/source mappings, applicable WCAG and ARIA rules, static/Next behavior, protected contracts, tests, and rollback.
2. Created 11 issue-specific Markdown/JSON owner-review requests with proposal hashes and PENDING decisions.
3. Created a dedicated Canon focus decision, 9 executable manual-evidence tasks, an owner-friendly package, a pending decision ledger, and 3 proposed Phase 5C batches.
4. Implemented no product fix and changed no product source, protected visual source, CSS, DOM/class/ARIA/tabindex, copy, asset, baseline, dependency, lockfile, runtime, research record, or paid-call behavior.

### Result

Phase 5B is **WAITING_OWNER**. All 20 issue/task decisions remain **PENDING**. Phase 5C is **NOT READY** and was not started. Phase 5 remains **IN_PROGRESS**; WCAG conformance is not claimed. Phase 2A remains **BLOCKED**, Phase 3 remains **WAITING_OWNER**, Phase 4 remains **WAITING_OWNER_SESSION_DATA**, and Phase 6A remains independently READY but was not executed.`);
write(historyPath, historyMd);

console.log(JSON.stringify({
  status: "PASS",
  program: { phase5b: "WAITING_OWNER", phase5c: "NOT_READY", nextReady: "6A" },
  decisionCounts: { issues: issueIds.length, manualTasks: taskIds.length, pending: decisionIds.length },
  preserved: { phase2a: "BLOCKED", phase3: "WAITING_OWNER", phase4: "WAITING_OWNER_SESSION_DATA" }
}, null, 2));
