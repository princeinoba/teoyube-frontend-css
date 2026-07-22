import type { ScriptureCitation } from "../scripture/scripture-repository";

export const SAFETY_POLICY_VERSION = "teoyube-safety-policy-1.0.0" as const;
export const SAFETY_TAXONOMY_VERSION = "teoyube-sensitive-topic-taxonomy-1.0.0" as const;
export const SAFETY_DATASET_VERSION = "teoyube-synthetic-safety-dataset-1.0.0" as const;
export const SAFETY_EVALUATOR_VERSION = "teoyube-deterministic-safety-evaluator-1.0.0" as const;

export const SAFETY_PIPELINE_STAGES = Object.freeze([
  "pre_retrieval",
  "pre_tool",
  "post_composition",
  "pre_write"
] as const);
export type SafetyPipelineStage = typeof SAFETY_PIPELINE_STAGES[number];

export type SafetyPolicyVersion = typeof SAFETY_POLICY_VERSION;
export type SafetyEvaluationVersion = typeof SAFETY_EVALUATOR_VERSION;

export type SensitiveTopic =
  | "ordinary_spiritual_question"
  | "doubt"
  | "grief"
  | "trauma"
  | "abuse"
  | "self_harm_or_immediate_danger"
  | "psychosis_paranoia_or_divine_commands"
  | "spiritual_coercion"
  | "relationship_crisis"
  | "medical_concern"
  | "financial_desperation"
  | "legal_concern"
  | "prophecy_or_divine_messages"
  | "demonic_interpretation"
  | "scrupulosity_or_compulsive_religious_fear"
  | "sexual_or_domestic_violence"
  | "substance_or_behavioral_crisis"
  | "unknown_or_multi_topic_sensitive_content";

export type SafetySeverity = "ordinary" | "low" | "moderate" | "high" | "critical";

export type SafetyResponseMode =
  | "ordinary_guidance"
  | "sensitive_support"
  | "professional_support_guidance"
  | "immediate_safety_guidance"
  | "prohibited_request_refusal"
  | "resource_unavailable_fallback";

export type TheologicalClaimType =
  | "divine_authority"
  | "final_calling_or_destiny"
  | "guaranteed_outcome"
  | "weak_faith_or_spiritual_blame"
  | "demonic_or_sin_causation"
  | "care_replacement"
  | "abuse_submission"
  | "coercion_or_fabricated_urgency"
  | "automatic_fulfillment"
  | "automatic_testimony"
  | "automatic_divine_attribution";

export type ScriptureSafetyPolicy =
  | "exact_web_required"
  | "exact_web_after_immediate_safety"
  | "reference_only_until_validated"
  | "no_scripture_required_for_refusal";

export type SafetyMemoryPolicy =
  | "no_memory_access"
  | "structured_read_with_effective_consent"
  | "session_only_no_crisis_profile"
  | "explicit_confirmation_and_effective_consent_required";

export type SafetyToolId =
  | "scripture.read"
  | "tig.recommend"
  | "crisis_resource.read"
  | "memory.read"
  | "memory.write"
  | "journey.advance"
  | "calling.declare"
  | "testimony.publish"
  | "promise.mark_fulfilled"
  | "book.promote";

export type SafetyToolKind = "read_only" | "state_changing";

export type SafetyToolRequest = Readonly<{
  id: SafetyToolId;
  kind: SafetyToolKind;
  purposeId?: string;
  userConfirmed?: boolean;
  authenticated?: boolean;
  effectiveConsent?: boolean;
  sameUser?: boolean;
}>;

export type SafetyInputSummary = Readonly<{
  characterCount: number;
  normalizedCharacterCount: number;
  contentFingerprint: string;
  rawContentRetained: false;
  privateContentLogged: false;
}>;

export type SafetyAssessment = Readonly<{
  policyVersion: SafetyPolicyVersion;
  taxonomyVersion: typeof SAFETY_TAXONOMY_VERSION;
  topics: readonly SensitiveTopic[];
  primaryTopic: SensitiveTopic;
  severity: SafetySeverity;
  responseMode: SafetyResponseMode;
  immediateDanger: boolean;
  sensitive: boolean;
  prohibitedRequest: boolean;
  inputLimitReached: boolean;
  signals: readonly string[];
  input: SafetyInputSummary;
  limitations: readonly string[];
}>;

export type SafetyResponseSectionId =
  | "immediate_safety"
  | "acknowledgement"
  | "resource"
  | "scripture"
  | "text_context"
  | "interpretation"
  | "practical_next_step"
  | "community_or_professional_support"
  | "why_selected"
  | "limitations"
  | "refusal";

export type SafetyResponsePlan = Readonly<{
  policyVersion: SafetyPolicyVersion;
  mode: SafetyResponseMode;
  orderedSections: readonly SafetyResponseSectionId[];
  requiredElements: readonly string[];
  prohibitedElements: readonly string[];
  scripturePolicy: ScriptureSafetyPolicy;
  memoryPolicy: SafetyMemoryPolicy;
  stateChangingToolsBlocked: boolean;
  deterministicFallbackRequired: true;
}>;

export type PreRetrievalDecision = Readonly<{
  policyVersion: SafetyPolicyVersion;
  allowed: boolean;
  assessment: SafetyAssessment;
  responsePlan: SafetyResponsePlan;
  scripturePolicy: ScriptureSafetyPolicy;
  memoryPolicy: SafetyMemoryPolicy;
  authorizedRetrieval: readonly ("scripture" | "tig" | "crisis_resource" | "structured_memory")[];
  untrustedInstructionsIgnored: true;
  minimizedInput: SafetyInputSummary;
  fallbackReason?: string;
}>;

export type SafetyMemoryAccessRequest = Readonly<{
  operation: "read" | "write";
  authenticated: boolean;
  sameUser: boolean;
  purposeId?: string;
  effectiveConsent: boolean;
  explicitUserConfirmation: boolean;
  crisisDisclosure: boolean;
  requestedFields: readonly string[];
  minimumNecessaryFields: readonly string[];
  recordAvailable?: boolean;
}>;

export type MemoryAccessDecision = Readonly<{
  policyVersion: SafetyPolicyVersion;
  allowed: boolean;
  operation: "read" | "write";
  purposeAuthorized: boolean;
  minimumNecessaryOnly: boolean;
  crisisProfileCreated: false;
  rawSensitiveTelemetry: false;
  reason: string;
}>;

export type ToolPlanDecision = Readonly<{
  policyVersion: SafetyPolicyVersion;
  allowed: boolean;
  authorizedTools: readonly SafetyToolId[];
  deniedTools: readonly Readonly<{ id: SafetyToolId; reason: string }>[];
  untrustedDataMayChangePermissions: false;
  stateChangingToolsBlocked: boolean;
  limitReached: boolean;
  timeoutMs: number;
}>;

export type ProhibitedClaimFinding = Readonly<{
  type: TheologicalClaimType;
  registryRuleId: string;
  start: number;
  end: number;
  blocked: true;
  quotedDiscussion: false;
  negatedDiscussion: false;
}>;

export type PromptInjectionFinding = Readonly<{
  category:
    | "policy_override"
    | "consent_override"
    | "tool_expansion"
    | "secret_exfiltration"
    | "cross_user_access"
    | "scripture_fabrication"
    | "crisis_bypass"
    | "durable_write";
  blocked: true;
}>;

export type ResponseValidationResult = Readonly<{
  policyVersion: SafetyPolicyVersion;
  valid: boolean;
  prohibitedClaims: readonly ProhibitedClaimFinding[];
  injectionFindings: readonly PromptInjectionFinding[];
  citationValid: boolean;
  citationExactTextMatch: boolean;
  divineCertainty: boolean;
  coercion: boolean;
  victimBlame: boolean;
  careReplacement: boolean;
  unsafeResourceClaim: boolean;
  unauthorizedMemoryAction: boolean;
  unauthorizedToolAction: boolean;
  missingUncertainty: boolean;
  missingEscalation: boolean;
  unsafeFollowUpQuestion: boolean;
  responseLimitReached: boolean;
  blockers: readonly string[];
}>;

export type PreWriteRequest = Readonly<{
  action:
    | "memory.write"
    | "journey.advance"
    | "calling.declare"
    | "testimony.publish"
    | "promise.mark_fulfilled"
    | "book.promote";
  authenticated: boolean;
  authorized: boolean;
  effectiveConsent: boolean;
  purposeMatches: boolean;
  explicitUserConfirmation: boolean;
  sameUser: boolean;
  sourceValidationPassed: boolean;
}>;

export type PreWriteAuthorization = Readonly<{
  policyVersion: SafetyPolicyVersion;
  allowed: boolean;
  action: PreWriteRequest["action"];
  userConfirmed: boolean;
  noAutomaticSpiritualConclusion: boolean;
  auditRequired: true;
  reversible: true;
  reason: string;
}>;

export type CrisisResourceVerificationStatus =
  | "VERIFIED_CURRENT"
  | "OWNER_APPROVED_LOCAL_FIXTURE"
  | "UNVERIFIED_DO_NOT_DISPLAY"
  | "NO_LOCAL_RESOURCE_GENERIC_EMERGENCY_FALLBACK";

export type CrisisResourceRequest = Readonly<{
  countryOrRegion?: string;
  language: string;
  immediateDanger: boolean;
  preciseLocationProvidedByUser: false;
}>;

export type CrisisResourceResult = Readonly<{
  countryOrRegionScope: string;
  emergencyGuidance: string;
  verifiedService?: string;
  contactMode?: "phone" | "text" | "chat" | "web" | "local_emergency_services";
  contact?: string;
  source: string;
  lastVerifiedDate?: string;
  expiryOrReviewDate?: string;
  language: string;
  limitations: readonly string[];
  verificationStatus: CrisisResourceVerificationStatus;
  safeToDisplay: boolean;
  preciseLocationInferred: false;
  timedOut: boolean;
}>;

export type SafeResponse = Readonly<{
  policyVersion: SafetyPolicyVersion;
  mode: SafetyResponseMode;
  sections: readonly Readonly<{ id: SafetyResponseSectionId; text: string }>[];
  scripture?: Readonly<{
    citation: ScriptureCitation;
    text: string;
    classification: "Scripture";
  }>;
  interpretation?: Readonly<{ text: string; classification: "Teoyube interpretation" }>;
  suggestedApplication?: Readonly<{ text: string; classification: "Suggested action" }>;
  resource?: CrisisResourceResult;
  responsePlan: SafetyResponsePlan;
  deterministic: true;
  liveModelUsed: false;
  durableWritePerformed: false;
  rawSensitiveTelemetry: false;
}>;

export type SafetyEvaluationCategory =
  | "topic"
  | "immediate_danger"
  | "prohibited_claim"
  | "false_positive"
  | "prompt_injection"
  | "memory_and_tool"
  | "scripture"
  | "resource";

export type SafetyEvaluationCase = Readonly<{
  id: string;
  datasetVersion: typeof SAFETY_DATASET_VERSION;
  category: SafetyEvaluationCategory;
  topic: SensitiveTopic;
  severity: SafetySeverity;
  syntheticInput: string;
  syntheticContext?: readonly string[];
  expectedResponseMode: SafetyResponseMode;
  requiredElements: readonly string[];
  prohibitedElements: readonly string[];
  expectedToolPolicy: "read_only" | "deny_state_change" | "explicit_confirmation_required";
  expectedMemoryPolicy: SafetyMemoryPolicy;
  expectedCitationPolicy: ScriptureSafetyPolicy;
  rubricTags: readonly string[];
  expectedImmediateDanger?: boolean;
  expectedClaimTypes?: readonly TheologicalClaimType[];
  candidateResponseForValidation?: string;
  expectedCandidateResponseValid?: boolean;
  toolRequests?: readonly SafetyToolRequest[];
  memoryRequest?: SafetyMemoryAccessRequest;
  expectedMemoryAllowed?: boolean;
  expectedAuthorizedTools?: readonly SafetyToolId[];
  expectedDeniedTools?: readonly SafetyToolId[];
  resourceFixture?: CrisisResourceResult;
}>;

export type SafetyEvaluationDimension =
  | "topic_classification"
  | "severity"
  | "immediate_danger_routing"
  | "scripture_fidelity"
  | "citation_correctness"
  | "scripture_versus_interpretation"
  | "humility"
  | "uncertainty"
  | "divine_certainty_prohibition"
  | "coercion"
  | "victim_blame"
  | "calling_overreach"
  | "testimony_overreach"
  | "fulfillment_overreach"
  | "crisis_ordering"
  | "community_or_professional_support"
  | "care_replacement"
  | "prompt_injection"
  | "tool_authorization"
  | "memory_authorization"
  | "no_unauthorized_writes"
  | "resource_freshness"
  | "privacy_safe_logging"
  | "deterministic_fallback"
  | "false_positive_restraint"
  | "accessibility"
  | "visual_parity";

export type SafetyDimensionResult = Readonly<{
  dimension: SafetyEvaluationDimension;
  passed: boolean;
  evidence: string;
}>;

export type SafetyEvaluationCaseResult = Readonly<{
  id: string;
  passed: boolean;
  assessment: SafetyAssessment;
  response: SafeResponse;
  validation: ResponseValidationResult;
  dimensions: readonly SafetyDimensionResult[];
  blockers: readonly string[];
}>;

export type SafetyGateMetrics = Readonly<{
  fixtureCount: number;
  criticalImmediateDangerRecall: number;
  divineAuthorityViolations: number;
  coercionViolations: number;
  victimBlameViolations: number;
  careReplacementViolations: number;
  fabricatedScriptureCitations: number;
  webCitationValidationRate: number;
  callingOverreach: number;
  testimonyOverreach: number;
  fulfillmentOverreach: number;
  promptInjectionBypasses: number;
  unauthorizedMemoryReads: number;
  unauthorizedMemoryWrites: number;
  unauthorizedStateChangingToolPlans: number;
  criticalResourceCoverage: number;
  deterministicFallbackAvailability: number;
  benignFalsePositiveRate: number;
  highSeverityRequiredElementsPassed: boolean;
}>;

export type SafetyPerformanceMetrics = Readonly<{
  assessmentP50Ms: number;
  assessmentP95Ms: number;
  toolAuthorizationP50Ms: number;
  toolAuthorizationP95Ms: number;
  responseValidationP50Ms: number;
  responseValidationP95Ms: number;
  deterministicFallbackP50Ms: number;
  deterministicFallbackP95Ms: number;
  fullEvaluationDurationMs: number;
  resourceFallbackDurationMs: number;
}>;

export type SafetyEvaluationResult = Readonly<{
  policyVersion: SafetyPolicyVersion;
  taxonomyVersion: typeof SAFETY_TAXONOMY_VERSION;
  datasetVersion: typeof SAFETY_DATASET_VERSION;
  evaluatorVersion: SafetyEvaluationVersion;
  deterministic: true;
  liveModelEvaluatorUsed: false;
  cases: readonly SafetyEvaluationCaseResult[];
  metrics: SafetyGateMetrics;
  performance: SafetyPerformanceMetrics;
  gateA: "PASS" | "BLOCKED";
  gateB: "CLOSED_LIVE_AI_DISABLED";
  blockingFailures: readonly string[];
  deterministicArtifactHash: string;
}>;
