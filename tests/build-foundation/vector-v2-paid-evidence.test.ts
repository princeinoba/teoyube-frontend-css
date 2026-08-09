import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

type CompletionEvidence = {
  holdoutV2: { datasetHash: string; metrics: { paraphraseRecallAt5: number } };
  provider: { costs: { authorizationAdditionalUsd: number } };
};

const localRequire = createRequire(import.meta.url);
const { verifyVectorV2PaidEvidence } = localRequire("../../scripts/release/vectorV2PaidEvidence.cjs") as {
  verifyVectorV2PaidEvidence(options?: { evidenceOverride?: CompletionEvidence }): {
    valid: boolean;
    failures: string[];
  };
};

const original = () => JSON.parse(readFileSync(
  path.join(process.cwd(), "docs/release/vector-holdout-v2-quality-completion.json"),
  "utf8"
)) as CompletionEvidence;

describe("locked V2 paid-evidence binding", () => {
  it("validates the exact tracked completion evidence and commit ancestry", () => {
    const result = verifyVectorV2PaidEvidence();
    expect(result.valid, result.failures.join("\n")).toBe(true);
  });

  const alterations: Array<{
    name: string;
    alter: (evidence: CompletionEvidence) => void;
    expectedFailure: string;
  }> = [
    { name: "metric", alter: (evidence) => { evidence.holdoutV2.metrics.paraphraseRecallAt5 = 0.94; }, expectedFailure: "V2 paraphrase recall@5 is below its locked threshold." },
    { name: "hash", alter: (evidence) => { evidence.holdoutV2.datasetHash = "0".repeat(64); }, expectedFailure: "Locked V2 dataset hash changed or is inconsistent." },
    { name: "cost", alter: (evidence) => { evidence.provider.costs.authorizationAdditionalUsd = 0.006; }, expectedFailure: "V2 authorization cost is inconsistent or over budget." }
  ];

  it.each(alterations)("fails closed for altered $name evidence", ({ alter, expectedFailure }) => {
    const evidence = original();
    alter(evidence);
    const result = verifyVectorV2PaidEvidence({ evidenceOverride: evidence });
    expect(result.valid).toBe(false);
    expect(result.failures).toContain(expectedFailure);
  });
});
