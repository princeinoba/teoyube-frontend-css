import { createHash } from "node:crypto";
import type { SafeModelInput, SafeModelSource, SafeModelToolResult } from "../../domain/live-ai/model-gateway";
import type { TeoGuideOrchestrationResult, TeoGuideResponseSection, TeoGuideToolName } from "../../domain/teo-guide/orchestration-contracts";
import { LIVE_AI_OWNER_LIMITS } from "./model-configuration";

export const SAFE_MODEL_INPUT_VERSION = "teoyube-safe-model-input-2026-07-22.1";

const MAX_MESSAGE_CHARACTERS = 4_000;
const MAX_SOURCES = 8;
const MAX_MEMORY_RECORDS = 2;
const MAX_TOOL_RESULT_CHARACTERS = 12_000;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sanitizeMessage(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").trim().replace(/\s+/g, " ").slice(0, MAX_MESSAGE_CHARACTERS);
}

function sectionSummary(sections: readonly TeoGuideResponseSection[]): string {
  return sections.map((item) => `${item.label}: ${item.body}`).join("\n").slice(0, 4_000);
}

function sectionsForTool(result: TeoGuideOrchestrationResult, tool: TeoGuideToolName): readonly TeoGuideResponseSection[] {
  const response = result.response;
  if (tool === "searchScripture") return response.scripture;
  if (tool === "getScriptureContext") return response.context;
  if (tool === "searchPromises" || tool === "getPromiseCluster") return response.promiseConnections;
  if (tool === "getCurrentJourney" || tool === "proposeJourneyAction") return response.practicalActions;
  if (tool === "getCallingEvidence") return response.callingEvidence;
  if (tool === "buildPrayerOptions") return response.prayer;
  if (tool === "searchApprovedUserMemory" || tool === "summarizeReflectionPattern") return response.reflectionPrompts;
  if (tool === "createJournalDraft") return response.reflectionPrompts;
  if (tool === "createTestimonyDraft") return response.testimonyAndBook;
  return response.mentorCommunity;
}

const MEMORY_TOOLS = new Set<TeoGuideToolName>(["searchApprovedUserMemory", "summarizeReflectionPattern"]);

function preparedToolResults(result: TeoGuideOrchestrationResult, includeAuthorizedMemory: boolean): readonly SafeModelToolResult[] {
  const prepared: SafeModelToolResult[] = [];
  let characters = 0;
  for (const tool of result.executedTools.slice(0, LIVE_AI_OWNER_LIMITS.maximumToolsPerTurn)) {
    if (MEMORY_TOOLS.has(tool) && !includeAuthorizedMemory) continue;
    const sections = sectionsForTool(result, tool);
    const summary = sectionSummary(sections) || "The deterministic tool completed without an additional display section.";
    const sourceIds = Object.freeze([...new Set(sections.flatMap((item) => item.sourceIds))]);
    const limitations = Object.freeze(result.response.limitations.slice(0, 4));
    const candidate = Object.freeze({
      tool,
      status: "complete" as const,
      summary,
      sourceIds,
      limitations,
      resultHash: hash(JSON.stringify({ tool, summary, sourceIds, limitations }))
    });
    const size = JSON.stringify(candidate).length;
    if (characters + size > MAX_TOOL_RESULT_CHARACTERS) break;
    characters += size;
    prepared.push(candidate);
  }
  return Object.freeze(prepared);
}

function exactScriptureText(result: TeoGuideOrchestrationResult, source: TeoGuideOrchestrationResult["response"]["sources"][number]): string | undefined {
  const section = result.response.scripture.find((item) => item.sourceIds.includes(source.id)
    || Boolean(source.scriptureReference && item.body.startsWith(source.scriptureReference) && item.body.includes("WEB:")));
  if (!section) return undefined;
  const marker = section.body.indexOf("WEB:");
  return marker >= 0 ? section.body.slice(marker + 4).trim() : section.body;
}

function preparedSources(result: TeoGuideOrchestrationResult, includeAuthorizedMemory: boolean): readonly SafeModelSource[] {
  const ordered = result.response.sources
    .filter((source) => source.kind !== "approved_memory" || includeAuthorizedMemory)
    .sort((left, right) => (left.authority === "Scripture" ? -1 : 0) - (right.authority === "Scripture" ? -1 : 0));
  return Object.freeze(ordered.map((source) => Object.freeze({
      id: source.id,
      kind: source.kind,
      authority: source.authority,
      label: source.label,
      version: source.version,
      ...(source.scriptureReference ? { canonicalLabel: source.scriptureReference, translation: "WEB" as const, exactText: exactScriptureText(result, source) } : {})
    }))
    .filter((source) => source.authority !== "Scripture" || Boolean(source.canonicalLabel && source.exactText))
    .slice(0, MAX_SOURCES));
}

function totalToolCharacters(results: readonly SafeModelToolResult[]): number {
  return results.reduce((total, item) => total + JSON.stringify(item).length, 0);
}

export function estimateInputTokens(value: unknown): number {
  return Math.ceil(JSON.stringify(value).length / 4);
}

export function buildSafeModelInput(input: Readonly<{
  userMessage: string;
  deterministic: TeoGuideOrchestrationResult;
  includeAuthorizedMemory: boolean;
}>): SafeModelInput {
  const response = input.deterministic.response;
  const originalMessage = input.userMessage.trim().replace(/\s+/g, " ");
  const sanitizedUserMessage = sanitizeMessage(input.userMessage);
  const sources = preparedSources(input.deterministic, input.includeAuthorizedMemory);
  const sourceIds = new Set(sources.map((source) => source.id));
  const toolResults = Object.freeze(preparedToolResults(input.deterministic, input.includeAuthorizedMemory)
    .filter((result) => result.sourceIds.every((sourceId) => sourceIds.has(sourceId))));
  const includeJourney = input.includeAuthorizedMemory && Boolean(input.deterministic.plan.steps.some((step) => step.requiresConsentPurpose === "journey_continuity"));
  const journey = includeJourney ? input.deterministic.response.sources.find((source) => source.kind === "journey") : undefined;
  const currentJourney = includeJourney ? input.deterministic.plan.steps.find((step) => step.tool === "getCurrentJourney" || step.tool === "proposeJourneyAction") : undefined;
  const journeyMemory = includeJourney && journey && currentJourney
    ? [Object.freeze({
      recordId: journey.id,
      purposeId: "journey_continuity",
      layer: "journey_state" as const,
      fields: Object.freeze({
        stage: currentJourney.reason,
        sourceVersion: journey.version,
        scriptureReferences: Object.freeze(response.sources.filter((source) => source.kind === "scripture").map((source) => source.scriptureReference).filter((value): value is string => Boolean(value)))
      }),
      sourceIds: Object.freeze([journey.id])
    })]
    : [];
  const approvedMemory = input.includeAuthorizedMemory
    ? sources.filter((source) => source.kind === "approved_memory").map((source) => Object.freeze({
      recordId: source.id,
      purposeId: "authorized_source_purpose",
      layer: "episodic" as const,
      fields: Object.freeze({ sourceVersion: source.version, label: source.label }),
      sourceIds: Object.freeze([source.id])
    }))
    : [];
  const memory = Object.freeze([...journeyMemory, ...approvedMemory].slice(0, MAX_MEMORY_RECORDS));
  const core = {
    sanitizedUserMessage,
    safety: Object.freeze({
      mode: response.safety.mode === "critical" ? "sensitive" as const : response.safety.mode,
      topic: response.safety.topic,
      allowedResponsePolicy: Object.freeze([
        "Scripture remains authoritative and exact.",
        "Interpretation and application remain humble and uncertain.",
        "No divine certainty, coercion, care replacement, automatic calling, testimony, fulfillment, or write."
      ])
    }),
    sources,
    toolResults,
    memory,
    versions: Object.freeze({
      safetyPolicy: response.versions.safetyPolicy,
      orchestration: response.versions.orchestrator,
      toolRegistry: response.versions.tools,
      scriptureCorpus: response.versions.scriptureCorpus,
      tigDataset: response.versions.tigDataset,
      tigRuleset: response.versions.tigRuleset
    })
  };
  const estimatedInputTokens = estimateInputTokens(core);
  const removedContext = [
    ...(originalMessage.length > sanitizedUserMessage.length ? ["user_message_tail"] : []),
    ...(response.sources.length > sources.length ? ["least_relevant_noncanonical_sources"] : []),
    ...(response.actionProposals.length ? ["action_proposal_payloads"] : []),
    "raw_conversation_history",
    "raw_private_memory",
    "internal_source_paths"
  ];
  return Object.freeze({
    ...core,
    limits: Object.freeze({
      messageCharacters: sanitizedUserMessage.length,
      sourceCount: sources.length,
      toolResultCharacters: totalToolCharacters(toolResults),
      memoryRecordCount: memory.length,
      estimatedInputTokens,
      truncated: originalMessage.length > sanitizedUserMessage.length || response.sources.length > sources.length,
      removedContext: Object.freeze(removedContext)
    })
  });
}

export function safeModelInputWithinLimits(input: SafeModelInput): boolean {
  return input.sanitizedUserMessage.length <= MAX_MESSAGE_CHARACTERS
    && input.sources.length <= MAX_SOURCES
    && input.memory.length <= MAX_MEMORY_RECORDS
    && input.limits.toolResultCharacters <= MAX_TOOL_RESULT_CHARACTERS
    && input.limits.estimatedInputTokens <= LIVE_AI_OWNER_LIMITS.maximumInputTokens
    && input.sources.filter((source) => source.authority === "Scripture").every((source) => Boolean(source.canonicalLabel && source.translation === "WEB" && source.exactText));
}

export const SAFE_MODEL_INPUT_LIMITS = Object.freeze({
  version: SAFE_MODEL_INPUT_VERSION,
  messageCharacters: MAX_MESSAGE_CHARACTERS,
  sources: MAX_SOURCES,
  memoryRecords: MAX_MEMORY_RECORDS,
  toolResultCharacters: MAX_TOOL_RESULT_CHARACTERS,
  estimatedInputTokens: LIVE_AI_OWNER_LIMITS.maximumInputTokens
});
