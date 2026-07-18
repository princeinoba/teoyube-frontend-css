import type { TeoyubePublicLaunchDecision } from "./public-launch-preparation-contracts";
import { runPublicLaunchReadinessAudit } from "./public-launch-readiness-audit";
import { createProductionServiceConnectionPlan, createProductionServiceConnectionPlanReport } from "./production-service-connection-plan";
import { createPublicLaunchDatabasePersistencePlan, createDatabasePersistenceDecisionReport } from "./public-launch-database-persistence-plan";
import { createPublicLaunchAnalyticsPlan, createAnalyticsConnectionDecisionReport } from "./public-launch-analytics-plan";
import { createPublicLaunchLiveAiPlan, createLiveAiDecisionReport } from "./public-launch-live-ai-plan";
import { createPublicLaunchPrivacyConsentReport } from "./public-launch-privacy-consent-readiness";
import { createPublicLaunchSafetyCertificationReport } from "./public-launch-safety-certification";
import { createPublicLaunchSurfaceReadinessReport } from "./public-launch-surface-readiness-certification";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";
import { createPublicLaunchRiskRegister, createPublicLaunchRiskRegisterReport } from "./public-launch-risk-register";
import { createPublicLaunchOwnerReviewRecord, createPublicLaunchOwnerReviewReport } from "./public-launch-owner-review";

export type TeoyubePublicLaunchPreparationPackage = {
  id: string;
  label: string;
  readinessAudit: ReturnType<typeof runPublicLaunchReadinessAudit>;
  serviceConnectionPlanReport: ReturnType<typeof createProductionServiceConnectionPlanReport>;
  databasePersistenceReport: ReturnType<typeof createDatabasePersistenceDecisionReport>;
  analyticsReport: ReturnType<typeof createAnalyticsConnectionDecisionReport>;
  liveAiReport: ReturnType<typeof createLiveAiDecisionReport>;
  privacyConsentReport: ReturnType<typeof createPublicLaunchPrivacyConsentReport>;
  safetyCertificationReport: ReturnType<typeof createPublicLaunchSafetyCertificationReport>;
  surfaceReadinessReport: ReturnType<typeof createPublicLaunchSurfaceReadinessReport>;
  knownLimitationsReport: ReturnType<typeof createPublicLaunchKnownLimitationsReport>;
  riskRegisterReport: ReturnType<typeof createPublicLaunchRiskRegisterReport>;
  ownerReviewReport: ReturnType<typeof createPublicLaunchOwnerReviewReport>;
  recommendedNextStage: "Public Launch Preparation";
  recommendedNextStep: "5.2 - Privacy, Terms, Consent Copy & Public QA Checklist";
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  productionPersistenceConnected: false;
  externalAnalyticsConnected: false;
  liveAiOrchestrationConnected: false;
  generatedAt: string;
};

export function createPublicLaunchPreparationPackage(): TeoyubePublicLaunchPreparationPackage {
  const serviceConnectionPlan = createProductionServiceConnectionPlan();
  return {
    id: "public_launch_preparation_package_5_1",
    label: "Public Launch Preparation 5.1 Package",
    readinessAudit: runPublicLaunchReadinessAudit(),
    serviceConnectionPlanReport: createProductionServiceConnectionPlanReport(serviceConnectionPlan),
    databasePersistenceReport: createDatabasePersistenceDecisionReport(createPublicLaunchDatabasePersistencePlan()),
    analyticsReport: createAnalyticsConnectionDecisionReport(createPublicLaunchAnalyticsPlan()),
    liveAiReport: createLiveAiDecisionReport(createPublicLaunchLiveAiPlan()),
    privacyConsentReport: createPublicLaunchPrivacyConsentReport(),
    safetyCertificationReport: createPublicLaunchSafetyCertificationReport(),
    surfaceReadinessReport: createPublicLaunchSurfaceReadinessReport(),
    knownLimitationsReport: createPublicLaunchKnownLimitationsReport(),
    riskRegisterReport: createPublicLaunchRiskRegisterReport(createPublicLaunchRiskRegister()),
    ownerReviewReport: createPublicLaunchOwnerReviewReport(createPublicLaunchOwnerReviewRecord()),
    recommendedNextStage: "Public Launch Preparation",
    recommendedNextStep: "5.2 - Privacy, Terms, Consent Copy & Public QA Checklist",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    productionPersistenceConnected: false,
    externalAnalyticsConnected: false,
    liveAiOrchestrationConnected: false,
    generatedAt: new Date().toISOString()
  };
}

export function getPublicLaunchPreparationPackageBlockers(pkg: TeoyubePublicLaunchPreparationPackage = createPublicLaunchPreparationPackage()) {
  return [
    ...pkg.readinessAudit.blockers,
    ...pkg.serviceConnectionPlanReport.blockers,
    ...pkg.databasePersistenceReport.blockers,
    ...pkg.analyticsReport.blockers,
    ...pkg.liveAiReport.blockers,
    ...pkg.privacyConsentReport.blockers,
    ...pkg.safetyCertificationReport.blockers,
    ...pkg.surfaceReadinessReport.blockers,
    ...pkg.ownerReviewReport.blockers,
    pkg.fileWritten ? { id: "public_launch_preparation_package_file_written", label: pkg.label, reason: "5.1 package must not write files.", requiredAction: "Keep package in memory.", riskLevel: "high" as const } : undefined,
    pkg.databaseWritten || pkg.productionPersistenceConnected ? { id: "public_launch_preparation_package_database_connected", label: pkg.label, reason: "5.1 package must not connect production persistence.", requiredAction: "Keep persistence disconnected.", riskLevel: "critical" as const } : undefined,
    pkg.analyticsSent || pkg.externalAnalyticsConnected ? { id: "public_launch_preparation_package_analytics_connected", label: pkg.label, reason: "5.1 package must not connect or send analytics.", requiredAction: "Keep analytics disconnected.", riskLevel: "critical" as const } : undefined,
    pkg.externalServicesCalled || pkg.liveAiOrchestrationConnected ? { id: "public_launch_preparation_package_live_ai_connected", label: pkg.label, reason: "5.1 package must not connect live AI or call external services.", requiredAction: "Keep live AI disconnected.", riskLevel: "critical" as const } : undefined,
    pkg.publicLaunchPerformed ? { id: "public_launch_preparation_package_launch_performed", label: pkg.label, reason: "5.1 package must not perform public launch.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    pkg.usersContacted ? { id: "public_launch_preparation_package_users_contacted", label: pkg.label, reason: "5.1 package must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "public_launch_preparation_package_feedback_collected", label: pkg.label, reason: "5.1 package must not collect feedback automatically.", requiredAction: "Use manual feedback only.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchPreparationPackageWarnings(pkg: TeoyubePublicLaunchPreparationPackage = createPublicLaunchPreparationPackage()) {
  return [
    ...pkg.readinessAudit.warnings,
    ...pkg.serviceConnectionPlanReport.warnings,
    ...pkg.databasePersistenceReport.warnings,
    ...pkg.analyticsReport.warnings,
    ...pkg.liveAiReport.warnings,
    ...pkg.privacyConsentReport.warnings,
    ...pkg.surfaceReadinessReport.warnings,
    ...pkg.ownerReviewReport.warnings
  ];
}

export function createPublicLaunchPreparationPackageDecision(
  pkg: TeoyubePublicLaunchPreparationPackage = createPublicLaunchPreparationPackage()
): TeoyubePublicLaunchDecision {
  const blockers = getPublicLaunchPreparationPackageBlockers(pkg);
  if (blockers.length > 0) return "blocked";
  if (getPublicLaunchPreparationPackageWarnings(pkg).length > 0) return "ready_after_owner_review";
  return "ready_for_service_connection_planning";
}

export function createPublicLaunchPreparationPackageReport(
  pkg: TeoyubePublicLaunchPreparationPackage = createPublicLaunchPreparationPackage()
) {
  const blockers = getPublicLaunchPreparationPackageBlockers(pkg);
  const warnings = getPublicLaunchPreparationPackageWarnings(pkg);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createPublicLaunchPreparationPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noProductionPersistenceConnected: true,
    noExternalAnalyticsConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    nextRecommendedStep: pkg.recommendedNextStep,
    generatedAt: new Date().toISOString()
  };
}
