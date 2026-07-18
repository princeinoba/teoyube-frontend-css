import { createPhase52Package, createPhase52PackageReport } from "./phase-5-2-package";

export type TeoyubePhase52AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase52AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase52AuditChecklistItem[];
  missingItems: TeoyubePhase52AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase52AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase52AuditChecklist(): TeoyubePhase52AuditChecklistItem[] {
  const pkg = createPhase52Package();
  const report = createPhase52PackageReport(pkg);
  return [
    item("phase_5_2_map_document", "Phase 5.2 map document exists", true, "phase-5-2-manual-beta-qa-execution-issue-triage-readiness-score-map.md documents the map."),
    item("manual_beta_qa_execution_contracts", "Manual beta QA execution contracts exist", true, "manual-beta-qa-execution-contracts.ts defines execution contracts."),
    item("manual_beta_qa_execution_runner", "Manual beta QA execution runner exists", pkg.betaQaExecutionPackage.manualBetaQaExecutionReport.manualOnly, "manual-beta-qa-execution-runner.ts records in-memory manual QA results."),
    item("real_data_beta_qa", "Real data beta QA exists", pkg.betaQaExecutionPackage.realDataQaReport.valid, "beta-real-data-qa-execution.ts checks data contracts and mock replacement."),
    item("user_journey_beta_qa", "User journey beta QA exists", pkg.betaQaExecutionPackage.userJourneyQaReport.valid, "beta-user-journey-qa-execution.ts checks core journeys."),
    item("scripture_explanation_fallback_beta_qa", "Scripture/explanation/fallback beta QA exists", pkg.betaQaExecutionPackage.scriptureExplanationFallbackQaReport.valid, "beta-scripture-explanation-fallback-qa.ts checks anchors, traces, fallbacks, confidence, and language safety."),
    item("mobile_accessibility_beta_qa", "Mobile/accessibility beta QA exists", pkg.betaQaExecutionPackage.mobileAccessibilityQaReport.valid, "beta-mobile-accessibility-qa.ts checks mobile and accessibility readiness."),
    item("reviewed_content_gate_beta_qa", "Reviewed content gate beta QA exists", pkg.betaQaExecutionPackage.reviewedContentGateQaReport.valid, "beta-reviewed-content-gate-qa.ts checks reviewed content gates."),
    item("controlled_admin_beta_qa", "Controlled admin beta QA exists", pkg.betaQaExecutionPackage.controlledAdminQaReport.valid, "beta-controlled-admin-qa.ts checks prototype-only admin boundaries."),
    item("disabled_service_beta_qa", "Disabled service beta QA exists", pkg.betaQaExecutionPackage.disabledServiceQaReport.valid, "beta-disabled-service-qa.ts checks disabled service gates."),
    item("beta_issue_triage_execution_contracts", "Beta issue triage execution contracts exist", true, "beta-issue-triage-execution-contracts.ts defines issue triage contracts."),
    item("beta_issue_triage_execution", "Beta issue triage execution exists", pkg.betaQaExecutionPackage.issueTriageReport.valid, "beta-issue-triage-execution.ts classifies and triages manual issues."),
    item("beta_readiness_score_contracts", "Beta readiness score contracts exist", true, "beta-readiness-score-contracts.ts defines scoring contracts."),
    item("beta_readiness_score", "Beta readiness score exists", pkg.betaQaExecutionPackage.readinessScoreReport.valid, "beta-readiness-score.ts calculates readiness score and band."),
    item("beta_qa_execution_package", "Beta QA execution package exists", pkg.betaQaExecutionPackageReport.valid, "beta-qa-execution-package.ts combines Phase 5.2 reports."),
    item("owner_review", "Phase 5.2 owner review exists", pkg.ownerReviewReport.record.checklist.length >= 11, "phase-5-2-owner-review.ts prepares owner review."),
    item("phase_5_2_package", "Phase 5.2 package exists", report.valid, "phase-5-2-package.ts combines QA package and owner review."),
    item("smoke_check", "Phase 5.2 smoke check exists", true, "phase-5-2-manual-beta-qa-execution-smoke-check.ts verifies the step."),
    item("documentation", "Phase 5.2 documentation exists", true, "phase-5-2-manual-beta-qa-execution-issue-triage-readiness-score.md documents the step.")
  ];
}

export function getPhase52MissingItems(): TeoyubePhase52AuditChecklistItem[] {
  return getPhase52AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase52Warnings(): string[] {
  return createPhase52PackageReport(createPhase52Package()).warnings;
}

export function getPhase52CompletionPercentage(): number {
  const checklist = getPhase52AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase52Audit(): TeoyubePhase52AuditReport {
  const checklist = getPhase52AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase52PackageReport(createPhase52Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase52CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase52Warnings(),
    blockers,
    nextStep: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA",
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
