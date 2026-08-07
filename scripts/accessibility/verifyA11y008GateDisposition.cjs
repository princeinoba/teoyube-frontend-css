/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const DECISION_ID = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5D2-A11Y008-2026-08-07-001";
const ISSUE_ID = "A11Y-008";
const PROPOSAL_HASH = "63d03d4bc44ef4169b24c2e4d3dfa4236b10a67227ae03108b7fd535db6ce29d";
const MANIFEST_HASH = "88c0da1ac90bd8a0c0ce80cf321c1ab64baa273401aa5da20566a2c3a9e26247";
const MEASUREMENT_HASH = "4d20210b1ea1baf8edf283438588247754b90788bc8cc8278d498af66eacff0a";
const POLICY = "A11Y008_EXACT_FORCED_COLORS_RENDERED_EVIDENCE_POLICY";
const OUTCOME = "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE";
const THRESHOLD = 4.5;

const PATHS = Object.freeze({
  decision: "docs/owner-approvals/accessibility/TEOYUBE-OWNER-ACCESSIBILITY-PHASE5D2-A11Y008-2026-08-07-001.json",
  proposal: "docs/accessibility/a11y008-gate-disposition-proposal.json",
  manifest: "tests/accessibility/evidence/a11y008-phase5d2/manifest.json",
  measurement: "docs/accessibility/a11y008-phase5d2-measurements.json"
});

const EXPECTED_ROUTES = ["/canon", "/#canon"];
const EXPECTED_SELECTORS = [
  '[data-canon-item="canon-map-D02"] .canon-status.in-progress',
  '[data-canon-item="canon-map-D05"] .canon-status.in-progress'
];
const EXPECTED_BROWSERS = [
  "playwright-chromium 149.0.7827.55",
  "google-chrome 150.0.7871.187",
  "microsoft-edge 150.0.4078.105"
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`A11Y-008 gate disposition rejected: ${message}`);
  }
}

function sameArray(actual, expected) {
  return Array.isArray(actual) &&
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);
}

function readBoundJson(root, relativePath, override) {
  if (override !== undefined) {
    const bytes = Buffer.isBuffer(override)
      ? override
      : Buffer.from(typeof override === "string" ? override : JSON.stringify(override));
    return { bytes, value: JSON.parse(bytes.toString("utf8")) };
  }
  const bytes = readFileSync(resolve(root, relativePath));
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function verifyA11y008GateDisposition(options = {}) {
  const root = options.root || process.cwd();
  const overrides = options.overrides || {};
  const decisionArtifact = readBoundJson(root, PATHS.decision, overrides.decision);
  const proposalArtifact = readBoundJson(root, PATHS.proposal, overrides.proposal);
  const manifestArtifact = readBoundJson(root, PATHS.manifest, overrides.manifest);
  const measurementArtifact = readBoundJson(root, PATHS.measurement, overrides.measurement);

  const decision = decisionArtifact.value;
  const proposal = proposalArtifact.value;
  const manifest = manifestArtifact.value;
  const measurement = measurementArtifact.value;
  const { proposalHash, ...proposalPayload } = proposal;

  assert(decision.decisionId === DECISION_ID, "owner decision ID changed");
  assert(decision.decision === "APPROVED", "owner decision is not approved");
  assert(decision.binding?.issueId === ISSUE_ID, "owner decision was reused by another issue");
  assert(decision.gateDisposition?.issueId === ISSUE_ID, "gate disposition issue changed");
  assert(decision.gateDisposition?.status === OUTCOME, "approved status changed");
  assert(decision.gateDisposition?.policy === POLICY, "approved policy changed");
  assert(decision.gateDisposition?.productChangesAuthorized === 0, "product changes were authorized");
  assert(decision.gateDisposition?.productRemediation === "NOT_REQUIRED_ON_THE_CURRENT_BOUND_EVIDENCE", "product disposition changed");
  assert(decision.gateDisposition?.generalAxeSuppression === false, "general axe suppression was enabled");
  assert(decision.gateDisposition?.rawAxeResultPreserved === true, "raw axe result is not preserved");
  assert(decision.authorization?.manualEvidenceStarted === false, "manual evidence was marked started");
  assert(decision.authorization?.wcag22AaConformanceClaimed === false, "WCAG 2.2 AA was claimed");

  assert(proposalHash === PROPOSAL_HASH, "declared proposal hash changed");
  assert(sha256(JSON.stringify(proposalPayload)) === PROPOSAL_HASH, "proposal payload hash changed");
  assert(sha256(manifestArtifact.bytes) === MANIFEST_HASH, "evidence manifest hash changed");
  assert(sha256(measurementArtifact.bytes) === MEASUREMENT_HASH, "measurement hash changed");
  assert(decision.binding.proposal?.payloadSha256 === PROPOSAL_HASH, "decision/proposal binding changed");
  assert(decision.binding.evidenceManifest?.sha256 === MANIFEST_HASH, "decision/manifest binding changed");
  assert(decision.binding.measurement?.sha256 === MEASUREMENT_HASH, "decision/measurement binding changed");

  assert(proposal.issueId === ISSUE_ID, "proposal was reused by another issue");
  assert(proposal.proposalType === "ACCESSIBILITY_GATE_DISPOSITION_ONLY", "proposal type changed");
  assert(proposal.productChange === false, "proposal authorizes a product change");
  assert(proposal.axeSuppression === false, "proposal suppresses axe");
  assert(proposal.wildcardExclusion === false, "proposal enables a wildcard exclusion");
  assert(proposal.implementationAuthorized === false, "proposal authorizes implementation");
  assert(proposal.evidencePolicy?.name === POLICY, "proposal policy changed");
  assert(sameArray(proposal.exactScope?.routes, EXPECTED_ROUTES), "route scope expanded or changed");
  assert(sameArray(proposal.exactScope?.selectors, EXPECTED_SELECTORS), "selector scope expanded or changed");
  assert(proposal.exactScope?.state === "forced-colors active", "forced-colors state changed");
  assert(proposal.exactScope?.viewport === "desktop-wide", "forced-colors viewport changed");
  assert(proposal.exactScope?.zoomPercent === 200, "forced-colors zoom changed");
  assert(sameArray(proposal.exactScope?.browsers, EXPECTED_BROWSERS), "browser scope expanded or changed");
  assert(proposal.evidencePolicy?.failClosedConditions?.length === 6, "fail-closed policy changed");
  assert(proposal.evidencePolicy?.prohibitedGeneralization?.includes("No global axe suppression"), "prohibited generalization changed");

  assert(measurement.issueId === ISSUE_ID, "measurement belongs to another issue");
  assert(measurement.implementationAuthorized === false, "measurement authorizes implementation");
  assert(measurement.unknownRequiredCells === 0, "required evidence contains an unknown state");
  assert(measurement.adjudication?.harnessErrors === 0, "measurement contains a harness error");
  assert(measurement.adjudication?.outcome === OUTCOME, "measurement outcome changed");
  assert(measurement.adjudication?.allAxeClassified === true, "raw axe evidence is not fully classified");
  assert(measurement.adjudication?.allStaticReliable === true, "static rendered evidence is unreliable");
  assert(measurement.adjudication?.allStaticReliablePass === true, "static rendered contrast failed");
  assert(measurement.adjudication?.allReducedReliablePass === true, "reduced-motion rendered contrast failed");
  assert(measurement.adjudication?.reproducibleStaticFailure === false, "static failure remains");
  assert(measurement.adjudication?.reconciledActiveFailure === false, "active forced-colors failure remains");

  assert(measurement.forcedColorsAxeReconciliation?.length === 6, "forced-colors cell count changed");
  for (const cell of measurement.forcedColorsAxeReconciliation) {
    const active = cell.emulatedActive;
    const exactSelector = EXPECTED_SELECTORS[cell.element === "D02" ? 0 : cell.element === "D05" ? 1 : -1];
    assert(exactSelector !== undefined, `unexpected element ${cell.element}`);
    assert(cell.selector === exactSelector && active.selector === exactSelector, `selector changed for ${cell.cell}`);
    assert(EXPECTED_BROWSERS.includes(`${cell.browser} ${cell.browserVersion}`), `browser changed for ${cell.cell}`);
    assert(active.runtime === "next", `runtime changed for ${cell.cell}`);
    assert(active.route === "/canon?ownerQa=1", `route changed for ${cell.cell}`);
    assert(active.viewport === "desktop-wide" && active.zoom === 200, `viewport or zoom changed for ${cell.cell}`);
    assert(active.forcedColorsState === true, `forced colors is inactive for ${cell.cell}`);
    assert(Array.isArray(active.errors) && active.errors.length === 0, `harness error exists for ${cell.cell}`);
    assert(cell.directReconciliation?.classification === "AXE_DID_NOT_EVALUATE_RENDERED_PAIR", `axe classification changed for ${cell.cell}`);
    assert(cell.directReconciliation?.axeReportedPair?.foreground === "#fffdf4" && cell.directReconciliation?.axeReportedPair?.background === "#ffffff", `raw axe pair changed for ${cell.cell}`);
    assert(cell.directReconciliation?.activeComputedPair?.foreground === "rgb(0, 0, 0)" && cell.directReconciliation?.activeComputedPair?.background === "rgb(255, 255, 255)", `computed pair changed for ${cell.cell}`);
    assert(cell.directReconciliation?.activeRenderedPair?.reliable === true, `rendered sampler is unreliable for ${cell.cell}`);
    assert(cell.directReconciliation?.activeRenderedPair?.ratio >= THRESHOLD, `rendered contrast failed for ${cell.cell}`);
  }

  assert(measurement.staticForcedColorsSummary?.length === 6, "static forced-colors summary count changed");
  for (const summary of measurement.staticForcedColorsSummary) {
    assert(summary.attempts === 5 && summary.reliableAttempts === 5, `static repeat reliability failed for ${summary.browser}:${summary.element}`);
    assert(summary.minimumRatio >= THRESHOLD && summary.decision === "PASS_RENDERED", `static rendered contrast failed for ${summary.browser}:${summary.element}`);
  }

  const d05 = measurement.tabletReducedMotionSummary?.filter((summary) => summary.element === "D05") || [];
  assert(d05.length === 2, "D05 reduced-motion runtime coverage changed");
  assert(sameArray(d05.map((summary) => summary.runtime).sort(), ["next", "static"]), "D05 runtime scope changed");
  for (const summary of d05) {
    assert(summary.attempts === 10 && summary.reliableAttempts === 10, `D05 sampler is unreliable in ${summary.runtime}`);
    assert(summary.minimumRatio === 6.9851 && summary.minimumRatio >= THRESHOLD, `D05 contrast changed in ${summary.runtime}`);
    assert(summary.decision === "PASS_RENDERED", `D05 evidence failed in ${summary.runtime}`);
  }

  assert(manifest.counts?.reconciliationCells === 6, "manifest reconciliation count changed");
  assert(manifest.counts?.staticForcedColorsFreshContexts === 30, "static context count changed");
  assert(manifest.counts?.staticForcedColorsReliableContexts === 30, "static reliability count changed");
  assert(manifest.counts?.nextD05ReducedMotionCaptures === 10, "Next D05 capture count changed");
  assert(manifest.counts?.staticD05ReducedMotionCaptures === 10, "static D05 capture count changed");
  assert(manifest.counts?.formerUnknownCellsResolved === 7, "resolved unknown count changed");
  assert(manifest.counts?.unknownRequiredCells === 0, "manifest contains an unknown state");

  return {
    decisionId: DECISION_ID,
    issueId: ISSUE_ID,
    proposalHash: "PASS",
    manifestHash: "PASS",
    measurementHash: "PASS",
    outcome: OUTCOME,
    forcedColorsToolConflict: "CONFIRMED",
    computedRenderedEvidence: "ACCEPTED_FOR_THE_EXACT_BOUND_GATE",
    productRemediation: "NOT_REQUIRED",
    generalAxeSuppression: false,
    rawAxeResultPreserved: true
  };
}

if (require.main === module) {
  try {
    const result = verifyA11y008GateDisposition();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

module.exports = { verifyA11y008GateDisposition };
