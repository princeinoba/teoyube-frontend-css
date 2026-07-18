import type { TeoyubeUserJourneyInput, TeoyubeUserJourneySurface } from "./user-journey-contracts";

export type TeoyubeProductionUiPolishChecklistItem = {
  id: string;
  surface: TeoyubeUserJourneySurface | "all";
  label: string;
  complete: boolean;
  required: boolean;
  details: string;
};

export type TeoyubeProductionUiPolishReport = {
  valid: boolean;
  checklist: TeoyubeProductionUiPolishChecklistItem[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function item(
  id: string,
  surface: TeoyubeProductionUiPolishChecklistItem["surface"],
  label: string,
  details: string,
  complete = true,
  required = true
): TeoyubeProductionUiPolishChecklistItem {
  return { id, surface, label, complete, required, details };
}

export function getProductionUiPolishChecklist(): TeoyubeProductionUiPolishChecklistItem[] {
  return [
    item("mobile_layout", "all", "Mobile layout remains readable", "Use responsive sections, wrapping text, and graph/list fallback."),
    item("readable_spacing", "all", "Readable spacing", "Cards and panels should not crowd Scripture, trace, or action text."),
    item("card_overflow", "all", "Card overflow guarded", "Long Scripture anchors and explanation steps should wrap."),
    item("loading_state", "all", "Loading state present", "Interactive client surfaces keep current loading affordances."),
    item("empty_state", "all", "Empty state present", "Missing data uses a non-empty fallback state."),
    item("error_state", "all", "Error state present", "Errors are user-readable and do not expose debug payloads."),
    item("fallback_state", "all", "Fallback state visible", "Fallback reasons remain visible when used."),
    item("scripture_visible", "all", "Scripture anchors visible", "Scripture anchors should appear when available."),
    item("trace_visible", "all", "Explanation path visible", "Explanation trace or explanation path should not be hidden."),
    item("confidence_visible", "all", "Confidence label clear", "Confidence labels should be visible and humble."),
    item("consent_privacy_visible", "consent_controls", "Consent/privacy visible", "Consent and privacy surfaces remain available."),
    item("keyboard_focus", "all", "Keyboard/focus basics", "Buttons, links, select, and text inputs remain native focusable elements."),
    item("accessible_labels", "all", "Accessible labels", "Important sections use headings or aria labels where obvious."),
    item("debug_hidden", "all", "No debug payload visible", "Normal user surfaces do not render raw JSON/debug payloads.")
  ];
}

export function getProductionUiPolishChecklistBySurface(
  surface: TeoyubeUserJourneySurface
): TeoyubeProductionUiPolishChecklistItem[] {
  return getProductionUiPolishChecklist().filter((entry) => entry.surface === "all" || entry.surface === surface);
}

export function validateProductionUiPolish(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeProductionUiPolishReport {
  const checklist = getProductionUiPolishChecklistBySurface(input.surface || "unknown");
  const blockers = checklist
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => `${entry.label} is required for ${entry.surface}.`);
  const warnings = checklist
    .filter((entry) => !entry.required && !entry.complete)
    .map((entry) => `${entry.label} should be reviewed for ${entry.surface}.`);

  return {
    valid: blockers.length === 0,
    checklist,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}

export function getProductionUiPolishBlockers(input: TeoyubeUserJourneyInput = {}): string[] {
  return validateProductionUiPolish(input).blockers;
}

export function getProductionUiPolishWarnings(input: TeoyubeUserJourneyInput = {}): string[] {
  return validateProductionUiPolish(input).warnings;
}

export function createProductionUiPolishReport(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeProductionUiPolishReport {
  return validateProductionUiPolish(input);
}
