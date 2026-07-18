import { createBetaControlledAdminQaReport } from "./beta-controlled-admin-qa";
import { createBetaDisabledServiceQaReport } from "./beta-disabled-service-qa";
import { createBetaIssueTriageExecutionReport } from "./beta-issue-triage-execution";
import { createBetaMobileAccessibilityQaReport } from "./beta-mobile-accessibility-qa";
import { createBetaRealDataQaReport } from "./beta-real-data-qa-execution";
import { createBetaReviewedContentGateQaReport } from "./beta-reviewed-content-gate-qa";
import { createBetaScriptureExplanationFallbackQaReport } from "./beta-scripture-explanation-fallback-qa";
import { createBetaUserJourneyQaReport } from "./beta-user-journey-qa-execution";
import type {
  TeoyubeBetaReadinessScoreArea,
  TeoyubeBetaReadinessScoreBand,
  TeoyubeBetaReadinessScoreBlocker,
  TeoyubeBetaReadinessScoreDecision,
  TeoyubeBetaReadinessScoreInput,
  TeoyubeBetaReadinessScoreReport,
  TeoyubeBetaReadinessScoreResult,
  TeoyubeBetaReadinessScoreStatus,
  TeoyubeBetaReadinessScoreWarning
} from "./beta-readiness-score-contracts";

const AREAS: TeoyubeBetaReadinessScoreArea[] = [
  "real_data",
  "user_journey",
  "scripture_anchor",
  "explanation_trace",
  "fallback",
  "confidence_label",
  "reviewed_content_gate",
  "controlled_admin",
  "disabled_services",
  "mobile",
  "accessibility",
  "privacy_consent",
  "issue_triage"
];

const WEIGHTS: Partial<Record<TeoyubeBetaReadinessScoreArea, number>> = {
  real_data: 1.2,
  scripture_anchor: 1.2,
  explanation_trace: 1.1,
  fallback: 1.1,
  disabled_services: 1.2,
  privacy_consent: 1.2,
  issue_triage: 1.1
};

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getBetaReadinessScoreBand(score: number): TeoyubeBetaReadinessScoreBand {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 50) return "needs_improvement";
  return "blocked";
}

function statusForBand(band: TeoyubeBetaReadinessScoreBand): TeoyubeBetaReadinessScoreStatus {
  if (band === "excellent") return "ready";
  if (band === "good") return "ready_with_warnings";
  if (band === "needs_improvement") return "needs_improvement";
  if (band === "blocked") return "blocked";
  return "unknown";
}

function countDefaults() {
  const realData = createBetaRealDataQaReport();
  const journey = createBetaUserJourneyQaReport();
  const scripture = createBetaScriptureExplanationFallbackQaReport();
  const mobile = createBetaMobileAccessibilityQaReport();
  const reviewed = createBetaReviewedContentGateQaReport();
  const admin = createBetaControlledAdminQaReport();
  const disabled = createBetaDisabledServiceQaReport();
  const issues = createBetaIssueTriageExecutionReport();

  return {
    blockers: {
      real_data: realData.blockers.length,
      user_journey: journey.blockers.length,
      scripture_anchor: scripture.blockers.length,
      explanation_trace: scripture.blockers.length,
      fallback: scripture.blockers.length,
      confidence_label: scripture.blockers.length,
      reviewed_content_gate: reviewed.blockers.length,
      controlled_admin: admin.blockers.length,
      disabled_services: disabled.blockers.length,
      mobile: mobile.blockers.length,
      accessibility: mobile.blockers.length,
      privacy_consent: disabled.blockers.length,
      issue_triage: issues.blockers.length
    } as Partial<Record<TeoyubeBetaReadinessScoreArea, number>>,
    warnings: {
      real_data: realData.warnings.length,
      user_journey: journey.warnings.length,
      scripture_anchor: scripture.warnings.length,
      explanation_trace: scripture.warnings.length,
      fallback: scripture.warnings.length,
      confidence_label: scripture.warnings.length,
      reviewed_content_gate: reviewed.warnings.length,
      controlled_admin: admin.warnings.length,
      disabled_services: disabled.warnings.length,
      mobile: mobile.warnings.length,
      accessibility: mobile.warnings.length,
      privacy_consent: disabled.warnings.length,
      issue_triage: issues.warnings.length
    } as Partial<Record<TeoyubeBetaReadinessScoreArea, number>>
  };
}

export function calculateBetaReadinessScoreByArea(input: TeoyubeBetaReadinessScoreInput = {}, area: TeoyubeBetaReadinessScoreArea): TeoyubeBetaReadinessScoreResult {
  const defaults = countDefaults();
  const blockerCount = input.blockerCountByArea?.[area] ?? defaults.blockers[area] ?? 0;
  const warningCount = input.warningCountByArea?.[area] ?? defaults.warnings[area] ?? 0;
  const override = input.areaOverrides?.[area];
  const rawScore = override ?? (100 - blockerCount * 40 - Math.min(warningCount * 4, 24));
  const score = input.criticalBlockerPresent || blockerCount > 0 ? Math.min(clamp(rawScore), 49) : clamp(rawScore);
  const band = getBetaReadinessScoreBand(score);
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

export function calculateBetaReadinessScore(input: TeoyubeBetaReadinessScoreInput = {}): number {
  const results = AREAS.map((area) => calculateBetaReadinessScoreByArea(input, area));
  const totalWeight = results.reduce((sum, entry) => sum + entry.weight, 0);
  const weighted = results.reduce((sum, entry) => sum + entry.score * entry.weight, 0);
  return input.criticalBlockerPresent ? Math.min(clamp(weighted / totalWeight), 49) : clamp(weighted / totalWeight);
}

export function getBetaReadinessScoreBlockers(input: TeoyubeBetaReadinessScoreInput = {}): TeoyubeBetaReadinessScoreBlocker[] {
  return AREAS.flatMap((area) =>
    calculateBetaReadinessScoreByArea(input, area).blockers.map((message, index) => ({
      id: `${area}_blocker_${index}`,
      area,
      message,
      requiredAction: "Move blocker into Phase 5.3 remediation before beta execution."
    }))
  );
}

export function getBetaReadinessScoreWarnings(input: TeoyubeBetaReadinessScoreInput = {}): TeoyubeBetaReadinessScoreWarning[] {
  return AREAS.flatMap((area) =>
    calculateBetaReadinessScoreByArea(input, area).warnings.map((message, index) => ({
      id: `${area}_warning_${index}`,
      area,
      message,
      recommendedAction: "Review warning manually before owner acceptance."
    }))
  );
}

export function createBetaReadinessScoreDecision(input: TeoyubeBetaReadinessScoreInput = {}): TeoyubeBetaReadinessScoreDecision {
  const blockers = getBetaReadinessScoreBlockers(input);
  const score = calculateBetaReadinessScore(input);
  const band = getBetaReadinessScoreBand(score);
  if (blockers.length || input.criticalBlockerPresent || band === "blocked") return "blocked";
  if (band === "needs_improvement") return "needs_phase_5_3_fix_queue";
  return getBetaReadinessScoreWarnings(input).length ? "ready_with_warnings" : "ready_for_owner_review";
}

export function createBetaReadinessScoreReport(input: TeoyubeBetaReadinessScoreInput = {}): TeoyubeBetaReadinessScoreReport {
  const score = calculateBetaReadinessScore(input);
  const band = getBetaReadinessScoreBand(score);
  const blockers = getBetaReadinessScoreBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createBetaReadinessScoreDecision(input),
    score,
    band,
    status: statusForBand(band),
    results: AREAS.map((area) => calculateBetaReadinessScoreByArea(input, area)),
    blockers,
    warnings: getBetaReadinessScoreWarnings(input),
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
