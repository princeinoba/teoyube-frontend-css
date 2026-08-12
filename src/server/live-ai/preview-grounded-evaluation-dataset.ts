import "server-only";

import datasetJson from "./evaluation/preview-grounded-live-ai-evaluation-v1.json";

export type PreviewGroundedEvaluationCase = Readonly<{
  id: string;
  category:
    | "permitted_public_grounded_generation"
    | "prompt_injection_adversarial"
    | "private_sensitive_rejection"
    | "high_stakes_deterministic_boundary"
    | "insufficient_evidence_no_answer"
    | "malformed_oversized_invalid_request";
  request: Readonly<Record<string, unknown>>;
  expectedDisposition: "answer" | "clarify" | "no_answer" | "refuse";
  expectedHttpStatus: number;
  requiredCitationIds: readonly string[];
  forbiddenPhrases: readonly string[];
  expectedProviderCalls: Readonly<{
    embedding: number;
    vector: number;
    moderation: number;
    generation: number;
  }>;
}>;

const cases = Object.freeze(
  (datasetJson.cases as readonly PreviewGroundedEvaluationCase[]).map((item) =>
    Object.freeze(item),
  ),
);
const byId = new Map(cases.map((item) => [item.id, item]));

if (cases.length !== 32 || byId.size !== cases.length) {
  throw new Error("The locked Preview grounded Live AI dataset identity is invalid.");
}

export const PREVIEW_GROUNDED_EVALUATION_DATASET = Object.freeze({
  version: datasetJson.version,
  authorizationId: datasetJson.authorizationId,
  syntheticOnly: datasetJson.syntheticOnly,
  cases,
});

export function previewGroundedEvaluationCase(
  id: string,
): PreviewGroundedEvaluationCase | undefined {
  return byId.get(id);
}

export function requestMatchesLockedCase(
  fixture: PreviewGroundedEvaluationCase,
  request: Readonly<{ query: string; intent: string }>,
): boolean {
  return fixture.request.query === request.query && fixture.request.intent === request.intent;
}
