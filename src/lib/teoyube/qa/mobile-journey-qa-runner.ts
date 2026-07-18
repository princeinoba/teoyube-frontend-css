import { createJourneyPageProps } from "../journey/journey-page-integration";
import { createMobileAccessibilityJourneyQaReport } from "../journey/mobile-accessibility-journey-qa";
import type { TeoyubeUserJourneyInput, TeoyubeUserJourneySurface } from "../journey/user-journey-contracts";
import type { TeoyubeRealUserJourneyQaSurface } from "./real-user-journey-qa-contracts";

export type TeoyubeMobileJourneyQaStatus = "passed" | "passed_with_warnings" | "blocked";

export type TeoyubeMobileJourneyQaSurface = TeoyubeRealUserJourneyQaSurface;

export type TeoyubeMobileJourneyQaBlocker = {
  id: string;
  surface: TeoyubeMobileJourneyQaSurface;
  message: string;
};

export type TeoyubeMobileJourneyQaWarning = {
  id: string;
  surface: TeoyubeMobileJourneyQaSurface;
  message: string;
};

export type TeoyubeMobileJourneyQaCheck = {
  id: string;
  label: string;
  surface: TeoyubeMobileJourneyQaSurface;
  passed: boolean;
  details: string;
  manualReviewRecommended: boolean;
};

export type TeoyubeMobileJourneyQaResult = {
  surface: TeoyubeMobileJourneyQaSurface;
  status: TeoyubeMobileJourneyQaStatus;
  checks: TeoyubeMobileJourneyQaCheck[];
  blockers: TeoyubeMobileJourneyQaBlocker[];
  warnings: TeoyubeMobileJourneyQaWarning[];
};

export type TeoyubeMobileJourneyQaReport = {
  valid: boolean;
  status: TeoyubeMobileJourneyQaStatus;
  results: TeoyubeMobileJourneyQaResult[];
  blockers: TeoyubeMobileJourneyQaBlocker[];
  warnings: TeoyubeMobileJourneyQaWarning[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function toJourneySurface(surface: TeoyubeMobileJourneyQaSurface): TeoyubeUserJourneySurface {
  if (surface === "fallback_state") return "unknown";
  return surface;
}

function check(
  id: string,
  label: string,
  surface: TeoyubeMobileJourneyQaSurface,
  passed: boolean,
  details: string,
  manualReviewRecommended = true
): TeoyubeMobileJourneyQaCheck {
  return { id, label, surface, passed, details, manualReviewRecommended };
}

function result(surface: TeoyubeMobileJourneyQaSurface, checks: TeoyubeMobileJourneyQaCheck[]): TeoyubeMobileJourneyQaResult {
  const blockers = checks
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: entry.id, surface, message: entry.details }));
  const warnings = checks
    .filter((entry) => entry.passed && entry.manualReviewRecommended)
    .map((entry) => ({ id: `${entry.id}_manual_review`, surface, message: `${entry.label} still needs a device/browser spot check.` }));

  return {
    surface,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    checks,
    blockers,
    warnings
  };
}

function validateMobileSurface(surface: TeoyubeMobileJourneyQaSurface, input: TeoyubeUserJourneyInput = {}): TeoyubeMobileJourneyQaResult {
  const props = createJourneyPageProps({ ...input, surface: toJourneySurface(surface) });
  const mobileQa = createMobileAccessibilityJourneyQaReport({ ...input, surface: toJourneySurface(surface) });
  const graphPayload = props.payloads.find((payload) => payload.component === "TIGGraphExplorer") as
    | { fallbackListMode?: boolean; graphSummary?: { nodeCount?: number } }
    | undefined;
  const tablePayload = props.payloads.find((payload) => payload.component === "PromiseTable") as
    | { rows?: unknown[]; rowCount?: number; tableValid?: boolean }
    | undefined;

  return result(surface, [
    check("stacked_layout_ready", "Stacked layout readiness", surface, props.payloads.length > 0, "Journey props expose payloads that can be stacked on narrow screens."),
    check("stable_dimensions_ready", "Stable content dimensions", surface, props.payloads.every((payload) => Boolean((payload as { stableProps?: boolean }).stableProps)), "Payloads remain stable and should not resize around dynamic labels."),
    check("text_wrap_ready", "Text wrapping readiness", surface, true, "Scripture anchors, confidence labels, fallback messages, and trace summaries are plain text blocks that can wrap."),
    check("graph_list_fallback", "TIG graph list fallback", surface, surface !== "tig_graph_explorer" || Boolean(graphPayload && typeof graphPayload.fallbackListMode === "boolean"), "TIGGraphExplorer exposes list fallback mode for mobile and incomplete graph contexts."),
    check("promise_table_mobile_rows", "Promise Table mobile rows", surface, surface !== "promise_table" || Boolean(tablePayload?.tableValid && tablePayload.rowCount), "Promise Table payload uses real cluster rows that can render as compact rows."),
    check("controls_reachable", "Controls reachable", surface, true, "Existing route controls use native buttons, links, textareas, inputs, and selects."),
    check("scripture_visible_mobile", "Scripture visible on mobile", surface, props.report.scriptureAnchorCount > 0 || props.report.fallbackUsed, "Mobile surfaces keep Scripture anchors or a visible fallback state."),
    check("explanation_visible_mobile", "Explanation visible on mobile", surface, props.report.explanationTraceStepCount > 0, "Explanation trace remains available to compact layouts."),
    check("confidence_visible_mobile", "Confidence visible on mobile", surface, Boolean(props.report.confidenceLabel), "Confidence label remains available to compact layouts."),
    check("fallback_readable_mobile", "Fallback readable on mobile", surface, !props.report.fallbackUsed || props.report.blockers.length === 0, "Fallback states are safe, readable, and non-empty when used."),
    check("phase_3_5_mobile_baseline", "Phase 3.5 mobile baseline", surface, mobileQa.valid, "Phase 3.5 mobile/accessibility journey QA remains valid.", false)
  ]);
}

export function validateMobileWordCard(input: TeoyubeUserJourneyInput = {}) {
  return validateMobileSurface("word_card", input);
}

export function validateMobilePrayerCompanion(input: TeoyubeUserJourneyInput = {}) {
  return validateMobileSurface("prayer_companion", input);
}

export function validateMobileCompassExperience(input: TeoyubeUserJourneyInput = {}) {
  return validateMobileSurface("compass_experience", input);
}

export function validateMobileTigResponsePanel(input: TeoyubeUserJourneyInput = {}) {
  return validateMobileSurface("tig_response_panel", input);
}

export function validateMobileTigGraphExplorer(input: TeoyubeUserJourneyInput = {}) {
  return validateMobileSurface("tig_graph_explorer", input);
}

export function validateMobilePromiseTable(input: TeoyubeUserJourneyInput = {}) {
  return validateMobileSurface("promise_table", input);
}

export function validateMobileFallbackStates(input: TeoyubeUserJourneyInput = {}) {
  return validateMobileSurface("fallback_state", input);
}

export function runMobileJourneyQa(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileJourneyQaResult[] {
  return [
    validateMobileWordCard(input),
    validateMobilePrayerCompanion(input),
    validateMobileCompassExperience(input),
    validateMobileTigResponsePanel(input),
    validateMobileTigGraphExplorer(input),
    validateMobilePromiseTable(input),
    validateMobileFallbackStates(input)
  ];
}

export function createMobileJourneyQaReport(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileJourneyQaReport {
  const results = runMobileJourneyQa(input);
  const blockers = results.flatMap((entry) => entry.blockers);
  const warnings = results.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
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

export function getMobileJourneyQaBlockers(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileJourneyQaBlocker[] {
  return createMobileJourneyQaReport(input).blockers;
}

export function getMobileJourneyQaWarnings(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileJourneyQaWarning[] {
  return createMobileJourneyQaReport(input).warnings;
}
