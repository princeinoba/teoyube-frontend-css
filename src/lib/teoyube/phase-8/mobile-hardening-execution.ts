export type TeoyubeMobileHardeningInput = Partial<{
  wordCardReadable: boolean;
  prayerCompanionReadable: boolean;
  compassExperienceReadable: boolean;
  tigResponsePanelReadable: boolean;
  tigGraphExplorerReadable: boolean;
  promiseTableReadable: boolean;
  fallbackStatesReadable: boolean;
  noCriticalHorizontalOverflow: boolean;
  graphListFallbackAvailable: boolean;
  promiseTableMobileSafe: boolean;
  explanationTextVisible: boolean;
  scriptureAnchorsVisible: boolean;
  confidenceLabelsVisible: boolean;
  controlsReachable: boolean;
}>;

export type TeoyubeMobileHardeningCheck = {
  id: string;
  surface: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeMobileHardeningExecutionReport = {
  valid: boolean;
  checks: TeoyubeMobileHardeningCheck[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, surface: string, label: string, passed: boolean, details: string): TeoyubeMobileHardeningCheck {
  return { id, surface, label, passed, details };
}

export function createMobileHardeningChecklist(): TeoyubeMobileHardeningCheck[] {
  return createMobileHardeningExecutionReport().checks;
}

export function validateMobileWordCardHardening(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck {
  return check("mobile_word_card", "word_card", "WordCard mobile readability", flag(input.wordCardReadable) && flag(input.scriptureAnchorsVisible), "WordCard keeps readable layout and Scripture anchors on mobile.");
}

export function validateMobilePrayerCompanionHardening(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck {
  return check("mobile_prayer_companion", "prayer_companion", "PrayerCompanion mobile readability", flag(input.prayerCompanionReadable) && flag(input.explanationTextVisible), "Prayer guidance, devotional boundary, and explanation text remain readable.");
}

export function validateMobileCompassExperienceHardening(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck {
  return check("mobile_compass_experience", "compass_experience", "CompassExperience mobile readability", flag(input.compassExperienceReadable) && flag(input.controlsReachable), "Compass controls remain reachable and automatic fetching is avoided.");
}

export function validateMobileTigResponsePanelHardening(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck {
  return check("mobile_tig_response_panel", "tig_response_panel", "TIGResponsePanel mobile readability", flag(input.tigResponsePanelReadable) && flag(input.confidenceLabelsVisible) && flag(input.explanationTextVisible), "TIG response keeps confidence and explanation text visible.");
}

export function validateMobileTigGraphExplorerHardening(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck {
  return check("mobile_tig_graph_explorer", "tig_graph_explorer", "TIGGraphExplorer mobile fallback", flag(input.tigGraphExplorerReadable) && flag(input.graphListFallbackAvailable), "Graph explorer keeps readable list fallback.");
}

export function validateMobilePromiseTableHardening(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck {
  return check("mobile_promise_table", "promise_table", "Promise Table mobile view", flag(input.promiseTableReadable) && flag(input.promiseTableMobileSafe), "Promise Table keeps mobile-safe filtering and row readability.");
}

export function validateMobileFallbackStatesHardening(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck {
  return check("mobile_fallback_states", "fallback", "Fallback states readable", flag(input.fallbackStatesReadable), "Fallback and empty states remain readable and bounded.");
}

function allChecks(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningCheck[] {
  return [
    validateMobileWordCardHardening(input),
    validateMobilePrayerCompanionHardening(input),
    validateMobileCompassExperienceHardening(input),
    validateMobileTigResponsePanelHardening(input),
    validateMobileTigGraphExplorerHardening(input),
    validateMobilePromiseTableHardening(input),
    validateMobileFallbackStatesHardening(input),
    check("mobile_no_critical_overflow", "mobile", "No critical horizontal overflow", flag(input.noCriticalHorizontalOverflow), "Cards, lists, and tables use wrapping or list fallback.")
  ];
}

export function getMobileHardeningExecutionBlockers(input: TeoyubeMobileHardeningInput = {}): string[] {
  return allChecks(input).filter((entry) => !entry.passed).map((entry) => `${entry.label}: ${entry.details}`);
}

export function getMobileHardeningExecutionWarnings(input: TeoyubeMobileHardeningInput = {}): string[] {
  return [
    "Mobile hardening is a manual/static review helper and does not run device automation.",
    ...(!flag(input.controlsReachable) ? ["Important controls should be rechecked manually on small screens."] : [])
  ];
}

export function createMobileHardeningExecutionReport(input: TeoyubeMobileHardeningInput = {}): TeoyubeMobileHardeningExecutionReport {
  const checks = allChecks(input);
  const blockers = getMobileHardeningExecutionBlockers(input);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: getMobileHardeningExecutionWarnings(input),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
