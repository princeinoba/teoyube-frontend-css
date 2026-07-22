import { createHash } from "node:crypto";
import type {
  LiveModelEvent,
  LiveModelGateway,
  LiveStructuredGenerationResult,
  SafeUsageMetadata
} from "../../domain/live-ai/model-gateway";
import { assessSafety, validateSafetyResponse } from "../../domain/safety/safety-engine";
import type {
  TeoGuideOrchestrationResult,
  TeoGuideRequest,
  TeoGuideResponse,
  TeoGuideResponseSection
} from "../../domain/teo-guide/orchestration-contracts";
import { liveAiGuardrails, type LiveAiGuardrails } from "./live-ai-guardrails";
import {
  LIVE_AI_MODEL_CONFIGURATION_VERSION,
  LIVE_AI_OWNER_LIMITS,
  modelForRoute,
  readLiveAiRuntimeConfiguration,
  selectLiveModelRoute,
  type LiveAiRuntimeConfiguration
} from "./model-configuration";
import { modelToolsForPlan } from "./model-tool-definitions";
import { openAiResponsesAdapter } from "./openai-responses-adapter";
import { buildLivePromptBundle } from "./prompt-library";
import { buildSafeModelInput, safeModelInputWithinLimits } from "./safe-model-input";
import type { PrivacySafeEventSink } from "../observability/privacy-safe-events";
import { nullPrivacySafeEventSink } from "../observability/privacy-safe-events";

export const GUARDED_LIVE_TEO_GUIDE_VERSION = "teoyube-guarded-live-guide-2026-07-22.1";

export type LiveAiRequestMode = "deterministic" | "live_if_authorized";

export type GuardedTeoGuideResult = Readonly<{
  response: TeoGuideResponse;
  generationMode: "deterministic" | "live";
  fallbackReason?: string;
  modelResult?: LiveStructuredGenerationResult;
  events: readonly LiveModelEvent[];
  externalProcessingConsent: boolean;
  sensitiveContentConsent: boolean;
  memoryContextConsent: boolean;
  memoryIncluded: boolean;
  providerCalls: number;
  usage?: SafeUsageMetadata;
  durableWritePerformed: false;
}>;

export type GuardedLiveTeoGuideServiceOptions = Readonly<{
  gateway?: LiveModelGateway;
  guardrails?: LiveAiGuardrails;
  environment?: NodeJS.ProcessEnv;
  configuration?: LiveAiRuntimeConfiguration;
  now?: () => string;
  events?: PrivacySafeEventSink;
}>;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function effectiveConsent(request: TeoGuideRequest, purposeId: string, scope: string): Readonly<{ id: string }> | null {
  const current = Date.parse(request.context.now);
  const grant = request.context.effectiveConsents.find((item) => item.purposeId === purposeId
    && item.status === "granted"
    && item.scope.includes(scope)
    && (!item.expiresAt || Date.parse(item.expiresAt) > current));
  return grant ? Object.freeze({ id: grant.id }) : null;
}

function deterministicResult(
  response: TeoGuideResponse,
  reason: string | undefined,
  consents: Readonly<{ processing: boolean; sensitive: boolean; memory: boolean }>,
  events: readonly LiveModelEvent[] = Object.freeze([]),
  modelResult?: LiveStructuredGenerationResult
): GuardedTeoGuideResult {
  return Object.freeze({
    response,
    generationMode: "deterministic",
    ...(reason ? { fallbackReason: reason } : {}),
    ...(modelResult ? { modelResult } : {}),
    events: Object.freeze([...events]),
    externalProcessingConsent: consents.processing,
    sensitiveContentConsent: consents.sensitive,
    memoryContextConsent: consents.memory,
    memoryIncluded: false,
    providerCalls: modelResult?.usage.providerCalls || 0,
    usage: modelResult?.usage,
    durableWritePerformed: false
  });
}

function responseSections(result: NonNullable<LiveStructuredGenerationResult["structuredResponse"]>, kind: typeof result.sections[number]["kind"]): readonly TeoGuideResponseSection[] {
  return Object.freeze(result.sections.filter((section) => section.kind === kind).map((section) => Object.freeze({ label: section.label, body: section.body, sourceIds: Object.freeze([...section.sourceIds]) })));
}

function validateStructuredResult(input: Readonly<{
  model: NonNullable<LiveStructuredGenerationResult["structuredResponse"]>;
  deterministic: TeoGuideOrchestrationResult;
  userMessage: string;
}>): Readonly<{ valid: boolean; reason?: string }> {
  const response = input.deterministic.response;
  const sourceById = new Map(response.sources.map((source) => [source.id, source]));
  const proposalIds = new Set(response.actionProposals.map((proposal) => proposal.id));
  for (const section of input.model.sections) {
    if (section.sourceIds.some((sourceId) => !sourceById.has(sourceId))) return Object.freeze({ valid: false, reason: "model_source_unknown" });
    if (/\bWEB\s*:|\bScripture\s+(?:says|reads)\b/i.test(section.body) || section.label.toLowerCase() === "scripture") return Object.freeze({ valid: false, reason: "model_scripture_generation_blocked" });
  }
  for (const citation of input.model.citations) {
    const source = sourceById.get(citation.sourceId);
    if (!source || source.authority !== "Scripture" || source.scriptureReference !== citation.canonicalLabel || source.version !== citation.corpusVersion || citation.translation !== "WEB") {
      return Object.freeze({ valid: false, reason: "model_citation_mismatch" });
    }
  }
  if (input.model.actionProposalIds.some((id) => !proposalIds.has(id))) return Object.freeze({ valid: false, reason: "model_action_proposal_unknown" });
  const assessment = assessSafety(input.userMessage);
  const generatedText = [
    input.model.acknowledgement,
    ...input.model.sections.map((section) => section.body),
    ...input.model.whyThis,
    ...input.model.limitations,
    input.model.followUp.question || "",
    input.model.followUp.reason || ""
  ].join("\n");
  const validation = validateSafetyResponse({
    text: generatedText,
    assessment,
    citationValid: true,
    citationExactTextMatch: true,
    resourceSafeToDisplay: true
  });
  return validation.valid ? Object.freeze({ valid: true }) : Object.freeze({ valid: false, reason: "post_model_safety_blocked" });
}

function applyStructuredResult(input: Readonly<{
  deterministic: TeoGuideOrchestrationResult;
  model: NonNullable<LiveStructuredGenerationResult["structuredResponse"]>;
  modelResult: LiveStructuredGenerationResult;
  route: "light" | "standard";
  promptVersion: string;
  memoryIncluded: boolean;
  sensitiveContentIncluded: boolean;
}>): TeoGuideResponse {
  const existing = input.deterministic.response;
  const proposalIds = new Set(input.model.actionProposalIds);
  const selectedProposals = existing.actionProposals.filter((proposal) => proposalIds.has(proposal.id));
  return Object.freeze({
    ...existing,
    acknowledgement: input.model.acknowledgement,
    context: responseSections(input.model, "context"),
    teoyubeInterpretation: responseSections(input.model, "interpretation"),
    promiseConnections: responseSections(input.model, "promise_connection"),
    callingEvidence: responseSections(input.model, "calling_evidence"),
    prayer: responseSections(input.model, "prayer"),
    practicalActions: responseSections(input.model, "practical_action"),
    reflectionPrompts: responseSections(input.model, "reflection"),
    testimonyAndBook: responseSections(input.model, "testimony_book"),
    mentorCommunity: responseSections(input.model, "mentor_community"),
    ...(input.model.followUp.question && input.model.followUp.reason ? {
      followUp: Object.freeze({ question: input.model.followUp.question, reason: input.model.followUp.reason, maximumQuestions: 1 as const, sensitiveDetailsRequired: false as const })
    } : { followUp: undefined }),
    whyThis: Object.freeze([...input.model.whyThis, ...existing.whyThis.filter((item) => item.startsWith("Safety policy:"))]),
    limitations: Object.freeze([...new Set([...input.model.limitations, ...existing.limitations, "External AI synthesized language from deterministic Teoyube sources; Scripture, safety, consent, TIG, memory, and actions remained deterministic."])]),
    actionProposals: Object.freeze(selectedProposals),
    modelUse: Object.freeze({
      providerId: "openai",
      modelRoute: input.route,
      modelId: input.modelResult.modelId,
      modelSnapshot: input.modelResult.modelSnapshot || input.modelResult.modelId,
      promptVersion: input.promptVersion,
      responseSchemaVersion: input.model.schemaVersion,
      store: false,
      memoryIncluded: input.memoryIncluded,
      sensitiveContentIncluded: input.sensitiveContentIncluded,
      zeroDataRetentionClaimed: false
    }),
    deterministic: false,
    externalModelUsed: true,
    durableWritePerformed: false
  });
}

function providerFailure(status: LiveStructuredGenerationResult["status"]): boolean {
  return status === "timeout" || status === "rate_limited" || status === "provider_error";
}

export class GuardedLiveTeoGuideService {
  readonly #gateway: LiveModelGateway;
  readonly #guardrails: LiveAiGuardrails;
  readonly #configuration: LiveAiRuntimeConfiguration;
  readonly #now: () => string;
  readonly #events: PrivacySafeEventSink;

  constructor(options: GuardedLiveTeoGuideServiceOptions = {}) {
    this.#gateway = options.gateway || openAiResponsesAdapter;
    this.#guardrails = options.guardrails || liveAiGuardrails;
    this.#configuration = options.configuration || readLiveAiRuntimeConfiguration(options.environment || process.env);
    this.#now = options.now || (() => new Date().toISOString());
    this.#events = options.events || nullPrivacySafeEventSink;
  }

  async run(input: Readonly<{
    request: TeoGuideRequest;
    deterministic: TeoGuideOrchestrationResult;
    mode: LiveAiRequestMode;
    abortSignal?: AbortSignal;
  }>): Promise<GuardedTeoGuideResult> {
    const processingGrant = effectiveConsent(input.request, "external_ai_processing", "external_ai:process");
    const sensitiveGrant = effectiveConsent(input.request, "external_ai_sensitive_content", "external_ai:sensitive_content");
    const memoryGrant = effectiveConsent(input.request, "external_ai_memory_context", "external_ai:memory_context");
    const consents = Object.freeze({ processing: Boolean(processingGrant), sensitive: Boolean(sensitiveGrant), memory: Boolean(memoryGrant) });
    const response = input.deterministic.response;
    const traceId = digest(`${input.request.context.conversationId}|${response.id}`).slice(0, 24);
    const blocked = (reason: string) => {
      this.#events.emit({ name: "live_ai_request_blocked", occurredAt: this.#now(), result: "blocked", traceId, route: "/teo-guide", safeCode: reason, tokenCount: 0, memoryIncluded: false });
      return deterministicResult(response, reason, consents);
    };
    if (input.mode === "deterministic") return blocked("deterministic_mode_selected");
    if (!this.#configuration.enabled) return blocked("live_ai_disabled");
    if (!processingGrant) return blocked("external_processing_consent_required");
    if (response.safety.mode === "critical") return blocked("critical_deterministic_only");
    if (response.safety.promptInjectionBlocked) return blocked("prompt_injection_deterministic_only");
    const sensitive = response.safety.mode === "sensitive";
    if (sensitive && !sensitiveGrant) return blocked("external_sensitive_content_consent_required");
    const route = selectLiveModelRoute(response.intent, response.safety.mode);
    if (route === "deterministic_only" || route === "advanced") return blocked("model_route_disabled");
    const includeAuthorizedMemory = Boolean(memoryGrant)
      && Boolean(effectiveConsent(input.request, "journey_continuity", "memory:read"));
    const safeInput = buildSafeModelInput({ userMessage: input.request.input, deterministic: input.deterministic, includeAuthorizedMemory });
    if (!safeModelInputWithinLimits(safeInput)) return blocked("safe_model_input_limit");
    const prompt = buildLivePromptBundle(response.intent);
    const totalEstimatedTokens = safeInput.limits.estimatedInputTokens + Math.ceil(prompt.systemPrompt.length / 4);
    if (totalEstimatedTokens > LIVE_AI_OWNER_LIMITS.maximumInputTokens) return blocked("safe_model_input_limit");
    const preparedNames = new Set(safeInput.toolResults.map((item) => item.tool));
    const allPreparedTools = modelToolsForPlan(input.deterministic.plan).filter((tool) => preparedNames.has(tool.name));
    const allowedTools = route === "light" ? allPreparedTools : Object.freeze([]);
    const maximumToolRounds = route === "light" ? Math.min(LIVE_AI_OWNER_LIMITS.maximumToolRounds, allowedTools.length) : 0;
    const requestId = `live-${digest(`${input.request.context.conversationId}|${response.id}|${this.#now()}`).slice(0, 24)}`;
    const subjectHash = digest(input.request.context.authorization?.user.id || input.request.context.conversationId).slice(0, 24);
    const consentIds = [processingGrant?.id, sensitive ? sensitiveGrant?.id : undefined, includeAuthorizedMemory ? memoryGrant?.id : undefined].filter((value): value is string => Boolean(value));
    const consentPurposes = ["external_ai_processing", ...(sensitive ? ["external_ai_sensitive_content"] : []), ...(includeAuthorizedMemory ? ["external_ai_memory_context", "journey_continuity"] : [])];
    const model = modelForRoute(route);
    const liveEvents: LiveModelEvent[] = [];
    this.#events.emit({ name: "live_ai_request_started", occurredAt: this.#now(), result: "allowed", traceId: requestId, route: "/teo-guide", modelRoute: route, provider: "openai", memoryIncluded: safeInput.memory.length > 0, tokenCount: totalEstimatedTokens });
    let attempt = 0;
    let lastResult: LiveStructuredGenerationResult | undefined;
    while (true) {
      const admission = this.#guardrails.admit({
        requestId,
        attemptKey: `${requestId}:${attempt}`,
        subjectHash,
        route,
        estimatedInputTokens: totalEstimatedTokens,
        maximumOutputTokens: LIVE_AI_OWNER_LIMITS.maximumOutputTokens,
        maximumToolRounds
      });
      if (!admission.allowed || !admission.permit) {
        liveEvents.push(Object.freeze({ type: "fallback", requestId, reasonCode: admission.code }));
        this.#events.emit({ name: admission.code === "daily_budget_limit" || admission.code === "request_cost_limit" ? "live_ai_budget_blocked" : admission.code === "circuit_open" ? "live_ai_circuit_opened" : "live_ai_request_blocked", occurredAt: this.#now(), result: "blocked", traceId: requestId, route: "/teo-guide", modelRoute: route, provider: "openai", memoryIncluded: safeInput.memory.length > 0, safeCode: admission.code, tokenCount: totalEstimatedTokens });
        return deterministicResult(response, admission.code, consents, liveEvents, lastResult);
      }
      const modelRequest = Object.freeze({
        requestId,
        modelRoute: route,
        modelId: model.id,
        snapshotId: model.snapshotId,
        modelConfigurationVersion: LIVE_AI_MODEL_CONFIGURATION_VERSION,
        promptVersion: prompt.version,
        promptChecksum: prompt.checksum,
        systemPrompt: prompt.systemPrompt,
        responseSchemaVersion: "teo-guide-live-response-2026-07-22.1",
        safetyPolicyVersion: response.versions.safetyPolicy,
        orchestrationVersion: response.versions.orchestrator,
        input: safeInput,
        allowedTools,
        maximumToolRounds,
        maximumOutputTokens: LIVE_AI_OWNER_LIMITS.maximumOutputTokens,
        timeoutMs: LIVE_AI_OWNER_LIMITS.requestTimeoutMs,
        store: false as const,
        metadata: Object.freeze({
          traceId: requestId,
          subjectHash,
          route: "/teo-guide" as const,
          modelRoute: route,
          consentIds: Object.freeze(consentIds),
          consentPurposes: Object.freeze(consentPurposes),
          memoryIncluded: safeInput.memory.length > 0,
          sensitiveContentIncluded: sensitive,
          rawContentStored: false as const
        }),
        abortSignal: input.abortSignal
      });
      lastResult = await this.#gateway.generateStructured(modelRequest);
      if (lastResult.status === "completed" && lastResult.structuredResponse) {
        this.#guardrails.complete(admission.permit, lastResult.usage);
        const validation = validateStructuredResult({ model: lastResult.structuredResponse, deterministic: input.deterministic, userMessage: input.request.input });
        if (!validation.valid) {
          liveEvents.push(Object.freeze({ type: "fallback", requestId, reasonCode: validation.reason || "post_model_validation_failed" }));
          this.#events.emit({ name: "live_ai_fallback_used", occurredAt: this.#now(), result: "fallback", traceId: requestId, route: "/teo-guide", modelRoute: route, provider: "openai", memoryIncluded: safeInput.memory.length > 0, safeCode: validation.reason || "post_model_validation_failed", tokenCount: lastResult.usage.totalTokens, estimatedCostUsd: lastResult.usage.estimatedCostUsd });
          return deterministicResult(response, validation.reason || "post_model_validation_failed", consents, liveEvents, lastResult);
        }
        const liveResponse = applyStructuredResult({ deterministic: input.deterministic, model: lastResult.structuredResponse, modelResult: lastResult, route, promptVersion: prompt.version, memoryIncluded: safeInput.memory.length > 0, sensitiveContentIncluded: sensitive });
        for (const section of lastResult.structuredResponse.sections) liveEvents.push(Object.freeze({ type: "approved_section", requestId, section: Object.freeze({ kind: section.kind, label: section.label, body: section.body, sourceIds: Object.freeze([...section.sourceIds]) }) }));
        liveEvents.push(Object.freeze({ type: "completed", requestId, usage: lastResult.usage }));
        this.#events.emit({ name: "live_ai_provider_completed", occurredAt: this.#now(), result: "complete", traceId: requestId, route: "/teo-guide", modelRoute: route, provider: "openai", memoryIncluded: safeInput.memory.length > 0, tokenCount: lastResult.usage.totalTokens, estimatedCostUsd: lastResult.usage.estimatedCostUsd, latencyMs: lastResult.latencyMs });
        return Object.freeze({
          response: liveResponse,
          generationMode: "live",
          modelResult: lastResult,
          events: Object.freeze(liveEvents),
          externalProcessingConsent: true,
          sensitiveContentConsent: sensitive ? true : Boolean(sensitiveGrant),
          memoryContextConsent: Boolean(memoryGrant),
          memoryIncluded: safeInput.memory.length > 0,
          providerCalls: lastResult.usage.providerCalls,
          usage: lastResult.usage,
          durableWritePerformed: false
        });
      }
      this.#guardrails.fail(admission.permit, providerFailure(lastResult.status));
      liveEvents.push(Object.freeze({ type: "fallback", requestId, reasonCode: lastResult.safeErrorCode || lastResult.status }));
      if (!this.#guardrails.canRetry({ status: lastResult.status, requestId, route, estimatedInputTokens: totalEstimatedTokens, maximumOutputTokens: LIVE_AI_OWNER_LIMITS.maximumOutputTokens, attempt })) {
        this.#events.emit({ name: "live_ai_fallback_used", occurredAt: this.#now(), result: "fallback", traceId: requestId, route: "/teo-guide", modelRoute: route, provider: "openai", memoryIncluded: safeInput.memory.length > 0, safeCode: lastResult.safeErrorCode || lastResult.status, tokenCount: lastResult.usage.totalTokens, estimatedCostUsd: lastResult.usage.estimatedCostUsd });
        return deterministicResult(response, lastResult.safeErrorCode || lastResult.status, consents, liveEvents, lastResult);
      }
      attempt += 1;
    }
  }
}

export const guardedLiveTeoGuideService = new GuardedLiveTeoGuideService();
