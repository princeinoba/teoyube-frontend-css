import { runPublicLaunchReadinessAudit } from "../public-launch-readiness-audit";
import { createProductionServiceConnectionPlan, createProductionServiceConnectionPlanReport } from "../production-service-connection-plan";
import { createPublicLaunchDatabasePersistencePlan, createDatabasePersistenceDecisionReport } from "../public-launch-database-persistence-plan";
import { createPublicLaunchAnalyticsPlan, createAnalyticsConnectionDecisionReport } from "../public-launch-analytics-plan";
import { createPublicLaunchLiveAiPlan, createLiveAiDecisionReport } from "../public-launch-live-ai-plan";
import { createPublicLaunchPrivacyConsentReport } from "../public-launch-privacy-consent-readiness";
import { createPublicLaunchSafetyCertificationReport } from "../public-launch-safety-certification";
import { createPublicLaunchSurfaceReadinessReport } from "../public-launch-surface-readiness-certification";
import { createPublicLaunchPreparationPackage, createPublicLaunchPreparationPackageReport } from "../public-launch-preparation-package";
import { createPublicLaunchOwnerReviewRecord, createPublicLaunchOwnerReviewReport } from "../public-launch-owner-review";
import { runPublicLaunchPreparationAudit } from "../public-launch-preparation-audit";

export function runPublicLaunchPreparation51Example() {
  const serviceConnectionPlan = createProductionServiceConnectionPlan();
  const preparationPackage = createPublicLaunchPreparationPackage();

  return {
    readinessAudit: runPublicLaunchReadinessAudit(),
    serviceConnectionPlanReport: createProductionServiceConnectionPlanReport(serviceConnectionPlan),
    databasePersistenceReport: createDatabasePersistenceDecisionReport(createPublicLaunchDatabasePersistencePlan()),
    analyticsReport: createAnalyticsConnectionDecisionReport(createPublicLaunchAnalyticsPlan()),
    liveAiReport: createLiveAiDecisionReport(createPublicLaunchLiveAiPlan()),
    privacyConsentReport: createPublicLaunchPrivacyConsentReport(),
    safetyCertificationReport: createPublicLaunchSafetyCertificationReport(),
    surfaceReadinessReport: createPublicLaunchSurfaceReadinessReport(),
    preparationPackageReport: createPublicLaunchPreparationPackageReport(preparationPackage),
    ownerReviewReport: createPublicLaunchOwnerReviewReport(createPublicLaunchOwnerReviewRecord()),
    preparationAudit: runPublicLaunchPreparationAudit()
  };
}
