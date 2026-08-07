import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const executedAt = "2026-08-07T12:30:10.264Z";
const startingCommit = "4c165eada3a04212d32456c96bef3cf8b69613f5";
const evidenceCommit = "cfc455fcc6bacecf6789d89aaad71606e4a91a27";
const finalCommit = "FINAL_PHASE5D1_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF";
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001";
const proposalHash = "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8";
const tag = "teoyube-9of10-phase5d1-a11y008-start-4c165ea";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const appendSection = (path, marker, content) => {
  const current = readFileSync(path, "utf8");
  if (!current.includes(marker)) writeFileSync(path, `${current.trimEnd()}\n\n${content.trim()}\n`);
};
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

const measurementsPath = "docs/accessibility/a11y008-contrast-measurements.json";
const measurements = readJson(measurementsPath);
const summary = measurements.summary;
if (summary.outcome !== "BLOCKED_INCONCLUSIVE" || summary.totalMatrixCells !== 1584) {
  throw new Error("A11Y-008 evidence summary does not match the completed Phase 5D-1 matrix");
}

const exactMissingEvidence = [
  "Reconcile the 144 forced-colors axe results that report the historical authored #fffdf4/#ffffff pair at 1.01:1 with computed forced colors at 21:1 and predominantly high-contrast rendered samples.",
  "Obtain repeatable, full-opacity rendered foreground/background samples for the six static desktop-wide 200% forced-colors D02/D05 cells across pinned Chromium, installed Chrome, and installed Edge.",
  "Reproduce the pinned-Chromium Next tablet-landscape 200% reduced-motion D05 rendered sample and reconcile it with the static 6.7731:1 sample."
];

const report = {
  schemaVersion: 1,
  phase: "5D-1",
  selectedPhase: "Phase 5D-1 — A11Y-008 current-state retest",
  previousStatus: "NEEDS_MORE_EVIDENCE",
  finalOutcome: "BLOCKED_INCONCLUSIVE",
  programOverall: "IN_PROGRESS",
  executedAt,
  branch: "recovery/visual-source-of-truth",
  startingCommit,
  testEvidenceCommit: evidenceCommit,
  finalReportCommit: finalCommit,
  prePhaseTag: tag,
  ownerDecision: decisionId,
  issue: "A11Y-008",
  title: "Canon in-progress status text fails minimum contrast",
  criterion: "WCAG 2.2 1.4.3 Contrast (Minimum)",
  d02Element: "[data-canon-item=\"canon-map-D02\"] .canon-status.in-progress",
  d05Element: "[data-canon-item=\"canon-map-D05\"] .canon-status.in-progress",
  routes: { next: "/canon", static: "/#canon" },
  states: {
    tested: ["default", "hover", "media-selected", "reduced-motion", "forced-colors"],
    notApplicable: measurements.notApplicableStates,
    overlay: "MEASURED; 60 unrelated global-notice intersections recorded before harness-only isolation of the underlying label",
    imageGradientLoaded: "VERIFIED"
  },
  viewports: measurements.viewports,
  runtimes: ["Next canonical", "Static rollback"],
  browsers: measurements.browsers,
  zooms: measurements.zooms,
  threshold: 4.5,
  formerProposalHash: proposalHash,
  productImplementationAuthorized: false,
  measurements: summary,
  outcome: {
    currentStatus: "NEEDS_MORE_EVIDENCE",
    implementationRequiredNow: "NO_PRODUCT_IMPLEMENTATION_AUTHORIZED_OR_JUSTIFIED_BY_CONFLICTING_EVIDENCE",
    newProposalRequired: false,
    ownerDecisionRequired: false,
    manualLimitations: "No human/manual or assistive-technology task was completed; platform conformance remains unclaimed.",
    exactMissingEvidence
  },
  protection: measurements.protections,
  regression: {
    recovery: "PASS_268_PROTECTED_SOURCE_72_SCREENSHOTS_12_DOM",
    runtime: "PASS_NEXT_CANONICAL_STATIC_ROLLBACK_23_ROUTES_14_MAPPINGS_31_APIS",
    protectedSource: "PASS",
    immutableBaselines: "PASS_UNCHANGED",
    ownerBaselines: "PASS_UNCHANGED",
    phase5c1Delta: "PASS",
    phase5c2Delta: "PASS",
    phase5c3aDelta: "PASS",
    issueRegister: "PASS",
    wcagMatrix: "PASS",
    focusedEvidenceTests: "PASS_3_OF_3",
    phase5DeltaTests: "PASS_13_OF_13",
    typecheck: "PASS",
    lint: "PASS",
    secretScan: "PASS_RELEASE_SECURITY_GATE_18_CONTROLS_CRITICAL_HIGH_0",
    participantResearchRecords: "PASS_ZERO_PARTICIPANTS_ZERO_SESSIONS",
    paidCalls: 0,
    listenersClosed: "PASS_PORTS_3194_AND_4194"
  },
  independentBlockers: {
    jsYamlAdvisory: "OPEN_ONE_HIGH_DEVELOPMENT_ADVISORY_GHSA_5P4M_2WFM_XMQJ_PRODUCTION_ZERO",
    cssBudget: "BLOCKED_1416075_OF_948538_BYTES",
    broadParity: "BLOCKED_NINE_PRE_EXISTING_STATIC_NEXT_FAILURES",
    gateCPreview: "BLOCKED",
    phase3: "WAITING_OWNER",
    phase4: "WAITING_OWNER_SESSION_DATA"
  },
  next: "EXACT_MISSING_EVIDENCE_TASK",
  rollback: `git revert ${finalCommit} ${evidenceCommit}`,
  evidenceArtifacts: [
    "docs/accessibility/a11y008-retest-starting-manifest.json",
    "docs/accessibility/a11y008-current-retest-plan.json",
    "docs/accessibility/a11y008-contrast-measurements.json",
    "tests/accessibility/evidence/a11y008-retest/manifest.json"
  ].map((path) => ({ path, bytes: readFileSync(path).length, sha256: sha256(path) }))
};

writeJson("docs/accessibility/a11y008-current-retest-report.json", report);
writeJson("docs/recovery/9of10-phase-5d1-a11y008-retest-report.json", report);

const reportMarkdown = `# Teoyube 9/10 Phase 5D-1 A11Y-008 current-state retest

Final outcome: **BLOCKED_INCONCLUSIVE**
Previous status: **NEEDS_MORE_EVIDENCE**
Owner decision: \`${decisionId}\`
Starting commit: \`${startingCommit}\`
Test/evidence commit: \`${evidenceCommit}\`
Pre-phase tag: \`${tag}\`

## Result

The deterministic retest completed all **1,584** planned element/state cells across Next and static, six protected viewports, 100% and 200% browser-equivalent device metrics, and three Windows Chromium-family browser installations. There were **708 applicable**, **876 not applicable**, **563 passing**, **145 failing**, **7 unknown**, and **0 harness-error** cells.

The lowest computed ratio is **6.9851:1** and the lowest reliable rendered sample is **5.5411:1**, both above the required **4.5:1** threshold. The 145 recorded failures cannot be treated as a current product failure: 144 are forced-colors axe findings that report the historical authored 1.01:1 pair while computed forced colors are 21:1 and rendered pixels are predominantly high contrast. One additional cell has unavailable rendered evidence and contradicts the matching static sample. Seven cells have unresolved rendered samples in total. Outcome B is therefore forbidden by the unknown and contradictory evidence, and Outcome A is not established by a reliable below-threshold rendered pair.

A11Y-008 remains **NEEDS_MORE_EVIDENCE**. No product fix, former-proposal reactivation, new proposal, manual/AT completion, or conformance claim was made.

## Exact missing evidence

${exactMissingEvidence.map((item) => `- ${item}`).join("\n")}

## Protection

- Product source changes: 0.
- Protected visual changes: 0.
- CSS/color changes: 0.
- DOM/ARIA changes: 0.
- Baseline writes: 0.
- Package/lockfile changes: 0.
- Paid calls: 0.
- Participant records and sessions: 0.

## Regression evidence

- Runtime: PASS — Next canonical, static rollback retained.
- Recovery: PASS — 268 protected source entries, 72 immutable screenshots, 12 desktop DOM snapshots, and owner-approved support baselines unchanged.
- Phase 5C-1, 5C-2, and 5C-3A delta contracts: PASS (13/13 combined focused tests).
- A11Y-008 evidence contract: PASS (3/3).
- Typecheck and full lint: PASS.
- Release security/secret gate: PASS — 18 controls, zero critical/high.
- Research pilot: PASS — zero participants, sessions, participant records, or paid calls.
- Temporary listeners on 3194 and 4194: closed.

## Independent blockers

The single high development-only \`js-yaml\` advisory, CSS budget **1,416,075 / 948,538 bytes**, nine broad pre-existing parity failures, Gate C-Preview block, Phase 3 **WAITING_OWNER**, and Phase 4 **WAITING_OWNER_SESSION_DATA** remain open and were not remediated.

## Next gate

Phase 5 is **WAITING_EVIDENCE**. The next action is the exact missing-evidence task above. Manual accessibility evidence execution did not begin.

## Rollback

\`git revert <phase-5d1-final-report-commit> ${evidenceCommit}\`
`;

writeFileSync("docs/accessibility/a11y008-current-retest-report.md", reportMarkdown);
writeFileSync("docs/recovery/9of10-phase-5d1-a11y008-retest-report.md", reportMarkdown);

const issueRegister = readJson("docs/accessibility/accessibility-issue-register.json");
issueRegister.phase = "5D-1_BLOCKED_INCONCLUSIVE";
const issue = issueRegister.issues.find((candidate) => candidate.id === "A11Y-008");
if (!issue || issue.proposalHash !== proposalHash) throw new Error("A11Y-008 historical proposal hash mismatch");
Object.assign(issue, {
  classification: "NOT_REPRODUCED_CURRENT_NEEDS_MORE_EVIDENCE",
  phase5d1Status: "BLOCKED_INCONCLUSIVE",
  phase5d1Evidence: "1,584 cells; 708 applicable; 876 not applicable; lowest computed 6.9851:1; lowest reliable rendered 5.5411:1; 144 forced-colors axe conflicts; 7 unknown rendered samples; one static/Next contradiction; zero harness errors.",
  phase5d1Report: "docs/accessibility/a11y008-current-retest-report.json",
  phase5d1ProductChanges: 0,
  implementationRequiredNow: false,
  nextGate: "EXACT_MISSING_EVIDENCE_TASK"
});
writeJson("docs/accessibility/accessibility-issue-register.json", issueRegister);

const wcag = readJson("docs/accessibility/wcag-2.2-aa-conformance-matrix.json");
wcag.phase = "5D-1_BLOCKED_INCONCLUSIVE";
const criterion = wcag.criteria.find((candidate) => candidate.id === "1.4.3");
if (!criterion) throw new Error("WCAG 1.4.3 entry missing");
criterion.status = "NEEDS_MORE_EVIDENCE";
criterion.evidence = "Phase 5D-1 completed 1,584 A11Y-008 cells. Computed and reliable rendered ratios pass (minimum 6.9851:1 and 5.5411:1), but 144 forced-colors axe findings conflict with computed/rendered evidence, seven rendered samples remain unknown, and one static/Next cell contradicts. Outcome BLOCKED_INCONCLUSIVE; A11Y-009 manual contrast review remains incomplete.";
writeJson("docs/accessibility/wcag-2.2-aa-conformance-matrix.json", wcag);

const assistive = readJson("docs/accessibility/assistive-technology-results.json");
assistive.phase = "5D-1_BLOCKED_INCONCLUSIVE";
assistive.updatedAt = executedAt;
const forcedColors = assistive.results.find((candidate) => candidate.technology === "Windows forced colors and reduced motion emulation");
if (!forcedColors) throw new Error("Forced-colors assistive-technology row missing");
forcedColors.status = "BLOCKED_INCONCLUSIVE";
forcedColors.evidence = "Phase 5D-1 exercised D02/D05 across 216 environment contexts and 1,584 element/state cells. Forced-colors computed colors are black/white (21:1) and rendered samples are predominantly high contrast, but 144 scoped axe results report the historical authored 1.01:1 pair; six static 200% forced-colors rendered pairs remain unavailable. Manual perception and physical-device review remain NOT_TESTED.";
writeJson("docs/accessibility/assistive-technology-results.json", assistive);

const program = readJson("docs/recovery/9of10-program-status.json");
program.currentCommit = finalCommit;
program.nextReadyPhase = "PHASE5D1_EXACT_MISSING_EVIDENCE_TASK";
const phase5 = program.phases.find((candidate) => candidate.phaseId === "5");
if (!phase5) throw new Error("Phase 5 program entry missing");
phase5.status = "WAITING_EVIDENCE";
phase5.currentCommit = finalCommit;
const phase5d1Deliverable = "Phase 5D-1 A11Y-008 deterministic retest: BLOCKED_INCONCLUSIVE";
phase5.deliverables = phase5.deliverables.filter((entry) => !entry.startsWith("Phase 5D-1"));
phase5.deliverables.push(phase5d1Deliverable);
phase5.currentEvidence = phase5.currentEvidence.filter((entry) => !entry.startsWith("Phase 5D-1"));
phase5.currentEvidence.push("Phase 5D-1: 1,584 cells across Next/static, six viewports, 100/200%, and three browser installations; minimum computed 6.9851:1 and reliable rendered 5.5411:1; 144 forced-colors axe conflicts, seven rendered unknowns, one static/Next contradiction, and zero harness errors.");
phase5.currentEvidence.push("Phase 5D-1 product, CSS/color, DOM/ARIA, baseline, package/lockfile, paid-call, participant, and manual-task changes: zero.");
phase5.currentBlockers[0] = "A11Y-008 Phase 5D-1 is BLOCKED_INCONCLUSIVE: forced-colors axe authored-color evidence conflicts with computed/rendered high-contrast evidence; seven rendered samples and one static/Next comparison remain unresolved.";
phase5.nextReviewTrigger = "Execute only the exact Phase 5D-1 missing-evidence task; any A11Y-008 product implementation still requires reproducible current failure evidence, a new or revalidated proposal hash, and issue-specific owner approval.";
const phase5d1Subphase = {
  subphaseId: "5D-1",
  status: "BLOCKED_INCONCLUSIVE",
  issueIds: ["A11Y-008"],
  started: true,
  completed: true,
  productImplementation: false,
  testEvidenceCommit: evidenceCommit,
  finalReportCommit: finalCommit
};
phase5.subphases = phase5.subphases.filter((entry) => entry.subphaseId !== "5D-1");
phase5.subphases.push(phase5d1Subphase);
writeJson("docs/recovery/9of10-program-status.json", program);

const ledger = readJson("docs/recovery/9of10-evidence-ledger.json");
ledger.generatedAt = executedAt;
const phase5d1LedgerUpdate = {
  phase: "5D-1",
  status: "BLOCKED_INCONCLUSIVE",
  executedAt,
  startingCommit,
  testEvidenceCommit: evidenceCommit,
  finalReportCommit: finalCommit,
  decisionId,
  issue: "A11Y-008",
  formerProposalHash: proposalHash,
  totalCells: 1584,
  applicableCells: 708,
  notApplicableCells: 876,
  passingCells: 563,
  failingCells: 145,
  unknownCells: 7,
  harnessErrors: 0,
  scopedAxeFailures: 144,
  lowestComputedRatio: 6.9851,
  lowestReliableRenderedRatio: 5.5411,
  contradictions: 1,
  exactMissingEvidence,
  productSourceFilesChanged: 0,
  protectedVisualFilesChanged: 0,
  cssDomAriaChanges: 0,
  baselineFilesChanged: 0,
  packageLockFilesChanged: 0,
  paidCalls: 0,
  participantRecords: 0,
  manualTasksExecuted: 0
};
ledger.phaseUpdates = ledger.phaseUpdates.filter((entry) => entry.phase !== "5D-1");
ledger.phaseUpdates.push(phase5d1LedgerUpdate);
ledger.workspaceAfterPhase5d1 = {
  branch: "recovery/visual-source-of-truth",
  commit: finalCommit,
  trackedWorktree: "CLEAN_AFTER_COMMIT",
  protectedVisualFilesChanged: 0,
  immutableBaselineFilesChanged: 0,
  ownerApprovedBaselineFilesChanged: 0,
  productSourceFilesChanged: 0,
  packageLockFilesChanged: 0
};
writeJson("docs/recovery/9of10-evidence-ledger.json", ledger);

const decisions = readJson("docs/recovery/9of10-owner-decisions.json");
decisions.updatedAt = executedAt;
const splitDecision = decisions.decisions.find((candidate) => candidate.decisionId === decisionId);
if (!splitDecision) throw new Error("Split owner decision missing");
splitDecision.issueStatuses["A11Y-008"] = "NEEDS_MORE_EVIDENCE_PHASE5D1_BLOCKED_INCONCLUSIVE";
splitDecision.phase5d1RetestEvidence = {
  executedAt,
  status: "BLOCKED_INCONCLUSIVE",
  totalCells: 1584,
  applicableCells: 708,
  unknownCells: 7,
  scopedAxeFailures: 144,
  lowestComputedRatio: 6.9851,
  lowestReliableRenderedRatio: 5.5411,
  productChanges: 0,
  implementationAuthorized: false,
  newOwnerDecisionCreated: false,
  testEvidenceCommit: evidenceCommit,
  finalReportCommit: finalCommit
};
writeJson("docs/recovery/9of10-owner-decisions.json", decisions);

const phase5d1Section = `## Phase 5D-1 A11Y-008 retest (${executedAt})

A11Y-008 completed its deterministic 1,584-cell retest with **BLOCKED_INCONCLUSIVE** outcome. Minimum computed and reliable rendered ratios are 6.9851:1 and 5.5411:1, but forced-colors axe evidence conflicts with computed/rendered evidence, seven rendered samples remain unknown, and one static/Next comparison contradicts. A11Y-008 remains **NEEDS_MORE_EVIDENCE**; product changes, manual task completions, and new owner decisions are zero.`;

appendSection("docs/accessibility/accessibility-issue-register.md", "## Phase 5D-1 A11Y-008 retest", phase5d1Section);
appendSection("docs/accessibility/wcag-2.2-aa-conformance-matrix.md", "## Phase 5D-1 A11Y-008 retest", `${phase5d1Section}\n\nComplete WCAG 2.2 AA conformance remains **NOT CLAIMED**.`);
appendSection("docs/accessibility/assistive-technology-results.md", "## Phase 5D-1 forced-colors evidence", `## Phase 5D-1 forced-colors evidence\n\n${forcedColors.evidence} No manual/physical AT result was marked complete.`);
appendSection("docs/recovery/9of10-program-status.md", "## Phase 5D-1 A11Y-008 retest", `${phase5d1Section}\n\nPhase 5 is **WAITING_EVIDENCE**. Phase 3 remains **WAITING_OWNER** and Phase 4 remains **WAITING_OWNER_SESSION_DATA**. The next gate is only the exact missing-evidence task.`);
appendSection("docs/recovery/9of10-evidence-ledger.md", "## Phase 5D-1 A11Y-008 evidence", `## Phase 5D-1 A11Y-008 evidence\n\n- Matrix: 1,584 total; 708 applicable; 876 not applicable; 563 passing; 145 failing; 7 unknown; 0 harness errors.\n- Ratios: 6.9851:1 minimum computed; 5.5411:1 minimum reliable rendered; required 4.5:1.\n- Conflict: 144 forced-colors axe findings disagree with computed and predominantly high-contrast rendered evidence; one static/Next contradiction remains.\n- Protection: 0 product, protected visual, CSS/DOM/ARIA, baseline, package/lock, paid-call, participant, or manual-task changes.\n- Outcome: **BLOCKED_INCONCLUSIVE**; A11Y-008 **NEEDS_MORE_EVIDENCE**.`);
appendSection("docs/recovery/9of10-owner-decisions.md", "## Phase 5D-1 evidence under the split owner decision", `## Phase 5D-1 evidence under the split owner decision\n\nAt \`${executedAt}\`, the authorized A11Y-008 evidence-only retest completed with **BLOCKED_INCONCLUSIVE** outcome. This is execution evidence under \`${decisionId}\`, not a new owner decision. Product implementation remains unauthorized; manual tasks executed: 0; no approval was fabricated.`);
appendSection("docs/recovery/9of10-phase-history.md", "## Phase 5D-1 - A11Y-008 current-state retest", `## Phase 5D-1 - A11Y-008 current-state retest\n\nStatus: **BLOCKED_INCONCLUSIVE**\n\nStarted from: \`${startingCommit}\`\n\nTest/evidence commit: \`${evidenceCommit}\`\n\nThe full 1,584-cell deterministic retest completed without harness errors or product changes. Computed and reliable rendered ratios exceed 4.5:1, but forced-colors axe output conflicts with those measurements, seven rendered samples remain unknown, and one static/Next comparison contradicts. A11Y-008 remains NEEDS_MORE_EVIDENCE. Phase 5 is WAITING_EVIDENCE; no manual task or later phase began.`);

let risks = readFileSync("docs/recovery/9of10-risk-register.md", "utf8");
risks = risks.replace(
  /\| 9R-06 \| Accessibility conformance unproved \|.*?\| Phase 5 and Phase 2A recheck \|.*?\|/,
  "| 9R-06 | Accessibility conformance unproved | Phase 5C-1, 5C-2, and 5C-3A fixed A11Y-001 through A11Y-007; Phase 5D-1 is BLOCKED_INCONCLUSIVE for A11Y-008 because 144 forced-colors axe findings conflict with computed/rendered evidence, seven rendered samples remain unknown, and one static/Next comparison contradicts; all manual/AT scopes remain NOT_TESTED | Phase 5 and Phase 2A recheck | Complete the exact A11Y-008 missing-evidence task and approved manual/AT evidence; do not claim conformance early |"
);
writeFileSync("docs/recovery/9of10-risk-register.md", risks);

const validations = [
  issue.phase5d1Status === "BLOCKED_INCONCLUSIVE",
  criterion.status === "NEEDS_MORE_EVIDENCE",
  forcedColors.status === "BLOCKED_INCONCLUSIVE",
  phase5.status === "WAITING_EVIDENCE",
  splitDecision.phase5d1RetestEvidence.productChanges === 0,
  report.protection.productSourceChanges === 0,
  report.protection.baselineWrites === 0,
  report.regression.paidCalls === 0
];
if (validations.some((valid) => !valid)) throw new Error("Phase 5D-1 ledger validation failed");

console.log(JSON.stringify({ valid: true, executedAt, outcome: report.finalOutcome, totalCells: summary.totalMatrixCells }, null, 2));
