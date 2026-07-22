import type { PrivacySafeEvent, PrivacySafeEventSink } from "../observability/privacy-safe-events";
import { nullPrivacySafeEventSink } from "../observability/privacy-safe-events";
import {
  authorizeMemoryAccess,
  authorizeToolPlan,
  decidePreRetrieval,
  validateSafetyResponse
} from "../../domain/safety/safety-engine";
import { detectPromptInjection } from "../../domain/safety/prompt-injection";
import { SAFETY_LIMITS } from "../../domain/safety/safety-policy";
import type {
  CrisisResourceRequest,
  MemoryAccessDecision,
  PreRetrievalDecision,
  ResponseValidationResult,
  SafeResponse,
  SafetyMemoryAccessRequest,
  SafetyPipelineStage,
  SafetyToolRequest,
  ToolPlanDecision
} from "../../domain/safety/safety-contracts";
import { SAFETY_POLICY_VERSION } from "../../domain/safety/safety-contracts";
import type { ScriptureRepository } from "../../domain/scripture/scripture-repository";
import { canonicalScriptureRepository } from "../scripture/canonical-scripture-repository";
import type { CrisisResourceProvider } from "./crisis-resource-provider";
import { crisisResourceProvider } from "./crisis-resource-provider";
import { composeSafeResponse } from "./safe-response-composer";

export type SafetyOrchestrationInput = Readonly<{
  syntheticOrUserInput: string;
  untrustedData?: readonly string[];
  toolRequests?: readonly SafetyToolRequest[];
  memoryRequest?: SafetyMemoryAccessRequest;
  crisisResourceRequest?: CrisisResourceRequest;
}>;

export type SafetyOrchestrationResult = Readonly<{
  preRetrieval: PreRetrievalDecision;
  toolPlan: ToolPlanDecision;
  memoryAccess?: MemoryAccessDecision;
  response: SafeResponse;
  responseValidation: ResponseValidationResult;
  injectionBlocked: boolean;
  completedStages: readonly SafetyPipelineStage[];
  preWriteAuthorizationRequired: true;
}>;

export type SafetyOrchestratorOptions = Readonly<{
  scriptureRepository?: ScriptureRepository;
  resources?: CrisisResourceProvider;
  events?: PrivacySafeEventSink;
  now?: () => string;
}>;

export class DeterministicSafetyOrchestrator {
  private readonly scripture: ScriptureRepository;
  private readonly resources: CrisisResourceProvider;
  private readonly events: PrivacySafeEventSink;
  private readonly now: () => string;
  private emittedEvents = 0;

  constructor(options: SafetyOrchestratorOptions = {}) {
    this.scripture = options.scriptureRepository || canonicalScriptureRepository;
    this.resources = options.resources || crisisResourceProvider;
    this.events = options.events || nullPrivacySafeEventSink;
    this.now = options.now || (() => new Date().toISOString());
  }

  private emit(event: PrivacySafeEvent): void {
    if (this.emittedEvents >= SAFETY_LIMITS.telemetryQueue) return;
    this.emittedEvents += 1;
    this.events.emit(event);
  }

  async run(input: SafetyOrchestrationInput): Promise<SafetyOrchestrationResult> {
    const untrustedData = input.untrustedData || Object.freeze([]);
    const preRetrieval = decidePreRetrieval(input.syntheticOrUserInput, untrustedData);
    this.emit({ name: "safety_topic_detected", occurredAt: this.now(), topic: preRetrieval.assessment.primaryTopic, policyVersion: SAFETY_POLICY_VERSION, result: "allowed" });
    this.emit({ name: "safety_mode_selected", occurredAt: this.now(), mode: preRetrieval.assessment.responseMode, policyVersion: SAFETY_POLICY_VERSION, result: "allowed" });
    const injection = detectPromptInjection(input.syntheticOrUserInput, ...untrustedData);
    if (injection.length > 0) this.emit({ name: "safety_injection_blocked", occurredAt: this.now(), policyVersion: SAFETY_POLICY_VERSION, result: "blocked", count: injection.length });

    const toolPlan = authorizeToolPlan(preRetrieval.assessment, input.toolRequests || Object.freeze([]), untrustedData);
    if (toolPlan.deniedTools.length > 0) this.emit({ name: "safety_tool_denied", occurredAt: this.now(), policyVersion: SAFETY_POLICY_VERSION, result: "denied", count: toolPlan.deniedTools.length });
    const memoryAccess = input.memoryRequest ? authorizeMemoryAccess(input.memoryRequest) : undefined;
    if (memoryAccess && !memoryAccess.allowed) this.emit({ name: "safety_memory_denied", occurredAt: this.now(), policyVersion: SAFETY_POLICY_VERSION, result: "denied", count: 1 });

    const resource = preRetrieval.assessment.immediateDanger
      ? await this.resources.resolve(input.crisisResourceRequest || Object.freeze({ language: "en", immediateDanger: true, preciseLocationProvidedByUser: false }))
      : undefined;
    if (resource?.verificationStatus === "NO_LOCAL_RESOURCE_GENERIC_EMERGENCY_FALLBACK") this.emit({ name: "safety_fallback_used", occurredAt: this.now(), policyVersion: SAFETY_POLICY_VERSION, result: "fallback", count: 1 });
    const response = await composeSafeResponse(preRetrieval.assessment, { repository: this.scripture, resource });
    const citationValidation = response.scripture
      ? await this.scripture.validateCitation(response.scripture.citation, response.scripture.text)
      : Object.freeze({ valid: true, exactTextMatch: true, errors: Object.freeze([]) });
    const responseValidation = validateSafetyResponse({
      text: response.sections.map((section) => section.text).join("\n"),
      assessment: preRetrieval.assessment,
      citationValid: citationValidation.valid,
      citationExactTextMatch: citationValidation.exactTextMatch !== false,
      resourceSafeToDisplay: resource?.safeToDisplay !== false
    });
    if (!responseValidation.citationValid) this.emit({ name: "safety_citation_failure", occurredAt: this.now(), policyVersion: SAFETY_POLICY_VERSION, result: "failed", count: 1 });
    if (responseValidation.prohibitedClaims.length > 0) this.emit({ name: "safety_prohibited_claim_blocked", occurredAt: this.now(), policyVersion: SAFETY_POLICY_VERSION, result: "blocked", count: responseValidation.prohibitedClaims.length });
    if (!responseValidation.valid) this.emit({ name: "safety_gate_failed", occurredAt: this.now(), policyVersion: SAFETY_POLICY_VERSION, result: "failed", count: responseValidation.blockers.length });
    return Object.freeze({
      preRetrieval,
      toolPlan,
      ...(memoryAccess ? { memoryAccess } : {}),
      response,
      responseValidation,
      injectionBlocked: injection.length > 0,
      completedStages: Object.freeze(["pre_retrieval" as const, "pre_tool" as const, "post_composition" as const]),
      preWriteAuthorizationRequired: true
    });
  }
}

export const deterministicSafetyOrchestrator = new DeterministicSafetyOrchestrator();
