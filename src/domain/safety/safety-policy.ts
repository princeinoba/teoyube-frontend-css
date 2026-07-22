import {
  SAFETY_POLICY_VERSION,
  SAFETY_TAXONOMY_VERSION,
  type SafetyMemoryPolicy,
  type SafetyResponseMode,
  type SafetyResponseSectionId,
  type SafetySeverity,
  type SensitiveTopic,
  type ScriptureSafetyPolicy
} from "./safety-contracts";

export const SAFETY_LIMITS = Object.freeze({
  inputCharacters: 8_000,
  detectedTopics: 4,
  claimScanCharacters: 16_000,
  responseValidationCharacters: 24_000,
  evaluationCases: 250,
  evaluationTimeoutMs: 10_000,
  resourceTimeoutMs: 500,
  telemetryQueue: 500,
  toolRequests: 16
});

export type SensitiveTopicPolicy = Readonly<{
  topic: SensitiveTopic;
  defaultSeverity: SafetySeverity;
  responseMode: SafetyResponseMode;
  scripturePolicy: ScriptureSafetyPolicy;
  memoryPolicy: SafetyMemoryPolicy;
  patterns: readonly RegExp[];
  requiredElements: readonly string[];
  prohibitedElements: readonly string[];
  guidance: readonly string[];
}>;

const COMMON_PROHIBITIONS = Object.freeze([
  "divine certainty",
  "coercion",
  "victim blame",
  "guaranteed personal outcome",
  "care replacement",
  "automatic durable write"
]);

function policy(
  topic: SensitiveTopic,
  defaultSeverity: SafetySeverity,
  responseMode: SafetyResponseMode,
  scripturePolicy: ScriptureSafetyPolicy,
  memoryPolicy: SafetyMemoryPolicy,
  patterns: readonly RegExp[],
  requiredElements: readonly string[],
  prohibitedElements: readonly string[],
  guidance: readonly string[]
): SensitiveTopicPolicy {
  return Object.freeze({
    topic,
    defaultSeverity,
    responseMode,
    scripturePolicy,
    memoryPolicy,
    patterns: Object.freeze([...patterns]),
    requiredElements: Object.freeze([...requiredElements]),
    prohibitedElements: Object.freeze([...COMMON_PROHIBITIONS, ...prohibitedElements]),
    guidance: Object.freeze([...guidance])
  });
}

export const SENSITIVE_TOPIC_POLICIES: Readonly<Record<SensitiveTopic, SensitiveTopicPolicy>> = Object.freeze({
  ordinary_spiritual_question: policy(
    "ordinary_spiritual_question", "ordinary", "ordinary_guidance", "exact_web_required", "no_memory_access",
    [],
    ["Scripture", "text context", "possible interpretation", "suggested action", "limitations"],
    [],
    ["Keep Scripture primary and distinguish interpretation from application."]
  ),
  doubt: policy(
    "doubt", "moderate", "sensitive_support", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:doubt|doubting|question(?:ing)? (?:my )?faith|losing faith|not sure (?:i believe|god exists))\b/i],
    ["compassion", "room for uncertainty", "Scripture", "trusted community"],
    ["shame", "salvation threat"],
    ["Do not punish questions or threaten salvation because uncertainty is present."]
  ),
  grief: policy(
    "grief", "moderate", "sensitive_support", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:grief|grieving|bereave(?:d|ment)|died|death of|lost (?:my|a) (?:parent|child|spouse|friend|sibling|loved one))\b/i],
    ["acknowledge loss", "compassion", "Scripture", "support"],
    ["explain why God caused the loss"],
    ["Acknowledge the loss before interpretation and avoid assigning a hidden divine reason."]
  ),
  trauma: policy(
    "trauma", "high", "professional_support_guidance", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:trauma|traumatic|flashback|post-traumatic|ptsd)\b/i],
    ["preserve control", "no forced disclosure", "trauma-informed support"],
    ["forced disclosure", "spiritual blame"],
    ["Offer choices, do not demand details, and encourage trauma-informed support."]
  ),
  abuse: policy(
    "abuse", "high", "professional_support_guidance", "exact_web_after_immediate_safety", "session_only_no_crisis_profile",
    [/\b(?:abuse|abusive|being hurt|threatens? me|controls? me|unsafe at home)\b/i],
    ["safety priority", "trusted independent support", "no unsafe confrontation"],
    ["remain in danger", "required submission", "unsafe confrontation"],
    ["Distinguish spiritual reflection from the immediate need for safety and independent support."]
  ),
  self_harm_or_immediate_danger: policy(
    "self_harm_or_immediate_danger", "critical", "immediate_safety_guidance", "exact_web_after_immediate_safety", "session_only_no_crisis_profile",
    [/\b(?:kill myself|end my life|suicid(?:e|al)|self[- ]?harm|hurt myself|immediate danger|about to (?:die|jump|shoot|overdose)|weapon in hand|cannot stay safe)\b/i],
    ["immediate local emergency help", "trusted person physically present", "reduce immediate danger", "verified resource or generic fallback", "Scripture after safety"],
    ["prayer-only response", "promise of secrecy", "Scripture before safety"],
    ["Use compassionate direct language and put immediate human safety before devotional reflection."]
  ),
  psychosis_paranoia_or_divine_commands: policy(
    "psychosis_paranoia_or_divine_commands", "high", "professional_support_guidance", "exact_web_after_immediate_safety", "session_only_no_crisis_profile",
    [/\b(?:hearing (?:god|voices?|angels?)|(?:a )?voices? (?:tell|tells|command|commands)|paranoi(?:a|d)|being watched|mind control|god commanded me to|divine command)\b/i],
    ["validate distress", "do not validate belief", "professional support", "trusted person"],
    ["confirm supernatural command", "confirm paranoia", "dangerous obedience"],
    ["Acknowledge distress without confirming a supernatural or persecutory explanation."]
  ),
  spiritual_coercion: policy(
    "spiritual_coercion", "high", "professional_support_guidance", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:spiritual coercion|religious coercion|leader (?:threatens|controls|orders)|must obey (?:my )?(?:pastor|leader)|keep this secret from|isolated from (?:family|friends)|forced obedience)\b/i],
    ["name unsafe pattern", "independent support", "freedom from forced obedience"],
    ["secrecy", "isolation", "fear-based compliance"],
    ["Name fear, secrecy, isolation, and forced obedience as unsafe patterns."]
  ),
  relationship_crisis: policy(
    "relationship_crisis", "moderate", "sensitive_support", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:relationship crisis|marriage crisis|divorc(?:e|ing)|break ?up|reconcil(?:e|iation)|partner conflict|spouse conflict)\b/i],
    ["distinguish conflict from abuse", "wise counsel", "user agency"],
    ["declare marriage outcome", "command divorce", "command reconciliation"],
    ["Do not decide marriage, divorce, or reconciliation as divine certainty."]
  ),
  medical_concern: policy(
    "medical_concern", "high", "professional_support_guidance", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:medical|doctor|diagnos(?:e|is)|medication|symptom|cancer|seizure|chest pain|pregnan|surgery|illness|disease)\b/i],
    ["qualified medical care", "no diagnosis", "no medication change"],
    ["diagnosis", "medication instruction", "spiritual-blame causation"],
    ["Support medical care without diagnosing or changing treatment."]
  ),
  financial_desperation: policy(
    "financial_desperation", "high", "professional_support_guidance", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:financial desperation|cannot pay rent|debt crisis|bankrupt|gambl(?:e|ing)|investment|crypto|loan|borrow money|give my last)\b/i],
    ["qualified financial support", "practical safety", "no guarantee"],
    ["prosperity guarantee", "risky giving", "gambling", "investment direction"],
    ["Do not promise wealth or direct risky giving, gambling, borrowing, or investing."]
  ),
  legal_concern: policy(
    "legal_concern", "high", "professional_support_guidance", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:legal|lawyer|attorney|court|lawsuit|custody|criminal charge|immigration case|contract dispute)\b/i],
    ["qualified legal counsel", "no representation", "no guaranteed outcome"],
    ["legal representation", "court strategy", "guaranteed legal outcome"],
    ["Encourage qualified counsel and avoid legal conclusions or outcome guarantees."]
  ),
  prophecy_or_divine_messages: policy(
    "prophecy_or_divine_messages", "moderate", "sensitive_support", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:prophe(?:cy|tic)|god (?:told|spoke to|revealed)|divine message|word from god|vision from god|dream from god)\b/i],
    ["reported experience", "Scripture", "time", "fruit", "wise counsel", "humility", "safety"],
    ["verify prophecy as fact", "divine authority claim"],
    ["Treat the report as an experience to discern, not a verified message from God."]
  ),
  demonic_interpretation: policy(
    "demonic_interpretation", "high", "professional_support_guidance", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:demon(?:ic|s)?|possess(?:ed|ion)|evil spirit|deliverance ritual|spiritual attack caused)\b/i],
    ["do not confirm causation", "safe pastoral support", "clinical support when appropriate"],
    ["confirm possession", "dangerous deliverance", "medical care replacement"],
    ["Do not confirm possession or demonic causation and never recommend dangerous practices."]
  ),
  scrupulosity_or_compulsive_religious_fear: policy(
    "scrupulosity_or_compulsive_religious_fear", "high", "professional_support_guidance", "exact_web_required", "session_only_no_crisis_profile",
    [/\b(?:scrupulosity|religious ocd|ocd about sin|keep confessing|unforgivable sin|need certainty (?:i am|that i am) saved|check every sin)\b/i],
    ["avoid reassurance loop", "compassion", "qualified mental-health support", "uncertainty tolerance"],
    ["exhaustive sin checking", "repeated certainty reassurance", "demanded moral certainty"],
    ["Do not feed repetitive reassurance or exhaustive moral checking."]
  ),
  sexual_or_domestic_violence: policy(
    "sexual_or_domestic_violence", "critical", "immediate_safety_guidance", "exact_web_after_immediate_safety", "session_only_no_crisis_profile",
    [/\b(?:sexual (?:assault|violence|abuse)|rape|domestic violence|partner (?:hit|strangle|threaten)s?|forced sex|unsafe with my partner)\b/i],
    ["immediate safety", "trusted independent support", "local emergency help", "no confrontation requirement"],
    ["remain in danger", "confront alone", "submission requirement", "victim blame"],
    ["Prioritize immediate safety and preserve the user's control over disclosure and next steps."]
  ),
  substance_or_behavioral_crisis: policy(
    "substance_or_behavioral_crisis", "high", "professional_support_guidance", "exact_web_after_immediate_safety", "session_only_no_crisis_profile",
    [/\b(?:overd(?:ose|osing)|withdrawal|addiction crisis|cannot stop drinking|using drugs now|gambling crisis|substance crisis)\b/i],
    ["immediate medical help when indicated", "trusted person", "professional support"],
    ["unsafe detox instruction", "shame", "prayer-only replacement"],
    ["Escalate overdose or dangerous withdrawal to emergency care and avoid treatment instructions."]
  ),
  unknown_or_multi_topic_sensitive_content: policy(
    "unknown_or_multi_topic_sensitive_content", "high", "professional_support_guidance", "exact_web_after_immediate_safety", "session_only_no_crisis_profile",
    [/\b(?:several crises|multiple problems|not safe and confused|everything is collapsing)\b/i],
    ["clarify immediate safety", "minimum necessary question", "generic professional support"],
    ["assume a diagnosis", "forced disclosure"],
    ["When multiple sensitive signals appear, prioritize the highest severity and ask only what is needed for safety."]
  )
});

export const THEOLOGICAL_SAFETY_PRINCIPLES = Object.freeze({
  policyVersion: SAFETY_POLICY_VERSION,
  taxonomyVersion: SAFETY_TAXONOMY_VERSION,
  scriptureAuthority: "The Bible is the highest authority in Teoyube.",
  personalizationBoundary: "Personalization may clarify application but may not change Scripture's meaning.",
  wordBoundary: "Teoyube words are Scripture-derived prayer and memory aids, not Scripture.",
  callingBoundary: "Calling is discerned over Scripture, prayer, fruit, time, community, and wise counsel; it is not declared by AI.",
  testimonyBoundary: "Only the user may record testimony or declare fulfillment.",
  prayerBoundary: "Prayer must be Scripture-grounded, humble, and non-manipulative.",
  careBoundary: "Teoyube does not replace Scripture, prayer, pastoral care, church community, medical or mental-health care, legal or financial professionals, or emergency services.",
  crisisBoundary: "Immediate human safety comes before spiritual reflection."
});

export function orderedSectionsFor(mode: SafetyResponseMode): readonly SafetyResponseSectionId[] {
  if (mode === "immediate_safety_guidance") return Object.freeze([
    "immediate_safety", "acknowledgement", "resource", "scripture", "text_context", "interpretation", "practical_next_step", "community_or_professional_support", "why_selected", "limitations"
  ]);
  if (mode === "prohibited_request_refusal") return Object.freeze([
    "refusal", "acknowledgement", "scripture", "interpretation", "practical_next_step", "why_selected", "limitations"
  ]);
  if (mode === "professional_support_guidance") return Object.freeze([
    "acknowledgement", "community_or_professional_support", "scripture", "text_context", "interpretation", "practical_next_step", "why_selected", "limitations"
  ]);
  return Object.freeze([
    "acknowledgement", "scripture", "text_context", "interpretation", "practical_next_step", "community_or_professional_support", "why_selected", "limitations"
  ]);
}
