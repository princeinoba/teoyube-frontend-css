import {
  TEO_GUIDE_LIMITS,
  TEO_GUIDE_PLANNER_VERSION,
  type TeoGuideIntent,
  type TeoGuidePlan,
  type TeoGuidePlanStep,
  type TeoGuideRequest,
  type TeoGuideToolName
} from "./orchestration-contracts";

const REFERENCE_PATTERN = /\b(?:genesis|exodus|psalms?|proverbs|isaiah|matthew|mark|luke|john|romans|corinthians|galatians|ephesians|philippians|colossians|james|peter|revelation)\s+\d{1,3}(?::\d{1,3}(?:-\d{1,3})?)?\b/i;

function includesAny(value: string, terms: readonly string[]): boolean {
  return terms.some((term) => value.includes(term));
}

export function classifyTeoGuideIntent(inputValue: string): TeoGuideIntent {
  const input = inputValue.trim().toLowerCase();
  if (includesAny(input, ["kill myself", "suicide", "end my life", "self-harm", "hurt myself", "immediate danger"])) return "crisis_support";
  if (includesAny(input, ["ignore previous", "reveal system", "developer message", "hidden prompt", "bypass safety", "print your instructions"])) return "sensitive_topic";
  if (REFERENCE_PATTERN.test(input)) return includesAny(input, ["context", "before", "after", "chapter"]) ? "scripture_context" : "scripture_lookup";
  if (includesAny(input, ["which promise", "promise cluster", "promise category"])) return "promise_cluster";
  if (includesAny(input, ["promise", "hope", "assurance"])) return "promise_search";
  if (includesAny(input, ["journey status", "where am i", "current journey"])) return "journey_status";
  if (includesAny(input, ["next journey", "advance", "accept assignment", "complete this step"])) return "journey_action";
  if (includesAny(input, ["calling", "purpose", "vocation", "gift", "burden"])) return "calling_discernment";
  if (includesAny(input, ["pray", "prayer", "anxious", "anxiety", "peace"])) return "prayer_support";
  if (includesAny(input, ["remember", "my preference", "what did i choose"])) return "memory_search";
  if (includesAny(input, ["reflection pattern", "summarize my reflections", "recurring reflection"])) return "reflection_pattern";
  if (includesAny(input, ["journal draft", "draft a journal", "journal entry"])) return "journal_draft";
  if (includesAny(input, ["testimony draft", "testimony candidate", "draft testimony"])) return "testimony_draft";
  if (includesAny(input, ["mentor", "pastor", "wise counsel", "community discussion"])) return "mentor_prompt";
  if (includesAny(input, ["abuse", "violence", "medical", "legal", "financial", "trauma", "grief", "depression"])) return "sensitive_topic";
  if (includesAny(input, ["how do i use", "what can teo guide", "help page"])) return "product_help";
  if (includesAny(input, ["scripture", "bible", "verse", "wisdom", "decision", "confusion", "trust", "direction"])) return "scripture_lookup";
  return "unknown";
}

function step(index: number, tool: TeoGuideToolName, reason: string, options: Partial<Pick<TeoGuidePlanStep, "dependsOn" | "requiresAuthentication" | "requiresConsentPurpose">> = {}): TeoGuidePlanStep {
  return Object.freeze({
    id: `step-${index + 1}-${tool}`,
    tool,
    reason,
    dependsOn: Object.freeze([...(options.dependsOn || [])]),
    requiresAuthentication: options.requiresAuthentication || false,
    requiresConsentPurpose: options.requiresConsentPurpose,
    stateMutation: false
  });
}

export function createDeterministicTeoGuidePlan(request: TeoGuideRequest): TeoGuidePlan {
  const normalizedInput = request.input.trim().replace(/\s+/g, " ").slice(0, TEO_GUIDE_LIMITS.inputCharacters);
  const intent = classifyTeoGuideIntent(normalizedInput);
  const tools: TeoGuidePlanStep[] = [];
  const add = (tool: TeoGuideToolName, reason: string, options?: Partial<Pick<TeoGuidePlanStep, "dependsOn" | "requiresAuthentication" | "requiresConsentPurpose">>) => {
    if (tools.length < TEO_GUIDE_LIMITS.toolCallsPerTurn) tools.push(step(tools.length, tool, reason, options));
  };

  if (intent === "scripture_lookup" || intent === "scripture_context" || intent === "prayer_support" || intent === "journal_draft" || intent === "testimony_draft" || intent === "mentor_prompt" || intent === "unknown" || intent === "product_help") add("searchScripture", "Retrieve exact approved WEB Scripture before interpretation.");
  if (intent === "scripture_context") add("getScriptureContext", "Read the requested passage in deterministic canonical context.", { dependsOn: [tools[0]?.id || ""] });
  if (intent === "promise_search" || intent === "promise_cluster") add("searchPromises", "Find local Promise Clusters with explicit Scripture provenance.");
  if (intent === "promise_cluster") add("getPromiseCluster", "Read the selected local cluster without changing its data.", { dependsOn: [tools[0]?.id || ""] });
  if (intent === "journey_status" || intent === "journey_action") add("getCurrentJourney", "Read current journey state only after authentication.", { requiresAuthentication: true, requiresConsentPurpose: "journey_continuity" });
  if (intent === "journey_action") add("proposeJourneyAction", "Create a reversible proposal; do not mutate journey state.", { dependsOn: [tools[0]?.id || ""], requiresAuthentication: true, requiresConsentPurpose: "journey_continuity" });
  if (intent === "calling_discernment") add("getCallingEvidence", "Return deterministic indicators and limitations, never a final calling declaration.");
  if (intent === "prayer_support") add("buildPrayerOptions", "Build prayer language as a user-editable devotional aid.", { dependsOn: [tools[0]?.id || ""] });
  if (intent === "memory_search" || intent === "reflection_pattern") add("searchApprovedUserMemory", "Read only explicitly approved structured memory.", { requiresAuthentication: true, requiresConsentPurpose: "journey_continuity" });
  if (intent === "reflection_pattern") add("summarizeReflectionPattern", "Summarize approved records without storing a new conclusion.", { dependsOn: [tools[0]?.id || ""], requiresAuthentication: true, requiresConsentPurpose: "journey_continuity" });
  if (intent === "journal_draft") add("draftJournalEntry", "Create an editable session draft, not a durable journal entry.", { dependsOn: [tools[0]?.id || ""] });
  if (intent === "testimony_draft") add("draftTestimonyCandidate", "Create an editable candidate; only the user may finalize testimony.", { dependsOn: [tools[0]?.id || ""] });
  if (intent === "mentor_prompt") add("createMentorDiscussionPrompt", "Offer a discussion prompt for wise counsel and community.", { dependsOn: [tools[0]?.id || ""] });

  return Object.freeze({
    intent,
    normalizedInput,
    plannerVersion: TEO_GUIDE_PLANNER_VERSION,
    steps: Object.freeze(tools),
    limitations: Object.freeze(intent === "crisis_support" ? ["Ordinary recommendation tools are skipped until immediate safety guidance is provided."] : [])
  });
}
