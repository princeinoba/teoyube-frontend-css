import { z } from "zod";

export const PREVIEW_GROUNDED_RESPONSE_SCHEMA_VERSION =
  "teoyube-preview-grounded-live-ai-2026-08-12.2";
export const PREVIEW_GROUNDED_SAFETY_BOUNDARY =
  "This is interpretation, not divine certainty.";

const boundedText = (maximum: number) => z.string().trim().min(1).max(maximum);
const citationId = z.string().trim().min(1).max(192).regex(/^[a-z0-9._:#-]+$/i);

export const previewGroundedResponseSchema = z.object({
  disposition: z.enum(["answer", "clarify", "no_answer", "refuse"]),
  summary: boundedText(700),
  biblical_application: boundedText(700),
  prayer: boundedText(500),
  action_step: boundedText(400),
  citation_ids: z.array(citationId).max(5),
  limitations: z.array(boundedText(300)).min(1).max(4),
  confidence: z.enum(["high", "medium", "low"]),
  safety_boundary: z.literal(PREVIEW_GROUNDED_SAFETY_BOUNDARY),
}).strict();

export type PreviewGroundedResponse = Readonly<
  z.infer<typeof previewGroundedResponseSchema>
>;

export const PREVIEW_GROUNDED_RESPONSE_JSON_SCHEMA: Readonly<
  Record<string, unknown>
> = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: Object.freeze([
    "disposition",
    "summary",
    "biblical_application",
    "prayer",
    "action_step",
    "citation_ids",
    "limitations",
    "confidence",
    "safety_boundary",
  ]),
  properties: Object.freeze({
    disposition: Object.freeze({
      type: "string",
      enum: Object.freeze(["answer", "clarify", "no_answer", "refuse"]),
    }),
    summary: Object.freeze({ type: "string", minLength: 1, maxLength: 700 }),
    biblical_application: Object.freeze({
      type: "string",
      minLength: 1,
      maxLength: 700,
    }),
    prayer: Object.freeze({ type: "string", minLength: 1, maxLength: 500 }),
    action_step: Object.freeze({
      type: "string",
      minLength: 1,
      maxLength: 400,
    }),
    citation_ids: Object.freeze({
      type: "array",
      maxItems: 5,
      items: Object.freeze({
        type: "string",
        minLength: 1,
        maxLength: 192,
        pattern: "^[a-zA-Z0-9._:#-]+$",
      }),
    }),
    limitations: Object.freeze({
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: Object.freeze({ type: "string", minLength: 1, maxLength: 300 }),
    }),
    confidence: Object.freeze({
      type: "string",
      enum: Object.freeze(["high", "medium", "low"]),
    }),
    safety_boundary: Object.freeze({
      type: "string",
      enum: Object.freeze([PREVIEW_GROUNDED_SAFETY_BOUNDARY]),
    }),
  }),
});

export function parsePreviewGroundedResponse(
  value: unknown,
): PreviewGroundedResponse {
  return Object.freeze(previewGroundedResponseSchema.parse(value));
}
