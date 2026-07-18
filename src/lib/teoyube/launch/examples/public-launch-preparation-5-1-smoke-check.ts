import { runPublicLaunchReadinessAudit } from "../public-launch-readiness-audit";
import { createProductionServiceConnectionPlan, createProductionServiceConnectionPlanReport } from "../production-service-connection-plan";
import { createPublicLaunchDatabasePersistencePlan, createDatabasePersistenceDecisionReport } from "../public-launch-database-persistence-plan";
import { createPublicLaunchAnalyticsPlan, createAnalyticsConnectionDecisionReport } from "../public-launch-analytics-plan";
import { createPublicLaunchLiveAiPlan, createLiveAiDecisionReport } from "../public-launch-live-ai-plan";
import { createPublicLaunchPrivacyConsentReport } from "../public-launch-privacy-consent-readiness";
import {
  createPublicLaunchSafetyCertificationReport,
  validatePublicLaunchExplanationPaths,
  validatePublicLaunchFallbackSafety,
  validatePublicLaunchNoExternalAnalytics,
  validatePublicLaunchNoLiveAiUnlessApproved,
  validatePublicLaunchNoPersistenceUnlessApproved,
  validatePublicLaunchScriptureAnchoring
} from "../public-launch-safety-certification";
import { createPublicLaunchSurfaceReadinessReport, PUBLIC_LAUNCH_SURFACES } from "../public-launch-surface-readiness-certification";
import { createPublicLaunchPreparationPackage, createPublicLaunchPreparationPackageReport } from "../public-launch-preparation-package";
import { createPublicLaunchOwnerReviewChecklist, createPublicLaunchOwnerReviewRecord, createPublicLaunchOwnerReviewReport } from "../public-launch-owner-review";
import { runPublicLaunchPreparationAudit } from "../public-launch-preparation-audit";

export function runPublicLaunchPreparation51SmokeCheck() {
  const readinessAudit = runPublicLaunchReadinessAudit();
  const servicePlan = createProductionServiceConnectionPlan();
  const servicePlanReport = createProductionServiceConnectionPlanReport(servicePlan);
  const databaseReport = createDatabasePersistenceDecisionReport(createPublicLaunchDatabasePersistencePlan());
  const analyticsReport = createAnalyticsConnectionDecisionReport(createPublicLaunchAnalyticsPlan());
  const liveAiReport = createLiveAiDecisionReport(createPublicLaunchLiveAiPlan());
  const privacyReport = createPublicLaunchPrivacyConsentReport();
  const safetyReport = createPublicLaunchSafetyCertificationReport();
  const surfaceReport = createPublicLaunchSurfaceReadinessReport();
  const packageToReview = createPublicLaunchPreparationPackage();
  const packageReport = createPublicLaunchPreparationPackageReport(packageToReview);
  const ownerChecklist = createPublicLaunchOwnerReviewChecklist();
  const ownerReview = createPublicLaunchOwnerReviewReport(createPublicLaunchOwnerReviewRecord());
  const audit = runPublicLaunchPreparationAudit();

  const planIds = new Set(servicePlan.map((entry) => entry.id));
  const checks = [
    readinessAudit.ready && readinessAudit.readinessPercentage === 100,
    readinessAudit.noPublicLaunchPerformed && readinessAudit.noUsersContacted && readinessAudit.noFeedbackCollectedAutomatically,
    servicePlan.length >= 15 && planIds.size === servicePlan.length,
    servicePlanReport.ready && servicePlanReport.noProvidersConnected && servicePlanReport.noSecretsWritten && servicePlanReport.noExternalCallsEnabled,
    databaseReport.ready && databaseReport.noDatabaseConnected && databaseReport.noMigrationsCreated && databaseReport.noProviderInstalled,
    analyticsReport.ready && analyticsReport.noAnalyticsConnected && analyticsReport.noAnalyticsSent && analyticsReport.noSdkInstalled,
    liveAiReport.ready && liveAiReport.noLiveAiEnabled && liveAiReport.noOpenAiApiCalled && liveAiReport.noApiKeyWritten && liveAiReport.deterministicTigPreserved,
    privacyReport.ready && privacyReport.consentReady && privacyReport.noHiddenPersonalization && privacyReport.noRawSensitiveStorage,
    safetyReport.ready && validatePublicLaunchScriptureAnchoring() && validatePublicLaunchExplanationPaths() && validatePublicLaunchFallbackSafety(),
    validatePublicLaunchNoExternalAnalytics() && validatePublicLaunchNoPersistenceUnlessApproved() && validatePublicLaunchNoLiveAiUnlessApproved(),
    surfaceReport.ready && surfaceReport.surfaceCount === PUBLIC_LAUNCH_SURFACES.length && surfaceReport.surfaceCount >= 15,
    packageReport.ready && packageToReview.inMemoryOnly && packageReport.noPublicLaunchPerformed && packageReport.noExternalWrite,
    ownerChecklist.length >= 10 && ownerReview.ready && ownerReview.noUsersContacted && ownerReview.noExternalWrite,
    audit.complete && audit.completionPercentage === 100,
    !packageToReview.publicLaunchPerformed && !packageToReview.usersContacted && !packageToReview.feedbackCollectedAutomatically,
    !packageToReview.databaseWritten && !packageToReview.analyticsSent && !packageToReview.externalServicesCalled,
    !packageToReview.productionPersistenceConnected && !packageToReview.externalAnalyticsConnected && !packageToReview.liveAiOrchestrationConnected
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noDatabaseExternalApisAnalyticsStorageOrFileWritesRequired: true,
    noServiceWorkerRequired: true,
    noLocalStorageCookiesIndexedDbRequired: true,
    publicLaunchReadinessDecision: readinessAudit.decision,
    preparationPackageDecision: packageReport.decision,
    audit,
    generatedAt: new Date().toISOString()
  };
}
