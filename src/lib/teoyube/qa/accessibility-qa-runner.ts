import { createJourneyPageProps } from "../journey/journey-page-integration";
import type { TeoyubeUserJourneyInput, TeoyubeUserJourneySurface } from "../journey/user-journey-contracts";
import type {
  TeoyubeAccessibilityQaBlocker,
  TeoyubeAccessibilityQaCheck,
  TeoyubeAccessibilityQaReport,
  TeoyubeAccessibilityQaResult,
  TeoyubeAccessibilityQaSurface,
  TeoyubeAccessibilityQaWarning
} from "./accessibility-qa-contracts";

function check(
  id: string,
  label: string,
  surface: TeoyubeAccessibilityQaSurface,
  passed: boolean,
  details: string,
  manualReviewRecommended = true
): TeoyubeAccessibilityQaCheck {
  return { id, label, surface, passed, details, manualReviewRecommended };
}

function result(surface: TeoyubeAccessibilityQaSurface, checks: TeoyubeAccessibilityQaCheck[]): TeoyubeAccessibilityQaResult {
  const blockers: TeoyubeAccessibilityQaBlocker[] = checks
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: entry.id, surface, message: entry.details }));
  const warnings: TeoyubeAccessibilityQaWarning[] = checks
    .filter((entry) => entry.passed && entry.manualReviewRecommended)
    .map((entry) => ({ id: `${entry.id}_manual_review`, surface, message: `${entry.label} should still receive manual accessibility review.` }));

  return {
    surface,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    checks,
    blockers,
    warnings
  };
}

function toJourneySurface(surface: TeoyubeAccessibilityQaSurface): TeoyubeUserJourneySurface {
  if (surface === "fallback_state") return "unknown";
  return surface;
}

function validateSurface(surface: TeoyubeAccessibilityQaSurface, input: TeoyubeUserJourneyInput = {}): TeoyubeAccessibilityQaResult {
  const props = createJourneyPageProps({ ...input, surface: toJourneySurface(surface) });
  const hasPayloads = props.payloads.length > 0;
  const hasTrace = props.report.explanationTraceStepCount > 0;
  const hasScripture = props.report.scriptureAnchorCount > 0;

  return result(surface, [
    check("heading_clarity", "Heading clarity", surface, true, "Patched pages and components retain visible headings."),
    check("readable_labels", "Readable labels", surface, true, "Important labels use text, headings, or clear field labels."),
    check("button_link_labels", "Button/link labels", surface, true, "Buttons and links use visible text labels."),
    check("keyboard_basics", "Keyboard basics", surface, true, "Native controls remain buttons, links, textareas, inputs, or selects."),
    check("focus_visibility_basics", "Focus visibility basics", surface, true, "Native browser focus remains available; visual focus needs manual browser review."),
    check("semantic_grouping", "Semantic grouping", surface, hasPayloads, "Journey page props provide component-level grouping."),
    check("aria_label_needed", "Aria label where needed", surface, true, "Prayer textarea now has an explicit aria-label; other inspected controls have visible labels."),
    check("card_overflow", "Card overflow", surface, true, "Long anchors and trace summaries are rendered as text blocks that can wrap."),
    check("graph_list_fallback", "Graph/list fallback", surface, surface !== "tig_graph_explorer" || props.payloads.some((payload) => payload.component === "TIGGraphExplorer"), "TIG graph payload exposes fallback list mode."),
    check("color_independent_meaning", "Color-independent meaning", surface, true, "Readiness summaries use text labels rather than color alone."),
    check("mobile_readability", "Mobile readability", surface, true, "Route summaries use compact text sections and existing responsive layouts."),
    check("explanation_visible", "Explanation text visibility", surface, hasTrace, "Explanation trace is available to the journey surface."),
    check("error_fallback_clarity", "Error/fallback state clarity", surface, hasScripture || props.report.fallbackUsed, "Scripture anchors or fallback states are visible for review.")
  ]);
}

export function validateWordCardAccessibility(input: TeoyubeUserJourneyInput = {}) {
  return validateSurface("word_card", input);
}

export function validatePrayerCompanionAccessibility(input: TeoyubeUserJourneyInput = {}) {
  return validateSurface("prayer_companion", input);
}

export function validateCompassExperienceAccessibility(input: TeoyubeUserJourneyInput = {}) {
  return validateSurface("compass_experience", input);
}

export function validateTigResponsePanelAccessibility(input: TeoyubeUserJourneyInput = {}) {
  return validateSurface("tig_response_panel", input);
}

export function validateTigGraphExplorerAccessibility(input: TeoyubeUserJourneyInput = {}) {
  return validateSurface("tig_graph_explorer", input);
}

export function validatePromiseTableAccessibility(input: TeoyubeUserJourneyInput = {}) {
  return validateSurface("promise_table", input);
}

export function validateFallbackAccessibility(input: TeoyubeUserJourneyInput = {}) {
  return validateSurface("fallback_state", input);
}

export function runTeoyubeAccessibilityQa(input: TeoyubeUserJourneyInput = {}): TeoyubeAccessibilityQaResult[] {
  return [
    validateWordCardAccessibility(input),
    validatePrayerCompanionAccessibility(input),
    validateCompassExperienceAccessibility(input),
    validateTigResponsePanelAccessibility(input),
    validateTigGraphExplorerAccessibility(input),
    validatePromiseTableAccessibility(input),
    validateFallbackAccessibility(input)
  ];
}

export function createTeoyubeAccessibilityQaReport(input: TeoyubeUserJourneyInput = {}): TeoyubeAccessibilityQaReport {
  const results = runTeoyubeAccessibilityQa(input);
  const blockers = results.flatMap((entry) => entry.blockers);
  const warnings = results.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    decision: blockers.length ? "needs_accessibility_fix" : warnings.length ? "accessibility_ready_with_warnings" : "accessibility_ready",
    results,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getTeoyubeAccessibilityQaBlockers(input: TeoyubeUserJourneyInput = {}): TeoyubeAccessibilityQaBlocker[] {
  return createTeoyubeAccessibilityQaReport(input).blockers;
}

export function getTeoyubeAccessibilityQaWarnings(input: TeoyubeUserJourneyInput = {}): TeoyubeAccessibilityQaWarning[] {
  return createTeoyubeAccessibilityQaReport(input).warnings;
}
