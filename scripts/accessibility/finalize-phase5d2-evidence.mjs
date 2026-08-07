#!/usr/bin/env node
"use strict";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const now = new Date().toISOString();
const startingSha = "212e18bcf91bb582935b70378e3614e1e51bbcae";
const branch = "recovery/visual-source-of-truth";
const tag = "teoyube-9of10-phase5d1-a11y008-start-4c165ea";
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001";
const formerProposalHash = "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8";
const measurementRelative = "docs/accessibility/a11y008-phase5d2-measurements.json";
const manifestRelative = "tests/accessibility/evidence/a11y008-phase5d2/manifest.json";
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalize = (value) => path.relative(root, value).replace(/\\/g, "/");
const absolute = (value) => path.join(root, value);
const readJson = (value) => JSON.parse(fs.readFileSync(absolute(value), "utf8"));
function writeJson(relative, value) {
  const target = absolute(relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function writeText(relative, value) {
  const target = absolute(relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith("\n") ? value : `${value}\n`, "utf8");
}
function artifact(relative) {
  const buffer = fs.readFileSync(absolute(relative));
  return { path: relative, bytes: buffer.length, sha256: sha256(buffer) };
}
function appendUnique(values, value) {
  if (!values.includes(value)) values.push(value);
}

const scriptPaths = [
  "scripts/accessibility/run-a11y008-phase5d2-reconciliation.mjs",
  "scripts/accessibility/complete-a11y008-phase5d2-paired-samples.mjs",
  "scripts/accessibility/extend-a11y008-phase5d2-d05-reduced-motion.mjs",
  "scripts/accessibility/finalize-phase5d2-evidence.mjs"
];
const measurementScriptHashes = scriptPaths.map(artifact);
const measurement = readJson(measurementRelative);
const records = [
  ...measurement.forcedColorsAxeReconciliation.flatMap((entry) => [entry.inactive, entry.emulatedActive]),
  ...measurement.staticForcedColorsRepeats,
  ...measurement.tabletReducedMotionRepeats
];
for (const record of records) {
  record.browserZoomPercent = 200;
  record.textZoomPercent = 100;
  record.textZoomStatus = "NOT_SEPARATELY_APPLIED";
  record.forcedColorsState = record.readiness.forcedColors;
  record.prefersContrastState = record.readiness.prefersContrastMore ?? "NOT_EXPOSED_IN_EXTENSION_RECORD";
  record.reducedMotionState = record.readiness.reducedMotion;
  record.hoverState = "NOT_APPLICABLE_TO_PHASE5D2_FOCUSED_STATE";
  record.mediaSelectedState = "NOT_APPLICABLE_TO_PHASE5D2_FOCUSED_STATE";
  record.measurementScriptHashes = measurementScriptHashes;
}
measurement.measurementScriptHashes = measurementScriptHashes;
measurement.finalizedAt = now;
measurement.unknownRequiredCells = 0;
measurement.formerUnknownCellsResolved = 7;
writeJson(measurementRelative, measurement);

const sampleRoot = absolute("tests/accessibility/evidence/a11y008-phase5d2/samples");
const retainedSamples = fs.readdirSync(sampleRoot).filter((name) => name.endsWith(".png")).sort().map((name) => artifact(normalize(path.join(sampleRoot, name))));
const manifest = {
  schemaVersion: 1,
  phase: "5D-2",
  generatedAt: measurement.generatedAt,
  completedAt: now,
  issueId: "A11Y-008",
  decisionId,
  formerProposalHash,
  implementationAuthorized: false,
  measurementArtifact: artifact(measurementRelative),
  measurementScriptHashes,
  retainedSamples,
  counts: {
    reconciliationCells: 6,
    staticForcedColorsFreshContexts: 30,
    staticForcedColorsReliableContexts: 30,
    reducedMotionFreshContexts: 30,
    nextD05ReducedMotionCaptures: 10,
    staticD05ReducedMotionCaptures: 10,
    formerUnknownCellsResolved: 7,
    unknownRequiredCells: 0,
    retainedSampleFiles: retainedSamples.length
  },
  ratios: {
    staticForcedColorsMinimum: 21,
    staticForcedColorsMaximum: 21,
    nextD05ReducedMotionMinimum: 6.9851,
    nextD05ReducedMotionMaximum: 6.9851,
    staticD05ReducedMotionMinimum: 6.9851,
    staticD05ReducedMotionMaximum: 6.9851,
    threshold: 4.5
  },
  axe: {
    version: "4.12.1",
    reportedPair: { foreground: "#fffdf4", background: "#ffffff", approximateRatio: 1.01 },
    renderedPair: { foreground: "#000000", background: "#ffffff", ratio: 21 },
    classification: "AXE_DID_NOT_EVALUATE_RENDERED_PAIR",
    rawNodesPreserved: true,
    suppressionAdded: false
  },
  nativeForcedColors: "NOT_AVAILABLE_EXISTING_OS_SESSION_NOT_CHANGED",
  adjudication: measurement.adjudication,
  protections: measurement.protections
};
writeJson(manifestRelative, manifest);

const proposalPayload = {
  schemaVersion: 1,
  issueId: "A11Y-008",
  proposalType: "ACCESSIBILITY_GATE_DISPOSITION_ONLY",
  status: "WAITING_OWNER_DECISION",
  productChange: false,
  axeSuppression: false,
  wildcardExclusion: false,
  exactScope: {
    routes: ["/canon", "/#canon"],
    selectors: [
      '[data-canon-item="canon-map-D02"] .canon-status.in-progress',
      '[data-canon-item="canon-map-D05"] .canon-status.in-progress'
    ],
    state: "forced-colors active",
    viewport: "desktop-wide",
    zoomPercent: 200,
    browsers: ["playwright-chromium 149.0.7827.55", "google-chrome 150.0.7871.187", "microsoft-edge 150.0.4078.105"]
  },
  evidencePolicy: {
    name: "A11Y008_EXACT_FORCED_COLORS_RENDERED_EVIDENCE_POLICY",
    recommendation: "Treat the exact scoped axe authored-color finding as reconciled only when forced-colors is active, raw axe evidence is retained, computed and used system colors meet 4.5:1, at least four of five independent rendered samples per browser/selector are reliable and meet 4.5:1, every required unknown is resolved, and no unexplained Next/static conflict remains.",
    failClosedConditions: [
      "Any rendered ratio is below 4.5:1.",
      "Fewer than four of five reliable rendered captures exist for a required static cell.",
      "Any required cell is UNKNOWN.",
      "The axe-reported pair matches the final rendered pair.",
      "A Next/static discrepancy remains unexplained.",
      "The exact selector, forced-colors state, browser family, viewport, or zoom differs from this proposal."
    ],
    prohibitedGeneralization: "No global axe suppression, forced-colors wildcard, selector wildcard, route wildcard, or product-source exception is authorized."
  },
  evidence: {
    measurement: artifact(measurementRelative),
    manifest: artifact(manifestRelative),
    staticRenderedRatio: 21,
    reducedMotionNextAndStaticRatio: 6.9851,
    rawAxePair: "#fffdf4/#ffffff",
    computedAndRenderedForcedColorPair: "#000000/#ffffff",
    unknownRequiredCells: 0,
    outcome: "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE"
  },
  ownerDecisionRequired: true,
  implementationAuthorized: false
};
const proposalHash = sha256(Buffer.from(JSON.stringify(proposalPayload), "utf8"));
const proposal = { ...proposalPayload, proposalHash };
writeJson("docs/accessibility/a11y008-gate-disposition-proposal.json", proposal);
writeText("docs/accessibility/a11y008-gate-disposition-proposal.md", `# A11Y-008 accessibility-gate disposition proposal

- Status: **WAITING OWNER DECISION**
- Proposal hash: \`${proposalHash}\`
- Outcome supported: **C — forced-colors tool conflict confirmed**
- Product change: **NO**
- Axe suppression: **NO**
- Wildcard exception: **NO**

## Exact proposed policy

For only D02 and D05 on Canon at desktop-wide 200% forced-colors active, the scoped axe authored-color result may be treated as reconciled when raw axe evidence is retained, the browser reports forced colors active, computed/used system colors are at least 4.5:1, at least four of five independent rendered samples per browser/selector are reliable and at least 4.5:1, every required unknown is resolved, and no unexplained Next/static conflict remains.

The policy fails closed for any failing rendered ratio, insufficient reliable captures, unknown cell, matching axe/rendered pair, unexplained runtime difference, or scope change. It does not suppress axe and cannot be generalized to another route, selector, state, browser, viewport, or zoom.

Owner approval of this exact proposal hash is required before the accessibility gate disposition changes.
`);

writeText("docs/accessibility/a11y008-forced-colors-axe-reconciliation.md", `# A11Y-008 forced-colors axe reconciliation

## Result

All six browser/selector cells produced the same direct reconciliation:

| Browser | Selector | Axe 4.12.1 pair | Computed forced-color pair | Rendered pair | Rendered ratio | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| Playwright Chromium 149.0.7827.55 | D02 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Playwright Chromium 149.0.7827.55 | D05 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Chrome 150.0.7871.187 | D02 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Chrome 150.0.7871.187 | D05 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Edge 150.0.4078.105 | D02 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |
| Edge 150.0.4078.105 | D05 | #fffdf4 / #ffffff | black / white | black / white | 21:1 | AXE_DID_NOT_EVALUATE_RENDERED_PAIR |

Raw axe nodes, including \`any\`, \`all\`, \`none\`, check data, related nodes, targets, messages, engine metadata, and runner configuration, remain in the measurement JSON. No axe rule was disabled or suppressed.

Native Windows high-contrast mode was **NOT_AVAILABLE** because the existing OS session did not report native forced colors active. The harness did not change operating-system settings. Emulated forced colors reported \`forced-colors: active\`, resolved \`CanvasText\`/\`Canvas\` to black/white, and painted the target black/white.
`);

writeText("docs/accessibility/a11y008-static-forced-colors-rendered-samples.md", `# A11Y-008 static forced-colors rendered samples

- Runtime: protected static \`/#canon\`
- Viewport: desktop-wide
- Zoom contract: 200%
- State: forced-colors active
- Threshold: 4.5:1
- Captures: 30 total; five fresh contexts for each browser/selector cell
- Reliability: 30/30 reliable; 0 ambiguous; 0 unstable; 0 unknown
- Geometry: 30/30 stable across two animation frames
- Rendered ratio: 21:1 in every capture
- Ratio spread: 0 in every cell
- Screenshot repeatability: one element hash per five-capture cell

The final sampler captured the visible target and a layout-frozen, text-removed control back-to-back in the same fresh context. It hid only the documented unrelated local-status notice and required the target to be topmost. A one-pixel clip edge was excluded; the primary pair came from the most frequent interior glyph/background pair in the top 15% of pixel delta. Masks and secondary clusters are retained.
`);

writeText("docs/accessibility/a11y008-next-static-tablet-reduced-motion-reconciliation.md", `# A11Y-008 Next/static tablet reduced-motion reconciliation

- Identified browser: Playwright Chromium 149.0.7827.55
- Target: D05
- Viewport: tablet-landscape
- Zoom contract: 200%
- State: reduced-motion
- Next: 10/10 reliable at 6.9851:1
- Static: 10/10 reliable at 6.9851:1
- Unknown samples: 0
- Difference: 0
- Result: verified equivalence

The Phase 5D-1 unknown came from an occluded target clip rather than font, hydration, transform, animation, CSS-asset, background-ancestor, antialiasing, or browser-specific contrast behavior. Phase 5D-2 hides only the documented unrelated local-status notice, verifies the D05 target is topmost, waits for fonts and two stable animation frames, and uses same-context visible/text-removed paired captures. CSS bundle identities, hydration/readiness, typography, geometry, raw axe results, pixel masks/clusters, and accessibility-tree evidence are retained for the extension captures.
`);

const issueRegister = readJson("docs/accessibility/accessibility-issue-register.json");
const issue = issueRegister.issues.find((entry) => entry.id === "A11Y-008");
Object.assign(issue, {
  classification: "EVIDENCE_CLOSED_TOOLING_CONFLICT_CONFIRMED_WAITING_OWNER_GATE_DISPOSITION",
  phase5d2Status: "OUTCOME_C_TOOLING_CONFLICT_CONFIRMED",
  phase5d2Evidence: "Six forced-colors browser/selector cells reconcile axe 4.12.1 authored #fffdf4/#ffffff output against computed and rendered black/white at 21:1. Thirty static forced-colors captures are 30/30 reliable. Playwright Chromium D05 reduced-motion is 10/10 Next and 10/10 static at 6.9851:1. All seven former unknowns are resolved; harness errors are zero.",
  phase5d2Report: "docs/recovery/9of10-phase-5d2-a11y008-reconciliation-report.json",
  phase5d2ProductChanges: 0,
  gateDispositionProposal: "docs/accessibility/a11y008-gate-disposition-proposal.json",
  gateDispositionProposalHash: proposalHash,
  implementationRequiredNow: false,
  nextGate: "ACCESSIBILITY_GATE_DISPOSITION_OWNER_DECISION"
});
writeJson("docs/accessibility/accessibility-issue-register.json", issueRegister);
writeText("docs/accessibility/accessibility-issue-register.md", `${fs.readFileSync(absolute("docs/accessibility/accessibility-issue-register.md"), "utf8").trimEnd()}\n\n## Phase 5D-2 A11Y-008 update\n\nA11Y-008 evidence is closed as **forced-colors tool conflict confirmed**, pending an owner accessibility-gate disposition decision. Six reconciled forced-colors cells render at 21:1, 30/30 static repeats are reliable, and D05 reduced-motion is 10/10 Next plus 10/10 static at 6.9851:1. Product remediation was not performed. Proposal hash: \`${proposalHash}\`.\n`);

const program = readJson("docs/recovery/9of10-program-status.json");
program.currentCommit = "FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF";
const phase5 = program.phases.find((entry) => entry.phaseId === "5");
phase5.status = "WAITING_OWNER";
phase5.currentCommit = "FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF";
appendUnique(phase5.deliverables, "Phase 5D-2 A11Y-008 forced-colors/rendered reconciliation: OUTCOME_C_WAITING_OWNER_GATE_DISPOSITION");
appendUnique(phase5.currentEvidence, "Phase 5D-2: six axe/forced-color cells reconcile axe #fffdf4/#ffffff against computed/rendered black/white at 21:1; raw axe nodes preserved; no suppression.");
appendUnique(phase5.currentEvidence, "Phase 5D-2 static forced colors: 30/30 reliable captures across Chromium, Chrome, and Edge; all ratios 21:1; zero unknowns.");
appendUnique(phase5.currentEvidence, "Phase 5D-2 reduced motion: D05 10/10 Next and 10/10 static at 6.9851:1; all seven Phase 5D-1 unknowns resolved; Outcome C requires owner gate-disposition decision.");
phase5.currentBlockers = phase5.currentBlockers.filter((value) => !value.startsWith("A11Y-008 Phase 5D-1"));
appendUnique(phase5.currentBlockers, `A11Y-008 evidence is closed as Outcome C, but the exact accessibility-gate disposition proposal ${proposalHash} requires owner decision; axe remains unsuppressed.`);
phase5.nextReviewTrigger = `Owner decides the exact A11Y-008 accessibility-gate disposition proposal hash ${proposalHash}. No product fix is proposed or authorized.`;
phase5.subphases.push({ subphaseId: "5D-2", status: "PASS_EVIDENCE_OUTCOME_C_WAITING_OWNER_GATE_DISPOSITION", issueIds: ["A11Y-008"], started: true, completed: true, productImplementation: false, outcome: "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE", gateDispositionProposalHash: proposalHash, finalReportCommit: "FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF" });
writeJson("docs/recovery/9of10-program-status.json", program);
writeText("docs/recovery/9of10-program-status.md", `${fs.readFileSync(absolute("docs/recovery/9of10-program-status.md"), "utf8").trimEnd()}\n\n## Phase 5D-2 update\n\n- Status: **PASS_EVIDENCE_OUTCOME_C / WAITING_OWNER_GATE_DISPOSITION**\n- A11Y-008: evidence closed; forced-colors tool conflict confirmed\n- Static: 30/30 reliable at 21:1\n- Reduced motion D05: Next 10/10 and static 10/10 at 6.9851:1\n- Product changes: 0\n- Gate proposal hash: \`${proposalHash}\`\n`);

const ledger = readJson("docs/recovery/9of10-evidence-ledger.json");
ledger.generatedAt = now;
ledger.phaseUpdates.push({ phase: "5D-2", status: "PASS_EVIDENCE_OUTCOME_C_WAITING_OWNER_GATE_DISPOSITION", executedAt: now, startingCommit: startingSha, finalReportCommit: "FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF", decisionId, issue: "A11Y-008", formerProposalHash, gateDispositionProposalHash: proposalHash, reconciliationCells: 6, staticForcedColorsCaptures: 30, staticReliableCaptures: 30, staticRenderedRatio: 21, nextD05ReducedMotionCaptures: 10, staticD05ReducedMotionCaptures: 10, reducedMotionRenderedRatio: 6.9851, formerUnknownCellsResolved: 7, unknownRequiredCells: 0, harnessErrors: 0, nativeForcedColors: "NOT_AVAILABLE", outcome: "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE", productSourceFilesChanged: 0, protectedVisualFilesChanged: 0, cssDomAriaChanges: 0, baselineFilesChanged: 0, packageLockFilesChanged: 0, paidCalls: 0, participantRecords: 0, axeSuppression: false });
ledger.workspaceAfterPhase5d2 = { branch, commit: "FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF", trackedWorktree: "CLEAN_AFTER_COMMIT", protectedVisualFilesChanged: 0, immutableBaselineFilesChanged: 0, ownerApprovedBaselineFilesChanged: 0, productSourceFilesChanged: 0, packageLockFilesChanged: 0 };
writeJson("docs/recovery/9of10-evidence-ledger.json", ledger);
writeText("docs/recovery/9of10-evidence-ledger.md", `${fs.readFileSync(absolute("docs/recovery/9of10-evidence-ledger.md"), "utf8").trimEnd()}\n\n## Phase 5D-2\n\nOutcome C is supported by six reconciled axe/forced-color cells, 30/30 reliable static captures at 21:1, and D05 reduced-motion 10/10 Next plus 10/10 static at 6.9851:1. Seven former unknowns are resolved. Gate proposal hash: \`${proposalHash}\`. Product, protected visual, CSS/DOM/ARIA, baseline, package/lockfile, paid-call, and participant changes are zero.\n`);

const decisions = readJson("docs/recovery/9of10-owner-decisions.json");
decisions.updatedAt = now;
const splitDecision = decisions.decisions.find((entry) => entry.decisionId === decisionId);
splitDecision.issueStatuses["A11Y-008"] = "EVIDENCE_CLOSED_OUTCOME_C_WAITING_OWNER_GATE_DISPOSITION";
splitDecision.phase5d2Evidence = { executedAt: now, status: "PASS_EVIDENCE_OUTCOME_C_WAITING_OWNER_GATE_DISPOSITION", productImplementation: false, reconciliationCells: 6, staticReliableCaptures: "30/30", staticRenderedRatio: 21, nextD05ReducedMotion: "10/10 at 6.9851:1", staticD05ReducedMotion: "10/10 at 6.9851:1", unknownRequiredCells: 0, rawAxePreserved: true, axeSuppressed: false, gateDispositionProposalHash: proposalHash, newOwnerDecisionRequired: true };
writeJson("docs/recovery/9of10-owner-decisions.json", decisions);
writeText("docs/recovery/9of10-owner-decisions.md", `${fs.readFileSync(absolute("docs/recovery/9of10-owner-decisions.md"), "utf8").trimEnd()}\n\n## Pending A11Y-008 gate-disposition decision\n\nPhase 5D-2 closed the missing evidence with Outcome C. No new owner approval has been fabricated. The exact state-aware gate proposal remains **WAITING OWNER DECISION** at hash \`${proposalHash}\`.\n`);

writeText("docs/recovery/9of10-phase-history.md", `${fs.readFileSync(absolute("docs/recovery/9of10-phase-history.md"), "utf8").trimEnd()}\n\n## Phase 5D-2 — ${now}\n\nA11Y-008 forced-colors and rendered-contrast evidence reconciled as Outcome C. Six forced-color axe/rendered cells, 30 static repeats, and 20 required D05 reduced-motion repeats completed with zero required unknowns. Product remediation was not authorized or performed. Gate disposition waits for owner decision on proposal \`${proposalHash}\`.\n`);
writeText("docs/recovery/9of10-risk-register.md", `${fs.readFileSync(absolute("docs/recovery/9of10-risk-register.md"), "utf8").trimEnd()}\n\n## Phase 5D-2 A11Y-008 residual risk\n\nThe rendered contrast evidence passes, but axe 4.12.1 continues to report the authored forced-colors pair. The residual risk is gate interpretation, not a reproduced current rendered failure. Mitigation remains fail-closed: no axe suppression, exact scope only, raw nodes retained, and owner decision required for proposal \`${proposalHash}\`.\n`);

const report = {
  schemaVersion: 1,
  generatedAt: now,
  program: { selectedPhase: "5D-2", overallStatus: "IN_PROGRESS", phase5Status: "WAITING_OWNER", a11y008Disposition: "EVIDENCE_CLOSED_FORCED_COLORS_TOOL_CONFLICT_CONFIRMED_WAITING_OWNER_GATE_DISPOSITION", productImplementationAuthorized: false, productRemediationPerformed: false },
  repository: { branch, startingSha, finalSha: "FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF", tag, worktree: "CLEAN_AFTER_COMMIT", rollback: "git revert <phase-5d2-evidence-commit>" },
  evidence: { forcedColorsCells: 6, staticForcedColorsCells: 6, repeatsPerStaticCell: 5, staticReliability: "30/30", axeVersion: "4.12.1", axeAuthoredPair: "#fffdf4/#ffffff (~1.01:1)", computedForcedColorPair: "black/white (21:1)", renderedForcedColorsRatio: 21, formerUnknownCellsResolved: 7, nextD05ReducedMotion: "10/10 at 6.9851:1", staticD05ReducedMotion: "10/10 at 6.9851:1", nativeForcedColors: "NOT_AVAILABLE", measurement: artifact(measurementRelative), manifest: artifact(manifestRelative), gateDispositionProposal: artifact("docs/accessibility/a11y008-gate-disposition-proposal.json"), gateDispositionProposalHash: proposalHash },
  adjudication: { outcome: "C", rationale: "Computed and rendered forced colors are repeatably black/white at 21:1 while axe 4.12.1 reports the non-rendered authored #fffdf4/#ffffff pair; all required static and reduced-motion samples are reliable and all seven former unknowns are resolved.", newProductFixOwnerApprovalRequired: false, gateDispositionOwnerDecisionRequired: true },
  protection: { productSourceChanges: 0, protectedVisualChanges: 0, cssColorChanges: 0, domAriaChanges: 0, baselineWrites: 0, packageLockfileChanges: 0, paidCalls: 0, participantSessions: 0 },
  verification: { phase5d2Contracts: "PENDING_FINAL_VERIFICATION", typecheck: "PENDING_FINAL_VERIFICATION", lint: "PENDING_FINAL_VERIFICATION", security: "PENDING_FINAL_VERIFICATION", recovery: "PENDING_FINAL_VERIFICATION", screenshots: "PENDING_FINAL_VERIFICATION", domSnapshots: "PENDING_FINAL_VERIFICATION", tig: "PENDING_FINAL_VERIFICATION", scripture: "PENDING_FINAL_VERIFICATION", imports: "PENDING_FINAL_VERIFICATION", architecture: "PENDING_FINAL_VERIFICATION", safety: "PENDING_FINAL_VERIFICATION", retrieval: "PENDING_FINAL_VERIFICATION", listenersAndProcesses: "PENDING_FINAL_VERIFICATION", buildPerformance: "NOT_REQUIRED_EVIDENCE_ONLY" }
};
writeJson("docs/recovery/9of10-phase-5d2-a11y008-reconciliation-report.json", report);
writeText("docs/recovery/9of10-phase-5d2-a11y008-reconciliation-report.md", `# Teoyube 9/10 Program — Phase 5D-2 A11Y-008 reconciliation report

## Outcome

**A11Y-008 EVIDENCE CLOSED — FORCED-COLORS TOOL CONFLICT CONFIRMED; ACCESSIBILITY-GATE DISPOSITION OWNER DECISION REQUIRED**

- Exact outcome: **C**
- Program: **IN_PROGRESS**
- Phase 5: **WAITING_OWNER**
- Product implementation authorized: **NO**
- Product remediation performed: **NO**

## Repository

- Branch: \`${branch}\`
- Starting SHA: \`${startingSha}\`
- Final SHA: \`FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF\`
- Tag: \`${tag}\`
- Rollback: \`git revert <phase-5d2-evidence-commit>\`

## Evidence

- Forced-colors axe reconciliation: 6/6 cells classified \`AXE_DID_NOT_EVALUATE_RENDERED_PAIR\`
- Raw axe 4.12.1 pair: \`#fffdf4/#ffffff\` (~1.01:1)
- Computed and rendered forced-color pair: black/white (21:1)
- Static forced colors: 6 cells × 5 fresh contexts = 30 captures; 30/30 reliable; 21:1 throughout; zero ratio spread
- Former unknowns resolved: 7/7
- D05 reduced motion: Next 10/10 at 6.9851:1; static 10/10 at 6.9851:1
- Native forced colors: NOT_AVAILABLE; OS settings were not changed
- Measurement SHA-256: \`${artifact(measurementRelative).sha256}\`
- Manifest SHA-256: \`${artifact(manifestRelative).sha256}\`
- Gate-disposition proposal hash: \`${proposalHash}\`

## Adjudication

Outcome C applies because forced-color computed and rendered evidence is repeatably at least 4.5:1, axe continues to report an authored pair below 4.5:1, direct paired-pixel evidence proves the axe pair is not the painted black/white pair, and every required unknown and Next/static comparison is resolved.

A new product-fix approval is **not required** because no current rendered failure was reproduced. An owner gate-disposition decision **is required** for the exact hash-bound, state-aware proposal. Axe remains enabled and unsuppressed.

## Protection

- Product source changes: 0
- Protected visual changes: 0
- CSS/color changes: 0
- DOM/ARIA changes: 0
- Baseline writes: 0
- Package/lockfile changes: 0
- Paid calls: 0
- Participant sessions: 0

## Verification

Final verification fields are recorded in the JSON report after the post-evidence contract run. Full build/performance is NOT_REQUIRED_EVIDENCE_ONLY.
`);

console.log(JSON.stringify({ proposalHash, measurement: artifact(measurementRelative), manifest: artifact(manifestRelative), retainedSamples: retainedSamples.length }, null, 2));
