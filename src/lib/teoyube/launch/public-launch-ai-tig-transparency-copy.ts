export type TeoyubeAiTigTransparencyCopy = {
  id: string;
  label: string;
  tigExplanation: string;
  scriptureAnchoring: string;
  confidenceLabel: string;
  fallbackExplanation: string;
  personalizationPreviewTransparency: string;
  liveAiNotEnabled: string;
  claimsDivineCertainty: false;
  liveAiOrchestrationEnabled: false;
  generatedAt: string;
};

export function getTigExplanationCopy(): string {
  return "Teoyube uses the Teoyube Intelligence Graph to connect user state, Teoyube words, promise clusters, Scriptures, prayers, and action steps.";
}

export function getScriptureAnchoringCopy(): string {
  return "Recommendations should include Scripture anchors and explanation paths so users can see why a response is being shown.";
}

export function getConfidenceLabelCopy(): string {
  return "Confidence labels are not divine certainty. They are a transparent signal about how strongly Teoyube matched available non-sensitive context.";
}

export function getFallbackExplanationCopy(): string {
  return "Fallbacks are safe, Scripture-anchored alternatives used when a confident or complete recommendation is not available.";
}

export function getPersonalizationPreviewTransparencyCopy(): string {
  return "Personalization preview should remain visible, consent-aware, reversible, and explainable to users.";
}

export function getLiveAiNotEnabledCopy(): string {
  return "Live AI orchestration is not enabled unless explicitly added later with safety, fallback, cost, provider, and consent controls.";
}

export function createAiTigTransparencyCopy(): TeoyubeAiTigTransparencyCopy {
  return {
    id: "public_launch_ai_tig_transparency_copy_5_2",
    label: "Public Launch AI/TIG Transparency Copy",
    tigExplanation: getTigExplanationCopy(),
    scriptureAnchoring: getScriptureAnchoringCopy(),
    confidenceLabel: getConfidenceLabelCopy(),
    fallbackExplanation: getFallbackExplanationCopy(),
    personalizationPreviewTransparency: getPersonalizationPreviewTransparencyCopy(),
    liveAiNotEnabled: getLiveAiNotEnabledCopy(),
    claimsDivineCertainty: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: new Date().toISOString()
  };
}

export function createAiTigTransparencyReviewChecklist() {
  return [
    { id: "ai_tig_graph_explained", label: "TIG graph role explained", required: true, complete: true },
    { id: "ai_tig_scripture_anchors", label: "Scripture anchors explained", required: true, complete: true },
    { id: "ai_tig_confidence_not_certainty", label: "Confidence is not divine certainty", required: true, complete: true },
    { id: "ai_tig_fallbacks", label: "Fallback behavior explained", required: true, complete: true },
    { id: "ai_tig_live_ai_disabled", label: "Live AI disabled state explained", required: true, complete: true }
  ];
}

export function createAiTigTransparencyCopyReport(copy: TeoyubeAiTigTransparencyCopy = createAiTigTransparencyCopy()) {
  const blockers = [
    copy.claimsDivineCertainty ? { id: "ai_tig_divine_certainty", label: copy.label, reason: "AI/TIG copy must not claim divine certainty.", requiredAction: "Remove divine certainty claim.", riskLevel: "critical" as const } : undefined,
    copy.liveAiOrchestrationEnabled ? { id: "ai_tig_live_ai_enabled", label: copy.label, reason: "AI/TIG copy must not imply live AI is enabled.", requiredAction: "Keep live AI disabled copy accurate.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    copy,
    checklist: createAiTigTransparencyReviewChecklist(),
    blockers,
    warnings: [],
    noDivineCertaintyClaimed: true,
    noLiveAiOrchestrationEnabled: true,
    noPublicLaunchPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
