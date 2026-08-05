#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const hashObject = (value) => {
  const stable = (entry) => {
    if (Array.isArray(entry)) return entry.map(stable);
    if (entry && typeof entry === "object") return Object.fromEntries(Object.keys(entry).sort().map((key) => [key, stable(entry[key])]));
    return entry;
  };
  return crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
};

const errors = [];
const viewports = new Set(["desktop-wide", "desktop-standard", "tablet-landscape", "tablet-portrait", "mobile", "mobile-small"]);
const routeMatrix = readJson("docs/accessibility/accessibility-route-state-matrix.json");
const routes = new Set(routeMatrix.routes.map((entry) => entry.route));
const phase5a = readJson("docs/accessibility/accessibility-issue-register.json");
const decisions = readJson("docs/accessibility/owner-review/phase-5b-owner-decisions.json");
const manualPlan = readJson("docs/accessibility/owner-review/manual-evidence-plan.json");
const requiredFields = ["issueId", "title", "severity", "phase5aStatus", "affectedRoutes", "affectedStates", "affectedViewports", "affectedUsers", "wcagCriteria", "normativeSources", "currentBehavior", "expectedBehavior", "staticBehavior", "nextBehavior", "parityRelationship", "fixClass", "proposedAction", "proposedFiles", "protectedContractsAffected", "expectedPixelImpact", "expectedDomImpact", "expectedBehaviorImpact", "risks", "tests", "visualEvidenceRequired", "manualAtEvidenceRequired", "rollback", "recommendation", "ownerDecision", "proposalHash"];

const issueRecords = phase5a.issues.map((source) => {
  const relativePath = `docs/accessibility/owner-review/requests/${source.id}.json`;
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`Missing issue record ${source.id}`);
    return null;
  }
  return readJson(relativePath);
}).filter(Boolean);

if (phase5a.issues.length !== 11) errors.push("Phase 5A issue count is not 11");
for (const [severity, expected] of Object.entries({ critical: 1, high: 8, medium: 2 })) {
  if (phase5a.issues.filter((issue) => issue.severity === severity).length !== expected) errors.push(`${severity} count mismatch`);
}
if (issueRecords.filter((issue) => issue.phase5aStatus === "confirmed").length !== 8) errors.push("Confirmed count mismatch");
if (issueRecords.filter((issue) => issue.phase5aStatus === "manual_evidence_gap").length !== 3) errors.push("Manual-gap count mismatch");

for (const issue of issueRecords) {
  for (const field of requiredFields) if (!(field in issue)) errors.push(`${issue.issueId} missing ${field}`);
  if (!issue.affectedRoutes.length || issue.affectedRoutes.some((route) => !routes.has(route))) errors.push(`${issue.issueId} route mismatch`);
  if (!issue.affectedStates.length) errors.push(`${issue.issueId} has no states`);
  if (!issue.affectedViewports.length || issue.affectedViewports.some((viewport) => !viewports.has(viewport))) errors.push(`${issue.issueId} viewport mismatch`);
  if (!issue.wcagCriteria.length || issue.normativeSources.some((source) => !/^https:\/\//.test(source))) errors.push(`${issue.issueId} WCAG/reference mismatch`);
  for (const relativePath of [...issue.proposedFiles, ...issue.protectedContractsAffected]) if (!fs.existsSync(path.join(root, relativePath))) errors.push(`${issue.issueId} missing path ${relativePath}`);
  const binding = { issueEvidence: issue.phase5aEvidence, proposedAction: issue.proposedAction, affectedFiles: issue.proposedFiles, protectedContracts: issue.protectedContractsAffected, testPlan: issue.tests, rollback: issue.rollback };
  if (hashObject(binding) !== issue.proposalHash) errors.push(`${issue.issueId} proposal hash mismatch`);
  const markdown = read(`docs/accessibility/owner-review/requests/${issue.issueId}.md`);
  if (!markdown.includes(issue.proposalHash) || !markdown.includes("Owner decision: **PENDING**")) errors.push(`${issue.issueId} Markdown/JSON mismatch`);
}

if (manualPlan.tasks.length !== 9) errors.push("Manual task count is not 9");
for (const gap of ["A11Y-009", "A11Y-010", "A11Y-011"]) if (!manualPlan.tasks.some((task) => task.relatedIssueIds.includes(gap))) errors.push(`Manual gap ${gap} is uncovered`);
for (const task of manualPlan.tasks) {
  if (!task.safeEvidenceFields?.length || !task.prohibitedContent?.length || !task.passFailCriteria || !task.whoMayRun || !task.productSourceMayChangeBeforeComplete || !task.blocks) errors.push(`${task.taskId} is incomplete`);
  const copy = { ...task };
  delete copy.taskHash;
  if (hashObject(copy) !== task.taskHash) errors.push(`${task.taskId} hash mismatch`);
}

if (decisions.decisions.length !== 20 || decisions.decisions.some((entry) => entry.decision !== "PENDING")) errors.push("Decision ledger must contain 20 pending entries");
if (decisions.decisions.some((entry) => !decisions.allowedDecisions.includes(entry.recommendation))) errors.push("A recommendation is outside the allowed decision vocabulary");
const proposalHashes = new Map([
  ...issueRecords.map((issue) => [issue.issueId, issue.proposalHash]),
  ...manualPlan.tasks.map((task) => [task.taskId, task.taskHash])
]);
for (const entry of decisions.decisions) if (proposalHashes.get(entry.id) !== entry.proposalHash) errors.push(`${entry.id} decision hash mismatch`);

const batchIds = readJson("docs/accessibility/phase-5c-proposed-batches.json").batches.flatMap((batch) => batch.issueIds);
const confirmedIds = issueRecords.filter((issue) => issue.phase5aStatus === "confirmed").map((issue) => issue.issueId).sort();
if (JSON.stringify([...new Set(batchIds)].sort()) !== JSON.stringify(confirmedIds)) errors.push("Phase 5C batch coverage mismatch");

const program = readJson("docs/recovery/9of10-program-status.json");
const phase5 = program.phases.find((phase) => phase.phaseId === "5");
const evidence = readJson("docs/recovery/9of10-evidence-ledger.json");
const owner = readJson("docs/recovery/9of10-owner-decisions.json");
if (phase5?.subphases.find((phase) => phase.subphaseId === "5B")?.status !== "WAITING_OWNER") errors.push("Program ledger Phase 5B mismatch");
if (phase5?.subphases.find((phase) => phase.subphaseId === "5C")?.status !== "NOT_READY") errors.push("Program ledger Phase 5C mismatch");
if (evidence.phaseUpdates.find((phase) => phase.phase === "5B")?.status !== "WAITING_OWNER") errors.push("Evidence ledger Phase 5B mismatch");
if (owner.pendingDecisionGroups.find((group) => group.phase === "5B")?.status !== "WAITING_OWNER") errors.push("Owner ledger Phase 5B mismatch");
if (!read("docs/recovery/9of10-program-status.md").includes("Phase 5B is **WAITING_OWNER**")) errors.push("Program Markdown mismatch");
if (!read("docs/recovery/9of10-evidence-ledger.md").includes("## Phase 5B update")) errors.push("Evidence Markdown mismatch");
if (!read("docs/recovery/9of10-phase-history.md").includes("## Phase 5B - issue-specific accessibility owner review")) errors.push("History Markdown mismatch");

const result = {
  status: errors.length ? "FAIL" : "PASS",
  issueConsistency: errors.some((error) => /count|issue record/i.test(error)) ? "FAIL" : "PASS",
  ownerReviewSchema: errors.some((error) => /missing|incomplete/i.test(error)) ? "FAIL" : "PASS",
  proposalHashes: errors.some((error) => /hash/i.test(error)) ? "FAIL" : "PASS_20",
  decisionValidation: errors.some((error) => /decision/i.test(error)) ? "FAIL" : "PASS_ALL_PENDING",
  routeStateReferences: errors.some((error) => /route|state|viewport/i.test(error)) ? "FAIL" : "PASS",
  wcagReferences: errors.some((error) => /WCAG|reference/i.test(error)) ? "FAIL" : "PASS",
  sourcePathsAndProtectedContracts: errors.some((error) => /missing path/i.test(error)) ? "FAIL" : "PASS",
  batchCoverage: errors.some((error) => /batch/i.test(error)) ? "FAIL" : "PASS_8_CONFIRMED",
  manualTaskCoverage: errors.some((error) => /manual/i.test(error)) ? "FAIL" : "PASS_9_TASKS_3_GAPS",
  markdownJsonConsistency: errors.some((error) => /Markdown/i.test(error)) ? "FAIL" : "PASS",
  programLedger: errors.some((error) => /ledger|History/i.test(error)) ? "FAIL" : "PASS",
  errors
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
