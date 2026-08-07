import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const MEASUREMENT_PATH = "docs/accessibility/a11y008-phase5d2-measurements.json";
const MANIFEST_PATH = "tests/accessibility/evidence/a11y008-phase5d2/manifest.json";
const PROPOSAL_PATH = "docs/accessibility/a11y008-gate-disposition-proposal.json";
const FORMER_PROPOSAL_HASH = "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8";

type Artifact = { path: string; bytes: number; sha256: string };
type Summary = {
  runtime?: string;
  element: string;
  attempts: number;
  reliableAttempts: number;
  minimumRatio: number;
  maximumRatio: number;
  ratioSpread: number;
  stableGeometryAttempts: number;
  decision: string;
};
type AxeNode = { any: unknown[]; all: unknown[]; none: unknown[] };
type MeasurementRecord = {
  evidence: {
    AXE_RULE_EVIDENCE: {
      runner: { axeVersion: string; runOnly: { values: string[] } };
      violations: Array<{ nodes: AxeNode[] }>;
    };
  };
  browserZoomPercent: number;
  textZoomPercent: number;
  textZoomStatus: string;
  forcedColorsState: string;
  prefersContrastState: string;
  reducedMotionState: string;
  hoverState: string;
  mediaSelectedState: string;
  measurementScriptHashes: Artifact[];
};
type ForcedColorsCell = {
  directReconciliation: Record<string, unknown>;
  inactive: MeasurementRecord;
  emulatedActive: MeasurementRecord;
};
type Measurement = {
  issueId: string;
  formerProposalHash: string;
  implementationAuthorized: boolean;
  forcedColorsAxeReconciliation: ForcedColorsCell[];
  staticForcedColorsRepeats: MeasurementRecord[];
  tabletReducedMotionRepeats: MeasurementRecord[];
  staticForcedColorsSummary: Summary[];
  tabletReducedMotionSummary: Summary[];
  formerUnknownCellsResolved: number;
  unknownRequiredCells: number;
  adjudication: Record<string, unknown>;
  protections: Record<string, unknown>;
};
type Manifest = {
  counts: Record<string, unknown>;
  measurementArtifact: Artifact;
  measurementScriptHashes: Artifact[];
  retainedSamples: Artifact[];
};
type GateProposal = {
  proposalHash: string;
  issueId: string;
  proposalType: string;
  status: string;
  productChange: boolean;
  axeSuppression: boolean;
  wildcardExclusion: boolean;
  ownerDecisionRequired: boolean;
  implementationAuthorized: boolean;
  exactScope: { routes: string[]; selectors: string[] };
  evidencePolicy: { failClosedConditions: string[]; prohibitedGeneralization: string };
};
const readJson = <T = Record<string, unknown>>(path: string): T =>
  JSON.parse(readFileSync(path, "utf8")) as T;

const sha256 = (value: Buffer | string): string =>
  createHash("sha256").update(value).digest("hex");

describe("Phase 5D-2 A11Y-008 evidence-only reconciliation", () => {
  it("closes every required evidence cell without authorizing product mutation", () => {
    const measurement = readJson<Measurement>(MEASUREMENT_PATH);
    const manifest = readJson<Manifest>(MANIFEST_PATH);

    expect(measurement.issueId).toBe("A11Y-008");
    expect(measurement.formerProposalHash).toBe(FORMER_PROPOSAL_HASH);
    expect(measurement.implementationAuthorized).toBe(false);
    expect(measurement.forcedColorsAxeReconciliation).toHaveLength(6);
    expect(measurement.staticForcedColorsRepeats).toHaveLength(30);
    expect(measurement.tabletReducedMotionRepeats).toHaveLength(30);
    expect(measurement.formerUnknownCellsResolved).toBe(7);
    expect(measurement.unknownRequiredCells).toBe(0);
    expect(measurement.adjudication).toMatchObject({
      outcome: "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE",
      allAxeClassified: true,
      allStaticReliable: true,
      allStaticReliablePass: true,
      allReducedReliablePass: true,
      harnessErrors: 0,
      ownerGateRequired: true
    });
    expect(measurement.protections).toEqual({
      productSourceChanges: 0,
      protectedVisualChanges: 0,
      cssColorChanges: 0,
      domAriaChanges: 0,
      baselineWrites: 0,
      packageLockfileChanges: 0,
      paidCalls: 0,
      participantRecords: 0
    });
    expect(manifest.counts).toMatchObject({
      reconciliationCells: 6,
      staticForcedColorsFreshContexts: 30,
      staticForcedColorsReliableContexts: 30,
      nextD05ReducedMotionCaptures: 10,
      staticD05ReducedMotionCaptures: 10,
      formerUnknownCellsResolved: 7,
      unknownRequiredCells: 0,
      retainedSampleFiles: 350
    });
  });

  it("proves axe did not evaluate the final rendered forced-color pair", () => {
    const measurement = readJson<Measurement>(MEASUREMENT_PATH);

    for (const cell of measurement.forcedColorsAxeReconciliation) {
      expect(cell.directReconciliation).toMatchObject({
        axeReportedPair: { foreground: "#fffdf4", background: "#ffffff" },
        activeComputedPair: {
          foreground: "rgb(0, 0, 0)",
          background: "rgb(255, 255, 255)"
        },
        activeSystemPair: {
          foreground: "rgb(0, 0, 0)",
          background: "rgb(255, 255, 255)"
        },
        activeRenderedPair: { ratio: 21, reliable: true },
        classification: "AXE_DID_NOT_EVALUATE_RENDERED_PAIR"
      });

      const rawAxe = cell.emulatedActive.evidence.AXE_RULE_EVIDENCE;
      expect(rawAxe.runner.axeVersion).toBe("4.12.1");
      expect(rawAxe.runner.runOnly.values).toEqual(["color-contrast"]);
      expect(rawAxe.violations[0].nodes[0]).toEqual(
        expect.objectContaining({ any: expect.any(Array), all: expect.any(Array), none: expect.any(Array) })
      );
    }
  });

  it("requires repeatable rendered samples for static forced colors and D05 reduced motion", () => {
    const measurement = readJson<Measurement>(MEASUREMENT_PATH);

    expect(measurement.staticForcedColorsSummary).toHaveLength(6);
    for (const group of measurement.staticForcedColorsSummary) {
      expect(group).toMatchObject({
        attempts: 5,
        reliableAttempts: 5,
        minimumRatio: 21,
        maximumRatio: 21,
        ratioSpread: 0,
        stableGeometryAttempts: 5,
        decision: "PASS_RENDERED"
      });
    }

    const d05 = measurement.tabletReducedMotionSummary.filter(
      (group) => group.element === "D05"
    );
    expect(d05).toHaveLength(2);
    expect(d05.map((group) => group.runtime).sort()).toEqual(["next", "static"]);
    for (const group of d05) {
      expect(group).toMatchObject({
        attempts: 10,
        reliableAttempts: 10,
        minimumRatio: 6.9851,
        maximumRatio: 6.9851,
        ratioSpread: 0,
        stableGeometryAttempts: 10,
        decision: "PASS_RENDERED"
      });
    }
  });

  it("records every required evidence-model field and measurement-script hash explicitly", () => {
    const measurement = readJson<Measurement>(MEASUREMENT_PATH);
    const records = [
      ...measurement.forcedColorsAxeReconciliation.flatMap((cell) => [cell.inactive, cell.emulatedActive]),
      ...measurement.staticForcedColorsRepeats,
      ...measurement.tabletReducedMotionRepeats
    ];

    expect(records).toHaveLength(72);
    for (const record of records) {
      expect(record).toMatchObject({
        browserZoomPercent: 200,
        textZoomPercent: 100,
        textZoomStatus: "NOT_SEPARATELY_APPLIED",
        forcedColorsState: expect.anything(),
        prefersContrastState: expect.anything(),
        reducedMotionState: expect.anything(),
        hoverState: "NOT_APPLICABLE_TO_PHASE5D2_FOCUSED_STATE",
        mediaSelectedState: "NOT_APPLICABLE_TO_PHASE5D2_FOCUSED_STATE"
      });
      expect(record.measurementScriptHashes).toHaveLength(4);
      expect(Object.keys(record.evidence).sort()).toEqual([
        "ACCESSIBILITY_TREE_EVIDENCE",
        "AUTHORED_COLOR_EVIDENCE",
        "AXE_RULE_EVIDENCE",
        "COMPUTED_STYLE_EVIDENCE",
        "RENDERED_PIXEL_EVIDENCE",
        "USED_FORCED_COLOR_EVIDENCE"
      ]);
    }
  });
  it("binds every retained artifact and measurement script to a source-safe hash", () => {
    const manifest = readJson<Manifest>(MANIFEST_PATH);
    const measurementBytes = readFileSync(MEASUREMENT_PATH);

    expect(manifest.measurementArtifact).toMatchObject({
      path: MEASUREMENT_PATH,
      bytes: measurementBytes.length,
      sha256: sha256(measurementBytes)
    });
    expect(manifest.measurementScriptHashes).toHaveLength(4);
    for (const script of manifest.measurementScriptHashes) {
      const bytes = readFileSync(script.path);
      expect(script).toMatchObject({ bytes: bytes.length, sha256: sha256(bytes) });
    }
    expect(manifest.retainedSamples).toHaveLength(350);
    for (const sample of manifest.retainedSamples) {
      expect(existsSync(sample.path)).toBe(true);
      const bytes = readFileSync(sample.path);
      expect(sample).toMatchObject({ bytes: bytes.length, sha256: sha256(bytes) });
    }
  });

  it("keeps the proposed gate disposition exact, state-aware, fail-closed, and owner-gated", () => {
    const proposal = readJson<GateProposal>(PROPOSAL_PATH);
    const { proposalHash, ...payload } = proposal;

    expect(proposalHash).toBe(sha256(JSON.stringify(payload)));
    expect(proposal).toMatchObject({
      issueId: "A11Y-008",
      proposalType: "ACCESSIBILITY_GATE_DISPOSITION_ONLY",
      status: "WAITING_OWNER_DECISION",
      productChange: false,
      axeSuppression: false,
      wildcardExclusion: false,
      ownerDecisionRequired: true,
      implementationAuthorized: false
    });
    expect(proposal.exactScope.routes).toEqual(["/canon", "/#canon"]);
    expect(proposal.exactScope.selectors).toEqual([
      '[data-canon-item="canon-map-D02"] .canon-status.in-progress',
      '[data-canon-item="canon-map-D05"] .canon-status.in-progress'
    ]);
    expect(proposal.evidencePolicy.failClosedConditions).toHaveLength(6);
    expect(proposal.evidencePolicy.prohibitedGeneralization).toContain("No global axe suppression");
  });
});
