import type {
  TeoyubePublicLaunchReadinessDecision,
  TeoyubePublicLaunchReadinessPackage
} from "./soft-launch-completion-contracts";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";
import { createPublicLaunchOwnerReadinessRecord, createPublicLaunchOwnerReadinessReport } from "./public-launch-owner-readiness-review";
import { createPublicLaunchReadinessCriteriaReport } from "./public-launch-readiness-criteria";
import { createPublicLaunchRiskRegister, createPublicLaunchRiskRegisterReport } from "./public-launch-risk-register";
import { createSoftLaunchCompletionReport } from "./soft-launch-completion-review";
import { createSoftLaunchFeedbackSummaryReport } from "./soft-launch-feedback-summary";
import { createSoftLaunchFinalSafetyPrivacyReport } from "./soft-launch-final-safety-privacy-review";
import { createSoftLaunchIssueClosureReport } from "./soft-launch-issue-closure";
import { createSoftLaunchStabilityCertificationReport } from "./soft-launch-stability-certification";

export type TeoyubePublicLaunchReadinessPackageInput = Partial<TeoyubePublicLaunchReadinessPackage> & {
  riskRegisterReport?: ReturnType<typeof createPublicLaunchRiskRegisterReport>;
};

export function createPublicLaunchReadinessPackage(
  input: TeoyubePublicLaunchReadinessPackageInput = {}
): TeoyubePublicLaunchReadinessPackage {
  const completionReport = input.completionReport || createSoftLaunchCompletionReport();
  const feedbackSummaryReport = input.feedbackSummaryReport || createSoftLaunchFeedbackSummaryReport();
  const issueClosureReport = input.issueClosureReport || createSoftLaunchIssueClosureReport();
  const stabilityCertificationReport = input.stabilityCertificationReport || createSoftLaunchStabilityCertificationReport();
  const finalSafetyPrivacyReport = input.finalSafetyPrivacyReport || createSoftLaunchFinalSafetyPrivacyReport();
  const surfaceReadinessReport = input.surfaceReadinessReport || createLaunchSurfaceReadinessReport();
  const readinessCriteriaReport = input.readinessCriteriaReport || createPublicLaunchReadinessCriteriaReport({
    completionReport: completionReport as ReturnType<typeof createSoftLaunchCompletionReport>,
    feedbackSummaryReport: feedbackSummaryReport as ReturnType<typeof createSoftLaunchFeedbackSummaryReport>,
    issueClosureReport: issueClosureReport as ReturnType<typeof createSoftLaunchIssueClosureReport>,
    stabilityCertificationReport: stabilityCertificationReport as ReturnType<typeof createSoftLaunchStabilityCertificationReport>,
    finalSafetyPrivacyReport: finalSafetyPrivacyReport as ReturnType<typeof createSoftLaunchFinalSafetyPrivacyReport>,
    surfaceReadinessReport: surfaceReadinessReport as ReturnType<typeof createLaunchSurfaceReadinessReport>
  });
  const knownLimitationsReport = createPublicLaunchKnownLimitationsReport();
  const riskRegisterReport = input.riskRegisterReport || createPublicLaunchRiskRegisterReport(createPublicLaunchRiskRegister());
  const ownerReview = input.ownerReview || createPublicLaunchOwnerReadinessReport(createPublicLaunchOwnerReadinessRecord());

  return {
    id: input.id || "public_launch_readiness_package_4_5",
    label: input.label || "Public Launch Readiness Package",
    completionReport,
    feedbackSummaryReport,
    issueClosureReport,
    stabilityCertificationReport,
    finalSafetyPrivacyReport,
    readinessCriteriaReport,
    surfaceReadinessReport,
    knownLimitations: input.knownLimitations || knownLimitationsReport.limitations.map((entry) => entry.message),
    risks: input.risks || riskRegisterReport.risks,
    ownerReview,
    recommendedNextStage: "Public Launch Preparation",
    recommendedNextStep: "5.1 - Public Launch Readiness Audit & Production Service Connection Plan",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicLaunchReadinessPackageBlockers(pkg: TeoyubePublicLaunchReadinessPackage) {
  const completionReport = pkg.completionReport as ReturnType<typeof createSoftLaunchCompletionReport>;
  const feedbackSummaryReport = pkg.feedbackSummaryReport as ReturnType<typeof createSoftLaunchFeedbackSummaryReport>;
  const issueClosureReport = pkg.issueClosureReport as ReturnType<typeof createSoftLaunchIssueClosureReport>;
  const stabilityCertificationReport = pkg.stabilityCertificationReport as ReturnType<typeof createSoftLaunchStabilityCertificationReport>;
  const finalSafetyPrivacyReport = pkg.finalSafetyPrivacyReport as ReturnType<typeof createSoftLaunchFinalSafetyPrivacyReport>;
  const readinessCriteriaReport = pkg.readinessCriteriaReport as ReturnType<typeof createPublicLaunchReadinessCriteriaReport>;
  const ownerReview = pkg.ownerReview as ReturnType<typeof createPublicLaunchOwnerReadinessReport>;
  return [
    ...completionReport.blockers,
    ...feedbackSummaryReport.blockers,
    ...issueClosureReport.blockers,
    ...stabilityCertificationReport.blockers,
    ...finalSafetyPrivacyReport.blockers,
    ...readinessCriteriaReport.blockers,
    ...ownerReview.blockers,
    ...pkg.risks.filter((risk) => risk.severity === "critical" && risk.status !== "resolved").map((risk) => ({ id: `public_launch_package_risk_${risk.id}`, label: risk.label, reason: risk.mitigation, requiredAction: "Resolve or owner-accept this critical risk.", riskLevel: "critical" as const })),
    pkg.fileWritten ? { id: "public_launch_package_file_written", label: pkg.label, reason: "Package must not write files.", requiredAction: "Keep package in memory.", riskLevel: "high" as const } : undefined,
    pkg.databaseWritten ? { id: "public_launch_package_database_written", label: pkg.label, reason: "Package must not write databases.", requiredAction: "Keep production persistence disabled.", riskLevel: "critical" as const } : undefined,
    pkg.analyticsSent ? { id: "public_launch_package_analytics_sent", label: pkg.label, reason: "Package must not send analytics.", requiredAction: "Keep external analytics disabled.", riskLevel: "critical" as const } : undefined,
    pkg.externalServicesCalled ? { id: "public_launch_package_external_services_called", label: pkg.label, reason: "Package must not call external services.", requiredAction: "Keep service connection for future explicit preparation.", riskLevel: "critical" as const } : undefined,
    pkg.publicLaunchPerformed ? { id: "public_launch_package_launch_performed", label: pkg.label, reason: "Package must not perform public launch.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    pkg.usersContacted ? { id: "public_launch_package_users_contacted", label: pkg.label, reason: "Package must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "public_launch_package_feedback_collected", label: pkg.label, reason: "Package must not collect feedback automatically.", requiredAction: "Use manual feedback summaries only.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchReadinessPackageWarnings(pkg: TeoyubePublicLaunchReadinessPackage) {
  const completionReport = pkg.completionReport as ReturnType<typeof createSoftLaunchCompletionReport>;
  const feedbackSummaryReport = pkg.feedbackSummaryReport as ReturnType<typeof createSoftLaunchFeedbackSummaryReport>;
  const issueClosureReport = pkg.issueClosureReport as ReturnType<typeof createSoftLaunchIssueClosureReport>;
  const stabilityCertificationReport = pkg.stabilityCertificationReport as ReturnType<typeof createSoftLaunchStabilityCertificationReport>;
  const finalSafetyPrivacyReport = pkg.finalSafetyPrivacyReport as ReturnType<typeof createSoftLaunchFinalSafetyPrivacyReport>;
  const readinessCriteriaReport = pkg.readinessCriteriaReport as ReturnType<typeof createPublicLaunchReadinessCriteriaReport>;
  const ownerReview = pkg.ownerReview as ReturnType<typeof createPublicLaunchOwnerReadinessReport>;
  return [
    ...completionReport.warnings,
    ...feedbackSummaryReport.warnings,
    ...issueClosureReport.warnings,
    ...stabilityCertificationReport.warnings,
    ...finalSafetyPrivacyReport.warnings,
    ...readinessCriteriaReport.warnings,
    ...ownerReview.warnings
  ];
}

export function createPublicLaunchReadinessPackageDecision(pkg: TeoyubePublicLaunchReadinessPackage): TeoyubePublicLaunchReadinessDecision {
  const blockers = getPublicLaunchReadinessPackageBlockers(pkg);
  const ownerReview = pkg.ownerReview as ReturnType<typeof createPublicLaunchOwnerReadinessReport>;
  if (blockers.length > 0) return "blocked";
  if (ownerReview.decision !== "ready_for_public_launch_preparation") return "ready_after_owner_review";
  if (getPublicLaunchReadinessPackageWarnings(pkg).length > 0) return "ready_after_owner_review";
  return "ready_for_public_launch_preparation";
}

export function validatePublicLaunchReadinessPackage(pkg: TeoyubePublicLaunchReadinessPackage) {
  const blockers = getPublicLaunchReadinessPackageBlockers(pkg);
  const warnings = getPublicLaunchReadinessPackageWarnings(pkg);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPublicLaunchReadinessPackageReport(pkg: TeoyubePublicLaunchReadinessPackage = createPublicLaunchReadinessPackage()) {
  const validation = validatePublicLaunchReadinessPackage(pkg);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPublicLaunchReadinessPackageDecision(pkg),
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
