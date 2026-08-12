import "server-only";

import { z } from "zod";

export const PREVIEW_GROUNDED_PIPELINE_STAGES = Object.freeze([
  "REQUEST_VALIDATION",
  "LOCAL_POLICY",
  "TIG",
  "RETRIEVAL",
  "EVIDENCE_HYDRATION",
  "MODEL_PROBE",
  "INPUT_MODERATION",
  "GENERATION",
  "OUTPUT_PARSING",
  "CITATION_VALIDATION",
  "OUTPUT_MODERATION",
  "THEOLOGICAL_VALIDATION",
  "COMPLETED",
  "UNKNOWN",
] as const);

export const PREVIEW_GROUNDED_REASON_CODES = Object.freeze([
  "COMPLETED",
  "PRE_PROVIDER_POLICY_REJECTION",
  "RUNTIME_DISABLED",
  "TIG_VALIDATION_FAILURE",
  "RETRIEVAL_UNAVAILABLE",
  "RETRIEVAL_INSUFFICIENT_EVIDENCE",
  "INPUT_MODERATION_REJECTION",
  "OPENAI_API_ERROR",
  "OPENAI_REFUSAL",
  "OPENAI_INCOMPLETE_MAX_OUTPUT",
  "OPENAI_INCOMPLETE_CONTENT_FILTER",
  "STRUCTURED_OUTPUT_MISSING",
  "STRUCTURED_OUTPUT_SCHEMA_INVALID",
  "CITATION_EMPTY",
  "CITATION_NOT_ALLOWED",
  "CITATION_NOT_RETRIEVED",
  "EXACT_WEB_HYDRATION_FAILURE",
  "OUTPUT_MODERATION_REJECTION",
  "MODEL_SCRIPTURE_GENERATION_REJECTION",
  "THEOLOGICAL_RULE_VIOLATION",
  "LATENCY_TIMEOUT",
  "COST_CIRCUIT_OPEN",
  "UNKNOWN_FALLBACK",
] as const);

export const PREVIEW_GROUNDED_RESPONSE_STATUSES = Object.freeze([
  "none",
  "completed",
  "failed",
  "in_progress",
  "cancelled",
  "queued",
  "incomplete",
  "api_error",
] as const);

export const PREVIEW_GROUNDED_INCOMPLETE_REASONS = Object.freeze([
  "none",
  "max_output_tokens",
  "content_filter",
  "unknown",
] as const);

export type PreviewGroundedPipelineStage =
  (typeof PREVIEW_GROUNDED_PIPELINE_STAGES)[number];
export type PreviewGroundedReasonCode =
  (typeof PREVIEW_GROUNDED_REASON_CODES)[number];
export type PreviewGroundedResponseStatus =
  (typeof PREVIEW_GROUNDED_RESPONSE_STATUSES)[number];
export type PreviewGroundedIncompleteReason =
  (typeof PREVIEW_GROUNDED_INCOMPLETE_REASONS)[number];

const finiteNonnegative = z.number().finite().nonnegative();
const previewGroundedForbiddenClaimEvidenceSchema = z.object({
  fieldProvenance: z.enum([
    "MODEL_SUMMARY",
    "MODEL_BIBLICAL_APPLICATION",
    "MODEL_PRAYER",
    "MODEL_ACTION_STEP",
    "MODEL_LIMITATIONS",
    "SERVER_FIXED_UNCERTAINTY",
  ]),
  validationRuleId: z.string().regex(/^[A-Z0-9_]{1,96}$/),
  matcherId: z.literal("SAFETY_REGISTRY_REGEX"),
  matchCount: z.number().int().positive().max(16),
  characterStart: z.number().int().nonnegative(),
  characterEnd: z.number().int().positive(),
  matchLength: z.number().int().positive(),
  fieldLength: z.number().int().positive(),
  normalizedMatchSha256: z.string().regex(/^[a-f0-9]{64}$/),
  semanticContext: z.enum([
    "SERVER_FIXED_BOUNDARY",
    "MODEL_AUTHORED_ASSERTION",
    "PERSONAL_GUARANTEE",
    "FUTURE_CERTAINTY",
  ]),
  providerCallCountClassification: z.literal(
    "EMBEDDING_VECTOR_GENERATION_AND_MODERATION",
  ),
  runtimeValidatorResult: z.literal("FAIL"),
  evaluatorResult: z.literal("NOT_RUN"),
}).strict().superRefine((value, context) => {
  if (
    value.characterEnd <= value.characterStart ||
    value.matchLength !== value.characterEnd - value.characterStart ||
    value.characterEnd > value.fieldLength
  ) {
    context.addIssue({
      code: "custom",
      message: "Forbidden-claim evidence offsets are inconsistent.",
    });
  }
});

export type PreviewGroundedForbiddenClaimEvidence = Readonly<
  z.infer<typeof previewGroundedForbiddenClaimEvidenceSchema>
>;

export const previewGroundedDiagnosticEnvelopeSchema = z.object({
  caseId: z.string().regex(/^[a-z0-9-]{1,96}$/),
  pipelineStage: z.enum(PREVIEW_GROUNDED_PIPELINE_STAGES),
  fallbackReason: z.enum(PREVIEW_GROUNDED_REASON_CODES),
  providerCalled: z.boolean(),
  moderationCalled: z.boolean(),
  retrievalResultCount: z.number().int().nonnegative(),
  eligibleEvidenceCount: z.number().int().nonnegative(),
  responseStatus: z.enum(PREVIEW_GROUNDED_RESPONSE_STATUSES),
  refusalPresent: z.boolean(),
  incompleteReason: z.enum(PREVIEW_GROUNDED_INCOMPLETE_REASONS),
  schemaValid: z.boolean(),
  citationCount: z.number().int().nonnegative(),
  unknownCitationCount: z.number().int().nonnegative(),
  validatorRuleId: z.string().regex(/^[A-Z0-9_]{1,96}$/),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  reasoningTokens: z.number().int().nonnegative(),
  latencyMs: finiteNonnegative,
  costUsd: finiteNonnegative,
  outputSha256: z.string().regex(/^(?:[a-f0-9]{64}|none)$/),
  forbiddenClaimEvidence: z.array(
    previewGroundedForbiddenClaimEvidenceSchema,
  ).max(16),
}).strict();

export type PreviewGroundedDiagnosticEnvelope = Readonly<
  z.infer<typeof previewGroundedDiagnosticEnvelopeSchema>
>;

export type PreviewGroundedDiagnosticState = Readonly<{
  caseId: string;
  pipelineStage: PreviewGroundedPipelineStage;
  fallbackReason: PreviewGroundedReasonCode;
  providerCalled?: boolean;
  moderationCalled?: boolean;
  retrievalResultCount?: number;
  eligibleEvidenceCount?: number;
  responseStatus?: PreviewGroundedResponseStatus;
  refusalPresent?: boolean;
  incompleteReason?: PreviewGroundedIncompleteReason;
  schemaValid?: boolean;
  citationCount?: number;
  unknownCitationCount?: number;
  validatorRuleId?: string;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  latencyMs?: number;
  costUsd?: number;
  outputSha256?: string;
  forbiddenClaimEvidence?: readonly PreviewGroundedForbiddenClaimEvidence[];
}>;

export function createPreviewGroundedDiagnosticEnvelope(
  state: PreviewGroundedDiagnosticState,
): PreviewGroundedDiagnosticEnvelope {
  return Object.freeze(previewGroundedDiagnosticEnvelopeSchema.parse({
    caseId: state.caseId,
    pipelineStage: state.pipelineStage,
    fallbackReason: state.fallbackReason,
    providerCalled: state.providerCalled === true,
    moderationCalled: state.moderationCalled === true,
    retrievalResultCount: state.retrievalResultCount || 0,
    eligibleEvidenceCount: state.eligibleEvidenceCount || 0,
    responseStatus: state.responseStatus || "none",
    refusalPresent: state.refusalPresent === true,
    incompleteReason: state.incompleteReason || "none",
    schemaValid: state.schemaValid === true,
    citationCount: state.citationCount || 0,
    unknownCitationCount: state.unknownCitationCount || 0,
    validatorRuleId: state.validatorRuleId || "NONE",
    inputTokens: state.inputTokens || 0,
    outputTokens: state.outputTokens || 0,
    reasoningTokens: state.reasoningTokens || 0,
    latencyMs: state.latencyMs || 0,
    costUsd: state.costUsd || 0,
    outputSha256: state.outputSha256 || "none",
    forbiddenClaimEvidence: state.forbiddenClaimEvidence || [],
  }));
}

export function isPreviewGroundedDiagnosticsRuntime(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    environment.VERCEL_ENV === "preview" &&
    environment.NEXT_PUBLIC_TEOYUBE_APP_ENV === "preview" &&
    environment.NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET === "vercel-preview" &&
    environment.TEOYUBE_ENABLE_PREVIEW_LIVE_AI_EVALUATION === "true" &&
    environment.TEOYUBE_ENABLE_PREVIEW_LIVE_AI_DIAGNOSTICS === "true"
  );
}
