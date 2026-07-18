export type TeoyubeBetaMobileAccessibilityQaInput = {
  wordCardMobileReadable?: boolean;
  prayerCompanionMobileReadable?: boolean;
  compassExperienceMobileReadable?: boolean;
  tigResponsePanelMobileReadable?: boolean;
  tigGraphListFallbackAvailable?: boolean;
  promiseTableMobileViewAvailable?: boolean;
  labelsReadable?: boolean;
  explanationTextVisible?: boolean;
  scriptureAnchorsVisible?: boolean;
  confidenceLabelsVisible?: boolean;
  keyboardBasicsPass?: boolean;
  accessibilityBasicsPass?: boolean;
  criticalMobileBlocker?: boolean;
  criticalAccessibilityBlocker?: boolean;
};

export type TeoyubeBetaMobileAccessibilityQaCheck = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
};

export type TeoyubeBetaMobileAccessibilityQaReport = {
  valid: boolean;
  checks: TeoyubeBetaMobileAccessibilityQaCheck[];
  blockers: string[];
  warnings: string[];
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, label: string, passed: boolean, details: string, required = true): TeoyubeBetaMobileAccessibilityQaCheck {
  return { id, label, passed, required, details };
}

export function validateBetaMobileReadiness(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaCheck {
  const passed = input.criticalMobileBlocker !== true &&
    input.wordCardMobileReadable !== false &&
    input.prayerCompanionMobileReadable !== false &&
    input.compassExperienceMobileReadable !== false &&
    input.tigResponsePanelMobileReadable !== false;
  return check("beta_mobile_readiness", "Core surfaces are readable on mobile", passed, "WordCard, PrayerCompanion, CompassExperience, and TIGResponsePanel must remain readable on small screens.");
}

export function validateBetaAccessibilityBasics(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaCheck {
  return check("beta_accessibility_basics", "Accessibility basics pass", input.criticalAccessibilityBlocker !== true && input.accessibilityBasicsPass !== false, "Headings, labels, focus order, and assistive text need manual review.");
}

export function validateBetaKeyboardBasics(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaCheck {
  return check("beta_keyboard_basics", "Keyboard basics pass", input.keyboardBasicsPass !== false, "Interactive beta surfaces should remain keyboard reachable where applicable.");
}

export function validateBetaGraphListFallback(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaCheck {
  return check("beta_graph_list_fallback", "TIGGraphExplorer has list fallback", input.tigGraphListFallbackAvailable !== false, "Dense graph output must have a mobile-safe list fallback.");
}

export function validateBetaPromiseTableMobileView(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaCheck {
  return check("beta_promise_table_mobile", "Promise Table has mobile-safe view", input.promiseTableMobileViewAvailable !== false, "Promise rows, Scripture anchors, and filters must remain usable on mobile.");
}

export function validateBetaReadableLabels(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaCheck {
  return check("beta_readable_labels", "Important labels remain readable", input.labelsReadable !== false && input.explanationTextVisible !== false && input.scriptureAnchorsVisible !== false && input.confidenceLabelsVisible !== false, "Explanation text, Scripture anchors, and confidence labels must not be hidden.");
}

export function createBetaMobileAccessibilityChecklist(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaCheck[] {
  return [
    validateBetaMobileReadiness(input),
    validateBetaAccessibilityBasics(input),
    validateBetaKeyboardBasics(input),
    validateBetaGraphListFallback(input),
    validateBetaPromiseTableMobileView(input),
    validateBetaReadableLabels(input)
  ];
}

export function getBetaMobileAccessibilityQaBlockers(input: TeoyubeBetaMobileAccessibilityQaInput = {}): string[] {
  return createBetaMobileAccessibilityChecklist(input)
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getBetaMobileAccessibilityQaWarnings(input: TeoyubeBetaMobileAccessibilityQaInput = {}): string[] {
  return [
    ...(input.criticalMobileBlocker ? ["Critical mobile blocker requires Phase 5.3 remediation before beta execution."] : []),
    ...(input.criticalAccessibilityBlocker ? ["Critical accessibility blocker requires Phase 5.3 remediation before beta execution."] : []),
    "Manual device and assistive-technology review still needs a human reviewer."
  ];
}

export function createBetaMobileAccessibilityQaReport(input: TeoyubeBetaMobileAccessibilityQaInput = {}): TeoyubeBetaMobileAccessibilityQaReport {
  const blockers = getBetaMobileAccessibilityQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checks: createBetaMobileAccessibilityChecklist(input),
    blockers,
    warnings: getBetaMobileAccessibilityQaWarnings(input),
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
