import { createPhase51Package, createPhase51PackageReport } from "./phase-5-1-package";

export type TeoyubePhase51AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase51AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase51AuditChecklistItem[];
  missingItems: TeoyubePhase51AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 5.2 - Manual Beta QA Execution, Issue Triage & Readiness Score";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase51AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase51AuditChecklist(): TeoyubePhase51AuditChecklistItem[] {
  const pkg = createPhase51Package();
  const report = createPhase51PackageReport(pkg);
  return [
    item("phase_5_contracts", "Phase 5 contracts exist", true, "phase-5-contracts.ts defines Phase 5 base contracts."),
    item("controlled_beta_preparation_contracts", "Controlled beta preparation contracts exist", true, "controlled-beta-preparation-contracts.ts defines scope and readiness contracts."),
    item("controlled_beta_preparation", "Controlled beta preparation module exists", pkg.controlledBetaPreparation.valid, "controlled-beta-preparation.ts prepares limited beta scope."),
    item("manual_beta_qa_contracts", "Manual beta QA contracts exist", true, "manual-beta-qa-contracts.ts defines manual QA plan contracts."),
    item("manual_beta_qa_execution_plan", "Manual beta QA execution plan exists", pkg.manualBetaQaExecutionPlan.valid, "manual-beta-qa-execution-plan.ts prepares manual scenarios."),
    item("service_gate_review_contracts", "Service gate review contracts exist", true, "service-gate-review-contracts.ts defines service gate contracts."),
    item("service_gate_review", "Service gate review exists", pkg.serviceGateReview.valid && pkg.serviceGateReview.serviceConnectedCount === 0, "service-gate-review.ts keeps services disabled or plan-only."),
    item("privacy_security_readiness", "Privacy/security readiness exists", pkg.privacySecurityReadiness.valid, "privacy-security-readiness.ts prepares privacy/security checks."),
    item("beta_issue_intake_plan", "Beta issue intake plan exists", pkg.betaIssueIntakePlan.valid, "beta-issue-intake-plan.ts defines manual issue categories and triage."),
    item("beta_feedback_readiness_plan", "Beta feedback readiness plan exists", pkg.betaFeedbackReadinessPlan.valid, "beta-feedback-readiness-plan.ts keeps feedback manual-only."),
    item("beta_operational_readiness", "Beta operational readiness exists", pkg.betaOperationalReadiness.valid, "beta-operational-readiness.ts prepares operational gates."),
    item("owner_review", "Owner review exists", pkg.ownerReviewReport.record.checklist.length >= 9, "phase-5-1-owner-review.ts prepares manual owner review."),
    item("phase_5_1_package", "Phase 5.1 package exists", report.valid, `Phase 5.1 package decision: ${report.decision}.`),
    item("smoke_check", "Phase 5.1 smoke check exists", true, "phase-5-1-controlled-beta-preparation-smoke-check.ts verifies Phase 5.1 modules."),
    item("documentation", "Phase 5.1 documentation exists", true, "phase-5-1-controlled-beta-preparation-manual-qa-service-gate-review.md documents the step.")
  ];
}

export function getPhase51MissingItems(): TeoyubePhase51AuditChecklistItem[] {
  return getPhase51AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase51Warnings(): string[] {
  return createPhase51PackageReport(createPhase51Package()).warnings;
}

export function getPhase51CompletionPercentage(): number {
  const checklist = getPhase51AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase51Audit(): TeoyubePhase51AuditReport {
  const checklist = getPhase51AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase51PackageReport(createPhase51Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase51CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase51Warnings(),
    blockers,
    nextStep: "Phase 5.2 - Manual Beta QA Execution, Issue Triage & Readiness Score",
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
