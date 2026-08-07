import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type RetestPlan = {
  issue: { id: string; implementationAuthorized: boolean; formerProposalHash: string };
  environmentMatrix: { maximumApplicableMeasurementCells: number; minimumNotApplicableCells: number; expectedTotalMatrixCells: number };
};

type RetestSummary = {
  totalMatrixCells: number;
  applicableCells: number;
  notApplicableCells: number;
  contextCells: number;
  harnessErrors: number;
  unknownCells: number;
  contradictions: unknown[];
  outcome: "REPRODUCED_CURRENT" | "NOT_REPRODUCED_CURRENT_RETEST_COMPLETE" | "BLOCKED_INCONCLUSIVE";
  failingCells: number;
  passingCells: number;
  scopedAxeFailures: number;
  lowestComputedRatio: number;
  lowestRenderedSampleRatio: number | null;
};

type RetestManifest = {
  summary: RetestSummary;
  protections: {
    productSourceChanges: number;
    protectedVisualChanges: number;
    cssColorChanges: number;
    domAriaChanges: number;
    baselineWrites: number;
    packageLockfileChanges: number;
    paidCalls: number;
    participantRecords: number;
  };
};

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8")) as T;

describe("Phase 5D-1 A11Y-008 evidence-only retest", () => {
  it("keeps the retest plan evidence-only and bound to the historical proposal", () => {
    const plan = readJson<RetestPlan>("docs/accessibility/a11y008-current-retest-plan.json");
    expect(plan.issue.id).toBe("A11Y-008");
    expect(plan.issue.implementationAuthorized).toBe(false);
    expect(plan.issue.formerProposalHash).toBe("86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8");
    expect(plan.environmentMatrix).toMatchObject({
      maximumApplicableMeasurementCells: 720,
      minimumNotApplicableCells: 864,
      expectedTotalMatrixCells: 1584
    });
  });

  it("records a complete deterministic matrix without product mutation", () => {
    const report = readJson<RetestManifest>("tests/accessibility/evidence/a11y008-retest/manifest.json");
    expect(report.summary.totalMatrixCells).toBe(1584);
    expect(report.summary.applicableCells).toBeLessThanOrEqual(720);
    expect(report.summary.notApplicableCells).toBeGreaterThanOrEqual(864);
    expect(report.summary.applicableCells + report.summary.notApplicableCells).toBe(1584);
    expect(report.summary.contextCells).toBe(216);
    expect(report.summary.harnessErrors).toBe(0);
    if (report.summary.outcome === "BLOCKED_INCONCLUSIVE") {
      expect(report.summary.unknownCells + report.summary.contradictions.length + report.summary.harnessErrors).toBeGreaterThan(0);
    } else {
      expect(report.summary.unknownCells).toBe(0);
      expect(report.summary.contradictions).toEqual([]);
    }
    expect(report.protections).toEqual({
      productSourceChanges: 0,
      protectedVisualChanges: 0,
      cssColorChanges: 0,
      domAriaChanges: 0,
      baselineWrites: 0,
      packageLockfileChanges: 0,
      paidCalls: 0,
      participantRecords: 0
    });
  });

  it("classifies the outcome from current contrast evidence without calling it fixed", () => {
    const report = readJson<RetestManifest>("tests/accessibility/evidence/a11y008-retest/manifest.json");
    expect(["REPRODUCED_CURRENT", "NOT_REPRODUCED_CURRENT_RETEST_COMPLETE", "BLOCKED_INCONCLUSIVE"]).toContain(report.summary.outcome);
    if (report.summary.outcome === "NOT_REPRODUCED_CURRENT_RETEST_COMPLETE") {
      expect(report.summary.failingCells).toBe(0);
      expect(report.summary.passingCells).toBe(report.summary.applicableCells);
      expect(report.summary.scopedAxeFailures).toBe(0);
      expect(report.summary.lowestComputedRatio).toBeGreaterThanOrEqual(4.5);
      expect(report.summary.lowestRenderedSampleRatio).toBeGreaterThanOrEqual(4.5);
    }
    expect(JSON.stringify(report)).not.toContain('"FIXED"');
    expect(JSON.stringify(report)).not.toContain('"FALSE_POSITIVE"');
  });
});
