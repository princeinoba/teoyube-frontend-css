import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import { createDeterministicTeoGuideMessage, type TeoGuideMessage } from "../../../domain/teo-guide/teo-guide-message";

export type TeoGuidePageViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  initialMessage: TeoGuideMessage;
  deterministicLocalOnly: true;
  liveAiConnected: false;
  durableMemoryConnected: false;
}>;

export function createTeoGuidePageViewModel(): TeoGuidePageViewModel {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.guide.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    initialMessage: createDeterministicTeoGuideMessage("Help me understand God's plan with Scripture and wise counsel."),
    deterministicLocalOnly: true,
    liveAiConnected: false,
    durableMemoryConnected: false
  });
}
