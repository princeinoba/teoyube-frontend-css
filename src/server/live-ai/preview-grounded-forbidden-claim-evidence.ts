import "server-only";

import { createHash } from "node:crypto";
import type { PreviewGroundedResponse } from "../../domain/live-ai/preview-grounded-response";
import type { ProhibitedClaimFinding } from "../../domain/safety/safety-contracts";
import type { PreviewGroundedForbiddenClaimEvidence } from "./preview-grounded-diagnostics";

type FieldProvenance = PreviewGroundedForbiddenClaimEvidence["fieldProvenance"];

type FieldSpan = Readonly<{
  provenance: FieldProvenance;
  value: string;
  start: number;
  end: number;
}>;

function generatedFieldSpans(response: PreviewGroundedResponse): readonly FieldSpan[] {
  const values: readonly Readonly<{ provenance: FieldProvenance; value: string }>[] = [
    { provenance: "MODEL_SUMMARY", value: response.summary },
    { provenance: "MODEL_BIBLICAL_APPLICATION", value: response.biblical_application },
    { provenance: "MODEL_PRAYER", value: response.prayer },
    { provenance: "MODEL_ACTION_STEP", value: response.action_step },
    ...response.limitations.map((value) => ({ provenance: "MODEL_LIMITATIONS" as const, value })),
    { provenance: "SERVER_FIXED_UNCERTAINTY", value: response.safety_boundary },
  ];
  let cursor = 0;
  return Object.freeze(values.map((field, index) => {
    const start = cursor;
    const end = start + field.value.length;
    cursor = end + (index === values.length - 1 ? 0 : 1);
    return Object.freeze({ ...field, start, end });
  }));
}

function validationRuleId(finding: ProhibitedClaimFinding): string {
  return finding.registryRuleId
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "UNKNOWN_THEOLOGICAL_RULE";
}

function semanticContext(
  finding: ProhibitedClaimFinding,
  provenance: FieldProvenance,
): PreviewGroundedForbiddenClaimEvidence["semanticContext"] {
  if (provenance === "SERVER_FIXED_UNCERTAINTY") return "SERVER_FIXED_BOUNDARY";
  if (finding.type === "divine_authority") return "PERSONAL_GUARANTEE";
  if (finding.type === "final_calling_or_destiny" || finding.type === "guaranteed_outcome") {
    return "FUTURE_CERTAINTY";
  }
  return "MODEL_AUTHORED_ASSERTION";
}

export function createPreviewGroundedForbiddenClaimEvidence(
  response: PreviewGroundedResponse,
  findings: readonly ProhibitedClaimFinding[],
): readonly PreviewGroundedForbiddenClaimEvidence[] {
  const fields = generatedFieldSpans(response);
  const counts = new Map<string, number>();
  for (const finding of findings) {
    const field = fields.find((candidate) => (
      finding.start >= candidate.start && finding.end <= candidate.end
    ));
    if (!field) continue;
    const key = `${field.provenance}:${finding.registryRuleId}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Object.freeze(findings.flatMap((finding) => {
    const field = fields.find((candidate) => (
      finding.start >= candidate.start && finding.end <= candidate.end
    ));
    if (!field) return [];
    const characterStart = finding.start - field.start;
    const characterEnd = finding.end - field.start;
    const normalizedMatch = field.value
      .slice(characterStart, characterEnd)
      .normalize("NFKC")
      .toLocaleLowerCase("en-US");
    const key = `${field.provenance}:${finding.registryRuleId}`;
    return [Object.freeze({
      fieldProvenance: field.provenance,
      validationRuleId: validationRuleId(finding),
      matcherId: "SAFETY_REGISTRY_REGEX" as const,
      matchCount: counts.get(key) || 1,
      characterStart,
      characterEnd,
      matchLength: characterEnd - characterStart,
      fieldLength: field.value.length,
      normalizedMatchSha256: createHash("sha256").update(normalizedMatch).digest("hex"),
      semanticContext: semanticContext(finding, field.provenance),
      providerCallCountClassification: "EMBEDDING_VECTOR_GENERATION_AND_MODERATION" as const,
      runtimeValidatorResult: "FAIL" as const,
      evaluatorResult: "NOT_RUN" as const,
    })];
  }));
}