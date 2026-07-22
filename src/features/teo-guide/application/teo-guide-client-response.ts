import type { TeoGuideClientResponseDto, TeoGuideClientSectionDto } from "../../../domain/teo-guide/teo-guide-client-dto";
import { createDeterministicTeoGuideMessage } from "../../../domain/teo-guide/teo-guide-message";
import type { TeoGuideResponse, TeoGuideResponseSection } from "../../../domain/teo-guide/orchestration-contracts";

function clientSection(section: TeoGuideResponseSection): TeoGuideClientSectionDto {
  return Object.freeze({ label: section.label, body: section.body, sourceIds: Object.freeze([...section.sourceIds]) });
}

export function createTeoGuideClientResponse(input: string, response: TeoGuideResponse): TeoGuideClientResponseDto {
  const legacyMessage = createDeterministicTeoGuideMessage(input);
  const primaryReference = response.sources.find((source) => source.scriptureReference)?.scriptureReference || legacyMessage.sources[0]?.reference || "Psalm 119:105";
  const message = response.safety.mode === "ordinary" ? legacyMessage : Object.freeze({
    ...legacyMessage,
    text: response.safety.orderedGuidance.join(" "),
    sources: Object.freeze([Object.freeze({ kind: "scripture" as const, reference: primaryReference, authority: "Scripture" as const })]),
    interpretation: response.teoyubeInterpretation[0]?.body || "Teoyube interpretation: this sensitive response uses cautious, reviewable language rather than certainty.",
    suggestedApplication: response.practicalActions[0]?.body || "Suggested action: include trusted community and appropriate qualified care.",
    limitation: response.limitations.join(" ")
  });
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
    sourceReferences: Object.freeze(response.sources.map((source) => source.scriptureReference).filter((reference): reference is string => Boolean(reference))),
    actionProposals: Object.freeze(response.actionProposals.map((proposal) => Object.freeze({ id: proposal.id, label: proposal.label, summary: proposal.summary, status: proposal.status, requiresExplicitConfirmation: true as const }))),
    safety: Object.freeze({ mode: response.safety.mode, orderedGuidance: Object.freeze([...response.safety.orderedGuidance]), postValidationPassed: response.safety.postValidationPassed }),
    deterministic: true,
    externalModelUsed: false,
    durableWritePerformed: false
  });
}
