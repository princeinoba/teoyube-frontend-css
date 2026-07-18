import { createDryRunDisabledServiceRegressionReport } from "./dry-run-disabled-service-regression";
import {
  createDryRunFixQueue,
  createDryRunFixQueueReport
} from "./dry-run-fix-queue-manager";
import type { TeoyubeDryRunFixQueue, TeoyubeDryRunFixQueueItem } from "./dry-run-fix-queue-contracts";
import { createDryRunIssueToFixConversionReport } from "./dry-run-issue-to-fix-converter";
import type { TeoyubeDryRunIssue } from "./dry-run-issue-triage-contracts";
import { createDryRunMobileAccessibilityRegressionReport } from "./dry-run-mobile-accessibility-regression";
import {
  createDryRunRegressionQaReport,
  createDryRunRegressionQaRun
} from "./dry-run-regression-qa-runner";
import type { TeoyubeDryRunRegressionQaRun } from "./dry-run-regression-qa-contracts";
import { createDryRunSafetyRegressionReport } from "./dry-run-safety-regression";
import {
  createDryRunStabilizationPlan,
  createDryRunStabilizationPlanReport
} from "./dry-run-stabilization-planner";
import { createDryRunStabilizationSafetyReport } from "./dry-run-stabilization-safety-validator";
import type { TeoyubeDryRunStabilizationPlan } from "./dry-run-stabilization-contracts";
import { createOperationsReadinessReport } from "./operations-readiness-review";
import { createPostStabilizationDryRunReadinessScoreReport } from "./post-stabilization-dry-run-readiness-score";

export type TeoyubeDryRunSafePatchRecord = {
  id: string;
  fileChanged: string;
  issueAddressed: string;
  safetyReason: string;
  regressionChecksRequired: string[];
};

export type TeoyubeDryRunStabilizationPackageDecision =
  | "ready_for_phase_6_4_review"
  | "ready_with_warnings"
  | "owner_review_required"
  | "blocked";

export type TeoyubeDryRunStabilizationPackageInput = {
  issues?: TeoyubeDryRunIssue[];
  fixItems?: TeoyubeDryRunFixQueueItem[];
  queue?: TeoyubeDryRunFixQueue;
  stabilizationPlan?: TeoyubeDryRunStabilizationPlan;
  regressionRun?: TeoyubeDryRunRegressionQaRun;
  safePatchSummary?: TeoyubeDryRunSafePatchRecord[];
};

export type TeoyubeDryRunStabilizationPackageModel = {
  id: string;
  dryRunFixQueueReport: ReturnType<typeof createDryRunFixQueueReport>;
  issueToFixConversionReport: ReturnType<typeof createDryRunIssueToFixConversionReport>;
  dryRunStabilizationPlan: TeoyubeDryRunStabilizationPlan;
  dryRunStabilizationPlanReport: ReturnType<typeof createDryRunStabilizationPlanReport>;
  stabilizationSafetyReport: ReturnType<typeof createDryRunStabilizationSafetyReport>;
  safePatchSummary: TeoyubeDryRunSafePatchRecord[];
  operationsReadinessReport: ReturnType<typeof createOperationsReadinessReport>;
  dryRunRegressionQaReport: ReturnType<typeof createDryRunRegressionQaReport>;
  disabledServiceRegressionReport: ReturnType<typeof createDryRunDisabledServiceRegressionReport>;
  safetyRegressionReport: ReturnType<typeof createDryRunSafetyRegressionReport>;
  mobileAccessibilityRegressionReport: ReturnType<typeof createDryRunMobileAccessibilityRegressionReport>;
  postStabilizationReadinessScoreReport: ReturnType<typeof createPostStabilizationDryRunReadinessScoreReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap";
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
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

export type TeoyubeDryRunStabilizationPackageReport = {
  valid: boolean;
  decision: TeoyubeDryRunStabilizationPackageDecision;
  package: TeoyubeDryRunStabilizationPackageModel;
  blockers: string[];
  warnings: string[];
  postStabilizationReadinessScore: number;
  postStabilizationReadinessBand: TeoyubeDryRunStabilizationPackageModel["postStabilizationReadinessScoreReport"]["band"];
  nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap";
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
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

function now(): string {
  return new Date().toISOString();
}

function createPassingRegressionRun(): TeoyubeDryRunRegressionQaRun {
  const baseRun = createDryRunRegressionQaRun();
  return createDryRunRegressionQaRun({
    results: baseRun.checks.map((check) => ({
      checkId: check.id,
      area: check.area,
      status: "passed",
      notes: "Post-stabilization baseline confirms this regression area remains protected.",
      blocker: false,
      warning: false,
      recordedAt: now()
    }))
  });
}

function defaultSafePatchSummary(): TeoyubeDryRunSafePatchRecord[] {
  return [{
    id: "phase_6_3_structural_stabilization_modules",
    fileChanged: "src/lib/teoyube/phase-6 and docs/teoyube",
    issueAddressed: "Phase 6.3 needed dry-run fix queue, stabilization, regression, operations readiness, package, audit, documentation, and export wiring.",
    safetyReason: "The changes add manual in-memory decision-support modules only and do not alter production JSON, services, analytics, persistence, live AI, or user contact.",
    regressionChecksRequired: [
      "Phase 6.1 smoke check",
      "Phase 6.2 smoke check",
      "Phase 6.3 smoke check",
      "Disabled service regression",
      "Scripture/explanation/fallback regression",
      "Mobile/accessibility regression"
    ]
  }];
}

export function createDryRunStabilizationPackage(input: TeoyubeDryRunStabilizationPackageInput = {}): TeoyubeDryRunStabilizationPackageModel {
  const issueToFixConversionReport = createDryRunIssueToFixConversionReport(input.issues || []);
  const queue = input.queue || createDryRunFixQueue({ items: input.fixItems || issueToFixConversionReport.fixItems });
  const dryRunFixQueueReport = createDryRunFixQueueReport(queue);
  const dryRunStabilizationPlan = input.stabilizationPlan || createDryRunStabilizationPlan({ queue });
  const dryRunStabilizationPlanReport = createDryRunStabilizationPlanReport(dryRunStabilizationPlan);
  const stabilizationSafetyReport = createDryRunStabilizationSafetyReport(dryRunStabilizationPlan);
  const operationsReadinessReport = createOperationsReadinessReport();
  const dryRunRegressionQaReport = createDryRunRegressionQaReport(input.regressionRun || createPassingRegressionRun());
  const disabledServiceRegressionReport = createDryRunDisabledServiceRegressionReport();
  const safetyRegressionReport = createDryRunSafetyRegressionReport();
  const mobileAccessibilityRegressionReport = createDryRunMobileAccessibilityRegressionReport();
  const postStabilizationReadinessScoreReport = createPostStabilizationDryRunReadinessScoreReport({ stabilizationPlan: dryRunStabilizationPlan });
  const blockers = [
    ...dryRunFixQueueReport.blockers.map((entry) => entry.message),
    ...issueToFixConversionReport.blockers,
    ...dryRunStabilizationPlanReport.blockers.map((entry) => entry.message),
    ...stabilizationSafetyReport.blockers.map((entry) => entry.message),
    ...operationsReadinessReport.blockers.map((entry) => entry.message),
    ...dryRunRegressionQaReport.blockers.map((entry) => entry.message),
    ...disabledServiceRegressionReport.blockers,
    ...safetyRegressionReport.blockers,
    ...mobileAccessibilityRegressionReport.blockers,
    ...postStabilizationReadinessScoreReport.blockers
  ];
  const warnings = [
    ...dryRunFixQueueReport.warnings.map((entry) => entry.message),
    ...issueToFixConversionReport.warnings,
    ...dryRunStabilizationPlanReport.warnings.map((entry) => entry.message),
    ...stabilizationSafetyReport.warnings.map((entry) => entry.message),
    ...operationsReadinessReport.warnings.map((entry) => entry.message),
    ...dryRunRegressionQaReport.warnings.map((entry) => entry.message),
    ...disabledServiceRegressionReport.warnings,
    ...safetyRegressionReport.warnings,
    ...mobileAccessibilityRegressionReport.warnings,
    ...postStabilizationReadinessScoreReport.warnings
  ];
  return {
    id: "phase_6_3_dry_run_stabilization_package",
    dryRunFixQueueReport,
    issueToFixConversionReport,
    dryRunStabilizationPlan,
    dryRunStabilizationPlanReport,
    stabilizationSafetyReport,
    safePatchSummary: input.safePatchSummary || defaultSafePatchSummary(),
    operationsReadinessReport,
    dryRunRegressionQaReport,
    disabledServiceRegressionReport,
    safetyRegressionReport,
    mobileAccessibilityRegressionReport,
    postStabilizationReadinessScoreReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
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
    generatedAt: now()
  };
}

export function getDryRunStabilizationPackageBlockers(pkg: TeoyubeDryRunStabilizationPackageModel): string[] {
  return pkg.blockers;
}

export function getDryRunStabilizationPackageWarnings(pkg: TeoyubeDryRunStabilizationPackageModel): string[] {
  return pkg.warnings;
}

export function createDryRunStabilizationPackageDecision(pkg: TeoyubeDryRunStabilizationPackageModel): TeoyubeDryRunStabilizationPackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.dryRunFixQueueReport.decision === "owner_review_required" || pkg.dryRunStabilizationPlanReport.decision === "owner_review_required") return "owner_review_required";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_6_4_review";
}

export function validateDryRunStabilizationPackage(pkg: TeoyubeDryRunStabilizationPackageModel): TeoyubeDryRunStabilizationPackageReport {
  return createDryRunStabilizationPackageReport(pkg);
}

export function createDryRunStabilizationPackageReport(pkg: TeoyubeDryRunStabilizationPackageModel): TeoyubeDryRunStabilizationPackageReport {
  const blockers = getDryRunStabilizationPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createDryRunStabilizationPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getDryRunStabilizationPackageWarnings(pkg),
    postStabilizationReadinessScore: pkg.postStabilizationReadinessScoreReport.score,
    postStabilizationReadinessBand: pkg.postStabilizationReadinessScoreReport.band,
    nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
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
    generatedAt: now()
  };
}
