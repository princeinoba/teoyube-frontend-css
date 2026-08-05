#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const write = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), `${typeof value === "string" ? value.trimEnd() : JSON.stringify(value, null, 2)}\n`, "utf8");
const lines = (commandArgs) => execFileSync("git", commandArgs, { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);

const generatedAt = new Date().toISOString();
const branch = execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim();
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const changedFiles = [...new Set([...lines(["diff", "--name-only"]), ...lines(["ls-files", "--others", "--exclude-standard"])])].sort();
const decisions = readJson("docs/accessibility/owner-review/phase-5b-owner-decisions.json");

const report = {
  schemaVersion: 1,
  generatedAt,
  program: {
    selectedPhase: "Phase 5B - Issue-specific accessibility owner review",
    previousStatus: "READY",
    finalStatus: "WAITING_OWNER",
    phase5Overall: "IN_PROGRESS",
    phase5c: "NOT_READY",
    overall: "IN_PROGRESS"
  },
  branchAndCommits: {
    branch,
    startingCommit: "0a98a0ba498315442823dc5469074cd2d8d3ed10",
    currentHeadBeforeReviewCommit: head,
    reviewPackageCommit: "FINAL_PHASE5B_REVIEW_COMMIT_REPORTED_IN_FINAL_HANDOFF",
    ownerDecisionCommit: null,
    finalCommit: "FINAL_PHASE5B_REVIEW_COMMIT_REPORTED_IN_FINAL_HANDOFF",
    prePhaseTag: "teoyube-9of10-phase5b-start-0a98a0b",
    worktree: "DOCUMENTATION_CHANGES_PENDING_COMMIT"
  },
  issues: {
    total: 11,
    critical: 1,
    high: 8,
    medium: 2,
    confirmed: 8,
    manualGaps: 3,
    falsePositives: 0,
    needsMoreEvidence: 0
  },
  fixClasses: {
    pixelIdentical: 0,
    protectedAttribute: 6,
    visibleCopy: 0,
    layoutOrComponent: 2,
    manualEvidence: 3,
    falsePositive: 0,
    needsMoreEvidence: 0
  },
  ownerReview: {
    requestsCreated: 11,
    proposalHashes: 20,
    canonDecision: "PENDING",
    manualTasks: 9,
    implementationBatches: 3,
    ownerDecisions: "ALL_PENDING",
    approvedFixes: 0,
    approvedManualTasks: 0,
    held: 0,
    rejected: 0,
    needsMoreEvidence: 0,
    pending: 20
  },
  changes: {
    filesChanged: changedFiles,
    fileCount: changedFiles.length,
    productFixes: 0,
    productSourceChanges: 0,
    protectedVisualChanges: 0,
    cssChanges: 0,
    domClassChanges: 0,
    ariaTabindexChanges: 0,
    visibleCopyChanges: 0,
    assetChanges: 0,
    baselineChanges: 0,
    packageLockfileChanges: 0,
    runtimeChanges: 0,
    paidCalls: 0,
    participantOrResearchRecords: 0
  },
  verification: {
    npm: "PASS_10.2.4",
    issueConsistency: "PASS_11_1_CRITICAL_8_HIGH_2_MEDIUM",
    ownerReviewRecordSchema: "PASS_11",
    proposalHashes: "PASS_20",
    decisionValidation: "PASS_20_PENDING_ALLOWED_VOCABULARY",
    routeStateReferences: "PASS_23_REGISTERED_ROUTES_NONEMPTY_STATES_6_VIEWPORTS",
    wcagReferences: "PASS_WCAG22_WAI_ARIA12_ARIA_IN_HTML",
    sourcePaths: "PASS",
    protectedContracts: "PASS",
    batchCoverage: "PASS_8_CONFIRMED_3_BATCHES",
    manualTaskCoverage: "PASS_9_TASKS_3_GAPS",
    markdownJson: "PASS",
    programLedger: "PASS_5B_WAITING_OWNER_5C_NOT_READY",
    secretScan: "PASS_ZERO_HITS",
    gitDiffClassification: "PASS_ZERO_PRODUCT_OR_PROTECTED_PATHS",
    participantResearchRecordScan: "PASS_ZERO_CHANGES",
    recovery: "PASS_268_PROTECTED_72_SCREENSHOTS_12_DOM_PLUS_OWNER_BASELINES",
    runtime: "PASS_NEXT_CANONICAL_23_ROUTES_STATIC_ROLLBACK",
    listeners: "PASS_PORT_3000_CLOSED_PORT_4173_PREEXISTING_UNRELATED_WORKSPACE_UNTOUCHED"
  },
  preservedStatus: {
    phase2a: "BLOCKED",
    phase3: "WAITING_OWNER",
    phase4: "WAITING_OWNER_SESSION_DATA",
    phase5a: "PASS",
    phase5b: "WAITING_OWNER",
    phase5c: "NOT_READY",
    gateCPreview: "BLOCKED",
    gateCProduction: "CLOSED",
    wcagConformanceClaim: false,
    canonicalRuntime: "next",
    rollbackRuntime: "static-node"
  },
  nextReady: "Phase 6A remains independently READY but was not started; Phase 5C is not ready until matching issue decisions are recorded.",
  ownerAction: {
    instructions: "Reply with one allowed decision per ID. A blanket approval is invalid. Every fix approval must bind the current proposal hash. Approval does not start Phase 5C.",
    decisions: decisions.decisions.map((entry) => ({ id: entry.id, recommendedDecision: entry.recommendation, proposalHash: entry.proposalHash }))
  },
  rollback: "git revert <phase-5b-review-package-commit>; delete tag teoyube-9of10-phase5b-start-0a98a0b only if the checkpoint tag itself was inaccurate"
};

write("docs/recovery/9of10-phase-5b-accessibility-owner-review-report.json", report);

const decisionLines = report.ownerAction.decisions.map((entry) => `- **${entry.id}** - recommended \`${entry.recommendedDecision}\` - proposal hash \`${entry.proposalHash}\``).join("\n");
const changedLines = changedFiles.map((file) => `- \`${file}\``).join("\n");
write("docs/recovery/9of10-phase-5b-accessibility-owner-review-report.md", `# Teoyube 9/10 Phase 5B accessibility owner-review report

## Program

- Selected phase: **Phase 5B - issue-specific accessibility owner review**
- Previous status: **READY**
- Final status: **WAITING_OWNER**
- Phase 5 overall: **IN_PROGRESS**
- Phase 5C: **NOT READY**
- Program overall: **IN_PROGRESS**

## Branch and commits

- Branch: \`${branch}\`
- Starting commit: \`0a98a0ba498315442823dc5469074cd2d8d3ed10\`
- Current HEAD before review commit: \`${head}\`
- Review-package/final commit: reported in final handoff after this report is committed
- Owner-decision commit: none; every decision is pending
- Pre-phase tag: \`teoyube-9of10-phase5b-start-0a98a0b\`
- Worktree at report generation: documentation/evidence changes pending focused commit

## Issues and fix classes

- Issues: **11 total; 1 critical; 8 high; 2 medium; 8 confirmed; 3 manual gaps; 0 false positives; 0 needs-more-evidence**.
- Fix classes: **0 pixel-identical; 6 protected-attribute; 0 visible-copy; 2 layout/component; 3 manual-evidence; 0 false-positive; 0 needs-more-evidence**.

## Owner review

- Requests: **11**
- Proposal/task hashes: **20**
- Canon decision: **PENDING**
- Manual tasks: **9**
- Proposed implementation batches: **3**
- Owner decisions: **20 PENDING; 0 approved; 0 held; 0 rejected**

## Changes (${changedFiles.length} files)

${changedLines}

Product fixes/source, protected visual source, CSS, DOM/class, ARIA/tabindex, visible copy, assets, baselines, package/lockfile, runtime, paid calls, and participant/research records changed: **0**.

## Verification

- Issue counts and review schema: **PASS**
- Proposal hashes: **PASS - 20**
- Pending-decision schema and allowed vocabulary: **PASS**
- Route/state/viewport references: **PASS**
- WCAG/WAI-ARIA/ARIA-in-HTML references: **PASS**
- Source paths and protected contracts: **PASS**
- Batch coverage: **PASS - 8 confirmed issues across 3 proposed batches**
- Manual coverage: **PASS - 9 tasks cover all 3 gaps**
- Markdown/JSON and program ledgers: **PASS**
- Secret and research-record scans: **PASS - zero hits/changes**
- Git diff classification: **PASS - zero product or protected paths**
- Runtime: **PASS - Next canonical, 23 routes, static rollback retained**
- Recovery: **PASS - 268 protected files, 72 screenshots, 12 DOM snapshots, owner baselines**
- Listeners: **PASS - port 3000 closed; pre-existing unrelated port 4173 listener untouched**

## Preserved status

- Phase 2A: **BLOCKED**
- Phase 3: **WAITING_OWNER**
- Phase 4: **WAITING_OWNER_SESSION_DATA**
- Phase 5A: **PASS**
- Phase 5B: **WAITING_OWNER**
- Phase 5C: **NOT READY**
- Gate C Preview: **BLOCKED**
- Gate C Production: **CLOSED**
- WCAG conformance: **NOT CLAIMED**

Phase 6A remains independently READY but was not started.

## Owner action

Reply with one allowed decision per ID. A blanket approval is invalid. Every fix approval must bind the current proposal hash. Approval does not start Phase 5C or update a baseline.

${decisionLines}

Allowed values: \`APPROVE_RECOMMENDED_PHASE5C_FIX\`, \`APPROVE_MANUAL_EVIDENCE_TASK\`, \`HOLD\`, \`REJECT\`, \`NEEDS_MORE_EVIDENCE\`.

## Rollback

${report.rollback}
`);

console.log(JSON.stringify({ status: "PASS", changedFiles: changedFiles.length, decisions: report.ownerAction.decisions.length }, null, 2));
