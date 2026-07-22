import { z } from "zod";
import type { StrictFunctionToolDefinition } from "../../domain/live-ai/model-gateway";
import type { TeoGuidePlan, TeoGuideToolName } from "../../domain/teo-guide/orchestration-contracts";

export const LIVE_MODEL_TOOL_SCHEMA_VERSION = "teoyube-live-model-tools-2026-07-22.1";

const stringProperty = Object.freeze({ type: "string", minLength: 1, maxLength: 8_000 });
const identifierProperty = Object.freeze({ type: "string", minLength: 1, maxLength: 192 });
const referenceProperty = Object.freeze({ type: "string", minLength: 3, maxLength: 128 });
const integerProperty = (minimum: number, maximum: number) => Object.freeze({ type: "integer", minimum, maximum });

function objectSchema(properties: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  return Object.freeze({ type: "object", additionalProperties: false, required: Object.freeze(Object.keys(properties)), properties: Object.freeze(properties) });
}

const definitions: Readonly<Record<TeoGuideToolName, StrictFunctionToolDefinition>> = Object.freeze({
  searchScripture: Object.freeze({ name: "searchScripture", description: "Read the already-prepared exact WEB Scripture result.", strict: true, parameters: objectSchema({ query: stringProperty, limit: integerProperty(1, 5) }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  getScriptureContext: Object.freeze({ name: "getScriptureContext", description: "Read the already-prepared exact WEB passage context.", strict: true, parameters: objectSchema({ reference: referenceProperty, versesBefore: integerProperty(0, 12), versesAfter: integerProperty(0, 12) }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  searchPromises: Object.freeze({ name: "searchPromises", description: "Read the already-prepared local Promise Cluster matches.", strict: true, parameters: objectSchema({ query: stringProperty, limit: integerProperty(1, 10) }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  getPromiseCluster: Object.freeze({ name: "getPromiseCluster", description: "Read one already-prepared Promise Cluster.", strict: true, parameters: objectSchema({ clusterId: identifierProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  getCurrentJourney: Object.freeze({ name: "getCurrentJourney", description: "Read the authorized prepared current journey summary.", strict: true, parameters: objectSchema({ conversationId: identifierProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  proposeJourneyAction: Object.freeze({ name: "proposeJourneyAction", description: "Read the prepared reversible proposal; this performs no state change.", strict: true, parameters: objectSchema({ journeyId: identifierProperty, stage: identifierProperty, requestedAction: stringProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  getCallingEvidence: Object.freeze({ name: "getCallingEvidence", description: "Read prepared deterministic TIG calling indicators and limitations.", strict: true, parameters: objectSchema({ query: stringProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  buildPrayerOptions: Object.freeze({ name: "buildPrayerOptions", description: "Read prepared editable Scripture-grounded prayer options.", strict: true, parameters: objectSchema({ query: stringProperty, scriptureReference: referenceProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  searchApprovedUserMemory: Object.freeze({ name: "searchApprovedUserMemory", description: "Read only the minimum prepared consent-authorized memory context.", strict: true, parameters: objectSchema({ query: stringProperty, purpose: Object.freeze({ type: "string", enum: Object.freeze(["preference_continuity", "journey_continuity"]) }) }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  summarizeReflectionPattern: Object.freeze({ name: "summarizeReflectionPattern", description: "Read a prepared tentative pattern summary from approved metadata.", strict: true, parameters: objectSchema({ query: stringProperty, approvedRecordIds: Object.freeze({ type: "array", maxItems: 25, items: identifierProperty }) }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  createJournalDraft: Object.freeze({ name: "createJournalDraft", description: "Read a prepared session-only editable journal draft.", strict: true, parameters: objectSchema({ query: stringProperty, scriptureReference: referenceProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  createTestimonyDraft: Object.freeze({ name: "createTestimonyDraft", description: "Read a prepared testimony candidate that only the user may finalize.", strict: true, parameters: objectSchema({ query: stringProperty, scriptureReference: referenceProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false }),
  createMentorDiscussionPrompt: Object.freeze({ name: "createMentorDiscussionPrompt", description: "Read a prepared Scripture-grounded mentor or community discussion prompt.", strict: true, parameters: objectSchema({ query: stringProperty, scriptureReference: referenceProperty }), outputSchemaVersion: LIVE_MODEL_TOOL_SCHEMA_VERSION, stateMutation: false })
});

const text = z.string().trim().min(1).max(8_000);
const identifier = z.string().trim().min(1).max(192);
const reference = z.string().trim().min(3).max(128);
const validators: Readonly<Record<TeoGuideToolName, z.ZodType<Readonly<Record<string, unknown>>>>> = Object.freeze({
  searchScripture: z.object({ query: text, limit: z.number().int().min(1).max(5) }).strict(),
  getScriptureContext: z.object({ reference, versesBefore: z.number().int().min(0).max(12), versesAfter: z.number().int().min(0).max(12) }).strict(),
  searchPromises: z.object({ query: text, limit: z.number().int().min(1).max(10) }).strict(),
  getPromiseCluster: z.object({ clusterId: identifier }).strict(),
  getCurrentJourney: z.object({ conversationId: identifier }).strict(),
  proposeJourneyAction: z.object({ journeyId: identifier, stage: identifier, requestedAction: text }).strict(),
  getCallingEvidence: z.object({ query: text }).strict(),
  buildPrayerOptions: z.object({ query: text, scriptureReference: reference }).strict(),
  searchApprovedUserMemory: z.object({ query: text, purpose: z.enum(["preference_continuity", "journey_continuity"]) }).strict(),
  summarizeReflectionPattern: z.object({ query: text, approvedRecordIds: z.array(identifier).max(25) }).strict(),
  createJournalDraft: z.object({ query: text, scriptureReference: reference }).strict(),
  createTestimonyDraft: z.object({ query: text, scriptureReference: reference }).strict(),
  createMentorDiscussionPrompt: z.object({ query: text, scriptureReference: reference }).strict()
});

export function modelToolsForPlan(plan: TeoGuidePlan): readonly StrictFunctionToolDefinition[] {
  return Object.freeze(plan.steps.map((step) => definitions[step.tool]));
}

export function validateModelToolArguments(name: string, value: unknown): Readonly<Record<string, unknown>> {
  if (!(name in validators)) throw new Error("The model requested an unknown tool.");
  return Object.freeze(validators[name as TeoGuideToolName].parse(value));
}

export function inspectModelToolDefinitions(): readonly StrictFunctionToolDefinition[] {
  return Object.freeze(Object.values(definitions));
}
