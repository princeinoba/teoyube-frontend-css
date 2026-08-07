import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { verifyA11y008GateDisposition } = require(
  "../../scripts/accessibility/verifyA11y008GateDisposition.cjs"
) as {
  verifyA11y008GateDisposition: (options?: {
    root?: string;
    overrides?: Record<string, unknown>;
  }) => Record<string, unknown>;
};

const readJson = (path: string): Record<string, unknown> =>
  JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

describe("A11Y-008 exact owner-approved gate disposition", () => {
  it("accepts only the exact bound owner decision and evidence", () => {
    expect(verifyA11y008GateDisposition()).toMatchObject({
      issueId: "A11Y-008",
      proposalHash: "PASS",
      manifestHash: "PASS",
      measurementHash: "PASS",
      outcome: "C_TOOLING_FALSE_POSITIVE_OR_UNSUPPORTED_STATE",
      forcedColorsToolConflict: "CONFIRMED",
      computedRenderedEvidence: "ACCEPTED_FOR_THE_EXACT_BOUND_GATE",
      productRemediation: "NOT_REQUIRED",
      generalAxeSuppression: false,
      rawAxeResultPreserved: true
    });
  });

  it("fails closed when another issue attempts to reuse the decision", () => {
    const decision = structuredClone(readJson(
      "docs/owner-approvals/accessibility/TEOYUBE-OWNER-ACCESSIBILITY-PHASE5D2-A11Y008-2026-08-07-001.json"
    ));
    (decision.binding as Record<string, unknown>).issueId = "A11Y-009";
    expect(() => verifyA11y008GateDisposition({ overrides: { decision } })).toThrow(
      "owner decision was reused by another issue"
    );
  });

  it("fails closed when the proposal scope or bound proposal hash changes", () => {
    const proposal = structuredClone(readJson(
      "docs/accessibility/a11y008-gate-disposition-proposal.json"
    ));
    ((proposal.exactScope as Record<string, unknown>).routes as string[]).push("/today");
    expect(() => verifyA11y008GateDisposition({ overrides: { proposal } })).toThrow(
      "proposal payload hash changed"
    );
  });

  it("fails closed when forced colors is inactive", () => {
    const measurement = structuredClone(readJson(
      "docs/accessibility/a11y008-phase5d2-measurements.json"
    ));
    const cells = measurement.forcedColorsAxeReconciliation as Array<Record<string, unknown>>;
    (cells[0].emulatedActive as Record<string, unknown>).forcedColorsState = false;
    expect(() => verifyA11y008GateDisposition({ overrides: { measurement } })).toThrow(
      "measurement hash changed"
    );
  });

  it("fails closed when rendered evidence is unreliable or unknown", () => {
    const measurement = structuredClone(readJson(
      "docs/accessibility/a11y008-phase5d2-measurements.json"
    ));
    measurement.unknownRequiredCells = 1;
    expect(() => verifyA11y008GateDisposition({ overrides: { measurement } })).toThrow(
      "measurement hash changed"
    );
  });

  it("fails closed when the manifest or measurement artifact bytes change", () => {
    const manifest = readFileSync("tests/accessibility/evidence/a11y008-phase5d2/manifest.json");
    const measurement = readFileSync("docs/accessibility/a11y008-phase5d2-measurements.json");
    expect(() => verifyA11y008GateDisposition({
      overrides: { manifest: Buffer.concat([manifest, Buffer.from(" ")]) }
    })).toThrow("evidence manifest hash changed");
    expect(() => verifyA11y008GateDisposition({
      overrides: { measurement: Buffer.concat([measurement, Buffer.from(" ")]) }
    })).toThrow("measurement hash changed");
  });
});
