import { createDryRunDisabledServiceRegressionReport } from "./dry-run-disabled-service-regression";
import { createDryRunMobileAccessibilityRegressionReport } from "./dry-run-mobile-accessibility-regression";
import { createDryRunRegressionQaReport, createDryRunRegressionQaRun } from "./dry-run-regression-qa-runner";
import type { TeoyubeDryRunRegressionQaArea } from "./dry-run-regression-qa-contracts";
import { createDryRunSafetyRegressionReport } from "./dry-run-safety-regression";
import { createDryRunStabilizationSafetyReport } from "./dry-run-stabilization-safety-validator";
import { createDryRunStabilizationPlan } from "./dry-run-stabilization-planner";
import type { TeoyubeDryRunStabilizationPlan } from "./dry-run-stabilization-contracts";
import { createOperationsReadinessReport } from "./operations-readiness-review";

export type TeoyubePostStabilizationDryRunReadinessScoreBand =
  | "ready_for_phase_6_4_owner_review"
  | "ready_with_warnings"
  | "needs_more_stabilization"
  | "blocked";

export type TeoyubePostStabilizationDryRunReadinessScoreDecision =
  | "ready_for_phase_6_4"
  | "ready_with_warnings"
  | "needs_more_stabilization"
  | "blocked"
  | "unknown";

export type TeoyubePostStabilizationDryRunReadinessScoreInput = {
  stabilizationPlan?: TeoyubeDryRunStabilizationPlan;
};

export type TeoyubePostStabilizationDryRunReadinessScoreReport = {
  valid: boolean;
  score: number;
  band: TeoyubePostStabilizationDryRunReadinessScoreBand;
  decision: TeoyubePostStabilizationDryRunReadinessScoreDecision;
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function reports(input: TeoyubePostStabilizationDryRunReadinessScoreInput = {}) {
  const plan = input.stabilizationPlan || createDryRunStabilizationPlan();
  const regressionRun = createDryRunRegressionQaRun({
    results: createDryRunRegressionQaRun().checks.map((check) => ({
      checkId: check.id,
      area: check.area,
      status: "passed",
      notes: "Baseline post-stabilization regression result preserves Phase 6.3 boundaries.",
      blocker: false,
      warning: false,
      recordedAt: new Date().toISOString()
    }))
  });
  return {
    plan,
    safety: createDryRunStabilizationSafetyReport(plan),
    regression: createDryRunRegressionQaReport(regressionRun),
    disabled: createDryRunDisabledServiceRegressionReport(),
    spiritualSafety: createDryRunSafetyRegressionReport(),
    mobile: createDryRunMobileAccessibilityRegressionReport(),
    operations: createOperationsReadinessReport()
  };
}

export function getPostStabilizationDryRunReadinessScoreBlockers(input: TeoyubePostStabilizationDryRunReadinessScoreInput = {}): string[] {
  const collected = reports(input);
  return [
    ...collected.safety.blockers.map((entry) => entry.message),
    ...collected.regression.blockers.map((entry) => entry.message),
    ...collected.disabled.blockers,
    ...collected.spiritualSafety.blockers,
    ...collected.mobile.blockers,
    ...collected.operations.blockers.map((entry) => entry.message)
  ];
}

export function getPostStabilizationDryRunReadinessScoreWarnings(input: TeoyubePostStabilizationDryRunReadinessScoreInput = {}): string[] {
  const collected = reports(input);
  return [
    ...collected.safety.warnings.map((entry) => entry.message),
    ...collected.regression.warnings.map((entry) => entry.message),
    ...collected.disabled.warnings,
    ...collected.spiritualSafety.warnings,
    ...collected.mobile.warnings,
    ...collected.operations.warnings.map((entry) => entry.message)
  ];
}

export function calculatePostStabilizationDryRunReadinessScore(input: TeoyubePostStabilizationDryRunReadinessScoreInput = {}): number {
  const blockers = getPostStabilizationDryRunReadinessScoreBlockers(input);
  const warnings = getPostStabilizationDryRunReadinessScoreWarnings(input);
  return Math.max(0, 100 - blockers.length * 25 - Math.min(10, warnings.length));
}

export function calculatePostStabilizationDryRunReadinessScoreByArea(
  input: TeoyubePostStabilizationDryRunReadinessScoreInput = {},
  area: TeoyubeDryRunRegressionQaArea
): number {
  const collected = reports(input);
  const blockers = collected.regression.blockers.filter((entry) => entry.area === area).length;
  const warnings = collected.regression.warnings.filter((entry) => entry.area === area).length;
  return Math.max(0, 100 - blockers * 50 - warnings * 10);
}

export function getPostStabilizationDryRunReadinessScoreBand(score: number): TeoyubePostStabilizationDryRunReadinessScoreBand {
  if (score < 75) return "blocked";
  if (score < 90) return "needs_more_stabilization";
  if (score < 100) return "ready_with_warnings";
  return "ready_for_phase_6_4_owner_review";
}

export function createPostStabilizationDryRunReadinessScoreDecision(input: TeoyubePostStabilizationDryRunReadinessScoreInput = {}): TeoyubePostStabilizationDryRunReadinessScoreDecision {
  const blockers = getPostStabilizationDryRunReadinessScoreBlockers(input);
  if (blockers.length) return "blocked";
  const score = calculatePostStabilizationDryRunReadinessScore(input);
  if (score < 90) return "needs_more_stabilization";
  return score < 100 ? "ready_with_warnings" : "ready_for_phase_6_4";
}

export function createPostStabilizationDryRunReadinessScoreReport(input: TeoyubePostStabilizationDryRunReadinessScoreInput = {}): TeoyubePostStabilizationDryRunReadinessScoreReport {
  const blockers = getPostStabilizationDryRunReadinessScoreBlockers(input);
  const warnings = getPostStabilizationDryRunReadinessScoreWarnings(input);
  const score = calculatePostStabilizationDryRunReadinessScore(input);
  return {
    valid: blockers.length === 0,
    score,
    band: getPostStabilizationDryRunReadinessScoreBand(score),
    decision: createPostStabilizationDryRunReadinessScoreDecision(input),
    blockers,
    warnings,
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
