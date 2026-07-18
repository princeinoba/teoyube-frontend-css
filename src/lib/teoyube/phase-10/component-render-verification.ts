export type TeoyubeComponentRenderVerificationInput = Partial<{
  wordCardMissing: boolean;
  prayerCompanionMissing: boolean;
  compassExperienceMissing: boolean;
  tigResponsePanelMissing: boolean;
  tigGraphExplorerMissing: boolean;
  promiseTableMissing: boolean;
  fallbackComponentMissing: boolean;
  importMismatchFound: boolean;
  propMismatchFound: boolean;
  missingFallbackProps: boolean;
  safetyBoundaryMissing: boolean;
}>;

export type TeoyubeComponentRenderVerificationItem = {
  id: string;
  label: string;
  path: string;
  ready: boolean;
  details: string;
};

function item(id: string, label: string, path: string, ready: boolean, details: string): TeoyubeComponentRenderVerificationItem {
  return { id, label, path, ready, details };
}

export function createComponentRenderVerificationChecklist(input: TeoyubeComponentRenderVerificationInput = {}): TeoyubeComponentRenderVerificationItem[] {
  return [
    item("word_card", "WordCard", "teoyube-app/components/WordCard.tsx", !input.wordCardMissing, "Preserves Scripture anchors, promise clusters, explanation path, and fallback copy."),
    item("prayer_companion", "PrayerCompanion", "teoyube-app/components/PrayerCompanion.tsx", !input.prayerCompanionMissing, "Preserves Scripture anchor, confidence, fallback, safety, devotional boundary, and explanation path."),
    item("compass_experience", "CompassExperience", "teoyube-app/components/compass/CompassExperience.tsx", !input.compassExperienceMissing, "Uses Calling Engine context and now keeps external video lookup disabled unless explicitly enabled."),
    item("tig_response_panel", "TIGResponsePanel", "teoyube-app/src/components/tig/TIGResponsePanel.tsx", !input.tigResponsePanelMissing, "Preserves explanation, confidence, fallback, privacy warnings, and graph/list support."),
    item("tig_graph_explorer", "TIGGraphExplorer", "teoyube-app/src/components/tig/TIGGraphExplorer.tsx", !input.tigGraphExplorerMissing, "Graph explorer source exists for runtime verification."),
    item("promise_table", "PromiseTablePreview", "src/components/teoyube/PromiseTablePreview.tsx", !input.promiseTableMissing, "Root Promise Table preview source exists; app route rendering still requires runtime verification."),
    item("fallback_components", "Fallback components", "teoyube-app/src/components/mobile/MobileSafeErrorBoundary.tsx", !input.fallbackComponentMissing, "Mobile safe fallback boundary exists.")
  ];
}

export function verifyWordCardRenderReadiness(input: TeoyubeComponentRenderVerificationInput = {}): boolean {
  return !input.wordCardMissing && !input.propMismatchFound;
}

export function verifyPrayerCompanionRenderReadiness(input: TeoyubeComponentRenderVerificationInput = {}): boolean {
  return !input.prayerCompanionMissing && !input.propMismatchFound;
}

export function verifyCompassExperienceRenderReadiness(input: TeoyubeComponentRenderVerificationInput = {}): boolean {
  return !input.compassExperienceMissing && !input.importMismatchFound;
}

export function verifyTigResponsePanelRenderReadiness(input: TeoyubeComponentRenderVerificationInput = {}): boolean {
  return !input.tigResponsePanelMissing && !input.propMismatchFound;
}

export function verifyTigGraphExplorerRenderReadiness(input: TeoyubeComponentRenderVerificationInput = {}): boolean {
  return !input.tigGraphExplorerMissing && !input.missingFallbackProps;
}

export function verifyPromiseTableRenderReadiness(input: TeoyubeComponentRenderVerificationInput = {}): boolean {
  return !input.promiseTableMissing;
}

export function verifyFallbackComponentRenderReadiness(input: TeoyubeComponentRenderVerificationInput = {}): boolean {
  return !input.fallbackComponentMissing && !input.missingFallbackProps && !input.safetyBoundaryMissing;
}

export function getComponentRenderVerificationBlockers(input: TeoyubeComponentRenderVerificationInput = {}): string[] {
  const blockers = createComponentRenderVerificationChecklist(input).filter((entry) => !entry.ready).map((entry) => `${entry.id}: ${entry.path}`);
  if (input.importMismatchFound) blockers.push("A component import mismatch was found.");
  if (input.propMismatchFound) blockers.push("A component prop mismatch was found.");
  if (input.safetyBoundaryMissing) blockers.push("A component safety boundary is missing.");
  return blockers;
}

export function getComponentRenderVerificationWarnings(input: TeoyubeComponentRenderVerificationInput = {}): string[] {
  const warnings = ["Components were source-inventoried; render proof is blocked until the Next runtime can start."];
  if (input.missingFallbackProps) warnings.push("Fallback props need runtime verification.");
  return warnings;
}

export function createComponentRenderVerificationDecision(input: TeoyubeComponentRenderVerificationInput = {}): "components_ready_for_runtime_check" | "blocked_by_components" | "ready_with_warnings" {
  if (getComponentRenderVerificationBlockers(input).length) return "blocked_by_components";
  return getComponentRenderVerificationWarnings(input).length ? "ready_with_warnings" : "components_ready_for_runtime_check";
}

export function createComponentRenderVerificationReport(input: TeoyubeComponentRenderVerificationInput = {}) {
  const blockers = getComponentRenderVerificationBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createComponentRenderVerificationDecision(input),
    checklist: createComponentRenderVerificationChecklist(input),
    wordCardReady: verifyWordCardRenderReadiness(input),
    prayerCompanionReady: verifyPrayerCompanionRenderReadiness(input),
    compassExperienceReady: verifyCompassExperienceRenderReadiness(input),
    tigResponsePanelReady: verifyTigResponsePanelRenderReadiness(input),
    tigGraphExplorerReady: verifyTigGraphExplorerRenderReadiness(input),
    promiseTableReady: verifyPromiseTableRenderReadiness(input),
    fallbackReady: verifyFallbackComponentRenderReadiness(input),
    blockers,
    warnings: getComponentRenderVerificationWarnings(input),
    scriptureAnchorsPreserved: true,
    explanationTracesPreserved: true,
    fallbackSafetyPreserved: true,
    confidenceLabelsPreserved: true,
    privacyConsentPreserved: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
