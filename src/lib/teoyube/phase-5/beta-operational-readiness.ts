import { createBetaFeedbackReadinessReport } from "./beta-feedback-readiness-plan";
import { createBetaIssueIntakePlanReport } from "./beta-issue-intake-plan";
import { createManualBetaQaExecutionPlanReport } from "./manual-beta-qa-execution-plan";
import { createPrivacySecurityReadinessReport } from "./privacy-security-readiness";
import { createServiceGateReviewReport } from "./service-gate-review";

export type TeoyubeBetaOperationalReadinessInput = {
  ownerReviewComplete?: boolean;
  documentationReady?: boolean;
  automaticUserContactEnabled?: boolean;
  externalServiceDependency?: boolean;
};

export type TeoyubeBetaOperationalReadinessCheck = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubeBetaOperationalReadinessDecision =
  | "operational_readiness_prepared"
  | "prepared_with_warnings"
  | "blocked";

export type TeoyubeBetaOperationalReadinessReport = {
  valid: boolean;
  decision: TeoyubeBetaOperationalReadinessDecision;
  checks: TeoyubeBetaOperationalReadinessCheck[];
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeBetaOperationalReadinessCheck {
  return { id, label, complete, details };
}

export function createBetaOperationalReadinessChecklist(input: TeoyubeBetaOperationalReadinessInput = {}): TeoyubeBetaOperationalReadinessCheck[] {
  const manualQa = createManualBetaQaExecutionPlanReport();
  const issueIntake = createBetaIssueIntakePlanReport();
  const feedback = createBetaFeedbackReadinessReport();
  const privacy = createPrivacySecurityReadinessReport();
  const serviceGate = createServiceGateReviewReport();
  return [
    check("manual_qa_plan", "Manual QA plan exists", manualQa.valid && manualQa.manualOnly, `${manualQa.scenarioCount} manual scenario(s) planned.`),
    check("issue_intake_plan", "Issue intake plan exists", issueIntake.valid && issueIntake.manualOnly, `${issueIntake.plan.categories.length} issue categories are defined.`),
    check("feedback_readiness_plan", "Feedback readiness plan exists", feedback.valid && feedback.plan.manualOnly, "Manual feedback boundaries are defined."),
    check("privacy_security_readiness", "Privacy/security readiness exists", privacy.valid, `${privacy.checks.length} privacy/security check(s) are prepared.`),
    check("service_gate_review", "Service gate review exists", serviceGate.valid && serviceGate.serviceConnectedCount === 0, `${serviceGate.reviews.length} service gate(s) remain disconnected.`),
    check("owner_review", "Owner review is required before beta execution", input.ownerReviewComplete === true, "Owner review is manual and may be completed before Phase 5.2."),
    check("pause_criteria", "Beta pause criteria are defined", manualQa.run.pauseCriteria.length > 0, `${manualQa.run.pauseCriteria.length} pause criterion/criteria defined.`),
    check("rollback_criteria", "Beta rollback criteria are defined", manualQa.run.rollbackCriteria.length > 0, `${manualQa.run.rollbackCriteria.length} rollback criterion/criteria defined.`),
    check("documentation_readiness", "Documentation readiness is prepared", input.documentationReady !== false, "Phase 5.1 documentation records preparation boundaries."),
    check("no_external_service_dependency", "No external service dependency exists", !input.externalServiceDependency, "Safe render does not require external providers."),
    check("no_automatic_user_contact", "No automatic user contact exists", !input.automaticUserContactEnabled, "Beta users are not contacted from code.")
  ];
}

export function validateBetaOperationalReadiness(input: TeoyubeBetaOperationalReadinessInput = {}): TeoyubeBetaOperationalReadinessReport {
  return createBetaOperationalReadinessReport(input);
}

export function getBetaOperationalReadinessBlockers(input: TeoyubeBetaOperationalReadinessInput = {}): string[] {
  return createBetaOperationalReadinessChecklist(input)
    .filter((entry) => !entry.complete && !["owner_review"].includes(entry.id))
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getBetaOperationalReadinessWarnings(input: TeoyubeBetaOperationalReadinessInput = {}): string[] {
  const checks = createBetaOperationalReadinessChecklist(input);
  return [
    ...checks.filter((entry) => !entry.complete && entry.id === "owner_review").map((entry) => `${entry.label}: ${entry.details}`),
    "Manual beta QA execution remains for Phase 5.2.",
    "Operational readiness remains preparation-only until owner review accepts beta execution."
  ];
}

export function createBetaOperationalReadinessDecision(input: TeoyubeBetaOperationalReadinessInput = {}): TeoyubeBetaOperationalReadinessDecision {
  const blockers = getBetaOperationalReadinessBlockers(input);
  const warnings = getBetaOperationalReadinessWarnings(input);
  if (blockers.length) return "blocked";
  return warnings.length ? "prepared_with_warnings" : "operational_readiness_prepared";
}

export function createBetaOperationalReadinessReport(input: TeoyubeBetaOperationalReadinessInput = {}): TeoyubeBetaOperationalReadinessReport {
  const checks = createBetaOperationalReadinessChecklist(input);
  const blockers = getBetaOperationalReadinessBlockers(input);
  const warnings = getBetaOperationalReadinessWarnings(input);
  return {
    valid: blockers.length === 0,
    decision: createBetaOperationalReadinessDecision(input),
    checks,
    blockers,
    warnings,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
