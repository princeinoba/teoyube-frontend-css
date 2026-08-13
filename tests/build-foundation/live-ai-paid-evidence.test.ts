import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

type CompletionEvidence = {
  lockedV1: { sha256: string };
  finalLockedEvaluation: {
    passed: number;
    metrics: { unsupportedBiblicalClaims: number };
    costsUsd: { cumulative: number };
  };
  bypass: { finalActiveCount: number };
  productionBoundary: { mutations: number };
};

const localRequire = createRequire(import.meta.url);
const { verifyLiveAiPaidEvidence } = localRequire("../../scripts/release/liveAiPaidEvidence.cjs") as {
  verifyLiveAiPaidEvidence(options?: { evidenceOverride?: CompletionEvidence }): {
    valid: boolean;
    failures: string[];
  };
};

const original = () => JSON.parse(readFileSync(
  path.join(process.cwd(), "docs/release/grounded-live-ai-probe-taxonomy-final.json"),
  "utf8"
)) as CompletionEvidence;

describe("locked Live AI paid-evidence binding", () => {
  it("validates the exact report, dataset, tested runtime, and unchanged dependencies", () => {
    const result = verifyLiveAiPaidEvidence();
    expect(result.valid, result.failures.join("\n")).toBe(true);
  });

  const alterations: Array<{
    name: string;
    alter: (evidence: CompletionEvidence) => void;
    expectedFailure: string;
  }> = [
    { name: "dataset hash", alter: (evidence) => { evidence.lockedV1.sha256 = "0".repeat(64); }, expectedFailure: "Locked Live AI V1 dataset binding changed." },
    { name: "case count", alter: (evidence) => { evidence.finalLockedEvaluation.passed = 31; }, expectedFailure: "Locked Live AI result is not an unretried 32/32 pass." },
    { name: "unsupported claims", alter: (evidence) => { evidence.finalLockedEvaluation.metrics.unsupportedBiblicalClaims = 1; }, expectedFailure: "unsupportedBiblicalClaims is non-zero." },
    { name: "cost", alter: (evidence) => { evidence.finalLockedEvaluation.costsUsd.cumulative = 0.28; }, expectedFailure: "Live AI evaluation cost binding is inconsistent or over budget." },
    { name: "bypass", alter: (evidence) => { evidence.bypass.finalActiveCount = 1; }, expectedFailure: "Automation bypass lifecycle is not closed." },
    { name: "production mutation", alter: (evidence) => { evidence.productionBoundary.mutations = 1; }, expectedFailure: "Production boundary is not closed." }
  ];

  it.each(alterations)("fails closed for altered $name evidence", ({ alter, expectedFailure }) => {
    const evidence = original();
    alter(evidence);
    const result = verifyLiveAiPaidEvidence({ evidenceOverride: evidence });
    expect(result.valid).toBe(false);
    expect(result.failures).toContain(expectedFailure);
  });
});
