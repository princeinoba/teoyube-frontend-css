import type { AuthorizationContext } from "../identity/identity-contracts";
import type { ConsentGrant } from "../memory/memory-contracts";

export const TEO_GUIDE_ORCHESTRATION_VERSION = "teo-guide-orchestration-2026-07-22.1";
export const TEO_GUIDE_PLANNER_VERSION = "teo-guide-deterministic-planner-2026-07-22.1";
export const TEO_GUIDE_TOOL_REGISTRY_VERSION = "teo-guide-tools-2026-07-22.1";

export const TEO_GUIDE_LIMITS = Object.freeze({
  inputCharacters: 8_000,
  conversationTurns: 20,
  toolCallsPerTurn: 5,
  toolOutputCharacters: 24_000,
  responseSourceCount: 12,
  orchestrationDurationMs: 10_000,
  proposalTtlMs: 15 * 60 * 1_000,
  conversationCount: 100
});

export type TeoGuideIntent =
  | "scripture_lookup"
  | "scripture_context"
  | "promise_search"
  | "promise_cluster"
  | "journey_status"
  | "journey_action"
  | "calling_discernment"
  | "prayer_support"
  | "memory_search"
  | "reflection_pattern"
  | "journal_draft"
  | "testimony_draft"
  | "mentor_prompt"
  | "sensitive_topic"
  | "crisis_support"
  | "product_help"
  | "unknown";

export type TeoGuideToolName =
  | "searchScripture"
  | "getScriptureContext"
  | "searchPromises"
  | "getPromiseCluster"
  | "getCurrentJourney"
  | "proposeJourneyAction"
  | "getCallingEvidence"
  | "buildPrayerOptions"
  | "searchApprovedUserMemory"
  | "summarizeReflectionPattern"
  | "draftJournalEntry"
  | "draftTestimonyCandidate"
  | "createMentorDiscussionPrompt";

export type TeoGuideSourceReference = Readonly<{
  id: string;
  kind: "scripture" | "scripture_context" | "promise_cluster" | "tig" | "journey" | "approved_memory" | "safety_policy";
  label: string;
  authority: "Scripture" | "Teoyube interpretation" | "User-approved record" | "Safety policy";
  path: string;
  version: string;
  scriptureReference?: string;
}>;

export type TeoGuideConversationTurn = Readonly<{
  id: string;
  role: "user" | "teo-guide";
  createdAt: string;
  inputFingerprint?: string;
  responseId?: string;
  sourceIds?: readonly string[];
}>;

export type TeoGuideContext = Readonly<{
  conversationId: string;
  route: "/teo-guide";
  locale: string;
  now: string;
  authorization?: AuthorizationContext;
  effectiveConsents: readonly ConsentGrant[];
  turns: readonly TeoGuideConversationTurn[];
  currentJourney?: Readonly<{
    journeyId: string;
    stage: string;
    revision: number;
    scriptureReferences: readonly string[];
    status: "active" | "completed";
  }>;
}>;

export type TeoGuideRequest = Readonly<{
  input: string;
  context: TeoGuideContext;
}>;

export type TeoGuidePlanStep = Readonly<{
  id: string;
  tool: TeoGuideToolName;
  reason: string;
  dependsOn: readonly string[];
  requiresAuthentication: boolean;
  requiresConsentPurpose?: "preference_continuity" | "journey_continuity" | "sensitive_spiritual_storage" | "testimony_book_continuity";
  stateMutation: false;
}>;

export type TeoGuidePlan = Readonly<{
  intent: TeoGuideIntent;
  normalizedInput: string;
  plannerVersion: string;
  steps: readonly TeoGuidePlanStep[];
  limitations: readonly string[];
}>;

export type TeoGuideConfidence = Readonly<{
  label: "exact_scripture" | "strong_deterministic_match" | "partial_deterministic_match" | "safe_fallback";
  score: number;
  rationale: string;
}>;

export type TeoGuideActionProposal = Readonly<{
  id: string;
  kind: "journey_action" | "journal_draft" | "testimony_candidate" | "mentor_discussion";
  status: "proposed" | "confirmed" | "rejected" | "expired";
  label: string;
  summary: string;
  sourceIds: readonly string[];
  requiresAuthentication: true;
  requiresCsrf: true;
  requiresExplicitConfirmation: true;
  createdAt: string;
  expiresAt: string;
  confirmationRevision: number;
  payload: Readonly<Record<string, string | number | boolean | readonly string[]>>;
}>;

export type TeoGuideResponseSection = Readonly<{
  label: string;
  body: string;
  sourceIds: readonly string[];
}>;

export type TeoGuideResponse = Readonly<{
  id: string;
  conversationId: string;
  intent: TeoGuideIntent;
  acknowledgement: string;
  scripture: readonly TeoGuideResponseSection[];
  context: readonly TeoGuideResponseSection[];
  teoyubeInterpretation: readonly TeoGuideResponseSection[];
  promiseConnections: readonly TeoGuideResponseSection[];
  callingEvidence: readonly TeoGuideResponseSection[];
  prayer: readonly TeoGuideResponseSection[];
  practicalActions: readonly TeoGuideResponseSection[];
  reflectionPrompts: readonly TeoGuideResponseSection[];
  testimonyAndBook: readonly TeoGuideResponseSection[];
  mentorCommunity: readonly TeoGuideResponseSection[];
  whyThis: readonly string[];
  confidence: TeoGuideConfidence;
  limitations: readonly string[];
  sources: readonly TeoGuideSourceReference[];
  actionProposals: readonly TeoGuideActionProposal[];
  safety: Readonly<{
    mode: "ordinary" | "sensitive" | "critical";
    topic: string;
    orderedGuidance: readonly string[];
    emergencyResourcesFirst: boolean;
    promptInjectionBlocked: boolean;
    prohibitedClaimsBlocked: readonly string[];
    postValidationPassed: boolean;
  }>;
  versions: Readonly<{
    orchestrator: string;
    planner: string;
    tools: string;
    scriptureCorpus: string;
    tigDataset: string;
    tigRuleset: string;
    safetyPolicy: string;
  }>;
  deterministic: true;
  externalModelUsed: false;
  durableWritePerformed: false;
}>;

export type TeoGuideOrchestrationResult = Readonly<{
  response: TeoGuideResponse;
  plan: TeoGuidePlan;
  executedTools: readonly TeoGuideToolName[];
  blockedTools: readonly Readonly<{ tool: TeoGuideToolName; reason: string }>[];
  durationMs: number;
  fallbackUsed: boolean;
}>;

export type TeoGuideProposalDecision = Readonly<{
  proposalId: string;
  expectedRevision: number;
  decision: "confirm" | "reject";
}>;

export type TeoGuideProposalDecisionResult = Readonly<{
  proposal: TeoGuideActionProposal;
  applicationActionAuthorized: boolean;
  durableWritePerformed: false;
  audit: Readonly<{
    event: "teo_guide_action_confirmed" | "teo_guide_action_rejected";
    subjectHash: string;
    proposalHash: string;
    occurredAt: string;
  }>;
}>;

export interface TeoGuideOrchestrator {
  run(request: TeoGuideRequest): Promise<TeoGuideOrchestrationResult>;
}
