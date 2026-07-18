import { runSoftLaunchCompletionAudit } from "./soft-launch-completion-audit";
import { createPublicLaunchReadinessCriteriaReport } from "./public-launch-readiness-criteria";
import { createPublicLaunchReadinessPackage, createPublicLaunchReadinessPackageReport } from "./public-launch-readiness-package";
import { createPublicLaunchRiskRegister, createPublicLaunchRiskRegisterReport } from "./public-launch-risk-register";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";
import { createPublicLaunchOwnerReadinessRecord, createPublicLaunchOwnerReadinessReport } from "./public-launch-owner-readiness-review";
import { createPublicLaunchReadinessHandoffReport } from "./public-launch-readiness-handoff";
import { createProductionServiceConnectionPlan, createProductionServiceConnectionPlanReport } from "./production-service-connection-plan";
import { createPublicLaunchDatabasePersistencePlan, createDatabasePersistenceDecisionReport } from "./public-launch-database-persistence-plan";
import { createPublicLaunchAnalyticsPlan, createAnalyticsConnectionDecisionReport } from "./public-launch-analytics-plan";
import { createPublicLaunchLiveAiPlan, createLiveAiDecisionReport } from "./public-launch-live-ai-plan";
import { createPublicLaunchPrivacyConsentReport } from "./public-launch-privacy-consent-readiness";
import { createPublicLaunchSafetyCertificationReport } from "./public-launch-safety-certification";
import { createPublicLaunchSurfaceReadinessReport } from "./public-launch-surface-readiness-certification";
import type {
  TeoyubePublicLaunchBlocker,
  TeoyubePublicLaunchDecision,
  TeoyubePublicLaunchNextAction,
  TeoyubePublicLaunchPreparationStage,
  TeoyubePublicLaunchReadinessCheck,
  TeoyubePublicLaunchReadinessReport,
  TeoyubePublicLaunchWarning
} from "./public-launch-preparation-contracts";

function readinessCheck(
  id: string,
  label: string,
  stage: TeoyubePublicLaunchPreparationStage,
  complete: boolean,
  details: string
): TeoyubePublicLaunchReadinessCheck {
  return {
    id,
    label,
    stage,
    status: complete ? "ready" : "blocked",
    required: true,
    launchCritical: true,
    details
  };
}

function blockerFromCheck(check: TeoyubePublicLaunchReadinessCheck): TeoyubePublicLaunchBlocker {
  return {
    id: check.id,
    label: check.label,
    stage: check.stage,
    reason: check.details,
    requiredAction: "Resolve this public launch preparation blocker before continuing.",
    riskLevel: "critical"
  };
}

function normalizeWarning(
  id: string,
  label: string,
  stage: TeoyubePublicLaunchPreparationStage,
  message: string,
  recommendedAction: string,
  riskLevel: "low" | "medium" | "high" = "medium"
): TeoyubePublicLaunchWarning {
  return { id, label, stage, message, recommendedAction, riskLevel };
}

function defaultReports() {
  const serviceConnectionPlan = createProductionServiceConnectionPlan();
  const publicLaunchReadinessPackage = createPublicLaunchReadinessPackage();
  return {
    softLaunchCompletionAudit: runSoftLaunchCompletionAudit(),
    readinessCriteria: createPublicLaunchReadinessCriteriaReport(),
    readinessPackage: createPublicLaunchReadinessPackageReport(publicLaunchReadinessPackage),
    riskRegister: createPublicLaunchRiskRegisterReport(createPublicLaunchRiskRegister()),
    knownLimitations: createPublicLaunchKnownLimitationsReport(),
    ownerReadiness: createPublicLaunchOwnerReadinessReport(createPublicLaunchOwnerReadinessRecord()),
    handoff: createPublicLaunchReadinessHandoffReport(),
    serviceConnection: createProductionServiceConnectionPlanReport(serviceConnectionPlan),
    databasePersistence: createDatabasePersistenceDecisionReport(createPublicLaunchDatabasePersistencePlan()),
    analytics: createAnalyticsConnectionDecisionReport(createPublicLaunchAnalyticsPlan()),
    liveAi: createLiveAiDecisionReport(createPublicLaunchLiveAiPlan()),
    privacyConsent: createPublicLaunchPrivacyConsentReport(),
    safety: createPublicLaunchSafetyCertificationReport(),
    surfaces: createPublicLaunchSurfaceReadinessReport()
  };
}

export function getPublicLaunchReadinessChecklist(): TeoyubePublicLaunchReadinessCheck[] {
  const reports = defaultReports();
  return [
    readinessCheck("soft_launch_4_5_completion_audit_complete", "Limited Soft Launch Execution 4.5 audit complete", "readiness_audit", reports.softLaunchCompletionAudit.complete && reports.softLaunchCompletionAudit.completionPercentage === 100, "Soft launch completion is fully audited."),
    readinessCheck("public_launch_readiness_criteria_ready", "Public launch readiness criteria ready", "readiness_audit", reports.readinessCriteria.ready && reports.readinessCriteria.noPublicLaunchPerformed, "Public launch readiness criteria are ready and launch nothing."),
    readinessCheck("public_launch_readiness_package_ready", "Public launch readiness package ready", "readiness_audit", reports.readinessPackage.ready && reports.readinessPackage.noExternalWrite, "Public launch readiness package is in-memory only."),
    readinessCheck("public_launch_risk_register_ready", "Public launch risk register ready", "readiness_audit", reports.riskRegister.ready && reports.riskRegister.noExternalWrite, "Public launch risks are documented without external writes."),
    readinessCheck("public_launch_known_limitations_ready", "Known limitations ready", "readiness_audit", reports.knownLimitations.ready && reports.knownLimitations.limitationCount >= 8, "Public launch known limitations are documented."),
    readinessCheck("public_launch_owner_readiness_ready", "4.5 owner readiness ready", "readiness_audit", reports.ownerReadiness.ready && reports.ownerReadiness.noUsersContacted, "Soft-launch completion owner readiness is recorded without contacting users."),
    readinessCheck("public_launch_handoff_ready", "Public launch handoff ready", "readiness_audit", reports.handoff.ready && reports.handoff.noPublicLaunchPerformed, "Public launch handoff prepares 5.1 without launching."),
    readinessCheck("production_service_connection_plan_ready", "Production service connection plan ready", "production_service_planning", reports.serviceConnection.ready && reports.serviceConnection.noProvidersConnected && reports.serviceConnection.noSecretsWritten, "Production service connection plan is provider-neutral and writes no secrets."),
    readinessCheck("database_persistence_plan_ready", "Database persistence plan ready", "production_service_planning", reports.databasePersistence.ready && reports.databasePersistence.noDatabaseConnected && reports.databasePersistence.noExternalWrite, "Database persistence remains a future explicit connection decision."),
    readinessCheck("analytics_connection_plan_ready", "Analytics connection plan ready", "production_service_planning", reports.analytics.ready && reports.analytics.noAnalyticsConnected && reports.analytics.noAnalyticsSent, "External analytics remain disconnected and unsent."),
    readinessCheck("live_ai_connection_plan_ready", "Live AI orchestration plan ready", "production_service_planning", reports.liveAi.ready && reports.liveAi.noLiveAiEnabled && reports.liveAi.noOpenAiApiCalled, "Live AI orchestration remains disabled and no OpenAI API call is made."),
    readinessCheck("privacy_consent_readiness_ready", "Privacy and consent readiness ready", "privacy_review", reports.privacyConsent.ready && reports.privacyConsent.consentReady && reports.privacyConsent.noRawSensitiveStorage, "Consent and privacy boundaries are ready for 5.2 copy/QA review."),
    readinessCheck("public_launch_safety_certification_ready", "Public launch safety certification ready", "public_qa", reports.safety.ready && reports.safety.scriptureAnchoringRequired && reports.safety.fallbackSafetyReady, "Scripture, explanation, fallback, confidence, consent, and disabled-provider guardrails remain intact."),
    readinessCheck("public_launch_surface_certification_ready", "Public launch surface certification ready", "public_qa", reports.surfaces.ready && reports.surfaces.surfaceCount >= 15 && reports.surfaces.readySurfaceCount === reports.surfaces.surfaceCount, "Public launch surface certification covers all launch-critical surfaces."),
    readinessCheck("public_launch_5_1_no_launch_or_provider_connection", "No launch or provider connection in 5.1", "production_service_planning", reports.readinessPackage.noPublicLaunchPerformed && reports.serviceConnection.noProvidersConnected && reports.analytics.noAnalyticsSent && reports.databasePersistence.noDatabaseConnected && reports.liveAi.noLiveAiEnabled, "5.1 performs no public launch, user contact, feedback collection, analytics sending, production persistence, or live AI orchestration.")
  ];
}

export function getPublicLaunchReadinessAuditMissingItems(): TeoyubePublicLaunchReadinessCheck[] {
  return getPublicLaunchReadinessChecklist().filter((entry) => entry.required && entry.status !== "ready");
}

export function getPublicLaunchReadinessAuditBlockers(): TeoyubePublicLaunchBlocker[] {
  return getPublicLaunchReadinessAuditMissingItems().map(blockerFromCheck);
}

export function getPublicLaunchReadinessAuditWarnings(): TeoyubePublicLaunchWarning[] {
  const reports = defaultReports();
  return [
    ...reports.serviceConnection.warnings.map((entry) => normalizeWarning(entry.id, entry.label, "production_service_planning", entry.message, entry.recommendedAction, entry.riskLevel)),
    ...reports.databasePersistence.warnings.map((entry) => normalizeWarning(entry.id, entry.label, "production_service_planning", entry.message, entry.recommendedAction, entry.riskLevel)),
    ...reports.analytics.warnings.map((entry) => normalizeWarning(entry.id, entry.label, "production_service_planning", entry.message, entry.recommendedAction, entry.riskLevel)),
    ...reports.liveAi.warnings.map((entry) => normalizeWarning(entry.id, entry.label, "production_service_planning", entry.message, entry.recommendedAction, entry.riskLevel)),
    ...reports.privacyConsent.warnings.map((entry) => normalizeWarning(entry.id, entry.label, "privacy_review", entry.message, entry.recommendedAction, entry.riskLevel)),
    normalizeWarning(
      "public_launch_5_2_privacy_terms_consent_required",
      "Privacy, terms, consent copy, and public QA remain next",
      "privacy_review",
      "5.1 confirms readiness and service-connection planning only; public-facing privacy, terms, consent copy, and public QA still need 5.2.",
      "Continue with Public Launch Preparation 5.2 before any public launch or production provider connection."
    )
  ];
}

export function getPublicLaunchReadinessPercentage(): number {
  const checklist = getPublicLaunchReadinessChecklist();
  const complete = checklist.filter((entry) => entry.status === "ready");
  return Math.round((complete.length / Math.max(1, checklist.length)) * 100);
}

export function createPublicLaunchReadinessDecision(): TeoyubePublicLaunchDecision {
  const blockers = getPublicLaunchReadinessAuditBlockers();
  if (blockers.length > 0) return "blocked";
  if (getPublicLaunchReadinessAuditWarnings().length > 0) return "ready_after_owner_review";
  return "ready_for_service_connection_planning";
}

export function createPublicLaunchReadinessReport(): TeoyubePublicLaunchReadinessReport {
  const blockers = getPublicLaunchReadinessAuditBlockers();
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createPublicLaunchReadinessDecision(),
    stage: "readiness_audit",
    checks: getPublicLaunchReadinessChecklist(),
    blockers,
    warnings: getPublicLaunchReadinessAuditWarnings(),
    readinessPercentage: getPublicLaunchReadinessPercentage(),
    nextActions: [
      { id: "public_launch_5_2_privacy_terms_consent_qa", label: "Complete Privacy, Terms, Consent Copy & Public QA Checklist", stage: "privacy_review", requiredBeforePublicLaunch: true, owner: "privacy" },
      { id: "public_launch_owner_acceptance", label: "Owner accepts 5.1 planning boundaries before future provider connection", stage: "production_service_planning", requiredBeforePublicLaunch: true, owner: "owner" },
      { id: "public_launch_provider_connection_guard", label: "Keep persistence, analytics, and live AI disconnected until a later explicit step", stage: "production_service_planning", requiredBeforePublicLaunch: true, owner: "engineering" }
    ] satisfies TeoyubePublicLaunchNextAction[],
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

export function runPublicLaunchReadinessAudit(): TeoyubePublicLaunchReadinessReport {
  return createPublicLaunchReadinessReport();
}
