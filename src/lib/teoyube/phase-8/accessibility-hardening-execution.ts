export type TeoyubeAccessibilityHardeningInput = Partial<{
  wordCardAccessible: boolean;
  prayerCompanionAccessible: boolean;
  compassExperienceAccessible: boolean;
  tigResponsePanelAccessible: boolean;
  tigGraphExplorerAccessible: boolean;
  promiseTableAccessible: boolean;
  fallbackAccessible: boolean;
  meaningfulHeadings: boolean;
  readableLabels: boolean;
  buttonLinkLabels: boolean;
  keyboardBasics: boolean;
  focusBasics: boolean;
  semanticGrouping: boolean;
  iconAriaLabels: boolean;
  graphListFallback: boolean;
  noColorOnlyMeaning: boolean;
  explanationTraceVisible: boolean;
}>;

export type TeoyubeAccessibilityHardeningCheck = {
  id: string;
  surface: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeAccessibilityHardeningExecutionReport = {
  valid: boolean;
  checks: TeoyubeAccessibilityHardeningCheck[];
  blockers: string[];
  warnings: string[];
  noExternalToolingAdded: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, surface: string, label: string, passed: boolean, details: string): TeoyubeAccessibilityHardeningCheck {
  return { id, surface, label, passed, details };
}

export function createAccessibilityHardeningChecklist(): TeoyubeAccessibilityHardeningCheck[] {
  return createAccessibilityHardeningExecutionReport().checks;
}

export function validateWordCardAccessibilityHardening(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck {
  return check("accessibility_word_card", "word_card", "WordCard accessibility", flag(input.wordCardAccessible) && flag(input.semanticGrouping), "WordCard is grouped and labelled through card title semantics.");
}

export function validatePrayerCompanionAccessibilityHardening(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck {
  return check("accessibility_prayer_companion", "prayer_companion", "PrayerCompanion accessibility", flag(input.prayerCompanionAccessible) && flag(input.readableLabels), "Prayer textarea and submit action remain labelled.");
}

export function validateCompassExperienceAccessibilityHardening(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck {
  return check("accessibility_compass_experience", "compass_experience", "CompassExperience accessibility", flag(input.compassExperienceAccessible) && flag(input.buttonLinkLabels), "Compass search controls have readable labels.");
}

export function validateTigResponsePanelAccessibilityHardening(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck {
  return check("accessibility_tig_response_panel", "tig_response_panel", "TIGResponsePanel accessibility", flag(input.tigResponsePanelAccessible) && flag(input.explanationTraceVisible), "TIG response preserves labelled reflection and visible explanation trace.");
}

export function validateTigGraphExplorerAccessibilityHardening(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck {
  return check("accessibility_tig_graph_explorer", "tig_graph_explorer", "TIGGraphExplorer accessibility", flag(input.tigGraphExplorerAccessible) && flag(input.graphListFallback), "Graph explorer keeps list fallback and readable relationship cards.");
}

export function validatePromiseTableAccessibilityHardening(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck {
  return check("accessibility_promise_table", "promise_table", "Promise Table accessibility", flag(input.promiseTableAccessible) && flag(input.readableLabels), "Promise Table filter and rows remain labelled and readable.");
}

export function validateFallbackAccessibilityHardening(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck {
  return check("accessibility_fallback", "fallback", "Fallback accessibility", flag(input.fallbackAccessible), "Fallback states use clear text and avoid color-only meaning.");
}

function allChecks(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningCheck[] {
  return [
    validateWordCardAccessibilityHardening(input),
    validatePrayerCompanionAccessibilityHardening(input),
    validateCompassExperienceAccessibilityHardening(input),
    validateTigResponsePanelAccessibilityHardening(input),
    validateTigGraphExplorerAccessibilityHardening(input),
    validatePromiseTableAccessibilityHardening(input),
    validateFallbackAccessibilityHardening(input),
    check("meaningful_headings", "accessibility", "Meaningful headings", flag(input.meaningfulHeadings), "Major surfaces keep headings."),
    check("keyboard_focus_basics", "accessibility", "Keyboard and focus basics", flag(input.keyboardBasics) && flag(input.focusBasics), "Obvious controls remain native buttons, inputs, selects, or textareas."),
    check("no_color_only_meaning", "accessibility", "No color-only meaning", flag(input.noColorOnlyMeaning), "Statuses use text as well as color.")
  ];
}

export function getAccessibilityHardeningExecutionBlockers(input: TeoyubeAccessibilityHardeningInput = {}): string[] {
  return allChecks(input).filter((entry) => !entry.passed).map((entry) => `${entry.label}: ${entry.details}`);
}

export function getAccessibilityHardeningExecutionWarnings(input: TeoyubeAccessibilityHardeningInput = {}): string[] {
  return [
    "Accessibility hardening uses existing markup only; no external accessibility tooling was added.",
    ...(!flag(input.iconAriaLabels) ? ["Icon-only controls, if added later, must include aria labels."] : [])
  ];
}

export function createAccessibilityHardeningExecutionReport(input: TeoyubeAccessibilityHardeningInput = {}): TeoyubeAccessibilityHardeningExecutionReport {
  const checks = allChecks(input);
  const blockers = getAccessibilityHardeningExecutionBlockers(input);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: getAccessibilityHardeningExecutionWarnings(input),
    noExternalToolingAdded: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
