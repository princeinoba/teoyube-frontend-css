import { z } from "zod";

export const TEO_GUIDE_LIVE_RESPONSE_SCHEMA_VERSION = "teo-guide-live-response-2026-07-22.1";

export const TEO_GUIDE_LIVE_SECTION_KINDS = Object.freeze([
  "context",
  "interpretation",
  "promise_connection",
  "calling_evidence",
  "prayer",
  "practical_action",
  "reflection",
  "testimony_book",
  "mentor_community"
] as const);

const boundedText = z.string().trim().min(1).max(4_000);
const sourceId = z.string().trim().min(1).max(192).regex(/^[a-z0-9._:-]+$/i);

export const teoGuideStructuredResponseSchema = z.object({
  schemaVersion: z.literal(TEO_GUIDE_LIVE_RESPONSE_SCHEMA_VERSION),
  acknowledgement: boundedText,
  sections: z.array(z.object({
    kind: z.enum(TEO_GUIDE_LIVE_SECTION_KINDS),
    label: z.string().trim().min(1).max(96),
    body: boundedText,
    sourceIds: z.array(sourceId).min(1).max(8)
  }).strict()).max(12),
  citations: z.array(z.object({
    sourceId,
    canonicalLabel: z.string().trim().min(3).max(128),
    translation: z.literal("WEB"),
    corpusVersion: z.string().trim().min(1).max(160)
  }).strict()).min(1).max(8),
  whyThis: z.array(z.string().trim().min(1).max(512)).min(1).max(8),
  limitations: z.array(z.string().trim().min(1).max(512)).min(1).max(8),
  followUp: z.object({
    question: z.string().trim().min(1).max(512).nullable(),
    reason: z.string().trim().min(1).max(512).nullable()
  }).strict(),
  actionProposalIds: z.array(z.string().trim().min(1).max(192)).max(4)
}).strict();

export type TeoGuideStructuredResponse = Readonly<z.infer<typeof teoGuideStructuredResponseSchema>>;

const sectionSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: Object.freeze(["kind", "label", "body", "sourceIds"]),
  properties: Object.freeze({
    kind: Object.freeze({ type: "string", enum: TEO_GUIDE_LIVE_SECTION_KINDS }),
    label: Object.freeze({ type: "string", minLength: 1, maxLength: 96 }),
    body: Object.freeze({ type: "string", minLength: 1, maxLength: 4_000 }),
    sourceIds: Object.freeze({ type: "array", minItems: 1, maxItems: 8, items: Object.freeze({ type: "string", minLength: 1, maxLength: 192 }) })
  })
});

export const TEO_GUIDE_STRUCTURED_RESPONSE_JSON_SCHEMA: Readonly<Record<string, unknown>> = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: Object.freeze(["schemaVersion", "acknowledgement", "sections", "citations", "whyThis", "limitations", "followUp", "actionProposalIds"]),
  properties: Object.freeze({
    schemaVersion: Object.freeze({ type: "string", const: TEO_GUIDE_LIVE_RESPONSE_SCHEMA_VERSION }),
    acknowledgement: Object.freeze({ type: "string", minLength: 1, maxLength: 4_000 }),
    sections: Object.freeze({ type: "array", maxItems: 12, items: sectionSchema }),
    citations: Object.freeze({
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: Object.freeze({
        type: "object",
        additionalProperties: false,
        required: Object.freeze(["sourceId", "canonicalLabel", "translation", "corpusVersion"]),
        properties: Object.freeze({
          sourceId: Object.freeze({ type: "string", minLength: 1, maxLength: 192 }),
          canonicalLabel: Object.freeze({ type: "string", minLength: 3, maxLength: 128 }),
          translation: Object.freeze({ type: "string", const: "WEB" }),
          corpusVersion: Object.freeze({ type: "string", minLength: 1, maxLength: 160 })
        })
      })
    }),
    whyThis: Object.freeze({ type: "array", minItems: 1, maxItems: 8, items: Object.freeze({ type: "string", minLength: 1, maxLength: 512 }) }),
    limitations: Object.freeze({ type: "array", minItems: 1, maxItems: 8, items: Object.freeze({ type: "string", minLength: 1, maxLength: 512 }) }),
    followUp: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze(["question", "reason"]),
      properties: Object.freeze({
        question: Object.freeze({ type: Object.freeze(["string", "null"]), minLength: 1, maxLength: 512 }),
        reason: Object.freeze({ type: Object.freeze(["string", "null"]), minLength: 1, maxLength: 512 })
      })
    }),
    actionProposalIds: Object.freeze({ type: "array", maxItems: 4, items: Object.freeze({ type: "string", minLength: 1, maxLength: 192 }) })
  })
});

export function parseTeoGuideStructuredResponse(value: unknown): TeoGuideStructuredResponse {
  return Object.freeze(teoGuideStructuredResponseSchema.parse(value));
}
