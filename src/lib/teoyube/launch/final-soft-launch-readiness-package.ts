import type {
  TeoyubeFinalSoftLaunchGoNoGoDecision,
  TeoyubeFinalSoftLaunchReadinessBlocker,
  TeoyubeFinalSoftLaunchReadinessPackage,
  TeoyubeFinalSoftLaunchReadinessWarning
} from "./final-soft-launch-readiness-contracts";
import { createLimitedSoftLaunchCommunicationPacket } from "./limited-soft-launch-communication-packet";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";
import { createLaunchDayRehearsalReport } from "./limited-soft-launch-day-rehearsal";
import { createLimitedSoftLaunchDryRun, createLimitedSoftLaunchDryRunReport } from "./limited-soft-launch-dry-run-runner";
import { createLimitedSoftLaunchDryRunPackage, createLimitedSoftLaunchDryRunPackageReport } from "./limited-soft-launch-dry-run-package";
import { createFeedbackIntakeRehearsalReport } from "./limited-soft-launch-feedback-rehearsal";
import { createIssueTriageRehearsalReport } from "./limited-soft-launch-issue-triage-rehearsal";
import { createLimitedSoftLaunchOwnerReviewReport } from "./limited-soft-launch-owner-review";
import { createRollbackRehearsalReport } from "./limited-soft-launch-rollback-rehearsal";
import { createLimitedSoftLaunchEnvironmentSafetyReport } from "./limited-soft-launch-environment-safety";
import { createLimitedSoftLaunchExecutionPlan, createLimitedSoftLaunchExecutionReport } from "./limited-soft-launch-execution-plan";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "./limited-soft-launch-feedback-workflow";
import { createParticipantScopeReport } from "./limited-soft-launch-participant-scope";
import { createLimitedSoftLaunchSupportResponseReport } from "./limited-soft-launch-support-response";
import { createLimitedSoftLaunchSurfaceScopeReport } from "./limited-soft-launch-surface-scope";
import { createFinalSoftLaunchSafetyCertificationReport } from "./final-soft-launch-safety-certification";
import { createFinalSoftLaunchSurfaceCertificationReport } from "./final-soft-launch-surface-certification";
import { createFinalSoftLaunchQualityGateReport } from "./final-soft-launch-quality-gate-report";
import { createFinalSoftLaunchRiskRegister } from "./final-soft-launch-risk-register";
import { getFinalSoftLaunchKnownLimitations } from "./final-soft-launch-known-limitations";

export type TeoyubeFinalSoftLaunchReadinessPackageInput = Partial<
  Pick<
    TeoyubeFinalSoftLaunchReadinessPackage,
    "knownLimitations" | "riskRegister" | "finalDecisionGuidance"
  >
>;

function blocker(id: string, label: string, reason: string, requiredAction: string): TeoyubeFinalSoftLaunchReadinessBlocker {
  return {
    id,
    label,
    category: "readiness_package",
    severity: "critical",
    reason,
    requiredAction
  };
}

function warning(id: string, message: string): TeoyubeFinalSoftLaunchReadinessWarning {
  return {
    id,
    label: id.replace(/_/g, " "),
    category: "readiness_package",
    severity: "medium",
    message,
    recommendedAction: "Document this item in final owner go/no-go review."
  };
}

export function createFinalSoftLaunchReadinessPackage(
  input: TeoyubeFinalSoftLaunchReadinessPackageInput = {}
): TeoyubeFinalSoftLaunchReadinessPackage {
  const executionPlan = createLimitedSoftLaunchExecutionPlan();
  const dryRun = createLimitedSoftLaunchDryRun();
  const dryRunReport = createLimitedSoftLaunchDryRunReport(dryRun);
  const launchDayRehearsalReport = createLaunchDayRehearsalReport();
  const feedbackRehearsalReport = createFeedbackIntakeRehearsalReport();
  const issueTriageRehearsalReport = createIssueTriageRehearsalReport();
  const rollbackRehearsalReport = createRollbackRehearsalReport();
  const ownerReviewReport = createLimitedSoftLaunchOwnerReviewReport();
  const dryRunPackage = createLimitedSoftLaunchDryRunPackage({
    dryRunReport,
    launchDayRehearsalReport,
    feedbackRehearsalReport,
    issueTriageRehearsalReport,
    rollbackRehearsalReport,
    ownerReviewReport
  });
  const dryRunPackageReport = createLimitedSoftLaunchDryRunPackageReport(dryRunPackage);
  const safetyCertification = createFinalSoftLaunchSafetyCertificationReport();
  const surfaceCertification = createFinalSoftLaunchSurfaceCertificationReport();
  const qualityGateReport = createFinalSoftLaunchQualityGateReport();
  const riskRegister = input.riskRegister || createFinalSoftLaunchRiskRegister();
  const knownLimitations = input.knownLimitations || getFinalSoftLaunchKnownLimitations();
  const readinessEvidence = {
    limitedSoftLaunchExecutionReport: createLimitedSoftLaunchExecutionReport(executionPlan),
    participantScopeReport: createParticipantScopeReport(),
    surfaceScopeReport: createLimitedSoftLaunchSurfaceScopeReport(),
    environmentSafetyReport: createLimitedSoftLaunchEnvironmentSafetyReport(),
    feedbackWorkflowReport: createLimitedSoftLaunchFeedbackWorkflowReport(),
    supportResponseReport: createLimitedSoftLaunchSupportResponseReport(),
    communicationPacketReference: createLimitedSoftLaunchCommunicationPacket(),
    launchDayRunbookReport: createLimitedSoftLaunchDayRunbookReport(),
    dryRunReport,
    launchDayRehearsalReport,
    feedbackRehearsalReport,
    issueTriageRehearsalReport,
    rollbackRehearsalReport,
    ownerReviewReport,
    dryRunPackageReport,
    safetyCertification,
    surfaceCertification,
    qualityGateReport
  };
  const blockers = [
    dryRunPackageReport.valid ? undefined : blocker("final_soft_launch_dry_run_package_invalid", "Dry run package invalid", "Dry run package must be valid.", "Resolve dry run package blockers."),
    safetyCertification.valid ? undefined : blocker("final_soft_launch_safety_invalid", "Safety certification invalid", "Final safety certification must pass.", "Resolve safety certification blockers."),
    surfaceCertification.valid ? undefined : blocker("final_soft_launch_surface_invalid", "Surface certification invalid", "Final surface certification must pass.", "Resolve surface certification blockers."),
    qualityGateReport.valid ? undefined : blocker("final_soft_launch_quality_invalid", "Quality gate report invalid", "Final quality gates must pass.", "Resolve final quality gate blockers.")
  ].filter(Boolean) as TeoyubeFinalSoftLaunchReadinessBlocker[];
  const warnings = [
    warning("final_soft_launch_no_external_send", "Readiness package is structured in memory only and is not sent externally."),
    warning("final_soft_launch_owner_review_required", "Owner go/no-go review remains required before limited soft launch execution.")
  ];
  const decisionRecommendation: TeoyubeFinalSoftLaunchGoNoGoDecision =
    blockers.length > 0
      ? "no_go_blocked"
      : ownerReviewReport.ready
        ? "go_for_limited_soft_launch_execution"
        : "go_after_owner_review";

  return {
    id: "final_soft_launch_readiness_package_3_3",
    label: "Soft Launch Preparation 3.3 Final Readiness Package",
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decisionRecommendation,
    readinessEvidence,
    knownLimitations,
    riskRegister,
    blockers,
    warnings,
    finalDecisionGuidance:
      input.finalDecisionGuidance ||
      "Proceed only after owner go/no-go review confirms the final package, safety certification, surface certification, quality gates, risk register, known limitations, feedback workflow, support response, and rollback criteria.",
    inMemoryOnly: true,
    sentExternally: false,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    launchPerformed: false,
    usersContacted: false,
    realFeedbackCollected: false,
    previewUrlFetched: false,
    generatedAt: new Date().toISOString()
  };
}

export function getFinalSoftLaunchReadinessPackageBlockers(
  readinessPackage: TeoyubeFinalSoftLaunchReadinessPackage
): TeoyubeFinalSoftLaunchReadinessBlocker[] {
  return [
    ...readinessPackage.blockers,
    readinessPackage.sentExternally ? blocker("final_soft_launch_package_sent", "Package sent externally", "Package must not be sent externally.", "Keep package local/in-memory.") : undefined,
    readinessPackage.fileWritten ? blocker("final_soft_launch_package_file_written", "Package wrote files", "Package must not write files.", "Remove file-write behavior.") : undefined,
    readinessPackage.databaseWritten ? blocker("final_soft_launch_package_database_written", "Package wrote database", "Package must not write databases.", "Remove database-write behavior.") : undefined,
    readinessPackage.analyticsSent ? blocker("final_soft_launch_package_analytics_sent", "Package sent analytics", "Package must not send analytics.", "Remove analytics sending.") : undefined,
    readinessPackage.launchPerformed ? blocker("final_soft_launch_package_launched", "Launch performed", "Package must not perform launch.", "Remove launch execution behavior.") : undefined,
    readinessPackage.usersContacted ? blocker("final_soft_launch_package_contacted_users", "Users contacted", "Package must not contact users.", "Remove user contact behavior.") : undefined,
    readinessPackage.realFeedbackCollected ? blocker("final_soft_launch_package_collected_feedback", "Real feedback collected", "Package must not collect real feedback.", "Remove feedback collection behavior.") : undefined,
    readinessPackage.previewUrlFetched ? blocker("final_soft_launch_package_fetched_url", "Preview URL fetched", "Package must not fetch preview URLs.", "Remove preview URL fetch behavior.") : undefined
  ].filter(Boolean) as TeoyubeFinalSoftLaunchReadinessBlocker[];
}

export function getFinalSoftLaunchReadinessPackageWarnings(
  readinessPackage: TeoyubeFinalSoftLaunchReadinessPackage
): TeoyubeFinalSoftLaunchReadinessWarning[] {
  return readinessPackage.warnings;
}

export function createFinalSoftLaunchReadinessPackageDecision(
  readinessPackage: TeoyubeFinalSoftLaunchReadinessPackage
): TeoyubeFinalSoftLaunchGoNoGoDecision {
  const blockers = getFinalSoftLaunchReadinessPackageBlockers(readinessPackage);

  if (blockers.some((item) => /safety|scripture|explanation|fallback|consent|privacy|analytics|persistence|live ai/i.test(`${item.label} ${item.reason}`))) return "needs_safety_fix";
  if (blockers.some((item) => /surface|mobile|accessibility|qa/i.test(`${item.label} ${item.reason}`))) return "needs_qa_fix";
  if (blockers.some((item) => /environment/i.test(`${item.label} ${item.reason}`))) return "needs_environment_fix";
  if (blockers.length > 0) return "no_go_blocked";
  return readinessPackage.decisionRecommendation;
}

export function validateFinalSoftLaunchReadinessPackage(
  readinessPackage: TeoyubeFinalSoftLaunchReadinessPackage
) {
  const blockers = getFinalSoftLaunchReadinessPackageBlockers(readinessPackage);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getFinalSoftLaunchReadinessPackageWarnings(readinessPackage)
  };
}

export function createFinalSoftLaunchReadinessPackageReport(
  readinessPackage: TeoyubeFinalSoftLaunchReadinessPackage = createFinalSoftLaunchReadinessPackage()
) {
  const validation = validateFinalSoftLaunchReadinessPackage(readinessPackage);
  const decision = createFinalSoftLaunchReadinessPackageDecision(readinessPackage);

  return {
    valid: validation.valid,
    ready: validation.valid && decision === "go_for_limited_soft_launch_execution",
    status: readinessPackage.status,
    decision,
    package: readinessPackage,
    blockerCount: validation.blockers.length,
    warningCount: validation.warnings.length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
