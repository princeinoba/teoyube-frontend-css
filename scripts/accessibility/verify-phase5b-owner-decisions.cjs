#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const ownerName = "Prince Okiemute Inoba — Teoyube Project Owner";
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const stable = (value) => Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])) : value;
const hashObject = (value) => crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
const fileHash = (relativePath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");
const errors = [];

const ledger = readJson("docs/accessibility/owner-review/phase-5b-owner-decisions.json");
const approval = readJson(`docs/owner-approvals/accessibility/${decisionId}.json`);
const manualPlan = readJson("docs/accessibility/owner-review/manual-evidence-plan.json");

if (ledger.status !== "PASS_OWNER_DECISIONS_RECORDED" || ledger.ownerDecisionId !== decisionId || ledger.decisions.length !== 20) errors.push("Decision ledger status/count mismatch");
if (approval.decisionId !== decisionId || approval.decision !== "APPROVED" || approval.owner !== ownerName || !/^2026-08-05T/.test(approval.approvedAt) || approval.decisions.length !== 20) errors.push("Approval identity/count/timestamp mismatch");
if (approval.phase5b !== "PASS" || approval.phase5c !== "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED" || approval.wcagConformanceClaim !== false) errors.push("Approval phase/conformance status mismatch");

const approvalById = new Map(approval.decisions.map((entry) => [entry.issueOrTaskId, entry]));
for (const entry of ledger.decisions) {
  if (entry.decision !== entry.recommendation || entry.decisionId !== decisionId || entry.owner !== ownerName || entry.proposalHash !== approvalById.get(entry.id)?.proposalHash) errors.push(`${entry.id} ledger/approval mismatch`);
  if (entry.kind === "issue") {
    const request = readJson(`docs/accessibility/owner-review/requests/${entry.id}.json`);
    const binding = { issueEvidence: request.phase5aEvidence, proposedAction: request.proposedAction, affectedFiles: request.proposedFiles, protectedContracts: request.protectedContractsAffected, testPlan: request.tests, rollback: request.rollback };
    if (request.proposalHash !== hashObject(binding) || request.proposalHash !== entry.proposalHash) errors.push(`${entry.id} proposal hash mismatch`);
    if (request.ownerDecision !== entry.decision || request.ownerDecisionId !== decisionId || !request.implementationStatus.endsWith("NOT_STARTED") && request.implementationStatus !== "EVIDENCE_TASKS_APPROVED_NOT_EXECUTED") errors.push(`${entry.id} request decision/status mismatch`);
    const markdown = read(`docs/accessibility/owner-review/requests/${entry.id}.md`);
    if (!markdown.includes(entry.decision) || !markdown.includes(decisionId) || !markdown.includes(entry.proposalHash)) errors.push(`${entry.id} Markdown mismatch`);
  }
}

if (manualPlan.status !== "OWNER_TASKS_APPROVED_NOT_EXECUTED" || manualPlan.tasks.length !== 9 || manualPlan.resultRules.manualApprovalIsPass !== false) errors.push("Manual plan status/count mismatch");
for (const task of manualPlan.tasks) {
  const original = { ...task, ownerDecision: "PENDING" };
  for (const field of ["taskHash", "ownerDecisionId", "ownerDecisionAt", "owner", "executionStatus"]) delete original[field];
  if (task.taskHash !== hashObject(original)) errors.push(`${task.taskId} original task hash mismatch`);
  if (task.ownerDecision !== "APPROVE_MANUAL_EVIDENCE_TASK" || task.ownerDecisionId !== decisionId || task.executionStatus !== "NOT_TESTED") errors.push(`${task.taskId} execution status mismatch`);
}

const canon = readJson("docs/accessibility/owner-review/canon-focus-owner-decision.json");
if (canon.status !== "APPROVED_NOT_STARTED" || canon.ownerDecisionId !== decisionId || canon.phase5cStatus !== "READY_FOR_BATCH_5C_2_NOT_STARTED") errors.push("Canon decision status mismatch");

const batches = readJson("docs/accessibility/phase-5c-proposed-batches.json");
if (batches.status !== "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED" || batches.ownerDecisionId !== decisionId || batches.batches.length !== 3 || batches.batches.some((batch) => batch.status !== "READY_NOT_STARTED" || JSON.stringify(batch.issueIds) !== JSON.stringify(batch.approvedIssueIds))) errors.push("Phase 5C batch status/scope mismatch");

const program = readJson("docs/recovery/9of10-program-status.json");
const phase5 = program.phases.find((phase) => phase.phaseId === "5");
if (phase5?.subphases.find((phase) => phase.subphaseId === "5B")?.status !== "PASS" || phase5?.subphases.find((phase) => phase.subphaseId === "5C")?.status !== "READY_FOR_APPROVED_SCOPE_ONLY") errors.push("Program Phase 5 status mismatch");
if (phase5?.ownerDecisionIds?.length !== 1 || phase5.ownerDecisionIds[0] !== decisionId) errors.push("Program owner decision ID mismatch");

const ownerLedger = readJson("docs/recovery/9of10-owner-decisions.json");
if (!ownerLedger.decisions.some((entry) => entry.decisionId === decisionId && entry.status === "APPROVED") || ownerLedger.pendingDecisionGroups.some((entry) => entry.phase === "5B")) errors.push("Program owner-decision ledger mismatch");

const report = readJson("docs/recovery/9of10-phase-5b-accessibility-owner-review-report.json");
if (report.program.finalStatus !== "PASS" || report.program.phase5c !== "READY_FOR_APPROVED_SCOPE_ONLY" || report.ownerReview.pending !== 0 || report.ownerDecisionRecording.decisionId !== decisionId || report.ownerDecisionRecording.phase5cStarted !== false || report.ownerDecisionRecording.manualTasksExecuted !== 0) errors.push("Final report status mismatch");

const evidence = readJson("docs/recovery/9of10-evidence-ledger.json");
const phase5b = evidence.phaseUpdates.find((entry) => entry.phase === "5B");
if (phase5b?.status !== "PASS" || phase5b?.ownerDecisionId !== decisionId || phase5b?.manualTasksExecuted !== 0 || phase5b?.conformanceClaim !== false) errors.push("Evidence ledger Phase 5B mismatch");
for (const artifact of phase5b?.artifacts || []) if (fileHash(artifact.path) !== artifact.sha256) errors.push(`Evidence artifact hash mismatch: ${artifact.path}`);

const markdownChecks = [
  [decisionId, `docs/owner-approvals/accessibility/${decisionId}.md`],
  ["Status: **PASS - ALL DECISIONS RECORDED**", "docs/accessibility/owner-review/phase-5b-owner-decisions.md"],
  ["OWNER TASKS APPROVED, NOT EXECUTED", "docs/accessibility/owner-review/manual-evidence-plan.md"],
  ["READY FOR APPROVED SCOPE ONLY - NOT STARTED", "docs/accessibility/phase-5c-proposed-batches.md"],
  ["Final status: **PASS**", "docs/recovery/9of10-phase-5b-accessibility-owner-review-report.md"]
];
for (const [needle, relativePath] of markdownChecks) if (!read(relativePath).includes(needle)) errors.push(`Markdown mismatch: ${relativePath}`);

const result = {
  status: errors.length ? "FAIL" : "PASS",
  decisionIdentity: errors.some((error) => /identity|timestamp/i.test(error)) ? "FAIL" : "PASS",
  decisionCount: ledger.decisions.length,
  proposalHashes: errors.some((error) => /hash/i.test(error)) ? "FAIL" : "PASS_20",
  ownerDecisionEvidence: errors.some((error) => /approval|Markdown/i.test(error)) ? "FAIL" : "PASS",
  manualTasks: errors.some((error) => /Manual|task/i.test(error)) ? "FAIL" : "PASS_9_APPROVED_0_EXECUTED_NOT_TESTED",
  canonControls: "PRESERVE_APPROVED_NOT_STARTED",
  phase5b: phase5b?.status,
  phase5c: batches.status,
  wcagConformanceClaim: false,
  productChanges: 0,
  errors
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
