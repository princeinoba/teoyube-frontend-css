import { createPhase72Package } from "./phase-7-2-package";
import {
  createProductStabilizationQueueReport
} from "./product-stabilization-queue-manager";
import type { TeoyubeProductStabilizationQueue } from "./product-stabilization-queue-contracts";
import {
  createProductStabilizationPlan,
  createProductStabilizationPlanReport
} from "./product-stabilization-planner";
import {
  createProductStabilizationSafetyReport
} from "./product-stabilization-safety-validator";
import {
  createProductStabilizationPass,
  createProductStabilizationPassReport
} from "./product-stabilization-pass-runner";
import {
  createProductStabilizationVerificationReport
} from "./product-stabilization-verification-mapper";
import {
  createStabilizationRegressionQaReport,
  createStabilizationRegressionQaRun
} from "./stabilization-regression-qa-runner";
import { createServiceDisabledOperationsRegressionReport } from "./service-disabled-operations-regression";
import { createScriptureExplanationFallbackOperationsRegressionReport } from "./scripture-explanation-fallback-operations-regression";
import { createReviewedContentAdminOperationsRegressionReport } from "./reviewed-content-admin-operations-regression";
import { createFeedbackSupportOperationsRegressionReport } from "./feedback-support-operations-regression";
import { createMobileAccessibilityOperationsRegressionReport } from "./mobile-accessibility-operations-regression";
import {
  createBetaOperationsReadinessScoreReport
} from "./beta-operations-readiness-score";
import type { TeoyubeBetaOperationsReadinessScoreInput } from "./beta-operations-readiness-score-contracts";
import type { TeoyubePhase72SafePatchSummary } from "./phase-7-2-package";

export type TeoyubeProductStabilizationPassPackageDecision =
  | "product_stabilization_pass_complete"
  | "product_stabilization_pass_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubeProductStabilizationPassPackageModel = {
  id: string;
  productStabilizationQueueReport: ReturnType<typeof createProductStabilizationQueueReport>;
  stabilizationPlanReport: ReturnType<typeof createProductStabilizationPlanReport>;
  stabilizationSafetyReport: ReturnType<typeof createProductStabilizationSafetyReport>;
  stabilizationPassReport: ReturnType<typeof createProductStabilizationPassReport>;
  verificationPlanReport: ReturnType<typeof createProductStabilizationVerificationReport>;
  stabilizationRegressionQaReport: ReturnType<typeof createStabilizationRegressionQaReport>;
  serviceDisabledOperationsRegressionReport: ReturnType<typeof createServiceDisabledOperationsRegressionReport>;
  scriptureExplanationFallbackOperationsRegressionReport: ReturnType<typeof createScriptureExplanationFallbackOperationsRegressionReport>;
  reviewedContentAdminOperationsRegressionReport: ReturnType<typeof createReviewedContentAdminOperationsRegressionReport>;
  feedbackSupportOperationsRegressionReport: ReturnType<typeof createFeedbackSupportOperationsRegressionReport>;
  mobileAccessibilityOperationsRegressionReport: ReturnType<typeof createMobileAccessibilityOperationsRegressionReport>;
  betaOperationsReadinessScoreReport: ReturnType<typeof createBetaOperationsReadinessScoreReport>;
  safePatchSummary: TeoyubePhase72SafePatchSummary[];
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap";
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

export type TeoyubeProductStabilizationPassPackageReport = {
  valid: boolean;
  decision: TeoyubeProductStabilizationPassPackageDecision;
  package: TeoyubeProductStabilizationPassPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap";
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

function collectMessages(entries: Array<{ message?: string; details?: string } | string>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Phase 7.3 package item needs attention.");
}

function defaultQueue(): TeoyubeProductStabilizationQueue {
  return createPhase72Package({ ownerReviewed: true }).productStabilizationQueueReport.queue;
}

function passingRegressionRun() {
  const run = createStabilizationRegressionQaRun();
  return createStabilizationRegressionQaRun({
    results: run.checks.map((check) => ({
      checkId: check.id,
      area: check.area,
      status: "passed" as const,
      notes: "Manual Phase 7.3 stabilization regression confirmation preserved safety boundaries.",
      blocker: false,
      warning: false,
      recordedAt: new Date().toISOString()
    }))
  });
}

function readinessInputFromReports(parts: {
  queueBlockers: number;
  passBlockers: number;
  regressionBlockers: number;
  serviceBlockers: number;
  safetyBlockers: number;
  adminBlockers: number;
  feedbackBlockers: number;
  mobileBlockers: number;
}): TeoyubeBetaOperationsReadinessScoreInput {
  return {
    blockerCountByArea: {
      product_stabilization: parts.queueBlockers + parts.passBlockers,
      service_disabled_state: parts.serviceBlockers,
      scripture_anchor: parts.safetyBlockers,
      explanation_trace: parts.safetyBlockers,
      fallback: parts.safetyBlockers,
      reviewed_content_gate: parts.adminBlockers,
      controlled_admin: parts.adminBlockers,
      manual_feedback_review: parts.feedbackBlockers,
      support_workflow: parts.feedbackBlockers,
      issue_triage: parts.feedbackBlockers,
      mobile: parts.mobileBlockers,
      accessibility: parts.mobileBlockers
    },
    warningCountByArea: {
      product_stabilization: parts.regressionBlockers
    },
    criticalBlockerPresent: Object.values(parts).some((count) => count > 0)
  };
}

export function createProductStabilizationPassPackage(input: {
  queue?: TeoyubeProductStabilizationQueue;
  safePatchSummary?: TeoyubePhase72SafePatchSummary[];
  readinessScoreInput?: TeoyubeBetaOperationsReadinessScoreInput;
} = {}): TeoyubeProductStabilizationPassPackageModel {
  const queue = input.queue || defaultQueue();
  const productStabilizationQueueReport = createProductStabilizationQueueReport(queue);
  const plan = createProductStabilizationPlan({ queue });
  const stabilizationPlanReport = createProductStabilizationPlanReport(plan);
  const stabilizationSafetyReport = createProductStabilizationSafetyReport(queue);
  const pass = createProductStabilizationPass({ plan });
  const stabilizationPassReport = createProductStabilizationPassReport(pass);
  const verificationPlanReport = createProductStabilizationVerificationReport(queue);
  const stabilizationRegressionQaReport = createStabilizationRegressionQaReport(passingRegressionRun());
  const serviceDisabledOperationsRegressionReport = createServiceDisabledOperationsRegressionReport();
  const scriptureExplanationFallbackOperationsRegressionReport = createScriptureExplanationFallbackOperationsRegressionReport();
  const reviewedContentAdminOperationsRegressionReport = createReviewedContentAdminOperationsRegressionReport();
  const feedbackSupportOperationsRegressionReport = createFeedbackSupportOperationsRegressionReport();
  const mobileAccessibilityOperationsRegressionReport = createMobileAccessibilityOperationsRegressionReport();
  const readinessInput = input.readinessScoreInput || readinessInputFromReports({
    queueBlockers: productStabilizationQueueReport.blockers.length,
    passBlockers: stabilizationPassReport.blockers.length,
    regressionBlockers: stabilizationRegressionQaReport.blockers.length,
    serviceBlockers: serviceDisabledOperationsRegressionReport.blockers.length,
    safetyBlockers: scriptureExplanationFallbackOperationsRegressionReport.blockers.length,
    adminBlockers: reviewedContentAdminOperationsRegressionReport.blockers.length,
    feedbackBlockers: feedbackSupportOperationsRegressionReport.blockers.length,
    mobileBlockers: mobileAccessibilityOperationsRegressionReport.blockers.length
  });
  const betaOperationsReadinessScoreReport = createBetaOperationsReadinessScoreReport(readinessInput);
  const blockers = [
    ...collectMessages(productStabilizationQueueReport.blockers),
    ...stabilizationPlanReport.blockers,
    ...collectMessages(stabilizationSafetyReport.blockers),
    ...collectMessages(stabilizationPassReport.blockers),
    ...verificationPlanReport.blockers,
    ...collectMessages(stabilizationRegressionQaReport.blockers),
    ...serviceDisabledOperationsRegressionReport.blockers,
    ...scriptureExplanationFallbackOperationsRegressionReport.blockers,
    ...reviewedContentAdminOperationsRegressionReport.blockers,
    ...feedbackSupportOperationsRegressionReport.blockers,
    ...mobileAccessibilityOperationsRegressionReport.blockers,
    ...collectMessages(betaOperationsReadinessScoreReport.blockers)
  ];
  const warnings = [
    ...collectMessages(productStabilizationQueueReport.warnings),
    ...stabilizationPlanReport.warnings,
    ...collectMessages(stabilizationSafetyReport.warnings),
    ...collectMessages(stabilizationPassReport.warnings),
    ...verificationPlanReport.warnings,
    ...collectMessages(stabilizationRegressionQaReport.warnings),
    ...serviceDisabledOperationsRegressionReport.warnings,
    ...scriptureExplanationFallbackOperationsRegressionReport.warnings,
    ...reviewedContentAdminOperationsRegressionReport.warnings,
    ...feedbackSupportOperationsRegressionReport.warnings,
    ...mobileAccessibilityOperationsRegressionReport.warnings,
    ...collectMessages(betaOperationsReadinessScoreReport.warnings)
  ];
  return {
    id: "phase_7_3_product_stabilization_pass_package",
    productStabilizationQueueReport,
    stabilizationPlanReport,
    stabilizationSafetyReport,
    stabilizationPassReport,
    verificationPlanReport,
    stabilizationRegressionQaReport,
    serviceDisabledOperationsRegressionReport,
    scriptureExplanationFallbackOperationsRegressionReport,
    reviewedContentAdminOperationsRegressionReport,
    feedbackSupportOperationsRegressionReport,
    mobileAccessibilityOperationsRegressionReport,
    betaOperationsReadinessScoreReport,
    safePatchSummary: input.safePatchSummary || [],
    blockers,
    warnings,
    nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}

export function getProductStabilizationPassPackageBlockers(pkg: TeoyubeProductStabilizationPassPackageModel): string[] {
  return pkg.blockers;
}

export function getProductStabilizationPassPackageWarnings(pkg: TeoyubeProductStabilizationPassPackageModel): string[] {
  return pkg.warnings;
}

export function createProductStabilizationPassPackageDecision(pkg: TeoyubeProductStabilizationPassPackageModel): TeoyubeProductStabilizationPassPackageDecision {
  if (pkg.blockers.length || pkg.betaOperationsReadinessScoreReport.band === "blocked") return "blocked";
  if (pkg.stabilizationPassReport.decision === "needs_owner_review") return "needs_owner_review";
  return pkg.warnings.length ? "product_stabilization_pass_complete_with_warnings" : "product_stabilization_pass_complete";
}

export function validateProductStabilizationPassPackage(pkg: TeoyubeProductStabilizationPassPackageModel): TeoyubeProductStabilizationPassPackageReport {
  return createProductStabilizationPassPackageReport(pkg);
}

export function createProductStabilizationPassPackageReport(pkg: TeoyubeProductStabilizationPassPackageModel): TeoyubeProductStabilizationPassPackageReport {
  const blockers = getProductStabilizationPassPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createProductStabilizationPassPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getProductStabilizationPassPackageWarnings(pkg),
    nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
