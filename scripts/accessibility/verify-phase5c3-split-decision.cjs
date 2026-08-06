#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001";
const hashes = {
  "A11Y-007": "e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717",
  "A11Y-008": "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8"
};

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const stable = (value) => Array.isArray(value)
  ? value.map(stable)
  : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]))
    : value;
const hashObject = (value) => crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
const proposalBinding = (request) => ({
  issueEvidence: request.phase5aEvidence,
  proposedAction: request.proposedAction,
  affectedFiles: request.proposedFiles,
  protectedContracts: request.protectedContractsAffected,
  testPlan: request.tests,
  rollback: request.rollback
});

const errors = [];
for (const [issueId, expected] of Object.entries(hashes)) {
  const request = readJson(`docs/accessibility/owner-review/requests/${issueId}.json`);
  if (request.proposalHash !== expected || hashObject(proposalBinding(request)) !== expected) errors.push(`${issueId} proposal hash mismatch.`);
}

const approval = readJson(`docs/owner-approvals/accessibility/${decisionId}.json`);
const manifest = readJson("docs/accessibility/phase-5c3a-batch-manifest.json");
const retest = readJson("docs/accessibility/a11y-008-current-evidence-retest-plan.json");
const batches = readJson("docs/accessibility/phase-5c-proposed-batches.json");
const program = readJson("docs/recovery/9of10-program-status.json");
const phase5 = program.phases.find((entry) => entry.phaseId === "5");
const batch5c3 = batches.batches.find((entry) => entry.batchId === "5C-3");
const batch5c3a = batches.batches.find((entry) => entry.batchId === "5C-3A");
const status5c3a = phase5?.subphases?.find((entry) => entry.subphaseId === "5C-3A");

if (approval.decisionId !== decisionId || approval.decision !== "APPROVED") errors.push("Owner decision identity mismatch.");
if (batch5c3?.status !== "SUPERSEDED_FOR_EXECUTION") errors.push("Original Phase 5C-3 is not superseded.");
if (batch5c3a?.status !== "READY_NOT_STARTED" || batch5c3a.started !== false) errors.push("Phase 5C-3A is not ready/not-started.");
if (JSON.stringify(manifest.issueIds) !== JSON.stringify(["A11Y-007"]) || manifest.proposalHashes["A11Y-007"] !== hashes["A11Y-007"]) errors.push("Phase 5C-3A scope/hash mismatch.");
if (!manifest.excludedIssueIds.includes("A11Y-008")) errors.push("A11Y-008 is not excluded from Phase 5C-3A.");
if (status5c3a?.status !== "READY_NOT_STARTED" || status5c3a.started !== false) errors.push("Program ledger does not mark Phase 5C-3A ready/not-started.");
if (retest.status !== "NOT_REPRODUCED_CURRENT_NEEDS_MORE_EVIDENCE" || retest.implementationAuthorized !== false) errors.push("A11Y-008 status mismatch.");
if (retest.currentEvidence.focusedCells !== 42 || retest.currentEvidence.nextCells !== 24 || retest.currentEvidence.staticCells !== 18 || retest.currentEvidence.viewportCount !== 6 || retest.currentEvidence.measuredContrastRatio !== 6.9851 || retest.currentEvidence.requiredContrastRatio !== 4.5 || retest.currentEvidence.scopedAxeContrastFailures !== 0) errors.push("A11Y-008 evidence mismatch.");

console.log(JSON.stringify({
  status: errors.length ? "FAIL" : "PASS",
  decisionId,
  a11y007ProposalHash: errors.some((error) => error.startsWith("A11Y-007")) ? "FAIL" : "PASS",
  phase5c3: batch5c3?.status,
  phase5c3a: batch5c3a?.status,
  a11y008: retest.status,
  errors
}, null, 2));
if (errors.length) process.exitCode = 1;
