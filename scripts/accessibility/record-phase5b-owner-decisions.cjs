#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const ownerName = "Prince Okiemute Inoba — Teoyube Project Owner";
const approvalRoot = "docs/owner-approvals/accessibility";
const approvalJsonPath = `${approvalRoot}/${decisionId}.json`;
const approvalMdPath = `${approvalRoot}/${decisionId}.md`;
const decisionLedgerPath = "docs/accessibility/owner-review/phase-5b-owner-decisions.json";
const decisionLedgerMdPath = "docs/accessibility/owner-review/phase-5b-owner-decisions.md";
const finalCommitPlaceholder = "FINAL_PHASE5B_OWNER_DECISION_COMMIT_REPORTED_IN_FINAL_HANDOFF";
const reviewPackageCommit = "54252d5c9b29cf6ab93e40ea267960e581804981";

const expectedDecisions = new Map([
  ...Array.from({ length: 8 }, (_, index) => [`A11Y-${String(index + 1).padStart(3, "0")}`, "APPROVE_RECOMMENDED_PHASE5C_FIX"]),
  ...Array.from({ length: 3 }, (_, index) => [`A11Y-${String(index + 9).padStart(3, "0")}`, "APPROVE_MANUAL_EVIDENCE_TASK"]),
  ...Array.from({ length: 9 }, (_, index) => [`A11Y-MANUAL-${String(index + 1).padStart(3, "0")}`, "APPROVE_MANUAL_EVIDENCE_TASK"])
]);

const absolute = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => fs.readFileSync(absolute(relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const write = (relativePath, value) => {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  fs.writeFileSync(target, text.endsWith("\n") ? text : `${text}\n`, "utf8");
};
const sha256 = (relativePath) => crypto.createHash("sha256").update(fs.readFileSync(absolute(relativePath))).digest("hex");
const identity = (relativePath) => ({ path: relativePath, sha256: sha256(relativePath) });
const currentHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

function replaceExactOrCurrent(text, before, after, label) {
  const beforeCount = text.split(before).length - 1;
  if (beforeCount === 1) return text.replace(before, after);
  const afterCount = text.split(after).length - 1;
  if (beforeCount === 0 && afterCount === 1) return text;
  throw new Error(`${label}: expected one original or current value, found ${beforeCount}/${afterCount}`);
}

function appendOnce(text, marker, section) {
  if (text.includes(marker)) return text;
  return `${text.trimEnd()}\n\n${section.trim()}\n`;
}

const existingApproval = fs.existsSync(absolute(approvalJsonPath)) ? readJson(approvalJsonPath) : null;
const decidedAt = existingApproval?.approvedAt || new Date().toISOString();
const ledger = readJson(decisionLedgerPath);

if (ledger.decisions.length !== expectedDecisions.size) throw new Error(`Expected ${expectedDecisions.size} decision entries, found ${ledger.decisions.length}`);
for (const entry of ledger.decisions) {
  const expected = expectedDecisions.get(entry.id);
  if (!expected) throw new Error(`Unexpected decision ID ${entry.id}`);
  if (entry.recommendation !== expected) throw new Error(`${entry.id} recommendation changed from the owner-submitted decision`);
  if (!/^[a-f0-9]{64}$/.test(entry.proposalHash)) throw new Error(`${entry.id} proposal hash is invalid`);
  if (entry.decision !== "PENDING" && entry.decision !== expected) throw new Error(`${entry.id} contains an incompatible existing decision`);
}

const manualPlanPath = "docs/accessibility/owner-review/manual-evidence-plan.json";
const manualPlan = readJson(manualPlanPath);
const manualById = new Map(manualPlan.tasks.map((task) => [task.taskId, task]));
const decisionRecords = [];

for (const entry of ledger.decisions) {
  const decision = expectedDecisions.get(entry.id);
  if (entry.kind === "issue") {
    const requestPath = `docs/accessibility/owner-review/requests/${entry.id}.json`;
    const requestMdPath = `docs/accessibility/owner-review/requests/${entry.id}.md`;
    const request = readJson(requestPath);
    if (request.proposalHash !== entry.proposalHash) throw new Error(`${entry.id} request/decision hash mismatch`);
    request.ownerDecision = decision;
    request.ownerDecisionId = decisionId;
    request.ownerDecisionAt = decidedAt;
    request.owner = ownerName;
    request.implementationStatus = request.phase5aStatus === "confirmed" ? "APPROVED_NOT_STARTED" : "EVIDENCE_TASKS_APPROVED_NOT_EXECUTED";
    write(requestPath, request);
    let requestMd = read(requestMdPath);
    requestMd = replaceExactOrCurrent(requestMd, "- Owner decision: **PENDING**", `- Owner decision: **${decision}**`, `${entry.id} Markdown decision`);
    if (!requestMd.includes(`- Decision ID: \`${decisionId}\``)) {
      requestMd = requestMd.replace(`- Owner decision: **${decision}**`, `- Owner decision: **${decision}**\n- Decision ID: \`${decisionId}\`\n- Decided at: \`${decidedAt}\`\n- Implementation/evidence status: **${request.implementationStatus}**`);
    }
    write(requestMdPath, requestMd);
    decisionRecords.push({
      issueOrTaskId: entry.id,
      kind: "issue",
      severity: entry.severity,
      decision,
      proposalHash: entry.proposalHash,
      exactScope: request.proposedAction,
      affectedFiles: request.proposedFiles,
      protectedContracts: request.protectedContractsAffected,
      expectedPixelImpact: request.expectedPixelImpact,
      expectedDomImpact: request.expectedDomImpact,
      requiredTests: request.tests,
      rollback: request.rollback,
      executionStatus: request.implementationStatus
    });
  } else {
    const task = manualById.get(entry.id);
    if (!task || task.taskHash !== entry.proposalHash) throw new Error(`${entry.id} manual-task hash mismatch`);
    task.ownerDecision = decision;
    task.ownerDecisionId = decisionId;
    task.ownerDecisionAt = decidedAt;
    task.owner = ownerName;
    task.executionStatus = "NOT_TESTED";
    decisionRecords.push({
      issueOrTaskId: entry.id,
      kind: "manual_evidence_task",
      relatedIssueIds: task.relatedIssueIds,
      decision,
      proposalHash: entry.proposalHash,
      exactScope: task.taskScript,
      safeEvidenceFields: task.safeEvidenceFields,
      prohibitedContent: task.prohibitedContent,
      passFailCriteria: task.passFailCriteria,
      rollback: "Remove only an invalid evidence result; owner authorization remains recorded unless superseded by a later owner decision.",
      executionStatus: "NOT_TESTED"
    });
  }
  entry.decision = decision;
  entry.decisionId = decisionId;
  entry.decidedAt = decidedAt;
  entry.owner = ownerName;
  entry.executionStatus = entry.kind === "manual_task" ? "NOT_TESTED" : (entry.id <= "A11Y-008" ? "APPROVED_NOT_STARTED" : "EVIDENCE_TASKS_APPROVED_NOT_EXECUTED");
}

ledger.status = "PASS_OWNER_DECISIONS_RECORDED";
ledger.ownerDecisionId = decisionId;
ledger.owner = ownerName;
ledger.decidedAt = decidedAt;
ledger.phase5c = "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED";
ledger.rules = [...new Set([...ledger.rules, "Manual task approval is not a test PASS", "Each Phase 5C batch requires a separate Codex task", "Canon media controls must be preserved"])]
write(decisionLedgerPath, ledger);

write(decisionLedgerMdPath, `# Phase 5B accessibility owner decisions

Status: **PASS - ALL DECISIONS RECORDED**

- Decision ID: \`${decisionId}\`
- Owner: ${ownerName}
- Decided at: \`${decidedAt}\`
- Phase 5C: **READY FOR APPROVED SCOPE ONLY - NOT STARTED**
- Manual tasks: **AUTHORIZED, NOT TESTED**

| ID | Kind | Severity/issues | Decision | Proposal hash | Execution status |
| --- | --- | --- | --- | --- | --- |
${ledger.decisions.map((entry) => `| ${entry.id} | ${entry.kind} | ${entry.severity || entry.relatedIssueIds.join(", ")} | ${entry.decision} | \`${entry.proposalHash}\` | ${entry.executionStatus} |`).join("\n")}

Every decision is bound to the displayed proposal hash. This record authorizes no substitute implementation, baseline update, or automatic Phase 5C start.
`);

manualPlan.status = "OWNER_TASKS_APPROVED_NOT_EXECUTED";
manualPlan.ownerDecisionId = decisionId;
manualPlan.owner = ownerName;
manualPlan.decidedAt = decidedAt;
manualPlan.resultRules.manualApprovalIsPass = false;
write(manualPlanPath, manualPlan);
let manualMd = read("docs/accessibility/owner-review/manual-evidence-plan.md");
manualMd = replaceExactOrCurrent(manualMd, "Status: **PENDING OWNER DECISIONS**. Unavailable environments remain **NOT TESTED**. No private user content is permitted.", `Status: **OWNER TASKS APPROVED, NOT EXECUTED**. Decision \`${decisionId}\` authorizes the documented tasks only. Every environment remains **NOT TESTED** until genuine evidence is recorded. No private user content is permitted.`, "manual plan status");
manualMd = manualMd.replace(/- Owner decision: \*\*PENDING\*\*/g, "- Owner decision: **APPROVE_MANUAL_EVIDENCE_TASK**");
if (!manualMd.includes(`Decision ID: \`${decisionId}\``)) manualMd = manualMd.replace("# Phase 5B manual accessibility evidence plan", `# Phase 5B manual accessibility evidence plan\n\nDecision ID: \`${decisionId}\`\nDecided at: \`${decidedAt}\``);
write("docs/accessibility/owner-review/manual-evidence-plan.md", manualMd);

const canonJsonPath = "docs/accessibility/owner-review/canon-focus-owner-decision.json";
const canon = readJson(canonJsonPath);
canon.status = "APPROVED_NOT_STARTED";
canon.ownerDecision = "APPROVE_RECOMMENDED_PHASE5C_FIX";
canon.ownerDecisionId = decisionId;
canon.owner = ownerName;
canon.decidedAt = decidedAt;
canon.phase5cStatus = "READY_FOR_BATCH_5C_2_NOT_STARTED";
write(canonJsonPath, canon);
let canonMd = read("docs/accessibility/owner-review/canon-focus-owner-decision.md");
canonMd = replaceExactOrCurrent(canonMd, "Status: **PENDING**", "Status: **APPROVED FOR EXACT PROPOSAL - NOT STARTED**", "Canon status");
if (!canonMd.includes(`Decision ID: \`${decisionId}\``)) canonMd = canonMd.replace("Issue: **A11Y-003**", `Issue: **A11Y-003**\nDecision: **APPROVE_RECOMMENDED_PHASE5C_FIX**\nDecision ID: \`${decisionId}\`\nDecided at: \`${decidedAt}\``);
write("docs/accessibility/owner-review/canon-focus-owner-decision.md", canonMd);

const packageJsonPath = "docs/accessibility/owner-review/phase-5b-owner-review-package.json";
const ownerPackage = readJson(packageJsonPath);
ownerPackage.status = "PASS_OWNER_DECISIONS_RECORDED";
ownerPackage.ownerDecisionId = decisionId;
ownerPackage.owner = ownerName;
ownerPackage.decidedAt = decidedAt;
ownerPackage.phase5cStarted = false;
ownerPackage.recordedDecisions = ledger.decisions.map((entry) => ({ id: entry.id, decision: entry.decision, proposalHash: entry.proposalHash, executionStatus: entry.executionStatus }));
write(packageJsonPath, ownerPackage);
let packageMd = read("docs/accessibility/owner-review/phase-5b-owner-review-package.md");
packageMd = replaceExactOrCurrent(packageMd, "Status: **WAITING_OWNER**. No fix is implemented and no WCAG conformance claim is made.", `Status: **PASS - OWNER DECISIONS RECORDED**. Decision \`${decisionId}\` approves only the current hash-bound scopes. No fix is implemented and no WCAG conformance claim is made.`, "owner package status");
packageMd = replaceExactOrCurrent(packageMd, "## Owner rules", `## Recorded decision\n\n- Owner: ${ownerName}\n- Decided at: \`${decidedAt}\`\n- All 20 entries approved exactly as recommended and hash-bound.\n- Manual evidence remains NOT TESTED.\n- Phase 5C is READY for approved scope only and was not started.\n\n## Owner rules`, "owner package decision section");
write("docs/accessibility/owner-review/phase-5b-owner-review-package.md", packageMd);

const batchJsonPath = "docs/accessibility/phase-5c-proposed-batches.json";
const batches = readJson(batchJsonPath);
batches.status = "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED";
batches.ownerDecisionId = decisionId;
batches.owner = ownerName;
batches.decidedAt = decidedAt;
for (const batch of batches.batches) {
  batch.status = "READY_NOT_STARTED";
  batch.approvedIssueIds = [...batch.issueIds];
  batch.executionRule = "A separate Codex task must verify the clean worktree and exact current proposal hashes before implementing only this batch.";
}
write(batchJsonPath, batches);
let batchesMd = read("docs/accessibility/phase-5c-proposed-batches.md");
batchesMd = replaceExactOrCurrent(batchesMd, "Status: **PROPOSED - NOT AUTHORIZED**", `Status: **READY FOR APPROVED SCOPE ONLY - NOT STARTED**\n\nDecision \`${decisionId}\` approved the exact current hashes. Each batch still requires a separate Codex task and stop.`, "Phase 5C batch status");
write("docs/accessibility/phase-5c-proposed-batches.md", batchesMd);

const approval = {
  schemaVersion: 1,
  decisionId,
  decision: "APPROVED",
  owner: ownerName,
  approvedAt: decidedAt,
  timeZoneContext: "America/Toronto",
  scope: "Only the 20 current issue-specific and manual-task proposal hashes recorded in the Phase 5B decision ledger.",
  sourceDecisionLedger: decisionLedgerPath,
  sourceReviewPackageCommit: reviewPackageCommit,
  decisions: decisionRecords,
  conditions: [
    "No different implementation, expanded scope, substitute proposal, or changed proposal hash is authorized.",
    "Phase 5C is not started by this decision-recording task.",
    "No HTML, CSS, DOM hierarchy, class, ID, ARIA, tabindex, focus-order, visible-copy, icon, image, media-control, route, responsive-layout, or baseline change is authorized while recording this decision.",
    "All existing Canon media controls must be preserved.",
    "Manual evidence approval authorizes only the documented task and is not a PASS result.",
    "Each Phase 5C batch requires a separate Codex task, clean-worktree verification, exact hash scope, before evidence, focused implementation, full applicable gates, rollback, and no baseline replacement."
  ],
  exclusions: ["Phase 5C implementation", "Phase 6A or later phases", "baseline replacement", "product or visual change", "automatic conformance claim"],
  phase5b: "PASS",
  phase5c: "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED",
  wcagConformanceClaim: false,
  rollbackRequirement: "Each later Phase 5C batch must be independently revertible. Reverting this evidence commit does not revoke the owner decision; revocation requires a later explicit owner decision."
};
write(approvalJsonPath, approval);
write(approvalMdPath, `# Phase 5B owner accessibility decision

Decision: **APPROVED**

- Decision ID: \`${decisionId}\`
- Owner: ${ownerName}
- Approved at: \`${decidedAt}\`
- Time-zone context: \`America/Toronto\`
- Review-package commit: \`${reviewPackageCommit}\`
- Phase 5B: **PASS**
- Phase 5C: **READY FOR APPROVED SCOPE ONLY - NOT STARTED**
- WCAG conformance: **NOT CLAIMED**

## Exact decisions

| ID | Decision | Proposal hash | Status |
| --- | --- | --- | --- |
${decisionRecords.map((entry) => `| ${entry.issueOrTaskId} | ${entry.decision} | \`${entry.proposalHash}\` | ${entry.executionStatus} |`).join("\n")}

## Conditions and exclusions

${approval.conditions.map((condition) => `- ${condition}`).join("\n")}

Excluded: ${approval.exclusions.join("; ")}.

## Rollback requirement

${approval.rollbackRequirement}
`);

const programJsonPath = "docs/recovery/9of10-program-status.json";
const program = readJson(programJsonPath);
const phase5 = program.phases.find((phase) => phase.phaseId === "5");
if (!phase5) throw new Error("Program Phase 5 is missing");
program.currentCommit = finalCommitPlaceholder;
phase5.currentCommit = finalCommitPlaceholder;
phase5.status = "IN_PROGRESS";
phase5.deliverables = ["current accessibility audit: COMPLETE", "issue-specific owner review and decisions: COMPLETE", "approved fixes: NOT_STARTED", "manual evidence tasks: APPROVED_NOT_TESTED"];
phase5.currentEvidence = [...phase5.currentEvidence.filter((entry) => !entry.includes("decisions pending")), `Owner decision ${decisionId}: 8 exact Phase 5C fixes and 12 manual-evidence approvals recorded`, "All manual environments remain NOT_TESTED; WCAG conformance remains unclaimed", "Phase 5C batches 5C-1, 5C-2, and 5C-3 are READY_NOT_STARTED for exact approved hashes"];
phase5.currentBlockers = ["Approved Phase 5C batches have not been implemented", "All approved manual accessibility tasks remain NOT_TESTED", "inherited release accessibility aggregator has no current 216-cell controller input", "WCAG conformance remains unproved"];
phase5.ownerDecisionIds = [decisionId];
phase5.nextReviewTrigger = "Start exactly one separately tasked Phase 5C batch after revalidating the clean worktree and matching approved proposal hashes";
for (const subphase of phase5.subphases) {
  if (subphase.subphaseId === "5B") subphase.status = "PASS";
  if (subphase.subphaseId === "5C") subphase.status = "READY_FOR_APPROVED_SCOPE_ONLY";
}
program.nextReadyPhase = "5C-1_OR_6A";
program.otherReadyIndependentSubphases = ["5C-1", "6A"];
program.nextWaitingPhase = "PHASE4_WAITING_OWNER_SESSION_DATA_PHASE3_WAITING_OWNER_PHASE2A_BLOCKED";
write(programJsonPath, program);

let programMd = read("docs/recovery/9of10-program-status.md");
programMd = replaceExactOrCurrent(programMd, "| 5 - Accessibility remediation | **IN_PROGRESS** | Phase 5A audit PASS; Phase 5B review package complete and WAITING_OWNER; all 20 issue/task decisions pending; Phase 5C NOT READY. |", `| 5 - Accessibility remediation | **IN_PROGRESS** | Phase 5A and Phase 5B PASS; decision \`${decisionId}\` recorded; Phase 5C READY for exact approved scope only and NOT STARTED; manual tasks NOT TESTED. |`, "program Phase 5 row");
programMd = replaceExactOrCurrent(programMd, "Phase 5A is **PASS**; Phase 5B is **WAITING_OWNER**; Phase 5C is **NOT READY**. Phase 6A remains independently **READY** and was not executed.", "Phase 5A and Phase 5B are **PASS**; Phase 5C is **READY FOR APPROVED SCOPE ONLY** and was not started. Phase 6A remains independently **READY** and was not executed.", "program summary");
programMd = replaceExactOrCurrent(programMd, "Phase 5 is **IN_PROGRESS**. Phase 5B is **WAITING_OWNER** with 11 hash-bound issue requests and 9 hash-bound manual tasks; every decision remains pending. Phase 5C is **NOT READY** and no fix was implemented. Phase 2A remains **BLOCKED**, Phase 3 remains **WAITING_OWNER**, and Phase 4 remains **WAITING_OWNER_SESSION_DATA**. No protected visual source, CSS, DOM/class/ARIA production code, asset, baseline, package, or lockfile changed.", `Phase 5 is **IN_PROGRESS**. Phase 5B is **PASS** under decision \`${decisionId}\`; Phase 5C is **READY FOR APPROVED SCOPE ONLY** and no fix was implemented in this task. Manual tasks are approved but **NOT TESTED**. Phase 2A remains **BLOCKED**, Phase 3 remains **WAITING_OWNER**, and Phase 4 remains **WAITING_OWNER_SESSION_DATA**. No protected visual source, CSS, DOM/class/ARIA production code, asset, baseline, package, or lockfile changed.`, "program Phase 5 narrative");
write("docs/recovery/9of10-program-status.md", programMd);

const ownerLedgerPath = "docs/recovery/9of10-owner-decisions.json";
const ownerLedger = readJson(ownerLedgerPath);
ownerLedger.updatedAt = decidedAt;
if (!ownerLedger.decisions.some((entry) => entry.decisionId === decisionId)) ownerLedger.decisions.push({ decisionId, scope: approval.scope, status: "APPROVED", approvedAt: decidedAt, owner: ownerName, source: approvalJsonPath, limitations: approval.conditions });
ownerLedger.pendingDecisionGroups = ownerLedger.pendingDecisionGroups.filter((entry) => entry.phase !== "5B");
write(ownerLedgerPath, ownerLedger);
let ownerLedgerMd = read("docs/recovery/9of10-owner-decisions.md");
const tableAnchor = "| `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24` | Next canonical locally; static Node rollback | Existing approved decision |";
if (!ownerLedgerMd.includes(`| \`${decisionId}\` |`)) ownerLedgerMd = ownerLedgerMd.replace(tableAnchor, `| \`${decisionId}\` | Phase 5B exact hash-bound accessibility decisions; 8 fixes approved-not-started and 12 evidence approvals not tested | Approved at \`${decidedAt}\`; source \`${approvalJsonPath}\` |\n${tableAnchor}`);
ownerLedgerMd = replaceExactOrCurrent(ownerLedgerMd, "- Phase 5B: **WAITING_OWNER** for 11 issue decisions and 9 manual-task decisions in `docs/accessibility/owner-review/phase-5b-owner-decisions.json`; each decision is proposal-hash-bound, one line per ID, and a blanket approval is invalid. Phase 5C is not authorized.", `- Phase 5C execution: decision \`${decisionId}\` makes the exact approved scope READY, but each batch requires a separate Codex task and remains NOT STARTED.`, "owner ledger pending Phase 5B");
write("docs/recovery/9of10-owner-decisions.md", ownerLedgerMd);

let riskMd = read("docs/recovery/9of10-risk-register.md");
riskMd = replaceExactOrCurrent(riskMd, "| 9R-06 | Accessibility conformance unproved | Phase 5A completed 311 current cells and registered 11 findings; Phase 5B created 11 issue requests and 9 manual tasks, all 20 decisions pending; no fix or conformance claim | Phase 5 and Phase 2A recheck | Matching owner decisions, approved Phase 5C remediation, critical/high closure, required manual/AT evidence, and full verification |", `| 9R-06 | Accessibility conformance unproved | Decision \`${decisionId}\` approved 8 exact fixes and 12 evidence scopes; no fix is implemented, all manual tasks remain NOT_TESTED, and no conformance claim exists | Phase 5 and Phase 2A recheck | Execute approved Phase 5C batches separately; close critical/high findings; complete manual/AT evidence and full verification |`, "risk 9R-06 decision");
write("docs/recovery/9of10-risk-register.md", riskMd);

let historyMd = read("docs/recovery/9of10-phase-history.md");
historyMd = appendOnce(historyMd, `### Phase 5B owner decision ${decisionId}`, `### Phase 5B owner decision ${decisionId}

Status: **PASS**
Recorded at: \`${decidedAt}\`

The owner approved all 20 current proposal-hash-bound recommendations: 8 exact Phase 5C fixes, 3 manual-gap decisions, and 9 executable manual tasks. No implementation or manual test was performed. Phase 5C is **READY FOR APPROVED SCOPE ONLY** and **NOT STARTED**. WCAG conformance remains unclaimed. Phase 2A remains **BLOCKED**, Phase 3 remains **WAITING_OWNER**, and Phase 4 remains **WAITING_OWNER_SESSION_DATA**.`);
write("docs/recovery/9of10-phase-history.md", historyMd);

const reportJsonPath = "docs/recovery/9of10-phase-5b-accessibility-owner-review-report.json";
const report = readJson(reportJsonPath);
report.generatedAt = decidedAt;
report.program.finalStatus = "PASS";
report.program.phase5c = "READY_FOR_APPROVED_SCOPE_ONLY";
report.branchAndCommits.reviewPackageCommit = reviewPackageCommit;
report.branchAndCommits.currentHeadBeforeDecisionCommit = currentHead;
report.branchAndCommits.ownerDecisionCommit = finalCommitPlaceholder;
report.branchAndCommits.finalCommit = finalCommitPlaceholder;
report.branchAndCommits.worktree = "OWNER_DECISION_DOCUMENTATION_PENDING_COMMIT";
report.ownerReview.canonDecision = "APPROVED_NOT_STARTED";
report.ownerReview.ownerDecisions = "RECORDED_ALL_20";
report.ownerReview.approvedFixes = 8;
report.ownerReview.approvedManualTasks = 9;
report.ownerReview.pending = 0;
report.ownerReview.manualGapDecisionsApproved = 3;
report.ownerReview.decisionId = decisionId;
report.preservedStatus.phase5b = "PASS";
report.preservedStatus.phase5c = "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED";
report.nextReady = "Phase 5C batch 5C-1 and Phase 6A are independently READY; neither was started.";
report.ownerAction = { instructions: "No Phase 5B decision remains. Start only one separately tasked Phase 5C batch after revalidating hashes and the clean worktree.", decisions: ledger.decisions.map((entry) => ({ id: entry.id, decision: entry.decision, proposalHash: entry.proposalHash, executionStatus: entry.executionStatus })) };
report.ownerDecisionRecording = { decisionId, owner: ownerName, approvedAt: decidedAt, approvalJsonPath, approvalMdPath, productChanges: 0, phase5cStarted: false, manualTasksExecuted: 0 };
write(reportJsonPath, report);

write("docs/recovery/9of10-phase-5b-accessibility-owner-review-report.md", `# Teoyube 9/10 Phase 5B accessibility owner-review report

## Program

- Selected phase: **Phase 5B - issue-specific accessibility owner review**
- Previous status: **WAITING_OWNER**
- Final status: **PASS**
- Phase 5 overall: **IN_PROGRESS**
- Phase 5C: **READY FOR APPROVED SCOPE ONLY - NOT STARTED**
- Program overall: **IN_PROGRESS**

## Owner decision

- Decision ID: \`${decisionId}\`
- Owner: ${ownerName}
- Recorded at: \`${decidedAt}\`
- Decisions: **20 recorded; 8 fixes approved-not-started; 3 manual-gap scopes approved; 9 manual tasks approved-not-tested; 0 pending**
- Approval evidence: \`${approvalMdPath}\` and \`${approvalJsonPath}\`

Every decision is bound to the exact current proposal hash in \`${decisionLedgerPath}\`. No substitute implementation or baseline update is authorized.

## Branch and commits

- Branch: \`recovery/visual-source-of-truth\`
- Starting commit: \`0a98a0ba498315442823dc5469074cd2d8d3ed10\`
- Review-package commit: \`${reviewPackageCommit}\`
- Owner-decision/final commit: reported in final handoff after this report is committed
- Pre-phase tag: \`teoyube-9of10-phase5b-start-0a98a0b\`

## Verification and change accounting

- Proposal hashes and submitted decisions: **PASS - 20 exact matches**
- Owner-decision schema: **PASS**
- Manual tasks: **AUTHORIZED, NOT TESTED**
- Phase 5C batches: **READY_NOT_STARTED**
- Product fixes/source, protected visual source, CSS, DOM/class, ARIA/tabindex, focus order, visible copy, icons/assets/media, routes, baselines, package/lockfile, runtime, paid calls, participant/research records: **0 changes**
- Runtime/recovery: **PASS - Next canonical, static rollback, 268 protected files, 72 screenshots, 12 DOM snapshots, owner baselines**
- WCAG conformance: **NOT CLAIMED**

## Preserved status

- Phase 2A: **BLOCKED**
- Phase 3: **WAITING_OWNER**
- Phase 4: **WAITING_OWNER_SESSION_DATA**
- Phase 5A: **PASS**
- Phase 5B: **PASS**
- Phase 5C: **READY FOR APPROVED SCOPE ONLY - NOT STARTED**
- Gate C Preview: **BLOCKED**
- Gate C Production: **CLOSED**

## Next action

Start exactly one separate Phase 5C batch task, beginning with 5C-1, only after current clean-worktree and proposal-hash verification. This task did not begin Phase 5C.

## Rollback

Revert only the owner-decision recording commit if its transcription is inaccurate. Reverting Git evidence does not revoke the owner decision; revocation requires a later explicit owner decision.
`);

const evidencePath = "docs/recovery/9of10-evidence-ledger.json";
const evidence = readJson(evidencePath);
const phase5b = evidence.phaseUpdates.find((entry) => entry.phase === "5B");
if (!phase5b) throw new Error("Evidence ledger Phase 5B entry is missing");
phase5b.status = "PASS";
phase5b.executedAt = decidedAt;
phase5b.finalCommit = finalCommitPlaceholder;
phase5b.ownerDecisionId = decisionId;
phase5b.ownerDecisionAt = decidedAt;
phase5b.ownerDecisions = "RECORDED_ALL_20";
phase5b.approvedFixes = 8;
phase5b.approvedManualGapScopes = 3;
phase5b.approvedManualTasks = 9;
phase5b.manualTasksExecuted = 0;
phase5b.phase5c = "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED";
phase5b.conformanceClaim = false;
const evidenceArtifacts = [
  approvalJsonPath,
  approvalMdPath,
  decisionLedgerPath,
  "docs/accessibility/owner-review/phase-5b-owner-review-package.json",
  "docs/accessibility/owner-review/manual-evidence-plan.json",
  "docs/accessibility/owner-review/canon-focus-owner-decision.json",
  "docs/accessibility/phase-5c-proposed-batches.json",
  reportJsonPath
];
phase5b.artifacts = evidenceArtifacts.map(identity);
evidence.generatedAt = decidedAt;
evidence.workspaceAfterPhase5b = { recordedAt: decidedAt, head: finalCommitPlaceholder, productSourceFilesChanged: 0, protectedVisualFilesChanged: 0, immutableBaselineFilesChanged: 0, ownerApprovedBaselineFilesChanged: 0, packageJsonChanged: false, packageLockFilesChanged: 0, paidCalls: 0, phase2a: "BLOCKED", phase3: "WAITING_OWNER", phase4: "WAITING_OWNER_SESSION_DATA", phase5a: "PASS", phase5b: "PASS", phase5c: "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED", phase5Overall: "IN_PROGRESS", program: "IN_PROGRESS" };
write(evidencePath, evidence);

let evidenceMd = read("docs/recovery/9of10-evidence-ledger.md");
evidenceMd = appendOnce(evidenceMd, `## Phase 5B owner decision ${decisionId}`, `## Phase 5B owner decision ${decisionId}

| Evidence | Result |
| --- | --- |
| Owner / recorded at | ${ownerName}; \`${decidedAt}\` |
| Exact decisions | 20 hash-bound decisions recorded; 8 fixes, 3 manual-gap scopes, 9 manual tasks |
| Manual execution | 0; every task remains NOT_TESTED |
| Phase 5C | READY FOR APPROVED SCOPE ONLY; NOT STARTED |
| Product/protected/CSS/DOM/ARIA/focus/copy/assets/routes/baselines/package/lock/runtime/paid calls | 0 changes |
| Phase state | Phase 5A PASS; Phase 5B PASS; Phase 5C READY_NOT_STARTED; Phase 5 IN_PROGRESS |

Phase 2A remains BLOCKED, Phase 3 remains WAITING_OWNER, and Phase 4 remains WAITING_OWNER_SESSION_DATA. WCAG conformance remains unclaimed.`);
write("docs/recovery/9of10-evidence-ledger.md", evidenceMd);

console.log(JSON.stringify({ status: "PASS", decisionId, approvedAt: decidedAt, decisions: ledger.decisions.length, approvedFixes: 8, approvedManualGapScopes: 3, approvedManualTasks: 9, manualTasksExecuted: 0, phase5b: "PASS", phase5c: "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED", productChanges: 0 }, null, 2));
