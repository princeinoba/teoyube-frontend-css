import type { TeoGuideMessage } from "./teo-guide-message";

export type TeoGuideClientSectionDto = Readonly<{
  label: string;
  body: string;
  sourceIds: readonly string[];
}>;

export type TeoGuideClientResponseDto = Readonly<{
  responseId: string;
  conversationId: string;
  intent: string;
  message: TeoGuideMessage;
  sections: readonly TeoGuideClientSectionDto[];
  whyThis: readonly string[];
  limitations: readonly string[];
  sourceReferences: readonly string[];
  actionProposals: readonly Readonly<{
    id: string;
    label: string;
    summary: string;
    status: "proposed" | "confirmed" | "rejected" | "expired";
    requiresExplicitConfirmation: true;
  }>[];
  safety: Readonly<{
    mode: "ordinary" | "sensitive" | "critical";
    orderedGuidance: readonly string[];
    postValidationPassed: boolean;
  }>;
  deterministic: true;
  externalModelUsed: false;
  durableWritePerformed: false;
}>;
