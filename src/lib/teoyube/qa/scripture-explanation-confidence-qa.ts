import { createUserJourney } from "../journey/user-journey-orchestrator";
import type { TeoyubeUserJourneyInput } from "../journey/user-journey-contracts";
import type { TeoyubeRealUserJourneyQaSurface } from "./real-user-journey-qa-contracts";

export type TeoyubeScriptureExplanationConfidenceQaStatus = "passed" | "passed_with_warnings" | "blocked";

export type TeoyubeScriptureExplanationConfidenceQaBlocker = {
  id: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  message: string;
};

export type TeoyubeScriptureExplanationConfidenceQaWarning = {
  id: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  message: string;
};

export type TeoyubeScriptureExplanationConfidenceQaCheck = {
  id: string;
  label: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  passed: boolean;
  details: string;
};

export type TeoyubeScriptureExplanationConfidenceQaReport = {
  valid: boolean;
  status: TeoyubeScriptureExplanationConfidenceQaStatus;
  checks: TeoyubeScriptureExplanationConfidenceQaCheck[];
  blockers: TeoyubeScriptureExplanationConfidenceQaBlocker[];
  warnings: TeoyubeScriptureExplanationConfidenceQaWarning[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function surfaceFromInput(input: TeoyubeUserJourneyInput): TeoyubeRealUserJourneyQaSurface {
  return input.surface || "unknown";
}

function check(
  id: string,
  label: string,
  surface: TeoyubeRealUserJourneyQaSurface,
  passed: boolean,
  details: string
): TeoyubeScriptureExplanationConfidenceQaCheck {
  return { id, label, surface, passed, details };
}

function userVisibleText(input: TeoyubeUserJourneyInput): string {
  const journey = createUserJourney(input);
  return [
    journey.inputSummary,
    journey.recommendation?.selectedLabel,
    journey.recommendation?.fallbackReason,
    journey.explanationTrace?.summary,
    ...(journey.explanationTrace?.steps.map((entry) => `${entry.label} ${entry.summary}`) || []),
    journey.fallback?.message,
    ...journey.steps.map((entry) => `${entry.label} ${entry.summary} ${entry.fallbackReason || ""}`),
    ...journey.warnings.map((entry) => entry.message)
  ]
    .filter(Boolean)
    .join(" ");
}

export function validateScriptureAnchorVisibility(input: TeoyubeUserJourneyInput = {}): TeoyubeScriptureExplanationConfidenceQaCheck {
  const journey = createUserJourney(input);
  const surface = surfaceFromInput(input);
  const promiseWithoutAnchor = journey.recommendation?.selectedType === "promise" && journey.scriptureAnchors.length === 0;
  return check(
    "scripture_anchor_visibility",
    "Scripture anchor visibility",
    surface,
    journey.scriptureAnchors.length > 0 && !promiseWithoutAnchor,
    "Selected promises and user-facing journey surfaces must expose Scripture anchors when available."
  );
}

export function validateExplanationTraceVisibility(input: TeoyubeUserJourneyInput = {}): TeoyubeScriptureExplanationConfidenceQaCheck {
  const journey = createUserJourney(input);
  return check(
    "explanation_trace_visibility",
    "Explanation trace visibility",
    surfaceFromInput(input),
    Boolean(journey.explanationTrace?.steps.length && journey.explanationTrace.safeForNormalUsers),
    "TIG, calling, prayer, and action flows must preserve normal-user visible explanation trace steps."
  );
}

export function validateConfidenceLabelVisibility(input: TeoyubeUserJourneyInput = {}): TeoyubeScriptureExplanationConfidenceQaCheck {
  const journey = createUserJourney(input);
  return check(
    "confidence_label_visibility",
    "Confidence label visibility",
    surfaceFromInput(input),
    Boolean(journey.confidenceLabel && journey.recommendation?.confidenceLabel),
    "Confidence labels must remain present and bounded."
  );
}

export function validateNoDivineCertaintyLanguage(input: TeoyubeUserJourneyInput = {}): TeoyubeScriptureExplanationConfidenceQaCheck {
  const text = userVisibleText(input);
  const unsafePattern = /\b(God told|must be your calling|guaranteed outcome|will definitely)\b/i;
  return check(
    "no_divine_certainty_language",
    "No certainty overclaiming language",
    surfaceFromInput(input),
    !unsafePattern.test(text),
    "User-facing journey copy should remain humble, bounded, and review-oriented."
  );
}

export function validateFallbackExplanationSafety(input: TeoyubeUserJourneyInput = {}): TeoyubeScriptureExplanationConfidenceQaCheck {
  const journey = createUserJourney(input);
  const fallbackSafe = !journey.fallback?.used || Boolean(journey.fallback.message && journey.fallback.safe && journey.fallback.reason);
  const fallbackExplained = !journey.fallback?.used || Boolean(journey.explanationTrace?.steps.length || journey.fallback.scriptureAnchors.length);
  return check(
    "fallback_explanation_safety",
    "Fallback explanation safety",
    surfaceFromInput(input),
    fallbackSafe && fallbackExplained,
    "Fallback states must be safe, non-empty, and explain why the fallback was used."
  );
}

export function createScriptureExplanationConfidenceQaReport(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeScriptureExplanationConfidenceQaReport {
  const checks = [
    validateScriptureAnchorVisibility(input),
    validateExplanationTraceVisibility(input),
    validateConfidenceLabelVisibility(input),
    validateNoDivineCertaintyLanguage(input),
    validateFallbackExplanationSafety(input)
  ];
  const blockers = checks
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: entry.id, surface: entry.surface, message: entry.details }));
  const warnings = createUserJourney(input).warnings.map((entry) => ({
    id: entry.id,
    surface: surfaceFromInput(input),
    message: entry.message
  }));

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    checks,
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

export function getScriptureExplanationConfidenceQaBlockers(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeScriptureExplanationConfidenceQaBlocker[] {
  return createScriptureExplanationConfidenceQaReport(input).blockers;
}

export function getScriptureExplanationConfidenceQaWarnings(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeScriptureExplanationConfidenceQaWarning[] {
  return createScriptureExplanationConfidenceQaReport(input).warnings;
}
