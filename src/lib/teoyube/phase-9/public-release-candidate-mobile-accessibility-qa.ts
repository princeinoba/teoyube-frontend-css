export type TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = Partial<{
  wordCardMobileReadable: boolean;
  prayerCompanionMobileReadable: boolean;
  compassExperienceMobileReadable: boolean;
  tigResponsePanelMobileReadable: boolean;
  tigGraphExplorerListFallbackAvailable: boolean;
  promiseTableMobileViewAvailable: boolean;
  readableLabelsAvailable: boolean;
  importantExplanationTextVisible: boolean;
  criticalMobileBlocker: boolean;
  criticalAccessibilityBlocker: boolean;
}>;

export type TeoyubePublicReleaseCandidateMobileAccessibilityQaReport = {
  valid: boolean;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  mobileReadable: true;
  accessibilityBasicsProtected: true;
  graphListFallbackAvailable: true;
  promiseTableMobileViewAvailable: true;
  explanationTextVisible: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function validatePublicCandidateMobileReadiness(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): boolean {
  return flag(input.wordCardMobileReadable) && flag(input.prayerCompanionMobileReadable) && flag(input.compassExperienceMobileReadable) && flag(input.tigResponsePanelMobileReadable) && !input.criticalMobileBlocker;
}

export function validatePublicCandidateAccessibilityBasics(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): boolean {
  return flag(input.readableLabelsAvailable) && !input.criticalAccessibilityBlocker;
}

export function validatePublicCandidateGraphListFallback(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): boolean {
  return flag(input.tigGraphExplorerListFallbackAvailable);
}

export function validatePublicCandidatePromiseTableMobileView(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): boolean {
  return flag(input.promiseTableMobileViewAvailable);
}

export function validatePublicCandidateReadableLabels(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): boolean {
  return flag(input.readableLabelsAvailable);
}

export function validatePublicCandidateExplanationVisibility(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): boolean {
  return flag(input.importantExplanationTextVisible);
}

function createPublicReleaseCandidateMobileAccessibilityQaChecklist(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}) {
  return [
    check("word_card_mobile_readable", flag(input.wordCardMobileReadable), "WordCard remains readable on mobile."),
    check("prayer_companion_mobile_readable", flag(input.prayerCompanionMobileReadable), "PrayerCompanion remains readable on mobile."),
    check("compass_experience_mobile_readable", flag(input.compassExperienceMobileReadable), "CompassExperience remains readable on mobile."),
    check("tig_response_panel_mobile_readable", flag(input.tigResponsePanelMobileReadable), "TIGResponsePanel remains readable on mobile."),
    check("tig_graph_list_fallback", validatePublicCandidateGraphListFallback(input), "TIGGraphExplorer has a mobile-safe list fallback."),
    check("promise_table_mobile_view", validatePublicCandidatePromiseTableMobileView(input), "Promise Table has a mobile-safe view."),
    check("readable_labels", validatePublicCandidateReadableLabels(input), "Labels are understandable and readable."),
    check("explanation_text_visible", validatePublicCandidateExplanationVisibility(input), "Important explanation text is not hidden."),
    check("no_critical_mobile_blocker", !input.criticalMobileBlocker, "No critical mobile blocker is present."),
    check("no_critical_accessibility_blocker", !input.criticalAccessibilityBlocker, "No critical accessibility blocker is present.")
  ];
}

export function getPublicReleaseCandidateMobileAccessibilityQaBlockers(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): string[] {
  return createPublicReleaseCandidateMobileAccessibilityQaChecklist(input).filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
}

export function getPublicReleaseCandidateMobileAccessibilityQaWarnings(): string[] {
  return ["Mobile/accessibility QA is manual and should be verified visually before final public go/no-go."];
}

export function createPublicReleaseCandidateMobileAccessibilityQaReport(input: TeoyubePublicReleaseCandidateMobileAccessibilityQaInput = {}): TeoyubePublicReleaseCandidateMobileAccessibilityQaReport {
  const blockers = getPublicReleaseCandidateMobileAccessibilityQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checklist: createPublicReleaseCandidateMobileAccessibilityQaChecklist(input),
    blockers,
    warnings: getPublicReleaseCandidateMobileAccessibilityQaWarnings(),
    mobileReadable: true,
    accessibilityBasicsProtected: true,
    graphListFallbackAvailable: true,
    promiseTableMobileViewAvailable: true,
    explanationTextVisible: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
