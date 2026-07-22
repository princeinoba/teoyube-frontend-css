import { createHash } from "node:crypto";
import type { SafetyToolId, SafetyToolRequest } from "../../domain/safety/safety-contracts";
import { SAFETY_POLICY_VERSION } from "../../domain/safety/safety-contracts";
import { validateSafetyResponse } from "../../domain/safety/safety-engine";
import { createDeterministicTeoGuidePlan } from "../../domain/teo-guide/deterministic-planner";
import { createDeterministicTeoGuideMessage } from "../../domain/teo-guide/teo-guide-message";
import {
  TEO_GUIDE_LIMITS,
  TEO_GUIDE_ORCHESTRATION_VERSION,
  TEO_GUIDE_PLANNER_VERSION,
  TEO_GUIDE_RESPONSE_CONTRACT_VERSION,
  TEO_GUIDE_TOOL_REGISTRY_VERSION,
  type TeoGuideActionProposal,
  type TeoGuideOrchestrationResult,
  type TeoGuideOrchestrator,
  type TeoGuidePlanStep,
  type TeoGuideRequest,
  type TeoGuideResponse,
  type TeoGuideResponseSection,
  type TeoGuideSourceReference,
  type TeoGuideToolName
} from "../../domain/teo-guide/orchestration-contracts";
import type { TeoGuideToolInvocation, TeoGuideToolOutput } from "../../domain/teo-guide/tool-contracts";
import type { PrivacySafeEventSink } from "../observability/privacy-safe-events";
import { nullPrivacySafeEventSink } from "../observability/privacy-safe-events";
import { canonicalScriptureRepository } from "../scripture/canonical-scripture-repository";
import { DeterministicSafetyOrchestrator } from "../safety/safety-orchestrator";
import { TIG_DATASET_VERSION, TIG_RULESET_VERSION } from "../tig/canonical-tig-service";
import { teoGuideConversations, type TeoGuideConversationRepository } from "./conversation-repository";
import { TeoGuideToolRegistry, teoGuideToolRegistry } from "./tool-registry";

export type DeterministicTeoGuideOrchestratorOptions = Readonly<{
  tools?: TeoGuideToolRegistry;
  conversations?: TeoGuideConversationRepository;
  events?: PrivacySafeEventSink;
  now?: () => string;
  monotonicNow?: () => number;
}>;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function toolSafetyId(tool: TeoGuideToolName): SafetyToolId {
  if (tool === "searchScripture" || tool === "getScriptureContext") return "scripture.read";
  if (tool === "getCurrentJourney" || tool === "searchApprovedUserMemory" || tool === "summarizeReflectionPattern") return "memory.read";
  return "tig.recommend";
}

function effectiveConsent(request: TeoGuideRequest, step: TeoGuidePlanStep): boolean {
  if (!step.requiresConsentPurpose) return true;
  const now = Date.parse(request.context.now);
  return request.context.effectiveConsents.some((grant) => grant.purposeId === step.requiresConsentPurpose
    && grant.status === "granted"
    && (!grant.expiresAt || Date.parse(grant.expiresAt) > now));
}

function safetyRequests(request: TeoGuideRequest, steps: readonly TeoGuidePlanStep[]): readonly SafetyToolRequest[] {
  return Object.freeze(steps.map((step) => Object.freeze({
    id: toolSafetyId(step.tool),
    kind: "read_only" as const,
    purposeId: step.requiresConsentPurpose,
    authenticated: Boolean(request.context.authorization),
    sameUser: Boolean(request.context.authorization),
    effectiveConsent: effectiveConsent(request, step),
    userConfirmed: false
  })));
}

function field(output: TeoGuideToolOutput | undefined, name: string): string | undefined {
  const value = output?.items[0]?.[name];
  return typeof value === "string" ? value : undefined;
}

function invocation(step: TeoGuidePlanStep, request: TeoGuideRequest, outputs: readonly TeoGuideToolOutput[]): TeoGuideToolInvocation {
  const scripture = outputs.find((output) => output.tool === "searchScripture");
  const promise = outputs.find((output) => output.tool === "searchPromises");
  const scriptureReference = field(scripture, "reference") || "Psalm 119:105";
  switch (step.tool) {
    case "searchScripture": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, limit: 1 }) });
    case "getScriptureContext": return Object.freeze({ name: step.tool, input: Object.freeze({ reference: scriptureReference, versesBefore: 3, versesAfter: 3 }) });
    case "searchPromises": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, limit: 5 }) });
    case "getPromiseCluster": return Object.freeze({ name: step.tool, input: Object.freeze({ clusterId: field(promise, "clusterId") || "PC01" }) });
    case "getCurrentJourney": return Object.freeze({ name: step.tool, input: Object.freeze({ conversationId: request.context.conversationId }) });
    case "proposeJourneyAction": return Object.freeze({ name: step.tool, input: Object.freeze({ journeyId: request.context.currentJourney?.journeyId || "unavailable", stage: request.context.currentJourney?.stage || "unknown", requestedAction: "advance after user confirmation" }) });
    case "getCallingEvidence": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input }) });
    case "buildPrayerOptions": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, scriptureReference }) });
    case "searchApprovedUserMemory": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, purpose: "journey_continuity" as const }) });
    case "summarizeReflectionPattern": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, approvedRecordIds: Object.freeze(outputs.find((output) => output.tool === "searchApprovedUserMemory")?.items.map((item) => typeof item.id === "string" ? item.id : "").filter(Boolean) || []) }) });
    case "createJournalDraft": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, scriptureReference }) });
    case "createTestimonyDraft": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, scriptureReference }) });
    case "createMentorDiscussionPrompt": return Object.freeze({ name: step.tool, input: Object.freeze({ query: request.input, scriptureReference }) });
  }
}

function section(label: string, body: string, sourceIds: readonly string[]): TeoGuideResponseSection {
  return Object.freeze({ label, body, sourceIds: Object.freeze([...sourceIds]) });
}

function uniqueSources(outputs: readonly TeoGuideToolOutput[], safetySource: TeoGuideSourceReference): readonly TeoGuideSourceReference[] {
  const records = new Map<string, TeoGuideSourceReference>([[safetySource.id, safetySource]]);
  for (const output of outputs) for (const source of output.sources) records.set(source.id, source);
  return Object.freeze([...records.values()].slice(0, TEO_GUIDE_LIMITS.responseSourceCount));
}

function outputFor(outputs: readonly TeoGuideToolOutput[], tool: TeoGuideToolName): TeoGuideToolOutput | undefined {
  return outputs.find((output) => output.tool === tool);
}

function outputSources(output: TeoGuideToolOutput | undefined): readonly string[] {
  return Object.freeze(output?.sources.map((source) => source.id) || []);
}

function proposalList(outputs: readonly TeoGuideToolOutput[]): readonly TeoGuideActionProposal[] {
  const map = new Map<string, TeoGuideActionProposal>();
  for (const result of outputs) for (const proposal of result.proposals) map.set(proposal.id, proposal);
  return Object.freeze([...map.values()]);
}

async function executeWithTimeout(tools: TeoGuideToolRegistry, call: TeoGuideToolInvocation, context: TeoGuideRequest["context"], timeoutMs: number): Promise<TeoGuideToolOutput> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      tools.execute(call, context),
      new Promise<never>((_resolve, reject) => { timeout = setTimeout(() => reject(new Error("The deterministic tool timeout was reached.")), timeoutMs); })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export class DeterministicTeoGuideOrchestrator implements TeoGuideOrchestrator {
  readonly #tools: TeoGuideToolRegistry;
  readonly #conversations: TeoGuideConversationRepository;
  readonly #events: PrivacySafeEventSink;
  readonly #now: () => string;
  readonly #monotonicNow: () => number;

  constructor(options: DeterministicTeoGuideOrchestratorOptions = {}) {
    this.#tools = options.tools || teoGuideToolRegistry;
    this.#conversations = options.conversations || teoGuideConversations;
    this.#events = options.events || nullPrivacySafeEventSink;
    this.#now = options.now || (() => new Date().toISOString());
    this.#monotonicNow = options.monotonicNow || (() => performance.now());
  }

  async run(request: TeoGuideRequest): Promise<TeoGuideOrchestrationResult> {
    const started = this.#monotonicNow();
    const occurredAt = this.#now();
    const boundedInput = request.input.trim().slice(0, TEO_GUIDE_LIMITS.inputCharacters);
    const inputLimitReached = request.input.length > TEO_GUIDE_LIMITS.inputCharacters;
    const boundedRequest: TeoGuideRequest = Object.freeze({ ...request, input: boundedInput });
    const traceId = `trace-${digest(`${request.context.conversationId}|${occurredAt}`).slice(0, 16)}`;
    this.#events.emit({ name: "teo_guide_request_started", occurredAt, result: "allowed", count: boundedInput.length, traceId, route: request.context.route, responseVersion: TEO_GUIDE_RESPONSE_CONTRACT_VERSION, tokenCount: 0 });
    const plan = createDeterministicTeoGuidePlan(boundedRequest);
    this.#events.emit({ name: "teo_guide_intent_selected", occurredAt, result: "allowed", topic: plan.intent });
    const safety = await new DeterministicSafetyOrchestrator({ events: this.#events, now: this.#now }).run({
      syntheticOrUserInput: boundedInput,
      toolRequests: safetyRequests(boundedRequest, plan.steps),
      ...(plan.steps.some((step) => step.requiresConsentPurpose) ? {
        memoryRequest: Object.freeze({
          operation: "read" as const,
          authenticated: Boolean(request.context.authorization),
          sameUser: Boolean(request.context.authorization),
          purposeId: plan.steps.find((step) => step.requiresConsentPurpose)?.requiresConsentPurpose,
          effectiveConsent: plan.steps.filter((step) => step.requiresConsentPurpose).every((step) => effectiveConsent(request, step)),
          explicitUserConfirmation: false,
          crisisDisclosure: false,
          requestedFields: Object.freeze(["structured_summary"]),
          minimumNecessaryFields: Object.freeze(["structured_summary"])
        })
      } : {})
    });

    const outputs: TeoGuideToolOutput[] = [];
    const blocked: Array<Readonly<{ tool: TeoGuideToolName; reason: string }>> = [];
    const authorizedSafetyTools = new Set(safety.toolPlan.authorizedTools);
    let durationLimitReached = false;

    for (const step of plan.steps) {
      if (this.#monotonicNow() - started >= TEO_GUIDE_LIMITS.orchestrationDurationMs) {
        durationLimitReached = true;
        blocked.push(Object.freeze({ tool: step.tool, reason: "The deterministic orchestration duration limit was reached." }));
        continue;
      }
      const descriptor = this.#tools.descriptor(step.tool);
      const reason = descriptor.requiresAuthentication && !request.context.authorization
        ? "Server-authoritative authentication is required."
        : descriptor.requiresConsent && !effectiveConsent(request, step)
          ? "Effective purpose-scoped consent is required."
          : !authorizedSafetyTools.has(toolSafetyId(step.tool))
            ? "The deterministic safety policy denied this tool for the current request."
            : undefined;
      if (reason) {
        blocked.push(Object.freeze({ tool: step.tool, reason }));
        this.#events.emit({ name: "teo_guide_tool_blocked", occurredAt: this.#now(), result: "blocked", topic: step.tool });
        continue;
      }
      try {
        const toolStarted = this.#monotonicNow();
        const toolOutput = await executeWithTimeout(this.#tools, invocation(step, boundedRequest, outputs), boundedRequest.context, descriptor.timeoutMs);
        outputs.push(toolOutput);
        this.#events.emit({ name: "teo_guide_tool_allowed", occurredAt: this.#now(), result: "allowed", topic: step.tool });
        if (toolOutput.status === "fallback") this.#events.emit({ name: "teo_guide_tool_partial_result", occurredAt: this.#now(), result: "partial", topic: step.tool, latencyMs: Math.max(0, this.#monotonicNow() - toolStarted), tokenCount: 0 });
      } catch (error) {
        const timedOut = error instanceof Error && /timeout/i.test(error.message);
        blocked.push(Object.freeze({ tool: step.tool, reason: timedOut ? "The deterministic tool timeout was reached." : "The deterministic tool returned a controlled failure." }));
        this.#events.emit({ name: timedOut ? "teo_guide_tool_timeout" : "teo_guide_tool_blocked", occurredAt: this.#now(), result: timedOut ? "timeout" : "failed", topic: step.tool, tokenCount: 0 });
      }
    }

    const safetyScripture = safety.response.scripture;
    if (!safetyScripture) throw new Error("The deterministic safety response did not include an exact Scripture source.");
    const safetySource: TeoGuideSourceReference = Object.freeze({
      id: `source-${digest(safetyScripture.citation.sourceId).slice(0, 18)}`,
      kind: "scripture",
      label: `${safetyScripture.citation.canonicalLabel} (WEB)`,
      authority: "Scripture",
      path: safetyScripture.citation.sourceId,
      version: safetyScripture.citation.corpusVersion,
      scriptureReference: safetyScripture.citation.canonicalLabel
    });
    const sources = uniqueSources(outputs, safetySource);
    const legacy = createDeterministicTeoGuideMessage(boundedInput);
    const scriptureOutput = outputFor(outputs, "searchScripture");
    const contextOutput = outputFor(outputs, "getScriptureContext");
    const promiseOutput = outputFor(outputs, "getPromiseCluster") || outputFor(outputs, "searchPromises");
    const callingOutput = outputFor(outputs, "getCallingEvidence");
    const prayerOutput = outputFor(outputs, "buildPrayerOptions");
    const journeyOutput = outputFor(outputs, "proposeJourneyAction") || outputFor(outputs, "getCurrentJourney");
    const reflectionOutput = outputFor(outputs, "summarizeReflectionPattern") || outputFor(outputs, "searchApprovedUserMemory");
    const journalOutput = outputFor(outputs, "createJournalDraft");
    const testimonyOutput = outputFor(outputs, "createTestimonyDraft");
    const mentorOutput = outputFor(outputs, "createMentorDiscussionPrompt");
    const sensitive = safety.preRetrieval.assessment.sensitive;
    const orderedGuidance = Object.freeze(safety.response.sections.map((item) => item.text));
    const exactScriptureText = field(scriptureOutput, "text") || safetyScripture.text;
    const exactScriptureReference = field(scriptureOutput, "reference") || safetyScripture.citation.canonicalLabel;
    const scriptureSections = sensitive
      ? [section("Scripture", `${safetyScripture.citation.canonicalLabel} · WEB: ${safetyScripture.text}`, [safetySource.id])]
      : [section("Scripture", `${exactScriptureReference} · WEB: ${exactScriptureText}`, outputSources(scriptureOutput).length ? outputSources(scriptureOutput) : [safetySource.id])];
    const limitations = Object.freeze([...new Set([
      legacy.limitation,
      ...plan.limitations,
      ...outputs.flatMap((item) => item.limitations),
      ...blocked.map((item) => item.reason),
      ...(inputLimitReached ? ["Input was truncated at the safe character limit."] : []),
      ...(durationLimitReached ? ["The orchestration duration limit produced a typed fallback."] : [])
    ])]);
    const candidate: TeoGuideResponse = Object.freeze({
      id: `teo-guide-${digest(`${plan.normalizedInput}|${request.context.conversationId}|${TEO_GUIDE_ORCHESTRATION_VERSION}`).slice(0, 24)}`,
      conversationId: request.context.conversationId,
      intent: plan.intent,
      acknowledgement: sensitive ? (safety.response.sections.find((item) => item.id === "acknowledgement")?.text || orderedGuidance[0] || "Your safety and dignity matter.") : legacy.text,
      scripture: Object.freeze(scriptureSections),
      context: Object.freeze(contextOutput ? [section("Textual context", contextOutput.summary, outputSources(contextOutput))] : []),
      teoyubeInterpretation: Object.freeze([section("Teoyube interpretation", sensitive ? (safety.response.interpretation?.text || "This is a cautious interpretation, not certainty.") : legacy.interpretation, [sources[0].id])]),
      promiseConnections: Object.freeze(promiseOutput ? [section("Promise connection", promiseOutput.summary, outputSources(promiseOutput))] : []),
      callingEvidence: Object.freeze(callingOutput ? [section("Calling evidence", callingOutput.summary, outputSources(callingOutput))] : []),
      prayer: Object.freeze(prayerOutput ? [section("Prayer draft", field(prayerOutput, "text") || prayerOutput.summary, outputSources(prayerOutput))] : []),
      practicalActions: Object.freeze([section("Suggested action", sensitive ? (safety.response.suggestedApplication?.text || "Choose one safe, realistic next step with appropriate support.") : journeyOutput?.summary || legacy.suggestedApplication, journeyOutput ? outputSources(journeyOutput) : [sources[0].id])]),
      reflectionPrompts: Object.freeze(reflectionOutput || journalOutput ? [section("Reflection", journalOutput ? field(journalOutput, "draft") || journalOutput.summary : reflectionOutput?.summary || "", outputSources(journalOutput || reflectionOutput))] : []),
      testimonyAndBook: Object.freeze(testimonyOutput ? [section("Testimony candidate", field(testimonyOutput, "draft") || testimonyOutput.summary, outputSources(testimonyOutput))] : []),
      mentorCommunity: Object.freeze(mentorOutput ? [section("Mentor or community discussion", field(mentorOutput, "prompt") || mentorOutput.summary, outputSources(mentorOutput))] : []),
      ...(plan.intent === "unknown_or_ambiguous" ? { followUp: Object.freeze({ question: "Would you like to begin with Scripture, prayer, a Promise Cluster, or your current journey?", reason: "One focused choice materially changes the smallest safe tool plan.", maximumQuestions: 1 as const, sensitiveDetailsRequired: false as const }) } : {}),
      whyThis: Object.freeze([`Intent: ${plan.intent}.`, ...plan.steps.map((step) => `${step.tool}: ${step.reason}`), `Safety policy: ${SAFETY_POLICY_VERSION}.`]),
      confidence: Object.freeze({ label: outputs.some((item) => item.status === "fallback") || blocked.length ? "safe_fallback" : scriptureOutput ? "exact_scripture" : "strong_deterministic_match", score: outputs.some((item) => item.status === "fallback") || blocked.length ? 0.5 : 1, rationale: "The response uses fixed local rules, exact WEB Scripture, source paths, and deterministic safety policy." }),
      limitations,
      sources,
      actionProposals: proposalList(outputs),
      safety: Object.freeze({
        mode: safety.preRetrieval.assessment.immediateDanger ? "critical" : sensitive ? "sensitive" : "ordinary",
        topic: safety.preRetrieval.assessment.primaryTopic,
        orderedGuidance,
        emergencyResourcesFirst: safety.preRetrieval.assessment.immediateDanger,
        promptInjectionBlocked: safety.injectionBlocked,
        prohibitedClaimsBlocked: Object.freeze(safety.responseValidation.prohibitedClaims.map((finding) => finding.type)),
        postValidationPassed: false
      }),
      versions: Object.freeze({ orchestrator: TEO_GUIDE_ORCHESTRATION_VERSION, responseContract: TEO_GUIDE_RESPONSE_CONTRACT_VERSION, planner: TEO_GUIDE_PLANNER_VERSION, tools: TEO_GUIDE_TOOL_REGISTRY_VERSION, scriptureCorpus: safetyScripture.citation.corpusVersion, tigDataset: TIG_DATASET_VERSION, tigRuleset: TIG_RULESET_VERSION, safetyPolicy: SAFETY_POLICY_VERSION }),
      deterministic: true,
      externalModelUsed: false,
      durableWritePerformed: false
    });
    const validation = validateSafetyResponse({
      text: [candidate.acknowledgement, ...candidate.scripture.map((item) => item.body), ...candidate.context.map((item) => item.body), ...candidate.teoyubeInterpretation.map((item) => item.body), ...candidate.promiseConnections.map((item) => item.body), ...candidate.callingEvidence.map((item) => item.body), ...candidate.prayer.map((item) => item.body), ...candidate.practicalActions.map((item) => item.body), ...candidate.reflectionPrompts.map((item) => item.body), ...candidate.testimonyAndBook.map((item) => item.body), ...candidate.mentorCommunity.map((item) => item.body), ...candidate.limitations].join("\n"),
      assessment: safety.preRetrieval.assessment,
      citationValid: true,
      citationExactTextMatch: true,
      resourceSafeToDisplay: safety.response.resource?.safeToDisplay !== false
    });
    const response = Object.freeze({ ...candidate, safety: Object.freeze({ ...candidate.safety, postValidationPassed: validation.valid }) });
    if (!validation.valid) throw new Error("The deterministic Teo Guide response failed post-composition safety validation.");
    const durationMs = Math.max(0, this.#monotonicNow() - started);
    this.#events.emit({ name: "teo_guide_response_validated", occurredAt: this.#now(), result: "complete", count: response.sources.length });
    if (response.actionProposals.length) this.#events.emit({ name: "teo_guide_action_proposed", occurredAt: this.#now(), result: "allowed", count: response.actionProposals.length });
    if (outputs.some((item) => item.status === "fallback") || blocked.length || inputLimitReached || durationLimitReached) this.#events.emit({ name: "teo_guide_fallback_used", occurredAt: this.#now(), result: "fallback", count: 1 });
    this.#conversations.record(boundedInput, response, occurredAt, request.context.authorization?.user.id);
    return Object.freeze({ response, plan, executedTools: Object.freeze(outputs.map((item) => item.tool)), blockedTools: Object.freeze(blocked), durationMs, fallbackUsed: outputs.some((item) => item.status === "fallback") || blocked.length > 0 || inputLimitReached || durationLimitReached });
  }
}

export const deterministicTeoGuideOrchestrator = new DeterministicTeoGuideOrchestrator();

export async function verifyTeoGuideScriptureSources(response: TeoGuideResponse): Promise<boolean> {
  for (const source of response.sources.filter((item) => item.kind === "scripture" || item.kind === "scripture_context")) {
    if (!source.scriptureReference) return false;
    const parsed = canonicalScriptureRepository.parseReferences(source.scriptureReference).find((candidate) => candidate.valid);
    if (!parsed?.valid) return false;
    const passage = await canonicalScriptureRepository.getByReference(parsed.reference);
    if (!passage) return false;
  }
  return response.sources.length > 0;
}
