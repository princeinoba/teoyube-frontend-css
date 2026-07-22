import type {
  CrisisResourceResult,
  SafeResponse,
  SafetyAssessment,
  SafetyResponseSectionId
} from "../../domain/safety/safety-contracts";
import { SAFETY_POLICY_VERSION, SAFETY_TAXONOMY_VERSION } from "../../domain/safety/safety-contracts";
import { createResponsePlan } from "../../domain/safety/safety-engine";
import { SENSITIVE_TOPIC_POLICIES } from "../../domain/safety/safety-policy";
import type { ScripturePassage, ScriptureRepository } from "../../domain/scripture/scripture-repository";
import { canonicalScriptureRepository } from "../scripture/canonical-scripture-repository";
import { GENERIC_EMERGENCY_FALLBACK } from "./crisis-resource-provider";

const TOPIC_SCRIPTURE: Readonly<Partial<Record<SafetyAssessment["primaryTopic"], string>>> = Object.freeze({
  ordinary_spiritual_question: "James 1:5",
  doubt: "Mark 9:24",
  grief: "Psalm 34:18",
  trauma: "Psalm 34:18",
  abuse: "Psalm 82:4",
  self_harm_or_immediate_danger: "Psalm 34:18",
  psychosis_paranoia_or_divine_commands: "James 1:5",
  spiritual_coercion: "2 Timothy 1:7",
  relationship_crisis: "James 1:5",
  medical_concern: "James 1:5",
  financial_desperation: "James 1:5",
  legal_concern: "James 1:5",
  prophecy_or_divine_messages: "1 Thessalonians 5:21",
  demonic_interpretation: "James 1:5",
  scrupulosity_or_compulsive_religious_fear: "Romans 8:1",
  sexual_or_domestic_violence: "Psalm 82:4",
  substance_or_behavioral_crisis: "Psalm 34:18",
  unknown_or_multi_topic_sensitive_content: "James 1:5"
});

async function exactPassage(repository: ScriptureRepository, reference: string): Promise<ScripturePassage | null> {
  const parsed = repository.parseReferences(reference)[0];
  if (!parsed?.valid) return null;
  return repository.getByReference(parsed.reference);
}

function acknowledgement(assessment: SafetyAssessment): string {
  if (assessment.primaryTopic === "grief") return "I am sorry you are carrying this loss. Grief deserves acknowledgement before anyone tries to interpret it.";
  if (assessment.primaryTopic === "doubt") return "Questions and doubt can be spoken honestly without shame or a threat to your worth.";
  if (assessment.primaryTopic === "trauma") return "What you share is yours to control; you do not need to disclose more detail for Teoyube to support a safer next step.";
  if (assessment.primaryTopic === "psychosis_paranoia_or_divine_commands") return "That experience sounds distressing. Teoyube can acknowledge the distress without confirming that a voice, fear, or command is from God, demons, or another hidden source.";
  if (assessment.primaryTopic === "abuse" || assessment.primaryTopic === "sexual_or_domestic_violence") return "What is happening is not your fault, and spiritual language should never be used to require you to remain in danger.";
  if (assessment.primaryTopic === "scrupulosity_or_compulsive_religious_fear") return "This fear can feel consuming. Teoyube will not ask you to repeat certainty checks or catalogue every possible sin.";
  if (assessment.immediateDanger) return "I am glad you said something. Your immediate safety matters more than continuing a spiritual reflection right now.";
  return "Your question can be approached with compassion, Scripture, humility, and room for careful discernment.";
}

function professionalSupport(assessment: SafetyAssessment): string {
  switch (assessment.primaryTopic) {
    case "medical_concern": return "A qualified medical professional should assess symptoms, diagnosis, and medication. Prayer and Scripture may support you but must not replace medical care.";
    case "legal_concern": return "A qualified legal professional in the relevant jurisdiction can advise you; Teoyube cannot represent you or guarantee an outcome.";
    case "financial_desperation": return "Consider a qualified, trustworthy financial counselor or local practical-support service. Teoyube will not recommend gambling, risky giving, borrowing, or investing.";
    case "trauma": return "A trauma-informed professional and a trusted person may help while preserving your choices and pace.";
    case "psychosis_paranoia_or_divine_commands": return "Please contact a qualified mental-health professional and a trusted person who can be with you, especially before acting on any frightening command.";
    case "scrupulosity_or_compulsive_religious_fear": return "A mental-health professional familiar with scrupulosity or OCD may help without reinforcing repeated reassurance checks.";
    case "abuse":
    case "sexual_or_domestic_violence": return "Seek independent local support from a trusted person, qualified advocate, or emergency service. Do not confront an unsafe person alone.";
    case "substance_or_behavioral_crisis": return "Qualified medical or addiction support can help; dangerous withdrawal or overdose needs immediate medical care.";
    case "spiritual_coercion": return "Seek independent support outside the controlling relationship, such as a trusted person, qualified counselor, or safe pastoral leader with no conflict of interest.";
    default: return "For a major or sensitive decision, include a trusted person and appropriate qualified professional support; Teoyube is devotional support, not professional care.";
  }
}

function section(id: SafetyResponseSectionId, text: string) {
  return Object.freeze({ id, text });
}

export type ComposeSafeResponseOptions = Readonly<{
  resource?: CrisisResourceResult;
  repository?: ScriptureRepository;
}>;

export async function composeSafeResponse(
  assessment: SafetyAssessment,
  options: ComposeSafeResponseOptions = {}
): Promise<SafeResponse> {
  const responsePlan = createResponsePlan(assessment);
  const repository = options.repository || canonicalScriptureRepository;
  const reference = TOPIC_SCRIPTURE[assessment.primaryTopic] || "James 1:5";
  const passage = await exactPassage(repository, reference);
  if (!passage) throw new Error("The deterministic safety composer could not resolve its exact WEB Scripture anchor.");
  const text = passage.verses.map((verse) => verse.text).join(" ");
  const resource = assessment.immediateDanger ? options.resource || GENERIC_EMERGENCY_FALLBACK : options.resource;
  const policy = SENSITIVE_TOPIC_POLICIES[assessment.primaryTopic];
  const interpretation = `Possible Teoyube interpretation: ${policy.guidance[0]} This is a reviewable interpretation, not divine speech, diagnosis, or certainty.`;
  const suggestedApplication = assessment.immediateDanger
    ? "Suggested action: take the immediate safety steps first; do not remain alone with a dangerous plan, command, person, substance, or weapon."
    : "Suggested action: choose one realistic next step, review Scripture in context, pray without forcing certainty, and involve wise community or qualified care when appropriate.";
  const content: Partial<Record<SafetyResponseSectionId, string>> = {
    immediate_safety: resource?.emergencyGuidance,
    acknowledgement: acknowledgement(assessment),
    resource: resource ? `${resource.emergencyGuidance} Resource status: ${resource.verificationStatus}.` : undefined,
    scripture: `${passage.citation.canonicalLabel} · WEB: ${text}`,
    text_context: "What the text says must be read in its biblical context; it does not authorize Teoyube to predict a personal outcome or replace appropriate care.",
    interpretation,
    practical_next_step: suggestedApplication,
    community_or_professional_support: professionalSupport(assessment),
    why_selected: `Why selected: ${passage.citation.canonicalLabel} is an exact local WEB anchor relevant to humble help, discernment, or care after any immediate safety need is addressed.`,
    limitations: "Limitations: Teoyube cannot verify hidden spiritual causes, diagnose, guarantee an outcome, decide calling, declare fulfillment, publish testimony, or make a durable write.",
    refusal: "Teoyube cannot create divine-authority, guaranteed-outcome, coercive, victim-blaming, care-replacing, automatic-fulfillment, or automatic-testimony language."
  };
  const sections = responsePlan.orderedSections
    .map((id) => {
      const value = content[id];
      return typeof value === "string" ? section(id, value) : undefined;
    })
    .filter((entry): entry is Readonly<{ id: SafetyResponseSectionId; text: string }> => Boolean(entry));
  return Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    mode: assessment.responseMode,
    sections: Object.freeze(sections),
    scripture: Object.freeze({ citation: passage.citation, text, classification: "Scripture" as const }),
    interpretation: Object.freeze({ text: interpretation, classification: "Teoyube interpretation" as const }),
    suggestedApplication: Object.freeze({ text: suggestedApplication, classification: "Suggested action" as const }),
    ...(resource ? { resource } : {}),
    responsePlan,
    deterministic: true,
    liveModelUsed: false,
    durableWritePerformed: false,
    rawSensitiveTelemetry: false
  });
}

export async function composeResourceUnavailableFallback(repository: ScriptureRepository = canonicalScriptureRepository): Promise<SafeResponse> {
  const assessment: SafetyAssessment = Object.freeze({
    policyVersion: SAFETY_POLICY_VERSION,
    taxonomyVersion: SAFETY_TAXONOMY_VERSION,
    topics: Object.freeze(["self_harm_or_immediate_danger" as const]),
    primaryTopic: "self_harm_or_immediate_danger",
    severity: "critical",
    responseMode: "immediate_safety_guidance",
    immediateDanger: true,
    sensitive: true,
    prohibitedRequest: false,
    inputLimitReached: false,
    signals: Object.freeze(["resource_unavailable"]),
    input: Object.freeze({ characterCount: 0, normalizedCharacterCount: 0, contentFingerprint: "00000000", rawContentRetained: false, privateContentLogged: false }),
    limitations: Object.freeze(["Locale-specific crisis-resource data is unavailable; the generic local-emergency fallback is required."])
  });
  return composeSafeResponse(assessment, { repository, resource: GENERIC_EMERGENCY_FALLBACK });
}
