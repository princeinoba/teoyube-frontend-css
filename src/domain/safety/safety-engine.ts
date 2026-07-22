import {
  SAFETY_POLICY_VERSION,
  SAFETY_TAXONOMY_VERSION,
  type MemoryAccessDecision,
  type PreRetrievalDecision,
  type PreWriteAuthorization,
  type PreWriteRequest,
  type ResponseValidationResult,
  type SafetyAssessment,
  type SafetyInputSummary,
  type SafetyMemoryAccessRequest,
  type SafetyResponseMode,
  type SafetyResponsePlan,
  type SafetySeverity,
  type SafetyToolRequest,
  type SensitiveTopic,
  type ToolPlanDecision
} from "./safety-contracts";
import { detectProhibitedClaims } from "./prohibited-claims";
import { detectPromptInjection } from "./prompt-injection";
import { orderedSectionsFor, SAFETY_LIMITS, SENSITIVE_TOPIC_POLICIES } from "./safety-policy";

const SEVERITY_ORDER: Readonly<Record<SafetySeverity, number>> = Object.freeze({ ordinary: 0, low: 1, moderate: 2, high: 3, critical: 4 });
const ALLOWED_MEMORY_PURPOSES = Object.freeze(["preference_continuity", "journey_continuity", "sensitive_spiritual_storage", "testimony_book_continuity"]);
const FORBIDDEN_PROFILE_FIELDS = /(?:diagnosis|mental.?health.?profile|crisis.?profile|divine.?conclusion|calling.?is.?fact|promise.?fulfilled|god.?action)/i;

function stableFingerprint(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function summarizeInput(value: string): SafetyInputSummary {
  const normalized = value.trim().replace(/\s+/g, " ");
  return Object.freeze({
    characterCount: value.length,
    normalizedCharacterCount: normalized.length,
    contentFingerprint: stableFingerprint(normalized),
    rawContentRetained: false,
    privateContentLogged: false
  });
}

function highestSeverity(topics: readonly SensitiveTopic[]): SafetySeverity {
  return topics
    .map((topic) => SENSITIVE_TOPIC_POLICIES[topic].defaultSeverity)
    .sort((left, right) => SEVERITY_ORDER[right] - SEVERITY_ORDER[left])[0] || "ordinary";
}

function primaryTopicFor(topics: readonly SensitiveTopic[], severity: SafetySeverity): SensitiveTopic {
  return topics.find((topic) => SENSITIVE_TOPIC_POLICIES[topic].defaultSeverity === severity)
    || topics[0]
    || "ordinary_spiritual_question";
}

function modeFor(primaryTopic: SensitiveTopic, severity: SafetySeverity, prohibitedRequest: boolean): SafetyResponseMode {
  if (prohibitedRequest) return "prohibited_request_refusal";
  if (severity === "critical") return "immediate_safety_guidance";
  return SENSITIVE_TOPIC_POLICIES[primaryTopic].responseMode;
}

export function assessSafety(value: string): SafetyAssessment {
  const input = summarizeInput(value);
  const bounded = value.slice(0, SAFETY_LIMITS.inputCharacters);
  const inputLimitReached = value.length > SAFETY_LIMITS.inputCharacters;
  const matches = (Object.keys(SENSITIVE_TOPIC_POLICIES) as SensitiveTopic[])
    .filter((topic) => topic !== "ordinary_spiritual_question")
    .filter((topic) => SENSITIVE_TOPIC_POLICIES[topic].patterns.some((pattern) => pattern.test(bounded)));
  const deduplicated = [...new Set(matches)];
  const detected = deduplicated.length === 0
    ? ["ordinary_spiritual_question" as const]
    : deduplicated.length > SAFETY_LIMITS.detectedTopics
      ? [...deduplicated.slice(0, SAFETY_LIMITS.detectedTopics - 1), "unknown_or_multi_topic_sensitive_content" as const]
      : deduplicated;
  const immediateDangerSignal = /\b(?:overdosing now|overdose now|weapon in hand|cannot stay safe|about to (?:jump|shoot|harm|kill)|(?:voice|god)[^.!?]{0,50}commands? me to (?:jump|harm|kill))\b/i.test(bounded);
  const severity = inputLimitReached ? "high" : immediateDangerSignal ? "critical" : highestSeverity(detected);
  const claimFindings = detectProhibitedClaims(bounded);
  const prohibitedRequest = claimFindings.length > 0 && /\b(?:write|say|tell|declare|claim|confirm|assure|compose|respond with)\b/i.test(bounded);
  const primaryTopic = inputLimitReached
    ? "unknown_or_multi_topic_sensitive_content"
    : primaryTopicFor(detected, severity);
  const immediateDanger = severity === "critical";
  const responseMode = modeFor(primaryTopic, severity, prohibitedRequest);
  const signals = detected.map((topic) => `topic:${topic}`);
  if (immediateDanger) signals.push("immediate_danger");
  if (prohibitedRequest) signals.push("prohibited_request");
  if (inputLimitReached) signals.push("input_limit_reached");
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    taxonomyVersion: SAFETY_TAXONOMY_VERSION,
    topics: Object.freeze(detected),
    primaryTopic,
    severity,
    responseMode,
    immediateDanger,
    sensitive: primaryTopic !== "ordinary_spiritual_question",
    prohibitedRequest,
    inputLimitReached,
    signals: Object.freeze(signals),
    input,
    limitations: Object.freeze([
      "This deterministic classification supports routing and does not diagnose a person or verify a spiritual claim.",
      ...(inputLimitReached ? ["The input exceeded the safety processing limit, so a typed cautious fallback is required."] : [])
    ])
  });
}

export function createResponsePlan(assessment: SafetyAssessment): SafetyResponsePlan {
  const topicPolicy = SENSITIVE_TOPIC_POLICIES[assessment.primaryTopic];
  const scripturePolicy = assessment.responseMode === "prohibited_request_refusal"
    ? "no_scripture_required_for_refusal" as const
    : assessment.immediateDanger
      ? "exact_web_after_immediate_safety" as const
      : topicPolicy.scripturePolicy;
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    mode: assessment.responseMode,
    orderedSections: orderedSectionsFor(assessment.responseMode),
    requiredElements: topicPolicy.requiredElements,
    prohibitedElements: topicPolicy.prohibitedElements,
    scripturePolicy,
    memoryPolicy: topicPolicy.memoryPolicy,
    stateChangingToolsBlocked: assessment.sensitive,
    deterministicFallbackRequired: true
  });
}

export function decidePreRetrieval(value: string, untrustedData: readonly string[] = []): PreRetrievalDecision {
  const assessment = assessSafety(value);
  const responsePlan = createResponsePlan(assessment);
  const injection = detectPromptInjection(value, ...untrustedData);
  const authorizedRetrieval: Array<"scripture" | "tig" | "crisis_resource" | "structured_memory"> = ["scripture"];
  if (!assessment.immediateDanger && !assessment.prohibitedRequest && !assessment.inputLimitReached) authorizedRetrieval.push("tig");
  if (assessment.immediateDanger || assessment.severity === "high") authorizedRetrieval.push("crisis_resource");
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    allowed: true,
    assessment,
    responsePlan,
    scripturePolicy: responsePlan.scripturePolicy,
    memoryPolicy: responsePlan.memoryPolicy,
    authorizedRetrieval: Object.freeze(authorizedRetrieval),
    untrustedInstructionsIgnored: true,
    minimizedInput: assessment.input,
    fallbackReason: assessment.inputLimitReached
      ? "Input size limit reached; use the cautious deterministic fallback."
      : injection.length > 0
        ? "Untrusted instructions were blocked and cannot change retrieval or authorization."
        : undefined
  });
}

export function authorizeMemoryAccess(request: SafetyMemoryAccessRequest): MemoryAccessDecision {
  const purposeAuthorized = Boolean(request.purposeId && ALLOWED_MEMORY_PURPOSES.includes(request.purposeId));
  const minimumNecessaryOnly = request.requestedFields.every((field) => request.minimumNecessaryFields.includes(field))
    && request.requestedFields.every((field) => !FORBIDDEN_PROFILE_FIELDS.test(field));
  const common = request.authenticated
    && request.sameUser
    && request.effectiveConsent
    && purposeAuthorized
    && minimumNecessaryOnly
    && request.recordAvailable !== false;
  const writeAllowed = request.operation === "write"
    && common
    && request.explicitUserConfirmation
    && !request.crisisDisclosure;
  const readAllowed = request.operation === "read" && common;
  const allowed = readAllowed || writeAllowed;
  const reason = !request.authenticated
    ? "An authenticated server-authoritative session is required."
    : !request.sameUser
      ? "Cross-user memory access is denied."
      : !purposeAuthorized
        ? "The requested memory purpose is not authorized."
        : !request.effectiveConsent
          ? "Effective purpose-scoped consent is required."
          : !minimumNecessaryOnly
            ? "Only the minimum necessary structured fields may be accessed."
            : request.recordAvailable === false
              ? "Revoked, deleted, expired, or unavailable memory cannot be accessed."
              : request.operation === "write" && request.crisisDisclosure
                ? "A crisis disclosure cannot become a permanent crisis or mental-health profile."
                : request.operation === "write" && !request.explicitUserConfirmation
                  ? "A durable write requires explicit user confirmation."
                  : "Authorized minimum-necessary memory access.";
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    allowed,
    operation: request.operation,
    purposeAuthorized,
    minimumNecessaryOnly,
    crisisProfileCreated: false,
    rawSensitiveTelemetry: false,
    reason
  });
}

export function authorizeToolPlan(
  assessment: SafetyAssessment,
  requests: readonly SafetyToolRequest[],
  untrustedData: readonly string[] = []
): ToolPlanDecision {
  const bounded = requests.slice(0, SAFETY_LIMITS.toolRequests);
  const limitReached = requests.length > SAFETY_LIMITS.toolRequests;
  const injection = detectPromptInjection(...untrustedData);
  const authorized: SafetyToolRequest["id"][] = [];
  const denied: Array<Readonly<{ id: SafetyToolRequest["id"]; reason: string }>> = [];
  for (const request of bounded) {
    if (request.kind === "state_changing") {
      denied.push(Object.freeze({ id: request.id, reason: "State-changing tools are blocked during composition; a separate explicit pre-write action is required." }));
      continue;
    }
    if (request.id === "memory.read") {
      const memory = authorizeMemoryAccess({
        operation: "read",
        authenticated: request.authenticated === true,
        sameUser: request.sameUser === true,
        purposeId: request.purposeId,
        effectiveConsent: request.effectiveConsent === true,
        explicitUserConfirmation: false,
        crisisDisclosure: assessment.immediateDanger,
        requestedFields: Object.freeze(["structured_summary"]),
        minimumNecessaryFields: Object.freeze(["structured_summary"])
      });
      if (!memory.allowed) {
        denied.push(Object.freeze({ id: request.id, reason: memory.reason }));
        continue;
      }
    }
    if (assessment.immediateDanger && request.id !== "scripture.read" && request.id !== "crisis_resource.read") {
      denied.push(Object.freeze({ id: request.id, reason: "Immediate-safety composition permits only Scripture and crisis-resource reads." }));
      continue;
    }
    authorized.push(request.id);
  }
  if (injection.length > 0) {
    for (const request of bounded.filter((item) => item.id !== "scripture.read" && item.id !== "crisis_resource.read")) {
      const index = authorized.indexOf(request.id);
      if (index >= 0) authorized.splice(index, 1);
      if (!denied.some((item) => item.id === request.id)) denied.push(Object.freeze({ id: request.id, reason: "Untrusted instructions cannot expand tool permissions." }));
    }
  }
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    allowed: denied.length === 0 && !limitReached,
    authorizedTools: Object.freeze([...new Set(authorized)]),
    deniedTools: Object.freeze(denied),
    untrustedDataMayChangePermissions: false,
    stateChangingToolsBlocked: bounded.some((request) => request.kind === "state_changing"),
    limitReached,
    timeoutMs: SAFETY_LIMITS.evaluationTimeoutMs
  });
}

export type ResponseValidationInput = Readonly<{
  text: string;
  assessment: SafetyAssessment;
  citationValid: boolean;
  citationExactTextMatch: boolean;
  resourceSafeToDisplay: boolean;
  untrustedData?: readonly string[];
}>;

export function validateSafetyResponse(input: ResponseValidationInput): ResponseValidationResult {
  const responseLimitReached = input.text.length > SAFETY_LIMITS.responseValidationCharacters;
  const text = input.text.slice(0, SAFETY_LIMITS.responseValidationCharacters);
  const prohibitedClaims = detectProhibitedClaims(text);
  const injectionFindings = detectPromptInjection(text, ...(input.untrustedData || []));
  const types = new Set(prohibitedClaims.map((finding) => finding.type));
  const divineCertainty = types.has("divine_authority") || types.has("final_calling_or_destiny") || types.has("guaranteed_outcome");
  const coercion = types.has("coercion_or_fabricated_urgency") || types.has("abuse_submission");
  const victimBlame = types.has("weak_faith_or_spiritual_blame") || types.has("demonic_or_sin_causation");
  const careReplacement = types.has("care_replacement");
  const unsafeResourceClaim = !input.resourceSafeToDisplay || /\b(?:verified|available 24\/7)\b/i.test(text) && /\b(?:000-000|example\.com)\b/i.test(text);
  const unauthorizedMemoryAction = /\b(?:i (?:saved|stored|persisted)|memory was written)\b/i.test(text);
  const unauthorizedToolAction = /\b(?:i (?:published your testimony|marked the promise fulfilled|advanced your journey|declared your calling))\b/i.test(text);
  const missingUncertainty = !input.assessment.immediateDanger
    && !/\b(?:may|might|could|appears|possible|interpretation|uncertain|limitation|not certainty)\b/i.test(text);
  const missingEscalation = SEVERITY_ORDER[input.assessment.severity] >= SEVERITY_ORDER.high
    && !/\b(?:emergency|professional|doctor|clinician|counsel|trusted person|independent support|qualified)\b/i.test(text);
  const unsafeFollowUpQuestion = /\b(?:tell me every detail|prove it by describing|give me all identifying details)\b/i.test(text);
  const blockers = [
    prohibitedClaims.length > 0 ? "The response contains a prohibited theological or coercive claim." : undefined,
    !input.citationValid || !input.citationExactTextMatch ? "A Scripture citation or quotation failed exact WEB validation." : undefined,
    injectionFindings.length > 0 ? "Prompt-injection content appeared in the response or attempted to change policy." : undefined,
    unsafeResourceClaim ? "A crisis-resource statement is unsafe or unverified." : undefined,
    unauthorizedMemoryAction ? "The response claims an unauthorized memory action." : undefined,
    unauthorizedToolAction ? "The response claims an unauthorized state-changing action." : undefined,
    missingUncertainty ? "The response lacks the required uncertainty or interpretation boundary." : undefined,
    missingEscalation ? "The response lacks required human or professional escalation." : undefined,
    unsafeFollowUpQuestion ? "The response requests unnecessary sensitive detail." : undefined,
    responseLimitReached ? "The response exceeded the validation size limit." : undefined
  ].filter((entry): entry is string => Boolean(entry));
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    valid: blockers.length === 0,
    prohibitedClaims,
    injectionFindings,
    citationValid: input.citationValid,
    citationExactTextMatch: input.citationExactTextMatch,
    divineCertainty,
    coercion,
    victimBlame,
    careReplacement,
    unsafeResourceClaim,
    unauthorizedMemoryAction,
    unauthorizedToolAction,
    missingUncertainty,
    missingEscalation,
    unsafeFollowUpQuestion,
    responseLimitReached,
    blockers: Object.freeze(blockers)
  });
}

export function authorizePreWrite(request: PreWriteRequest): PreWriteAuthorization {
  const spiritualFactAction = request.action === "calling.declare";
  const consentRequired = request.action === "memory.write";
  const allowed = request.authenticated
    && request.authorized
    && request.sameUser
    && request.explicitUserConfirmation
    && request.sourceValidationPassed
    && request.purposeMatches
    && (!consentRequired || request.effectiveConsent)
    && !spiritualFactAction;
  const reason = spiritualFactAction
    ? "A system may preserve discernment evidence but cannot declare calling as fact."
    : !request.explicitUserConfirmation
      ? "The user must explicitly confirm this reversible write."
      : consentRequired && !request.effectiveConsent
        ? "An effective purpose-scoped consent grant is required."
        : !request.authenticated || !request.authorized || !request.sameUser
          ? "Server-authoritative identity and authorization checks failed."
          : !request.purposeMatches || !request.sourceValidationPassed
            ? "Purpose or source validation failed."
            : "The explicit user-confirmed reversible action is authorized.";
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    allowed,
    action: request.action,
    userConfirmed: request.explicitUserConfirmation,
    noAutomaticSpiritualConclusion: !spiritualFactAction && request.explicitUserConfirmation,
    auditRequired: true,
    reversible: true,
    reason
  });
}
