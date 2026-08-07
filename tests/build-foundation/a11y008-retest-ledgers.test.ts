import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

describe("Phase 5D-1 and Phase 5D-2 A11Y-008 evidence ledgers", () => {
  it("preserves the Phase 5D-1 history while recording the exact approved Phase 5D-2 disposition", () => {
    const register = readJson("docs/accessibility/accessibility-issue-register.json");
    const issues = register.issues as Array<Record<string, unknown>>;
    const issue = issues.find((candidate) => candidate.id === "A11Y-008");

    expect(issue).toMatchObject({
      classification: "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE",
      phase5d1Status: "BLOCKED_INCONCLUSIVE",
      phase5d1ProductChanges: 0,
      phase5d2Status: "PASS",
      phase5d2ProductChanges: 0,
      implementationRequiredNow: false,
      productRemediation: "NOT_REQUIRED",
      rawAxeResultPreserved: true,
      axeSuppressed: false
    });
  });

  it("records the completed Phase 5D-1 matrix and leaves WCAG conformance unclaimed", () => {
    const report = readJson("docs/accessibility/a11y008-current-retest-report.json");
    const wcag = readJson("docs/accessibility/wcag-2.2-aa-conformance-matrix.json");
    const criteria = wcag.criteria as Array<Record<string, unknown>>;

    expect(report).toMatchObject({
      finalOutcome: "BLOCKED_INCONCLUSIVE",
      productImplementationAuthorized: false,
      measurements: {
        totalMatrixCells: 1584,
        applicableCells: 708,
        notApplicableCells: 876,
        unknownCells: 7,
        harnessErrors: 0
      },
      protection: {
        productSourceChanges: 0,
        protectedVisualChanges: 0,
        baselineWrites: 0,
        packageLockfileChanges: 0,
        paidCalls: 0
      }
    });
    expect(wcag.conformanceClaim).not.toBe(true);
    expect(criteria.find((candidate) => candidate.id === "1.4.3")?.status).toBe("NEEDS_MORE_EVIDENCE");
  });

  it("sets only the exact hash-bound gate-disposition decision and records no fabricated approval", () => {
    const program = readJson("docs/recovery/9of10-program-status.json");
    const decisions = readJson("docs/recovery/9of10-owner-decisions.json");
    const phases = program.phases as Array<Record<string, unknown>>;
    const decisionRows = decisions.decisions as Array<Record<string, unknown>>;
    const phase5 = phases.find((candidate) => candidate.phaseId === "5");
    const splitDecision = decisionRows.find(
      (candidate) => candidate.decisionId === "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001"
    );
    const gateDecision = decisionRows.find(
      (candidate) => candidate.decisionId === "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5D2-A11Y008-2026-08-07-001"
    );

    expect(program.nextReadyPhase).toBe("MANUAL_ACCESSIBILITY_EVIDENCE_SEPARATE_TASK");
    expect(phase5?.status).toBe("WAITING_OWNER_MANUAL_EVIDENCE");
    expect(splitDecision?.phase5d1RetestEvidence).toMatchObject({
      status: "BLOCKED_INCONCLUSIVE",
      productChanges: 0,
      implementationAuthorized: false,
      newOwnerDecisionCreated: false
    });
    expect(splitDecision?.phase5d2Evidence).toMatchObject({
      status: "PASS_EVIDENCE_OUTCOME_C_WAITING_OWNER_GATE_DISPOSITION",
      productImplementation: false,
      unknownRequiredCells: 0,
      rawAxePreserved: true,
      axeSuppressed: false,
      newOwnerDecisionRequired: true
    });
    expect(gateDecision).toMatchObject({
      status: "APPROVED",
      binding: {
        issueId: "A11Y-008",
        proposalHash: "63d03d4bc44ef4169b24c2e4d3dfa4236b10a67227ae03108b7fd535db6ce29d",
        manifestHash: "88c0da1ac90bd8a0c0ce80cf321c1ab64baa273401aa5da20566a2c3a9e26247",
        measurementHash: "4d20210b1ea1baf8edf283438588247754b90788bc8cc8278d498af66eacff0a"
      },
      issueStatus: "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE",
      productRemediation: "NOT_REQUIRED",
      generalAxeSuppression: false,
      rawAxeResultPreserved: true,
      manualAccessibilityEvidence: "APPROVED_NOT_TESTED",
      wcag22AaConformance: "NOT_CLAIMED"
    });
    expect(decisions.fabricatedApprovals).toBe(0);
  });
});
