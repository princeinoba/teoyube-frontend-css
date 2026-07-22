import type { TeoGuideClientResponseDto, TeoGuideClientSectionDto } from "../../../domain/teo-guide/teo-guide-client-dto";
import { createDeterministicTeoGuideMessage } from "../../../domain/teo-guide/teo-guide-message";
import type { TeoGuideResponse, TeoGuideResponseSection } from "../../../domain/teo-guide/orchestration-contracts";

function clientSection(section: TeoGuideResponseSection): TeoGuideClientSectionDto {
  return Object.freeze({ label: section.label, body: section.body, sourceIds: Object.freeze([...section.sourceIds]) });
}

export function createTeoGuideClientResponse(
  input: string,
  response: TeoGuideResponse,
  disclosure: Readonly<{ externalProcessingConsent?: boolean; fallbackReason?: string }> = {}
): TeoGuideClientResponseDto {
  const legacyMessage = createDeterministicTeoGuideMessage(input);
  const primaryReference = response.sources.find((source) => source.scriptureReference)?.scriptureReference || legacyMessage.sources[0]?.reference || "Psalm 119:105";
  const liveMessage = response.externalModelUsed ? Object.freeze({
    id: response.id,
    role: "teo-guide" as const,
    text: response.acknowledgement,
    sources: Object.freeze(response.sources.filter((source) => source.authority === "Scripture" && source.scriptureReference).map((source) => Object.freeze({ kind: "scripture" as const, reference: source.scriptureReference || primaryReference, authority: "Scripture" as const })).slice(0, 4)),
    interpretation: response.teoyubeInterpretation[0]?.body || "Teoyube interpretation: the live language synthesis did not replace the deterministic source boundary.",
    suggestedApplication: response.practicalActions[0]?.body || "Suggested action: review the sourced response and choose one realistic, reversible next step.",
    confidence: "deterministic_scripture_match" as const,
    limitation: response.limitations.join(" ")
  }) : undefined;
  const message = liveMessage || (response.safety.mode === "ordinary" ? legacyMessage : Object.freeze({
    ...legacyMessage,
    text: response.safety.orderedGuidance.join(" "),
    sources: Object.freeze([Object.freeze({ kind: "scripture" as const, reference: primaryReference, authority: "Scripture" as const })]),
    interpretation: response.teoyubeInterpretation[0]?.body || "Teoyube interpretation: this sensitive response uses cautious, reviewable language rather than certainty.",
    suggestedApplication: response.practicalActions[0]?.body || "Suggested action: include trusted community and appropriate qualified care.",
    limitation: response.limitations.join(" ")
  }));
  const sections = [
    ...response.scripture,
    ...response.context,
    ...response.promiseConnections,
    ...response.callingEvidence,
    ...response.prayer,
    ...response.reflectionPrompts,
    ...response.testimonyAndBook,
    ...response.mentorCommunity
  ].map(clientSection);
  return Object.freeze({
    responseId: response.id,
    conversationId: response.conversationId,
    intent: response.intent,
    message,
    sections: Object.freeze(sections),
    whyThis: Object.freeze([...response.whyThis]),
    limitations: Object.freeze([...response.limitations]),
    ...(response.followUp ? { followUp: Object.freeze({ question: response.followUp.question, reason: response.followUp.reason }) } : {}),
    sourceReferences: Object.freeze(response.sources.map((source) => source.scriptureReference).filter((reference): reference is string => Boolean(reference))),
    actionProposals: Object.freeze(response.actionProposals.map((proposal) => Object.freeze({ id: proposal.id, label: proposal.label, summary: proposal.summary, status: proposal.status, requiresExplicitConfirmation: true as const }))),
    safety: Object.freeze({ mode: response.safety.mode, orderedGuidance: Object.freeze([...response.safety.orderedGuidance]), postValidationPassed: response.safety.postValidationPassed }),
    modelUse: Object.freeze(response.modelUse ? {
      mode: "live" as const,
      providerId: response.modelUse.providerId,
      modelRoute: response.modelUse.modelRoute,
      modelId: response.modelUse.modelId,
      memoryIncluded: response.modelUse.memoryIncluded,
      sensitiveContentIncluded: response.modelUse.sensitiveContentIncluded,
      externalProcessingConsent: disclosure.externalProcessingConsent === true,
      store: false as const
    } : {
      mode: "deterministic" as const,
      memoryIncluded: false,
      sensitiveContentIncluded: false,
      externalProcessingConsent: disclosure.externalProcessingConsent === true,
      ...(disclosure.fallbackReason ? { fallbackReason: disclosure.fallbackReason } : {}),
      store: false as const
    }),
    deterministic: response.deterministic,
    externalModelUsed: response.externalModelUsed,
    durableWritePerformed: false
  });
}
