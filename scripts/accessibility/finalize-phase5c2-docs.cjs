const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const EXECUTED_AT = "2026-08-06T10:35:23.723Z";
const STARTING_COMMIT = "621aac4d70858c823e44b1f5df6f43688c68f451";
const IMPLEMENTATION_COMMIT = "0716dc6";
const TEST_COMMIT = "dbda6ba";
const OWNER_DECISION = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const PROPOSAL_HASHES = {
  "A11Y-003": "512755ac81b5cf4961c9c548a8a7eea12c7677564762635d589d26de1656a1ca",
  "A11Y-005": "048ab643249f468aedd9d9db15205a762d2789c40ddd2936ccbd763ede2ac5ce",
  "A11Y-006": "0ba9a5fb8e12da2e3f26176e168ee3255d64d0033b9467ac6ff35fb48bde0a61",
};

function absolute(relativePath) {
  return path.join(ROOT, ...relativePath.split("/"));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(absolute(relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function writeText(relativePath, value) {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}

function appendSection(relativePath, marker, section) {
  let text = readText(relativePath);
  const markerIndex = text.indexOf(marker);
  if (markerIndex >= 0) {
    text = text.slice(0, markerIndex).trimEnd();
  }
  writeText(relativePath, `${text}\n\n${section.trim()}\n`);
}

function sha256(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(absolute(relativePath))).digest("hex");
}

function artifact(relativePath) {
  return {
    path: relativePath,
    bytes: fs.statSync(absolute(relativePath)).size,
    sha256: sha256(relativePath),
  };
}

const after = readJson("docs/accessibility/phase-5c2-after-evidence.json");
const paired = readJson("tests/accessibility/evidence/phase-5c2/after/paired-static-raster.json");

const deltaCommon = {
  ownerDecisionId: OWNER_DECISION,
  ownerDecisionAt: "2026-08-05T17:13:18.973Z",
  batch: "5C-2",
  implementationCommit: IMPLEMENTATION_COMMIT,
  testCommit: TEST_COMMIT,
  expectedPixelChange: 0,
  baselineUpdateAuthorized: false,
  baselineFilesChanged: 0,
  cssFilesChanged: 0,
  classOrIdChanges: 0,
};

const approvedDelta = {
  schemaVersion: 1,
  phase: "5C-2",
  status: "PASS",
  generatedAt: EXECUTED_AT,
  ...deltaCommon,
  issues: [
    {
      id: "A11Y-003",
      proposalHash: PROPOSAL_HASHES["A11Y-003"],
      routes: ["/canon"],
      states: ["default", "media-stage-focused", "media-stage-playing"],
      viewports: ["desktop-wide", "desktop-standard", "tablet-landscape", "tablet-portrait", "mobile", "mobile-small"],
      selectors: [".canon-project-media", ".canon-recent-media"],
      files: ["app.js"],
      approvedDelta: "Add role=button, tabindex=0, aria-pressed, stable accessible names, and click/Enter/Space playback to the same 11 visible static Canon stages.",
      preserved: ["all 11 media controls", "Next behavior", "visible copy", "classes and IDs", "media mapping", "layout and pixels"],
      evidence: "12/12 runtime/viewport cells expose exactly 11 named keyboard-operable stages; 36/36 click, Enter, and Space activations passed.",
      rollback: "Revert only the A11Y-003 app.js adapter delta; do not remove the existing Next controls or alter baselines.",
    },
    {
      id: "A11Y-005",
      proposalHash: PROPOSAL_HASHES["A11Y-005"],
      routes: ["/lexicon", "/embedded-videos", "/tables"],
      states: ["default", "search-focused", "filtered-results"],
      viewports: ["desktop-wide", "desktop-standard", "tablet-landscape", "tablet-portrait", "mobile", "mobile-small"],
      selectors: ["#lexiconSearchInput", "#uiVideoSearch", "#teoyubeTableSearch"],
      files: ["index.html", "src/app/_approved-source/approved-view-markup.generated.ts"],
      approvedDelta: "Add route-specific aria-label values to the three existing search inputs.",
      preserved: ["placeholders", "IDs", "wrappers", "styling", "filter behavior", "visible copy", "focus order", "pixels"],
      evidence: "36/36 runtime/viewport input cells have the three exact names and retain focus, input, and filter behavior.",
      rollback: "Revert only the three A11Y-005 aria-label additions; regenerate no baseline.",
    },
    {
      id: "A11Y-006",
      proposalHash: PROPOSAL_HASHES["A11Y-006"],
      routes: ["/testimony"],
      states: ["default", "drafts-tab"],
      viewports: ["mobile", "mobile-small"],
      selectors: [".testimony-milestones"],
      files: ["index.html", "src/app/_approved-source/approved-view-markup.generated.ts"],
      approvedDelta: "Add tabindex=0, role=region, and aria-label=Testimony milestones to the existing scroll region.",
      preserved: ["children", "order", "overflow", "testimony state", "user data behavior", "layout and pixels"],
      evidence: "8/8 cells expose a named focusable region; focus stays contained during ArrowRight, all four overflow cells scroll, and axe scrollable-region-focusable returns zero.",
      rollback: "Revert only the A11Y-006 attributes and rerun Testimony and recovery checks.",
    },
  ],
  scopedCharacterization: {
    cells: after.summary.cellCount,
    runtimes: after.summary.runtimeCount,
    viewports: after.summary.viewportCount,
    unexpectedErrors: after.summary.unexpectedErrorCount,
  },
  visualEvidence: {
    strictStableFrameStatus: paired.status,
    strictStableFrameChangedPixels: paired.summary?.changedPixelCount ?? 0,
    sequentialCaptureNote: "54/56 first sequential captures were zero; two static first-frame differences were retested with paired stable-frame capture and both were zero pixels.",
    masks: 0,
    tolerancesAdded: 0,
    baselineReplacements: 0,
  },
  exclusions: ["A11Y-007", "A11Y-008", "A11Y-009", "A11Y-010", "A11Y-011", "A11Y-MANUAL-001 through A11Y-MANUAL-009", "Phase 5C-3", "Phase 6A"],
};
writeJson("tests/accessibility/approved-deltas/phase-5c2/manifest.json", approvedDelta);

const issueRegister = readJson("docs/accessibility/accessibility-issue-register.json");
issueRegister.phase = "5C-2";
issueRegister.fixedIssueCount = 6;
issueRegister.openConfirmedIssueCount = 2;
for (const issue of issueRegister.issues) {
  if (["A11Y-003", "A11Y-005", "A11Y-006"].includes(issue.id)) {
    issue.phase5c2Status = "FIXED";
    issue.proposalHash = PROPOSAL_HASHES[issue.id];
  }
}
issueRegister.issues.find((issue) => issue.id === "A11Y-003").phase5c2Evidence = "Exactly 11 visible Canon media stages are named and keyboard-operable in both runtimes; click, Enter, and Space preserve the existing playback mapping. The previous static/Next accessibility parity delta is closed without removing a control.";
issueRegister.issues.find((issue) => issue.id === "A11Y-005").phase5c2Evidence = "All 36 runtime/viewport cells expose the exact route-specific search-input name while retaining the existing query/filter behavior.";
issueRegister.issues.find((issue) => issue.id === "A11Y-006").phase5c2Evidence = "The existing Testimony milestones region is named and keyboard-focusable in 8/8 cells; focus remains contained and every horizontally overflowed mobile cell scrolls with ArrowRight; axe reports zero scrollable-region-focusable violations.";
writeJson("docs/accessibility/accessibility-issue-register.json", issueRegister);

writeText("docs/accessibility/accessibility-issue-register.md", `# Accessibility issue register

Phase 5A registered 11 items: eight confirmed product/accessibility defects or deltas and three manual evidence gaps. Phase 5C-1 fixed A11Y-001, A11Y-002, and A11Y-004. Phase 5C-2 fixed A11Y-003, A11Y-005, and A11Y-006. Two approved confirmed issues and all three manual evidence gaps remain open.

| ID | Severity | Classification | Route(s) | Summary | WCAG | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| A11Y-001 | Critical | Confirmed defect | Lexicon | Unsupported ARIA attribute on 27 alphabet options | 1.3.1, 4.1.2 | **FIXED in 5C-1** |
| A11Y-002 | High | Confirmed defect | Today | Focusable actions in hidden carousel slides | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-003 | High | Confirmed parity delta | Canon | Static runtime lacked the 11 named keyboard media controls present in Next | 2.4.3, 2.4.6, 4.1.2 | **FIXED in 5C-2** |
| A11Y-004 | High | Confirmed defect | Canon | Hidden recent-row control remained focusable | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-005 | High | Confirmed name defect | Lexicon, Embedded Videos, Tables | Three search inputs lacked durable programmatic names | 2.4.6, 3.3.2, 4.1.2 | **FIXED in 5C-2** |
| A11Y-006 | High | Confirmed defect | Testimony | Milestones scroll region lacked keyboard access | 2.1.1 | **FIXED in 5C-2** |
| A11Y-007 | High | Confirmed defect | Today, Canon, Book, Explore | Target-size failures | 2.5.8 | Approved for 5C-3; not started |
| A11Y-008 | High | Confirmed defect | Canon | In-progress status contrast fails | 1.4.3 | Approved for 5C-3; not started |
| A11Y-009 | Medium | Manual validation | All retained routes | Complex-background contrast incomplete | 1.4.1, 1.4.3, 1.4.11 | APPROVED, NOT_TESTED |
| A11Y-010 | Medium | Manual validation | All retained routes | Focus visibility/obscuration needs human review | 2.4.7, 2.4.11 | APPROVED, NOT_TESTED |
| A11Y-011 | High | Manual AT/media validation | Media routes | Captions, alternatives, third-party controls, and spoken output unverified | 1.2.x, 2.1.1, 4.1.3 | APPROVED, NOT_TESTED |

## Phase 5C-2 evidence

- A11Y-003: 12/12 runtime/viewport cells expose exactly 11 named keyboard controls; 36/36 click, Enter, and Space activations passed.
- A11Y-005: 36/36 cells expose the exact route-specific search-input name; 36/36 retain existing input behavior.
- A11Y-006: 8/8 cells expose a named focusable region; focus remains contained, all four overflow cells scroll, and axe reports zero related violations.
- Current audit: 311 cells, zero errors, zero missing names, zero hidden-focus findings, and only the later-batch target-size and color-contrast rule families remain.
- Stable paired before/after raster: zero changed pixels for the two first-capture outliers; no masks, tolerance changes, or baseline replacement.

All manual and assistive-technology tasks remain **NOT_TESTED**. Complete WCAG 2.2 AA conformance is not claimed.
`);

const assistive = readJson("docs/accessibility/assistive-technology-results.json");
assistive.phase = "5C-2";
assistive.updatedAt = EXECUTED_AT;
assistive.results.find((item) => item.technology === "Keyboard").evidence = "311 current audit cells and 81 traversal cells; A11Y-003 Canon media semantics now match across runtimes, A11Y-006 Testimony milestone scrolling is keyboard accessible, and hidden-focus findings remain zero. Manual physical keyboard and AT review remains.";
assistive.results.find((item) => item.technology === "Chrome accessibility engine plus axe-core").evidence = "311 cells; two remaining automated violation-rule families (target-size and color-contrast); zero harness errors, zero missing names, zero aria-allowed-attr, zero aria-hidden-focus, and zero scrollable-region-focusable.";
writeJson("docs/accessibility/assistive-technology-results.json", assistive);
writeText("docs/accessibility/assistive-technology-results.md", `# Assistive-technology results

Automated keyboard and Chrome accessibility-engine testing completed for Phase 5C-2. The current 311-cell audit has zero execution errors, zero missing accessible names, zero unsupported ARIA findings, zero hidden-focus findings, and zero scrollable-region-focusable findings. The only remaining automated violation families are A11Y-007 target size and A11Y-008 Canon status contrast, both reserved for Phase 5C-3.

The Phase 5C-2 focused browser evidence confirms exact Canon click/Enter/Space playback for 11 controls, durable names for all three retained search inputs, and keyboard focus/scroll behavior for the Testimony milestone region across the scoped runtimes and viewports.

This automation is not equivalent to a screen-reader, braille, switch, speech-input, magnifier, or physical-device test. Windows Narrator is installed, but spoken output is not reliably observable from this headless environment. It remains **NOT_TESTED**. NVDA, JAWS, ZoomText, VoiceOver, TalkBack, braille, switch control, and speech-input configurations remain unavailable or not configured.

Manual tasks completed: **0**. Complete WCAG 2.2 AA conformance is not claimed.
`);

const wcag = readJson("docs/accessibility/wcag-2.2-aa-conformance-matrix.json");
wcag.phase = "5C-2";
const wcagUpdates = {
  "2.1.1": ["PARTIAL_EVIDENCE", "A11Y-006 fixed: the Testimony milestone region is named, focusable, and keyboard-scrollable. A11Y-011 media and observable assistive-technology validation remains."],
  "2.4.3": ["PARTIAL_EVIDENCE", "A11Y-002, A11Y-003, and A11Y-004 fixed. Canon exposes the same 11 named keyboard media controls in both runtimes; manual assistive-technology reading/focus-order review remains."],
  "2.4.6": ["PARTIAL_EVIDENCE", "A11Y-003 and A11Y-005 fixed; exact media-control and search-input names are verified. Manual label-clarity review remains."],
  "3.3.2": ["PARTIAL_EVIDENCE", "A11Y-005 fixed: all three retained search inputs expose route-specific programmatic names; broader human instruction review remains."],
  "4.1.2": ["PARTIAL_EVIDENCE", "A11Y-001 through A11Y-005 applicable name/role/state findings are fixed; observable screen-reader and third-party media-control validation remains."],
};
for (const criterion of wcag.criteria) {
  if (wcagUpdates[criterion.id]) {
    [criterion.status, criterion.evidence] = wcagUpdates[criterion.id];
  }
}
writeJson("docs/accessibility/wcag-2.2-aa-conformance-matrix.json", wcag);
let wcagMd = readText("docs/accessibility/wcag-2.2-aa-conformance-matrix.md")
  .replace("| 2.1.1 Keyboard | A | **Fail** | A11Y-006 Testimony milestones scroll region. |", "| 2.1.1 Keyboard | A | Partial | A11Y-006 fixed; media and observable assistive-technology validation remains. |")
  .replace("| 2.4.3 Focus Order | A | **Fail** | A11Y-002 and A11Y-004 fixed in Phase 5C-1; A11Y-003 remains. |", "| 2.4.3 Focus Order | A | Partial | A11Y-002, A11Y-003, and A11Y-004 fixed; manual AT order review remains. |")
  .replace("| 2.4.6 Headings and Labels | AA | Partial | Headings captured; A11Y-005 and clarity review remain. |", "| 2.4.6 Headings and Labels | AA | Partial | A11Y-003 and A11Y-005 fixed; manual clarity review remains. |")
  .replace("| 3.3.2 Labels or Instructions | A | Partial | A11Y-005 custom name findings. |", "| 3.3.2 Labels or Instructions | A | Partial | A11Y-005 fixed; broader human instruction review remains. |")
  .replace("| 4.1.2 Name, Role, Value | A | **Fail** | A11Y-001, A11Y-002, and A11Y-004 fixed in Phase 5C-1; A11Y-005 remains. |", "| 4.1.2 Name, Role, Value | A | Partial | Applicable A11Y-001 through A11Y-005 findings fixed; observable AT/media validation remains. |");
wcagMd = wcagMd.replace(/\n## Phase 5C-1 update[\s\S]*$/, "");
writeText("docs/accessibility/wcag-2.2-aa-conformance-matrix.md", `${wcagMd.trimEnd()}\n\n## Phase 5C-2 update\n\nThe matrix remains a non-conformance evidence matrix. Phase 5C-2 closes A11Y-003, A11Y-005, and A11Y-006, but A11Y-007, A11Y-008, and every manual/AT evidence gap remain. **Complete WCAG 2.2 AA conformance: NO.**\n`);

const ownerReview = readJson("docs/accessibility/owner-review/phase-5b-owner-decisions.json");
for (const decision of ownerReview.decisions) {
  if (["A11Y-003", "A11Y-005", "A11Y-006"].includes(decision.id)) {
    decision.executionStatus = "EXECUTED_PHASE5C2_PASS";
  }
}
ownerReview.phase5c = "IN_PROGRESS_5C1_AND_5C2_PASS_5C3_READY";
ownerReview.updatedAt = EXECUTED_AT;
writeJson("docs/accessibility/owner-review/phase-5b-owner-decisions.json", ownerReview);

const program = readJson("docs/recovery/9of10-program-status.json");
program.currentCommit = "FINAL_PHASE5C2_EVIDENCE_COMMIT_REPORTED_IN_FINAL_HANDOFF";
program.nextReadyPhase = "5C-3_OR_6A";
program.otherReadyIndependentSubphases = ["5C-3", "6A"];
const phase5 = program.phases.find((phase) => phase.phaseId === "5");
phase5.currentCommit = "FINAL_PHASE5C2_EVIDENCE_COMMIT_REPORTED_IN_FINAL_HANDOFF";
phase5.deliverables = [
  "current accessibility audit: COMPLETE",
  "issue-specific owner review and decisions: COMPLETE",
  "Phase 5C-1 approved critical/fail-closed fixes: PASS",
  "Phase 5C-2 approved high-severity fixes: PASS",
  "Phase 5C-3 approved target-size/contrast fixes: READY_NOT_STARTED",
  "manual evidence tasks: APPROVED_NOT_TESTED",
];
phase5.currentEvidence = [
  "A11Y-001 through A11Y-006 exact approved fixes PASS under owner decision TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001",
  "Phase 5C-2: 56 focused cells; 11 Canon controls, three search-input names, and Testimony keyboard scrolling verified across both runtimes",
  "311-cell current audit: zero harness errors, missing names, hidden focus, unsupported ARIA, or scrollable-region-focusable; remaining automated families are A11Y-007 target size and A11Y-008 contrast",
  "Strict stable-frame before/after comparison: zero changed pixels; no masks, tolerance change, baseline replacement, CSS, copy, class, ID, or asset change",
  "72 immutable screenshots, 12 desktop DOM snapshots, and owner-approved support baselines unchanged",
  "No WCAG conformance claim; all approved manual/AT tasks remain NOT_TESTED",
  "Current performance audit completed 72/72 first-run cells below 5,000 ms, but broad parity and CSS-budget blockers remain outside Phase 5C-2",
];
phase5.currentBlockers = [
  "A11Y-007 and A11Y-008 are approved for Phase 5C-3 but not started",
  "All approved manual accessibility tasks remain NOT_TESTED",
  "Complete WCAG 2.2 AA conformance remains unproved",
  "Gate C-Preview remains blocked by pre-existing broad parity, incomplete 216-cell performance evidence, CSS budget, and stale release evidence",
];
phase5.nextReviewTrigger = "Start only the separately tasked, exact hash-bound Phase 5C-3 scope; do not execute manual evidence or Phase 6A implicitly.";
for (const subphase of phase5.subphases) {
  if (subphase.subphaseId === "5C-2") subphase.status = "PASS";
  if (subphase.subphaseId === "5C-3") subphase.status = "READY";
}
writeJson("docs/recovery/9of10-program-status.json", program);

const evidenceLedger = readJson("docs/recovery/9of10-evidence-ledger.json");
evidenceLedger.generatedAt = EXECUTED_AT;
evidenceLedger.workspaceAfterPhase5c2 = {
  branch: "recovery/visual-source-of-truth",
  startingCommit: STARTING_COMMIT,
  implementationCommit: IMPLEMENTATION_COMMIT,
  testCommit: TEST_COMMIT,
  evidenceCommit: "FINAL_PHASE5C2_EVIDENCE_COMMIT_REPORTED_IN_FINAL_HANDOFF",
};
evidenceLedger.phaseUpdates = evidenceLedger.phaseUpdates.filter((item) => item.phase !== "5C-2");
evidenceLedger.phaseUpdates.push({
  phase: "5C-2",
  status: "PASS",
  executedAt: EXECUTED_AT,
  startingCommit: STARTING_COMMIT,
  prePhaseTag: "teoyube-9of10-phase5c2-start-621aac4",
  implementationCommit: IMPLEMENTATION_COMMIT,
  testCommit: TEST_COMMIT,
  evidenceCommit: "FINAL_PHASE5C2_EVIDENCE_COMMIT_REPORTED_IN_FINAL_HANDOFF",
  ownerDecisionId: OWNER_DECISION,
  issueIds: Object.keys(PROPOSAL_HASHES),
  proposalHashes: PROPOSAL_HASHES,
  scopedEvidenceCells: 56,
  currentAuditCells: 311,
  currentAuditErrors: 0,
  fixedIssues: 3,
  remainingConfirmedIssues: 2,
  manualTasksExecuted: 0,
  conformanceClaim: false,
  productSourceFilesChanged: 3,
  protectedVisualFilesChanged: 0,
  cssFilesChanged: 0,
  classIdChanges: 0,
  assetCopyChanges: 0,
  immutableBaselineFilesChanged: 0,
  ownerApprovedBaselineFilesChanged: 0,
  packageJsonChanged: false,
  packageLockFilesChanged: 0,
  paidCalls: 0,
  verification: {
    npmCi: "PASS_408_PACKAGES",
    audit: "PASS_ZERO_FULL_AND_PRODUCTION",
    typecheck: "PASS",
    lint: "PASS",
    unit: "PASS_AFTER_ISOLATED_SERIAL_CONFIRMATION_PARALLEL_HOST_TIMEOUTS_ONLY",
    integration: "PASS_101",
    browser: "PASS_60_RUNNABLE_3_STATIC_SKIPS_SERIAL",
    focusedBrowser: "PASS_3_OF_3",
    build: "PASS_NEXT_16_3_0_58_PAGES",
    security: "PASS_18_CONTROLS_CRITICAL_HIGH_0",
    gateA: "PASS_64_OF_64",
    teoGuide: "PASS_49_OF_49_13_TOOLS",
    retrieval: "PASS_DETERMINISTIC_21_OF_21_33563_CHUNKS_ZERO_PROVIDER_CALLS",
    optionalCandidateModelRetrievalEvaluation: "BLOCKED_LIVE_PROVIDER_DISABLED_ZERO_CALLS",
    recovery: "PASS_72_SCREENSHOTS_12_DOM",
    runtime: "PASS_NEXT_CANONICAL_STATIC_ROLLBACK",
    dualRuntime: "PASS_83_LISTENERS_CLOSED",
    accessibility: "PASS_311_CELLS_ZERO_ERRORS_TWO_LATER_BATCH_RULE_FAMILIES",
    scopedRaster: "PASS_STABLE_ZERO_PIXELS",
    performance: "BLOCKED_72_OF_216_AFTER_BROAD_PREEXISTING_PARITY_FAILURES",
    cssBudget: "BLOCKED_1414956_OF_948538_PREEXISTING",
  },
});
writeJson("docs/recovery/9of10-evidence-ledger.json", evidenceLedger);

const ownerDecisions = readJson("docs/recovery/9of10-owner-decisions.json");
ownerDecisions.updatedAt = EXECUTED_AT;
const accessibilityDecision = ownerDecisions.decisions.find((decision) => decision.decisionId === OWNER_DECISION);
accessibilityDecision.scope = "Only the 20 current issue-specific and manual-task proposal hashes recorded in the Phase 5B decision ledger; Phase 5C-1 and Phase 5C-2 exact issue subsets executed independently.";
accessibilityDecision.phase5c2ExecutionEvidence = {
  phase: "5C-2",
  status: "PASS",
  executedAt: EXECUTED_AT,
  exactIssueIds: Object.keys(PROPOSAL_HASHES),
  exactProposalHashes: PROPOSAL_HASHES,
  implementationCommit: IMPLEMENTATION_COMMIT,
  testCommit: TEST_COMMIT,
  evidenceCommit: "FINAL_PHASE5C2_EVIDENCE_COMMIT_REPORTED_IN_FINAL_HANDOFF",
  expandedScope: false,
  manualTasksExecuted: 0,
  phase5c3Started: false,
};
writeJson("docs/recovery/9of10-owner-decisions.json", ownerDecisions);

const report = {
  schemaVersion: 1,
  phase: "5C-2",
  status: "PASS",
  outcome: "B_SCOPED_PASS_WITH_PREEXISTING_UNRELATED_GATES_OPEN",
  executedAt: EXECUTED_AT,
  branch: "recovery/visual-source-of-truth",
  startingCommit: STARTING_COMMIT,
  implementationCommit: IMPLEMENTATION_COMMIT,
  testCommit: TEST_COMMIT,
  finalCommit: "FINAL_PHASE5C2_EVIDENCE_COMMIT_REPORTED_IN_FINAL_HANDOFF",
  ownerDecisionId: OWNER_DECISION,
  issues: Object.keys(PROPOSAL_HASHES),
  proposalHashes: PROPOSAL_HASHES,
  scopedResult: {
    fixed: 3,
    partiallyFixed: 0,
    blocked: 0,
    newIssues: 0,
    focusedCells: 56,
    currentAuditCells: 311,
    currentAuditErrors: 0,
  },
  visualResult: {
    stableBeforeAfterChangedPixels: 0,
    cssFilesChanged: 0,
    copyChanges: 0,
    classIdChanges: 0,
    assetChanges: 0,
    immutableBaselineChanges: 0,
    ownerApprovedBaselineChanges: 0,
    protectedVisualFilesChanged: 0,
  },
  verification: evidenceLedger.phaseUpdates.at(-1).verification,
  openIssues: ["A11Y-007", "A11Y-008"],
  manualTasks: "0 completed; all approved tasks remain NOT_TESTED",
  conformanceClaim: false,
  gateCPreview: "BLOCKED",
  phase2A: "BLOCKED",
  phase3: "WAITING_OWNER",
  phase4: "WAITING_OWNER_SESSION_DATA",
  phase5c3: "READY_NOT_STARTED",
  phase6A: "READY_NOT_STARTED",
  paidCalls: 0,
  rollback: "git revert <phase-5c2-evidence-commit> dbda6ba 0716dc6",
  artifacts: [
    artifact("docs/accessibility/phase-5c2-starting-manifest.json"),
    artifact("docs/accessibility/phase-5c2-before-characterization.json"),
    artifact("docs/accessibility/phase-5c2-after-evidence.json"),
    artifact("tests/accessibility/evidence/phase-5c2/before/manifest.json"),
    artifact("tests/accessibility/evidence/phase-5c2/after/manifest.json"),
    artifact("tests/accessibility/evidence/phase-5c2/after/paired-static-raster.json"),
    artifact("tests/accessibility/approved-deltas/phase-5c2/manifest.json"),
  ],
};
writeJson("docs/recovery/9of10-phase-5c2-high-accessibility-report.json", report);
writeText("docs/recovery/9of10-phase-5c2-high-accessibility-report.md", `# Teoyube 9/10 Phase 5C-2 high-severity accessibility report

Status: **PASS**
Outcome: **B - scoped remediation passed; unrelated pre-existing gates remain open**
Owner decision: \`${OWNER_DECISION}\`
Starting commit: \`${STARTING_COMMIT}\`
Implementation/test commits: \`${IMPLEMENTATION_COMMIT}\`, \`${TEST_COMMIT}\`

## Result

The exact hash-bound A11Y-003, A11Y-005, and A11Y-006 remediations are fixed. Canon retains all 11 media controls and gains equivalent static-runtime keyboard semantics and playback. The three search inputs now have durable route-specific names. The existing Testimony milestone strip is a named keyboard-scrollable region.

The focused evidence covers 56 cells across both runtimes and six protected viewports. All scoped behavior passed, the current 311-cell audit has zero harness errors and none of the three scoped defect families, and paired stable-frame raster comparison reports zero changed pixels. No CSS, visible copy, class, ID, asset, or baseline was changed.

## Verification

- Clean install: PASS (408 packages); full and production audits: zero vulnerabilities.
- Typecheck, lint, build, integration, security, Gate A, Teo Guide, deterministic retrieval, runtime, dual-runtime, and recovery contracts: PASS.
- Unit: PASS after isolated serial confirmation; parallel host runs exposed timeouts only, not assertion failures.
- Browser: all 60 runnable tests pass serially; three static-only cases remain intentionally skipped.
- Recovery: 72 immutable screenshots and 12 desktop DOM snapshots pass; all owner-approved support baselines remain unchanged.
- Scoped raster: PASS, stable-frame zero pixels; no masks, tolerance changes, or baseline replacement.
- Paid OpenAI/embedding calls: 0.

## Open gates

- A11Y-007 target size and A11Y-008 contrast remain approved for Phase 5C-3 and were not started.
- Every manual and real assistive-technology task remains approved but NOT_TESTED. WCAG 2.2 AA conformance is not claimed.
- Phase 2A and Gate C-Preview remain BLOCKED by broad pre-existing parity, incomplete 216-cell performance evidence, CSS budget, and stale release evidence. The first current performance run completed 72/72 cells below 5,000 ms, then the controller stopped on nine broad static/Next parity failures outside this attribute-only batch.
- Phase 3 remains WAITING_OWNER; Phase 4 remains WAITING_OWNER_SESSION_DATA; Phase 6A remains READY but not started.

## Rollback

\`git revert <phase-5c2-evidence-commit> dbda6ba 0716dc6\`
`);

writeText("docs/accessibility/phase-5c2-regression-summary.md", `# Phase 5C-2 regression summary

The exact A11Y-003, A11Y-005, and A11Y-006 scope passes with zero stable-frame changed pixels and no CSS, visible-copy, class, ID, asset, immutable-baseline, or owner-approved-baseline change.

| Area | Result |
| --- | --- |
| Canon controls | 11/11 named and keyboard-operable in both runtimes; click, Enter, Space PASS |
| Search names | Lexicon, Embedded Videos, and Tables exact labels PASS in 36/36 cells |
| Testimony scroll | Named focusable region PASS in 8/8 cells; all overflow cells scroll |
| Current audit | 311 cells, 0 errors; only A11Y-007 and A11Y-008 automated families remain |
| Stable-frame raster | 0 changed pixels; no masks or new tolerance |
| Functional/browser | Focused 3/3; full serial 60/60 runnable, 3 static skips |
| Build/type/lint | PASS |
| Security | 0 vulnerabilities; 18 release controls PASS |
| Recovery | 72 screenshots, 12 DOM snapshots, all support baselines PASS |

The broad parity/performance composite remains blocked outside this batch. This does not invalidate the zero-pixel paired scoped comparison and is not reclassified as a Phase 5C-2 regression.
`);

appendSection("docs/recovery/9of10-program-status.md", "## Phase 5C-2 high-severity accessibility batch", `## Phase 5C-2 high-severity accessibility batch

Phase 5C-2 is **PASS** for A11Y-003, A11Y-005, and A11Y-006 under their exact proposal hashes. The current 311-cell audit has zero missing-name, unsupported-ARIA, hidden-focus, or scrollable-region-focusable findings. The scoped paired raster comparison is zero pixels, and every immutable and owner-approved baseline remains unchanged.

Phase 5C remains **IN_PROGRESS**. Phase 5C-3 is **READY but not started** for A11Y-007 and A11Y-008. All manual tasks remain **APPROVED, NOT_TESTED**, and complete WCAG conformance remains unclaimed. Phase 2A/Gate C-Preview remain BLOCKED, Phase 3 remains WAITING_OWNER, Phase 4 remains WAITING_OWNER_SESSION_DATA, and Phase 6A remains independently READY but was not executed.`);

appendSection("docs/recovery/9of10-evidence-ledger.md", "## Phase 5C-2 update", `## Phase 5C-2 update

| Evidence | Result |
| --- | --- |
| Starting commit/tag | \`${STARTING_COMMIT}\`; \`teoyube-9of10-phase5c2-start-621aac4\` |
| Commits | implementation \`${IMPLEMENTATION_COMMIT}\`; tests \`${TEST_COMMIT}\`; evidence commit reported in final handoff |
| Owner scope | \`${OWNER_DECISION}\`; A11Y-003, A11Y-005, A11Y-006; exact proposal hashes |
| Scoped evidence | 56 cells; all 3 issues FIXED; 0 partial, blocked, or new scoped issues |
| Current audit | 311 cells; zero errors; only A11Y-007 target size and A11Y-008 contrast remain automated failures |
| Stable raster | PASS, zero pixels on paired stable frames; no masks, tolerance changes, or baseline replacement |
| Build/test/security/runtime | PASS; all 60 runnable browser tests serially; 101 integration tests; 18 security controls; 83 dual-runtime checks |
| Recovery | PASS; 72 immutable screenshots, 12 DOM snapshots, and all support baselines unchanged |
| Performance | First 72 cells below 5,000 ms; 216-cell controller stopped on broad pre-existing parity failures; CSS budget still blocked |
| Product/protected/CSS/class-ID/assets/baselines/package-lock/paid calls | 3 approved semantic source files / 0 / 0 / 0 / 0 / 0 / 0 / 0 |
| Phase state | 5C-2 PASS; 5C IN_PROGRESS; 5C-3 READY; manual tasks NOT_TESTED |

Phase 2A and Gate C-Preview remain BLOCKED; Phase 3 remains WAITING_OWNER; Phase 4 remains WAITING_OWNER_SESSION_DATA. WCAG 2.2 AA conformance is not claimed.`);

appendSection("docs/recovery/9of10-owner-decisions.md", "## Phase 5C-2 execution under the existing owner decision", `## Phase 5C-2 execution under the existing owner decision

At ${EXECUTED_AT}, the exact hash-bound A11Y-003, A11Y-005, and A11Y-006 remediations completed with status **PASS**. Implementation commit: \`${IMPLEMENTATION_COMMIT}\`; test commit: \`${TEST_COMMIT}\`; final evidence commit is reported in the handoff. Expanded scope: no. Manual tasks executed: 0. Phase 5C-3 started: no. No new approval was fabricated.`);

appendSection("docs/recovery/9of10-phase-history.md", "## Phase 5C-2 - high-severity accessibility remediation", `## Phase 5C-2 - high-severity accessibility remediation

Status: **PASS**
Started from: \`${STARTING_COMMIT}\`
Pre-phase tag: \`teoyube-9of10-phase5c2-start-621aac4\`
Implementation commit: \`${IMPLEMENTATION_COMMIT}\`
Test commit: \`${TEST_COMMIT}\`

### Actions

1. Validated the exact owner decision, proposal hashes, files, routes, states, tests, and rollback for A11Y-003, A11Y-005, and A11Y-006.
2. Added equivalent static Canon name/role/state and click/Enter/Space behavior for all existing 11 media stages, without removing or duplicating a control.
3. Added stable names to the three existing search inputs and keyboard focus/region semantics to the existing Testimony milestones strip.
4. Added hash-bound delta verification, focused unit/browser tests, 56-cell characterization, and strict paired stable-frame raster evidence.
5. Reran current accessibility, build, security, retrieval, runtime, recovery, browser, and performance gates without a paid call or baseline update.

### Result

All three scoped issues are **FIXED** with zero stable-frame changed pixels. Phase 5C-2 is PASS; Phase 5C is IN_PROGRESS; Phase 5C-3 is READY but not started. Manual tasks completed: 0. WCAG 2.2 AA conformance is not claimed. Phase 2A/Gate C-Preview remain blocked by separate broad parity, incomplete 216-cell performance, CSS-budget, and stale-release-evidence findings.`);

let risk = readText("docs/recovery/9of10-risk-register.md");
risk = risk.replace(/\| 9R-06 \| Accessibility conformance unproved \|[^\n]+/, "| 9R-06 | Accessibility conformance unproved | Phase 5C-1 and 5C-2 fixed 6 exact issues (A11Y-001 through A11Y-006); A11Y-007/A11Y-008 remain for 5C-3, all 12 manual/AT evidence scopes remain NOT_TESTED, and no conformance claim exists | Phase 5 and Phase 2A recheck | Execute approved Phase 5C-3 separately; complete manual/AT evidence and full verification |");
risk = risk.replace(/\| 9R-13 \| Current performance composite blocked \|[^\n]+/, "| 9R-13 | Current performance composite blocked | First current run completed 72/72 cells below 5,000 ms, but the 216-cell controller stopped on nine broad pre-existing static/Next parity failures; CSS remains 1,414,956 bytes against 948,538 | Phase 2A recheck / later performance scope | Reconcile owner-approved surfaces and the historical budget through separate owner-authorized work; never weaken silently |");
writeText("docs/recovery/9of10-risk-register.md", risk);

console.log(JSON.stringify({ status: "PASS", report: "docs/recovery/9of10-phase-5c2-high-accessibility-report.json", approvedDelta: "tests/accessibility/approved-deltas/phase-5c2/manifest.json" }, null, 2));
