import { createJourneySurfacePayload, createUserJourney } from "../journey/user-journey-orchestrator";
import {
  createCallingJourneyQaScenario,
  createFallbackJourneyQaScenario,
  createPrayerJourneyQaScenario,
  createPromiseJourneyQaScenario,
  createWordJourneyQaScenario,
  getRealUserJourneyQaScenarios
} from "./real-user-journey-qa-scenarios";
import type {
  TeoyubeRealUserJourneyQaBlocker,
  TeoyubeRealUserJourneyQaDecision,
  TeoyubeRealUserJourneyQaResult,
  TeoyubeRealUserJourneyQaScenario,
  TeoyubeRealUserJourneyQaStep,
  TeoyubeRealUserJourneyQaSurface,
  TeoyubeRealUserJourneyQaWarning
} from "./real-user-journey-qa-contracts";

function blocker(surface: TeoyubeRealUserJourneyQaSurface, id: string, message: string): TeoyubeRealUserJourneyQaBlocker {
  return { id, surface, message };
}

function warning(surface: TeoyubeRealUserJourneyQaSurface, id: string, message: string): TeoyubeRealUserJourneyQaWarning {
  return { id, surface, message };
}

function step(
  id: string,
  label: string,
  surface: TeoyubeRealUserJourneyQaSurface,
  passed: boolean,
  details: string,
  blockers: TeoyubeRealUserJourneyQaBlocker[] = [],
  warnings: TeoyubeRealUserJourneyQaWarning[] = []
): TeoyubeRealUserJourneyQaStep {
  return { id, label, surface, passed, details, blockers, warnings };
}

export function runRealUserJourneyQaScenario(
  scenario: TeoyubeRealUserJourneyQaScenario
): TeoyubeRealUserJourneyQaResult {
  const journey = createUserJourney(scenario.input);
  const payloads = scenario.expectedSurfaces.map((surface) => createJourneySurfacePayload(journey, surface));
  const steps = [
    step("state_initializes", "Journey state initializes safely", scenario.surface, journey.inMemoryOnly && journey.sensitiveInputCleared, "Journey state remains in memory and raw input is cleared."),
    step("real_data_loads", "Real data loads", scenario.surface, Boolean(journey.recommendation), "Journey created a recommendation from existing data and engines."),
    step("tig_flow_completes", "TIG recommendation flow completes", scenario.surface, Boolean(journey.recommendation?.sourceResult.valid), "TIG end-to-end recommendation result is structured."),
    step("payloads_stable", "UI payloads are stable", scenario.surface, payloads.every((payload) => payload.stableProps), "Expected UI payload adapters returned stable props."),
    step("scripture_visible", "Scripture anchors appear where available", scenario.surface, journey.scriptureAnchors.length > 0, "Journey exposes Scripture anchors for user-facing review."),
    step("trace_visible", "Explanation trace appears", scenario.surface, Boolean(journey.explanationTrace?.steps.length), "Journey preserves the TIG explanation trace."),
    step("confidence_visible", "Confidence label appears", scenario.surface, Boolean(journey.confidenceLabel), "Journey exposes a bounded confidence label."),
    step("fallback_safe", "Fallback is safe and non-empty", scenario.surface, !journey.fallback?.used || Boolean(journey.fallback.message && journey.fallback.safe), "Fallback remains visible and safe when used."),
    step("no_sensitive_raw_input", "Raw sensitive input is not exposed", scenario.surface, !journey.input.query && !journey.input.prayerInput && !journey.input.callingInput && !journey.input.actionInput, "Sanitized state keeps no raw query, prayer, calling, or action text."),
    step("local_only", "No external services or persistence required", scenario.surface, journey.noExternalServicesRequired && journey.noBrowserPersistenceRequired && journey.noDatabasePersistenceEnabled && journey.noAnalyticsEnabled && journey.noLiveAiOrchestrationEnabled, "Journey remains local and in-memory.")
  ];
  const blockers = [
    ...steps.filter((entry) => !entry.passed).map((entry) => blocker(scenario.surface, entry.id, entry.details)),
    ...journey.blockers.map((entry) => blocker(scenario.surface, entry.id, entry.message))
  ];
  const warnings = [
    ...journey.warnings.map((entry) => warning(scenario.surface, entry.id, entry.message)),
    ...(journey.fallback?.used ? [warning(scenario.surface, "fallback_used", journey.fallback.message)] : [])
  ];

  return {
    id: scenario.id,
    label: scenario.label,
    surface: scenario.surface,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    valid: blockers.length === 0,
    steps,
    blockers,
    warnings
  };
}

export function runRealUserJourneyQa(): ReturnType<typeof createRealUserJourneyQaReport> {
  return createRealUserJourneyQaReport(getRealUserJourneyQaScenarios().map(runRealUserJourneyQaScenario));
}

export function runWordJourneyQa(wordId: string) {
  return runRealUserJourneyQaScenario(createWordJourneyQaScenario(wordId));
}

export function runPromiseJourneyQa(clusterId: string) {
  return runRealUserJourneyQaScenario(createPromiseJourneyQaScenario(clusterId));
}

export function runPrayerJourneyQa(input: string) {
  return runRealUserJourneyQaScenario(createPrayerJourneyQaScenario(input));
}

export function runCallingJourneyQa(input: string) {
  return runRealUserJourneyQaScenario(createCallingJourneyQaScenario(input));
}

export function runFallbackJourneyQa(input: string) {
  return runRealUserJourneyQaScenario(createFallbackJourneyQaScenario(input));
}

export function getRealUserJourneyQaBlockers(results: TeoyubeRealUserJourneyQaResult[]): TeoyubeRealUserJourneyQaBlocker[] {
  return results.flatMap((entry) => entry.blockers);
}

export function getRealUserJourneyQaWarnings(results: TeoyubeRealUserJourneyQaResult[]): TeoyubeRealUserJourneyQaWarning[] {
  return results.flatMap((entry) => entry.warnings);
}

export function createRealUserJourneyQaDecision(results: TeoyubeRealUserJourneyQaResult[]): TeoyubeRealUserJourneyQaDecision {
  const blockers = getRealUserJourneyQaBlockers(results);
  const warnings = getRealUserJourneyQaWarnings(results);
  if (blockers.some((entry) => entry.id.includes("scripture"))) return "needs_scripture_anchor_fix";
  if (blockers.some((entry) => entry.id.includes("trace"))) return "needs_explanation_trace_fix";
  if (blockers.some((entry) => entry.id.includes("fallback"))) return "needs_fallback_fix";
  if (blockers.length) return "blocked";
  return warnings.length ? "ready_with_warnings" : "ready_for_integration_readiness_review";
}

export function createRealUserJourneyQaReport(results: TeoyubeRealUserJourneyQaResult[]) {
  const blockers = getRealUserJourneyQaBlockers(results);
  const warnings = getRealUserJourneyQaWarnings(results);

  return {
    valid: blockers.length === 0,
    decision: createRealUserJourneyQaDecision(results),
    scenarioCount: results.length,
    results,
    blockers,
    warnings,
    noExternalServicesRequired: true as const,
    noDatabasePersistenceEnabled: true as const,
    noAnalyticsEnabled: true as const,
    noLiveAiOrchestrationEnabled: true as const,
    noBrowserPersistenceRequired: true as const,
    inMemoryOnly: true as const,
    generatedAt: new Date().toISOString()
  };
}
