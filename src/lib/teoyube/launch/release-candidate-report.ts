import { createBuildArtifactReadinessReport } from "./build-artifact-readiness";
import { createBuildVerificationReport } from "./build-verification-runner";
import type { TeoyubeBuildCommandResult, TeoyubeReleaseCandidateStatus } from "./build-verification-contracts";
import { createDeploymentDryRunPlan, createDeploymentDryRunReport } from "./deployment-dry-run-planner";
import { createLaunchEnvironmentValidationReport } from "./launch-environment-validator";
import { createAccessibilityAuditReport } from "./launch-accessibility-audit";
import { createLaunchQaReadinessReport } from "./launch-qa-checklist";
import { createLaunchSafetyReviewReport } from "./launch-safety-review";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import { createRouteBuildReadinessReport } from "./route-build-readiness";
import { createPredeploymentSafetyGateReport } from "./predeployment-safety-gates";

export type TeoyubeReleaseCandidateReportInput = {
  buildResults?: TeoyubeBuildCommandResult[];
};

export function getReleaseCandidateChecklist() {
  return [
    "Build verification status",
    "Environment validation status",
    "QA status",
    "Accessibility status",
    "Surface readiness",
    "Safety review status",
    "Route build readiness",
    "Dry-run deployment readiness",
    "Predeployment safety gates"
  ];
}

export function createReleaseCandidateReport(input: TeoyubeReleaseCandidateReportInput = {}) {
  const build = createBuildVerificationReport(input.buildResults || []);
  const environment = createLaunchEnvironmentValidationReport();
  const qa = createLaunchQaReadinessReport();
  const accessibility = createAccessibilityAuditReport();
  const surfaces = createLaunchSurfaceReadinessReport();
  const safety = createLaunchSafetyReviewReport();
  const routes = createRouteBuildReadinessReport();
  const dryRun = createDeploymentDryRunReport(createDeploymentDryRunPlan("vercel"));
  const predeployment = createPredeploymentSafetyGateReport();
  const blockers = [
    ...build.blockers,
    ...environment.issues.filter((entry) => entry.severity === "error").map((entry) => entry.message),
    ...qa.blockers.map((entry) => entry.reason),
    ...accessibility.blockers.map((entry) => entry.reason),
    ...surfaces.blockers.map((entry) => entry.reason),
    ...safety.errors,
    ...routes.blockers,
    ...dryRun.blockers.map((entry) => entry.reason),
    ...predeployment.blockers.map((entry) => entry.details)
  ];
  const warnings = [
    ...build.warnings,
    ...environment.issues.filter((entry) => entry.severity === "warning").map((entry) => entry.message),
    ...qa.warnings.map((entry) => entry.message),
    ...accessibility.warnings.map((entry) => entry.message),
    ...surfaces.warnings.map((entry) => entry.message),
    ...safety.warnings.map((entry) => entry.message),
    ...routes.warnings,
    ...dryRun.warnings.map((entry) => entry.message)
  ];

  return {
    status: getReleaseCandidateStatus({ blockers, warnings }),
    buildVerification: build,
    environmentValidation: environment,
    qa,
    accessibility,
    surfaceReadiness: surfaces,
    safetyReview: safety,
    routeBuildReadiness: routes,
    dryRunDeploymentReadiness: dryRun,
    predeploymentSafetyGates: predeployment,
    unresolvedBlockers: blockers,
    unresolvedWarnings: warnings,
    recommendedNextAction: blockers.length
      ? "Resolve release candidate blockers before preview deployment."
      : "Proceed to Production Launch Preparation 1.9 - Final Launch Preparation Audit.",
    generatedAt: new Date().toISOString()
  };
}

export function getReleaseCandidateBlockers(report: ReturnType<typeof createReleaseCandidateReport>): string[] {
  return report.unresolvedBlockers;
}

export function getReleaseCandidateWarnings(report: ReturnType<typeof createReleaseCandidateReport>): string[] {
  return report.unresolvedWarnings;
}

export function getReleaseCandidateStatus(reportLike: { blockers?: string[]; warnings?: string[]; unresolvedBlockers?: string[]; unresolvedWarnings?: string[] }): TeoyubeReleaseCandidateStatus {
  const blockers = reportLike.blockers || reportLike.unresolvedBlockers || [];
  const warnings = reportLike.warnings || reportLike.unresolvedWarnings || [];

  if (blockers.length > 0) return "blocked";
  if (warnings.length > 0) return "ready_for_manual_review";
  return "ready_for_preview_deployment";
}

export function createReleaseCandidateDecision(report: ReturnType<typeof createReleaseCandidateReport>) {
  return {
    status: report.status,
    ready: report.status === "ready_for_preview_deployment" || report.status === "ready_for_manual_review",
    reasons: report.unresolvedBlockers.length
      ? report.unresolvedBlockers
      : ["Release candidate structure is available without deploying or connecting providers."],
    nextAction: report.recommendedNextAction
  };
}
