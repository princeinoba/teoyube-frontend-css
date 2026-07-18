import type {
  TeoyubePostLaunchReadinessDecision,
  TeoyubePostLaunchReadinessPackage
} from "./public-launch-completion-contracts";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import { createPostLaunchKnownLimitationsReport } from "./post-launch-known-limitations";
import { createPostLaunchOwnerReadinessRecord, createPostLaunchOwnerReadinessReport } from "./post-launch-owner-readiness-review";
import { createPostLaunchReadinessCriteriaReport } from "./post-launch-readiness-criteria";
import { createPostLaunchRiskRegister, createPostLaunchRiskRegisterReport } from "./post-launch-risk-register";
import { createPublicLaunchCompletionReport } from "./public-launch-completion-review";
import { createPublicLaunchFeedbackSummaryReport } from "./public-launch-feedback-summary";
import { createPublicLaunchFinalSafetyPrivacyReport } from "./public-launch-final-safety-privacy-review";
import { createPublicLaunchIssueClosureReport } from "./public-launch-issue-closure";
import { createPublicLaunchStabilityCertificationReport } from "./public-launch-stability-certification";

export type TeoyubePostLaunchReadinessPackageInput = Partial<TeoyubePostLaunchReadinessPackage> & {
  riskRegisterReport?: ReturnType<typeof createPostLaunchRiskRegisterReport>;
};

export function createPostLaunchReadinessPackage(
  input: TeoyubePostLaunchReadinessPackageInput = {}
): TeoyubePostLaunchReadinessPackage {
  const completionReport = input.completionReport || createPublicLaunchCompletionReport();
  const feedbackSummaryReport = input.feedbackSummaryReport || createPublicLaunchFeedbackSummaryReport();
  const issueClosureReport = input.issueClosureReport || createPublicLaunchIssueClosureReport();
  const stabilityCertificationReport = input.stabilityCertificationReport || createPublicLaunchStabilityCertificationReport();
  const finalSafetyPrivacyReport = input.finalSafetyPrivacyReport || createPublicLaunchFinalSafetyPrivacyReport();
  const surfaceReadinessReport = input.surfaceReadinessReport || createLaunchSurfaceReadinessReport();
  const readinessCriteriaReport = input.readinessCriteriaReport || createPostLaunchReadinessCriteriaReport({
    completionReport: completionReport as ReturnType<typeof createPublicLaunchCompletionReport>,
    feedbackSummaryReport: feedbackSummaryReport as ReturnType<typeof createPublicLaunchFeedbackSummaryReport>,
    issueClosureReport: issueClosureReport as ReturnType<typeof createPublicLaunchIssueClosureReport>,
    stabilityCertificationReport: stabilityCertificationReport as ReturnType<typeof createPublicLaunchStabilityCertificationReport>,
    finalSafetyPrivacyReport: finalSafetyPrivacyReport as ReturnType<typeof createPublicLaunchFinalSafetyPrivacyReport>,
    surfaceReadinessReport: surfaceReadinessReport as ReturnType<typeof createLaunchSurfaceReadinessReport>
  });
  const knownLimitationsReport = createPostLaunchKnownLimitationsReport();
  const riskRegisterReport = input.riskRegisterReport || createPostLaunchRiskRegisterReport(createPostLaunchRiskRegister());
  const ownerReview = input.ownerReview || createPostLaunchOwnerReadinessReport(createPostLaunchOwnerReadinessRecord());

  return {
    id: input.id || "post_launch_readiness_package_6_5",
    label: input.label || "Post-Launch Readiness Package",
    completionReport,
    feedbackSummaryReport,
    issueClosureReport,
    stabilityCertificationReport,
    finalSafetyPrivacyReport,
    readinessCriteriaReport,
    surfaceReadinessReport,
    productionServiceStatus: input.productionServiceStatus || "controlled",
    knownLimitations: input.knownLimitations || knownLimitationsReport.limitations.map((entry) => entry.message),
    risks: input.risks || riskRegisterReport.risks,
    ownerReview,
    recommendedNextStage: "Post-Launch Operations",
    recommendedNextStep: "7.1 - Public Monitoring, Support & Growth Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicUrlFetched: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    productionPersistenceEnabled: false,
    externalAnalyticsEnabled: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPostLaunchReadinessPackageBlockers(pkg: TeoyubePostLaunchReadinessPackage) {
  const completionReport = pkg.completionReport as ReturnType<typeof createPublicLaunchCompletionReport>;
  const feedbackSummaryReport = pkg.feedbackSummaryReport as ReturnType<typeof createPublicLaunchFeedbackSummaryReport>;
  const issueClosureReport = pkg.issueClosureReport as ReturnType<typeof createPublicLaunchIssueClosureReport>;
  const stabilityCertificationReport = pkg.stabilityCertificationReport as ReturnType<typeof createPublicLaunchStabilityCertificationReport>;
  const finalSafetyPrivacyReport = pkg.finalSafetyPrivacyReport as ReturnType<typeof createPublicLaunchFinalSafetyPrivacyReport>;
  const readinessCriteriaReport = pkg.readinessCriteriaReport as ReturnType<typeof createPostLaunchReadinessCriteriaReport>;
  const ownerReview = pkg.ownerReview as ReturnType<typeof createPostLaunchOwnerReadinessReport>;
  return [
    ...completionReport.blockers,
    ...feedbackSummaryReport.blockers,
    ...issueClosureReport.blockers,
    ...stabilityCertificationReport.blockers,
    ...finalSafetyPrivacyReport.blockers,
    ...readinessCriteriaReport.blockers,
    ...ownerReview.blockers,
    ...pkg.risks.filter((risk) => risk.severity === "critical" && risk.status !== "resolved").map((risk) => ({ id: `post_launch_package_risk_${risk.id}`, label: risk.label, reason: risk.mitigation, requiredAction: "Resolve or owner-accept this critical risk.", riskLevel: "critical" as const })),
    pkg.fileWritten ? { id: "post_launch_package_file_written", label: pkg.label, reason: "Package must not write files.", requiredAction: "Keep package in memory.", riskLevel: "high" as const } : undefined,
    pkg.databaseWritten ? { id: "post_launch_package_database_written", label: pkg.label, reason: "Package must not write databases.", requiredAction: "Keep production persistence disabled.", riskLevel: "critical" as const } : undefined,
    pkg.analyticsSent ? { id: "post_launch_package_analytics_sent", label: pkg.label, reason: "Package must not send analytics.", requiredAction: "Keep external analytics disabled.", riskLevel: "critical" as const } : undefined,
    pkg.externalServicesCalled ? { id: "post_launch_package_external_services_called", label: pkg.label, reason: "Package must not call external services.", requiredAction: "Keep service connection for future explicit post-launch operations.", riskLevel: "critical" as const } : undefined,
    pkg.publicUrlFetched ? { id: "post_launch_package_public_url_fetched", label: pkg.label, reason: "Package must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    pkg.usersContacted ? { id: "post_launch_package_users_contacted", label: pkg.label, reason: "Package must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "post_launch_package_feedback_collected", label: pkg.label, reason: "Package must not collect feedback automatically.", requiredAction: "Use manual feedback summaries only.", riskLevel: "critical" as const } : undefined,
    pkg.productionPersistenceEnabled ? { id: "post_launch_package_persistence_enabled", label: pkg.label, reason: "Package must not enable production persistence.", requiredAction: "Keep persistence disabled until explicit approval.", riskLevel: "critical" as const } : undefined,
    pkg.externalAnalyticsEnabled ? { id: "post_launch_package_analytics_enabled", label: pkg.label, reason: "Package must not enable external analytics.", requiredAction: "Keep analytics disabled until explicit approval.", riskLevel: "critical" as const } : undefined,
    pkg.liveAiOrchestrationEnabled ? { id: "post_launch_package_live_ai_enabled", label: pkg.label, reason: "Package must not enable live AI orchestration.", requiredAction: "Keep live AI disabled until explicit approval.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPostLaunchReadinessPackageWarnings(pkg: TeoyubePostLaunchReadinessPackage) {
  const completionReport = pkg.completionReport as ReturnType<typeof createPublicLaunchCompletionReport>;
  const feedbackSummaryReport = pkg.feedbackSummaryReport as ReturnType<typeof createPublicLaunchFeedbackSummaryReport>;
  const issueClosureReport = pkg.issueClosureReport as ReturnType<typeof createPublicLaunchIssueClosureReport>;
  const stabilityCertificationReport = pkg.stabilityCertificationReport as ReturnType<typeof createPublicLaunchStabilityCertificationReport>;
  const finalSafetyPrivacyReport = pkg.finalSafetyPrivacyReport as ReturnType<typeof createPublicLaunchFinalSafetyPrivacyReport>;
  const readinessCriteriaReport = pkg.readinessCriteriaReport as ReturnType<typeof createPostLaunchReadinessCriteriaReport>;
  const ownerReview = pkg.ownerReview as ReturnType<typeof createPostLaunchOwnerReadinessReport>;
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

export function createPostLaunchReadinessPackageDecision(pkg: TeoyubePostLaunchReadinessPackage): TeoyubePostLaunchReadinessDecision {
  const blockers = getPostLaunchReadinessPackageBlockers(pkg);
  const ownerReview = pkg.ownerReview as ReturnType<typeof createPostLaunchOwnerReadinessReport>;
  const readinessCriteriaReport = pkg.readinessCriteriaReport as ReturnType<typeof createPostLaunchReadinessCriteriaReport>;
  if (blockers.length > 0) return "blocked";
  if (readinessCriteriaReport.decision === "not_applicable_no_public_launch_recorded") return "not_applicable_no_public_launch_recorded";
  if (ownerReview.decision !== "ready_for_post_launch_operations") return "ready_after_owner_review";
  if (getPostLaunchReadinessPackageWarnings(pkg).length > 0) return "ready_after_owner_review";
  return "ready_for_post_launch_operations";
}

export function validatePostLaunchReadinessPackage(pkg: TeoyubePostLaunchReadinessPackage) {
  const blockers = getPostLaunchReadinessPackageBlockers(pkg);
  const warnings = getPostLaunchReadinessPackageWarnings(pkg);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPostLaunchReadinessPackageReport(pkg: TeoyubePostLaunchReadinessPackage = createPostLaunchReadinessPackage()) {
  const validation = validatePostLaunchReadinessPackage(pkg);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPostLaunchReadinessPackageDecision(pkg),
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
