import { runPublicLaunchReadinessAudit } from "./public-launch-readiness-audit";
import { createPublicLaunchPreparationPackage, createPublicLaunchPreparationPackageReport } from "./public-launch-preparation-package";
import { createPublicLaunchOwnerReviewRecord, createPublicLaunchOwnerReviewReport } from "./public-launch-owner-review";

export type TeoyubePublicLaunchPreparationAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  required: boolean;
  details: string;
};

export type TeoyubePublicLaunchPreparationAuditReport = {
  complete: boolean;
  ready: boolean;
  completionPercentage: number;
  checklist: TeoyubePublicLaunchPreparationAuditItem[];
  missingItems: TeoyubePublicLaunchPreparationAuditItem[];
  warnings: Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "low" | "medium" | "high" | "critical" }>;
  nextRecommendedStep: "Public Launch Preparation 5.2 - Privacy, Terms, Consent Copy & Public QA Checklist";
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noProductionPersistenceConnected: true;
  noExternalAnalyticsConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePublicLaunchPreparationAuditItem {
  return { id, label, complete, required: true, details };
}

export function getPublicLaunchPreparationAuditChecklist(): TeoyubePublicLaunchPreparationAuditItem[] {
  const readinessAudit = runPublicLaunchReadinessAudit();
  const preparationPackage = createPublicLaunchPreparationPackage();
  const preparationPackageReport = createPublicLaunchPreparationPackageReport(preparationPackage);
  const ownerReview = createPublicLaunchOwnerReviewReport(createPublicLaunchOwnerReviewRecord());
  return [
    item("public_launch_preparation_contracts_exist", "Public launch preparation contracts exist", true, "5.1 public launch preparation contracts are available."),
    item("production_service_connection_contracts_exist", "Production service connection contracts exist", true, "Provider-neutral production service connection contracts are available."),
    item("public_launch_readiness_audit_complete", "Public launch readiness audit complete", readinessAudit.ready && readinessAudit.readinessPercentage === 100, "5.1 public launch readiness audit is complete."),
    item("production_service_connection_plan_complete", "Production service connection plan complete", preparationPackage.serviceConnectionPlanReport.ready && preparationPackage.serviceConnectionPlanReport.noProvidersConnected, "Service plan connects no providers and writes no secrets."),
    item("database_persistence_plan_complete", "Database persistence plan complete", preparationPackage.databasePersistenceReport.ready && preparationPackage.databasePersistenceReport.noDatabaseConnected, "Database persistence remains deferred."),
    item("analytics_plan_complete", "Analytics plan complete", preparationPackage.analyticsReport.ready && preparationPackage.analyticsReport.noAnalyticsSent, "External analytics remain disconnected."),
    item("live_ai_plan_complete", "Live AI plan complete", preparationPackage.liveAiReport.ready && preparationPackage.liveAiReport.noOpenAiApiCalled, "Live AI orchestration remains disabled."),
    item("privacy_consent_readiness_complete", "Privacy and consent readiness complete", preparationPackage.privacyConsentReport.ready && preparationPackage.privacyConsentReport.noRawSensitiveStorage, "Privacy and consent boundaries are ready for 5.2."),
    item("public_launch_safety_certification_complete", "Public launch safety certification complete", preparationPackage.safetyCertificationReport.ready && preparationPackage.safetyCertificationReport.scriptureAnchoringRequired, "Safety guardrails remain intact."),
    item("public_launch_surface_certification_complete", "Public launch surface certification complete", preparationPackage.surfaceReadinessReport.ready && preparationPackage.surfaceReadinessReport.surfaceCount >= 15, "Public launch surface certification covers required surfaces."),
    item("public_launch_preparation_package_complete", "Public launch preparation package complete", preparationPackageReport.ready && preparationPackage.inMemoryOnly, "5.1 package is in-memory only."),
    item("public_launch_owner_review_complete", "Public launch owner review complete", ownerReview.ready && ownerReview.noUsersContacted, "5.1 owner review is manual-only."),
    item("public_launch_5_1_smoke_check_exists", "Public Launch Preparation 5.1 smoke check exists", true, "5.1 smoke check module is available."),
    item("public_launch_5_1_next_step_set", "Next step set to 5.2", preparationPackage.recommendedNextStep === "5.2 - Privacy, Terms, Consent Copy & Public QA Checklist", "Roadmap handoff points to 5.2.")
  ];
}

export function getPublicLaunchPreparationMissingItems(): TeoyubePublicLaunchPreparationAuditItem[] {
  return getPublicLaunchPreparationAuditChecklist().filter((entry) => entry.required && !entry.complete);
}

export function getPublicLaunchPreparationWarnings() {
  const packageReport = createPublicLaunchPreparationPackageReport(createPublicLaunchPreparationPackage());
  return packageReport.warnings;
}

export function getPublicLaunchPreparationCompletionPercentage(): number {
  const checklist = getPublicLaunchPreparationAuditChecklist();
  const complete = checklist.filter((entry) => entry.complete);
  return Math.round((complete.length / Math.max(1, checklist.length)) * 100);
}

export function runPublicLaunchPreparationAudit(): TeoyubePublicLaunchPreparationAuditReport {
  const missingItems = getPublicLaunchPreparationMissingItems();
  return {
    complete: missingItems.length === 0,
    ready: missingItems.length === 0,
    completionPercentage: getPublicLaunchPreparationCompletionPercentage(),
    checklist: getPublicLaunchPreparationAuditChecklist(),
    missingItems,
    warnings: getPublicLaunchPreparationWarnings(),
    nextRecommendedStep: "Public Launch Preparation 5.2 - Privacy, Terms, Consent Copy & Public QA Checklist",
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noProductionPersistenceConnected: true,
    noExternalAnalyticsConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
