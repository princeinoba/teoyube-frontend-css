import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

describe("Phase 5D-1 A11Y-008 evidence ledgers", () => {
  it("preserves the issue as needs more evidence without authorizing implementation", () => {
    const register = readJson("docs/accessibility/accessibility-issue-register.json");
    const issues = register.issues as Array<Record<string, unknown>>;
    const issue = issues.find((candidate) => candidate.id === "A11Y-008");

    expect(issue).toMatchObject({
      classification: "NOT_REPRODUCED_CURRENT_NEEDS_MORE_EVIDENCE",
      phase5d1Status: "BLOCKED_INCONCLUSIVE",
      phase5d1ProductChanges: 0,
      implementationRequiredNow: false
    });
  });

  it("records the completed matrix and leaves WCAG conformance unclaimed", () => {
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

  it("sets only the exact missing-evidence gate and records no fabricated decision", () => {
    const program = readJson("docs/recovery/9of10-program-status.json");
    const decisions = readJson("docs/recovery/9of10-owner-decisions.json");
    const phases = program.phases as Array<Record<string, unknown>>;
    const decisionRows = decisions.decisions as Array<Record<string, unknown>>;
    const phase5 = phases.find((candidate) => candidate.phaseId === "5");
    const splitDecision = decisionRows.find(
      (candidate) => candidate.decisionId === "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001"
    );

    expect(program.nextReadyPhase).toBe("PHASE5D1_EXACT_MISSING_EVIDENCE_TASK");
    expect(phase5?.status).toBe("WAITING_EVIDENCE");
    expect(splitDecision?.phase5d1RetestEvidence).toMatchObject({
      status: "BLOCKED_INCONCLUSIVE",
      productChanges: 0,
      implementationAuthorized: false,
      newOwnerDecisionCreated: false
    });
    expect(decisions.fabricatedApprovals).toBe(0);
  });
});
