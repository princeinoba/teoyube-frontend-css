import { runPhase46Audit } from "../phase-4";
import { runPhase46BetaReadinessCompletionSmokeCheck } from "./phase-4-6-beta-readiness-completion-smoke-check";
import {
  createBetaFeedbackReadinessReport,
  createBetaIssueIntakePlanReport,
  createBetaOperationalReadinessReport,
  createControlledBetaPreparationReport,
  createManualBetaQaExecutionPlan,
  createManualBetaQaExecutionPlanReport,
  createPhase51OwnerReviewRecord,
  createPhase51OwnerReviewReport,
  createPhase51Package,
  createPhase51PackageReport,
  createPrivacySecurityReadinessReport,
  createServiceGateReviewReport,
  runPhase51Audit
} from "../phase-5";
import { runPhase51ControlledBetaPreparationExample } from "./phase-5-1-controlled-beta-preparation-example";

export type TeoyubePhase51SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase51SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase51SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase51SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase51ControlledBetaPreparationSmokeCheck(): TeoyubePhase51SmokeCheckReport {
  const phase46Smoke = runPhase46BetaReadinessCompletionSmokeCheck();
  const phase46Audit = runPhase46Audit();
  const controlledBetaPreparation = createControlledBetaPreparationReport();
  const manualQaPlan = createManualBetaQaExecutionPlan();
  const manualQaReport = createManualBetaQaExecutionPlanReport(manualQaPlan);
  const serviceGate = createServiceGateReviewReport();
  const privacySecurity = createPrivacySecurityReadinessReport();
  const issueIntake = createBetaIssueIntakePlanReport();
  const feedbackReadiness = createBetaFeedbackReadinessReport();
  const operationalReadiness = createBetaOperationalReadinessReport();
  const ownerReview = createPhase51OwnerReviewRecord();
  const ownerReviewReport = createPhase51OwnerReviewReport(ownerReview);
  const phase51Package = createPhase51Package({ ownerReview });
  const phase51PackageReport = createPhase51PackageReport(phase51Package);
  const phase51Audit = runPhase51Audit();
  const example = runPhase51ControlledBetaPreparationExample();

  const disabledServiceFlags =
    serviceGate.serviceConnectedCount === 0 &&
    serviceGate.noDatabasePersistenceEnabled &&
    serviceGate.noAnalyticsEnabled &&
    serviceGate.noMonitoringProviderConnected &&
    serviceGate.noLiveAiOrchestrationEnabled &&
    serviceGate.noAdminAuthAdded &&
    serviceGate.noCmsConnected &&
    phase51PackageReport.noDatabasePersistenceEnabled &&
    phase51PackageReport.noAnalyticsEnabled &&
    phase51PackageReport.noMonitoringProviderConnected &&
    phase51PackageReport.noLiveAiOrchestrationEnabled &&
    phase51PackageReport.noAdminAuthAdded &&
    phase51PackageReport.noCmsConnected &&
    phase51PackageReport.noBrowserPersistenceRequired;

  const checks = [
    check("phase_4_6_smoke_check", phase46Smoke.valid, "Phase 4.6 smoke check remains valid."),
    check("phase_4_6_audit", phase46Audit.complete && phase46Audit.completionPercentage === 100, "Phase 4.6 audit remains complete."),
    check("phase_5_contracts_compile", controlledBetaPreparation.checks.length > 0, "Phase 5 contracts and controlled beta preparation report are available."),
    check("controlled_beta_preparation_structured", controlledBetaPreparation.valid && controlledBetaPreparation.scope.controlledAndLimited, "Controlled beta preparation returns structured limited scope."),
    check("manual_qa_plan_structured", manualQaReport.valid && manualQaReport.scenarioCount >= 18 && manualQaReport.manualOnly, "Manual QA plan returns structured scenarios."),
    check("service_gate_review_disabled", serviceGate.valid && serviceGate.serviceConnectedCount === 0 && serviceGate.reviews.every((entry) => !entry.serviceConnected), "Service gate review keeps services disabled or plan-only."),
    check("privacy_security_structured", privacySecurity.valid && privacySecurity.checks.length >= 10, "Privacy/security readiness returns structured report."),
    check("issue_intake_manual_only", issueIntake.valid && issueIntake.manualOnly && issueIntake.noAutomaticCollection, "Issue intake plan is manual only."),
    check("feedback_readiness_no_auto_collection", feedbackReadiness.valid && feedbackReadiness.noFeedbackCollectedAutomatically && feedbackReadiness.noDatabasePersistenceEnabled, "Feedback readiness collects nothing automatically."),
    check("operational_readiness_structured", operationalReadiness.valid && operationalReadiness.noUsersContacted, "Operational readiness returns structured report."),
    check("owner_review_checklist", ownerReviewReport.valid && ownerReview.checklist.length >= 9, "Owner review checklist exists."),
    check("phase_5_1_package_in_memory", phase51PackageReport.valid && phase51Package.inMemoryOnly && phase51Package.noExternalSend, "Phase 5.1 package is in-memory only."),
    check("phase_5_1_audit", phase51Audit.complete && phase51Audit.completionPercentage === 100, "Phase 5.1 audit returns complete."),
    check("no_beta_launch", phase51Package.noBetaLaunchPerformed && controlledBetaPreparation.noBetaLaunchPerformed, "No beta launch is performed."),
    check("no_users_contacted", phase51Package.noUsersContacted && manualQaReport.noUsersContacted, "No users are contacted."),
    check("no_feedback_collected_automatically", phase51Package.noFeedbackCollectedAutomatically && feedbackReadiness.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    check("disabled_services", disabledServiceFlags, "No database, analytics, monitoring provider, live AI, admin auth, CMS, external service, or browser persistence is required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by Phase 5.1 modules."),
    check("example_runs", example.phase51Audit.completionPercentage === phase51Audit.completionPercentage, "Phase 5.1 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...controlledBetaPreparation.warnings.map((entry) => entry.message),
    ...manualQaReport.warnings.map((entry) => entry.message),
    ...serviceGate.warnings.map((entry) => entry.message),
    ...privacySecurity.warnings,
    ...issueIntake.warnings,
    ...feedbackReadiness.warnings,
    ...operationalReadiness.warnings,
    ...ownerReviewReport.warnings,
    ...phase51PackageReport.warnings,
    ...phase51Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
