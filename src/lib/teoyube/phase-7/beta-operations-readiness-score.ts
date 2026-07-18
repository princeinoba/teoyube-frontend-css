import type {
  TeoyubeBetaOperationsReadinessScoreArea,
  TeoyubeBetaOperationsReadinessScoreBand,
  TeoyubeBetaOperationsReadinessScoreBlocker,
  TeoyubeBetaOperationsReadinessScoreDecision,
  TeoyubeBetaOperationsReadinessScoreInput,
  TeoyubeBetaOperationsReadinessScoreReport,
  TeoyubeBetaOperationsReadinessScoreResult,
  TeoyubeBetaOperationsReadinessScoreStatus,
  TeoyubeBetaOperationsReadinessScoreWarning
} from "./beta-operations-readiness-score-contracts";

const AREAS: TeoyubeBetaOperationsReadinessScoreArea[] = [
  "operations_runbook",
  "manual_feedback_review",
  "support_workflow",
  "issue_triage",
  "product_stabilization",
  "scripture_anchor",
  "explanation_trace",
  "fallback",
  "confidence_label",
  "privacy_consent",
  "service_disabled_state",
  "reviewed_content_gate",
  "controlled_admin",
  "mobile",
  "accessibility",
  "known_limitations"
];

const WEIGHTS: Partial<Record<TeoyubeBetaOperationsReadinessScoreArea, number>> = {
  product_stabilization: 1.2,
  scripture_anchor: 1.25,
  explanation_trace: 1.2,
  fallback: 1.2,
  privacy_consent: 1.25,
  service_disabled_state: 1.3,
  reviewed_content_gate: 1.1,
  support_workflow: 1.1,
  issue_triage: 1.1
};

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getBetaOperationsReadinessScoreBand(score: number): TeoyubeBetaOperationsReadinessScoreBand {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 50) return "needs_improvement";
  return "blocked";
}

function statusForBand(band: TeoyubeBetaOperationsReadinessScoreBand): TeoyubeBetaOperationsReadinessScoreStatus {
  if (band === "excellent") return "ready";
  if (band === "good") return "ready_with_warnings";
  if (band === "needs_improvement") return "needs_improvement";
  if (band === "blocked") return "blocked";
  return "unknown";
}

function isCriticalArea(area: TeoyubeBetaOperationsReadinessScoreArea): boolean {
  return [
    "scripture_anchor",
    "explanation_trace",
    "fallback",
    "privacy_consent",
    "service_disabled_state",
    "reviewed_content_gate"
  ].includes(area);
}

export function calculateBetaOperationsReadinessScoreByArea(
  input: TeoyubeBetaOperationsReadinessScoreInput = {},
  area: TeoyubeBetaOperationsReadinessScoreArea
): TeoyubeBetaOperationsReadinessScoreResult {
  const blockerCount = input.blockerCountByArea?.[area] || 0;
  const warningCount = input.warningCountByArea?.[area] || 0;
  const override = input.areaOverrides?.[area];
  const penalty = isCriticalArea(area) ? blockerCount * 55 + warningCount * 6 : blockerCount * 40 + warningCount * 4;
  const rawScore = override ?? (100 - Math.min(penalty, 100));
  const score = input.criticalBlockerPresent || blockerCount > 0 ? Math.min(clamp(rawScore), 49) : clamp(rawScore);
  const band = getBetaOperationsReadinessScoreBand(score);
  return {
    area,
    score,
    band,
    status: statusForBand(band),
    blockers: blockerCount > 0 ? [`${area} has ${blockerCount} blocker(s).`] : [],
    warnings: warningCount > 0 ? [`${area} has ${warningCount} warning(s).`] : [],
    weight: WEIGHTS[area] || 1
  };
}

export function calculateBetaOperationsReadinessScore(input: TeoyubeBetaOperationsReadinessScoreInput = {}): number {
  const results = AREAS.map((area) => calculateBetaOperationsReadinessScoreByArea(input, area));
  const totalWeight = results.reduce((sum, entry) => sum + entry.weight, 0);
  const weighted = results.reduce((sum, entry) => sum + entry.score * entry.weight, 0);
  return input.criticalBlockerPresent ? Math.min(clamp(weighted / totalWeight), 49) : clamp(weighted / totalWeight);
}

export function getBetaOperationsReadinessScoreBlockers(input: TeoyubeBetaOperationsReadinessScoreInput = {}): TeoyubeBetaOperationsReadinessScoreBlocker[] {
  return AREAS.flatMap((area) =>
    calculateBetaOperationsReadinessScoreByArea(input, area).blockers.map((message, index) => ({
      id: `${area}_blocker_${index}`,
      area,
      message,
      requiredAction: "Move blocker back into product stabilization before Phase 7.4."
    }))
  );
}

export function getBetaOperationsReadinessScoreWarnings(input: TeoyubeBetaOperationsReadinessScoreInput = {}): TeoyubeBetaOperationsReadinessScoreWarning[] {
  return AREAS.flatMap((area) =>
    calculateBetaOperationsReadinessScoreByArea(input, area).warnings.map((message, index) => ({
      id: `${area}_warning_${index}`,
      area,
      message,
      recommendedAction: "Review warning manually before Phase 7.4 owner acceptance."
    }))
  );
}

export function createBetaOperationsReadinessScoreDecision(input: TeoyubeBetaOperationsReadinessScoreInput = {}): TeoyubeBetaOperationsReadinessScoreDecision {
  const blockers = getBetaOperationsReadinessScoreBlockers(input);
  const score = calculateBetaOperationsReadinessScore(input);
  const band = getBetaOperationsReadinessScoreBand(score);
  if (blockers.length || input.criticalBlockerPresent || band === "blocked") return "blocked";
  if (band === "needs_improvement") return "needs_more_stabilization";
  return getBetaOperationsReadinessScoreWarnings(input).length ? "ready_with_warnings" : "ready_for_phase_7_4_owner_review";
}

export function createBetaOperationsReadinessScoreReport(input: TeoyubeBetaOperationsReadinessScoreInput = {}): TeoyubeBetaOperationsReadinessScoreReport {
  const score = calculateBetaOperationsReadinessScore(input);
  const band = getBetaOperationsReadinessScoreBand(score);
  const blockers = getBetaOperationsReadinessScoreBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createBetaOperationsReadinessScoreDecision(input),
    score,
    band,
    status: statusForBand(band),
    results: AREAS.map((area) => calculateBetaOperationsReadinessScoreByArea(input, area)),
    blockers,
    warnings: getBetaOperationsReadinessScoreWarnings(input),
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
