import { createPhase72Package, createPhase72PackageReport } from "./phase-7-2-package";

export type TeoyubePhase72AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase72AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase72AuditChecklistItem[];
  missingItems: TeoyubePhase72AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 7.3 - Product Stabilization Pass, Regression QA & Beta Operations Readiness Score";
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase72AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase72AuditChecklist(): TeoyubePhase72AuditChecklistItem[] {
  const pkg = createPhase72Package({ ownerReviewed: true });
  const report = createPhase72PackageReport(pkg);
  return [
    item("phase_7_2_map_document", "Phase 7.2 map document exists", true, "phase-7-2-manual-feedback-review-simulation-support-issue-triage-product-stabilization-map.md documents the map."),
    item("manual_feedback_review_simulation_contracts", "Manual feedback review simulation contracts exist", true, "manual-feedback-review-simulation-contracts.ts defines simulation contracts."),
    item("manual_feedback_review_simulation", "Manual feedback review simulation exists", pkg.feedbackReviewSimulationReport.inMemoryOnly, "manual-feedback-review-simulation.ts creates sanitized in-memory simulation."),
    item("support_issue_triage_contracts", "Support issue triage contracts exist", true, "support-issue-triage-contracts.ts defines issue triage contracts."),
    item("support_issue_triage", "Support issue triage exists", pkg.supportIssueTriageReport.inMemoryOnly, "support-issue-triage.ts triages support issues."),
    item("feedback_to_support_issue_converter", "Feedback-to-support issue converter exists", pkg.feedbackToSupportIssueConversionReport.inMemoryOnly, "feedback-to-support-issue-converter.ts converts simulated feedback into support issues."),
    item("product_stabilization_queue_contracts", "Product stabilization queue contracts exist", true, "product-stabilization-queue-contracts.ts defines queue contracts."),
    item("product_stabilization_queue_manager", "Product stabilization queue manager exists", pkg.productStabilizationQueueReport.inMemoryOnly, "product-stabilization-queue-manager.ts manages the queue in memory."),
    item("support_issue_to_stabilization_converter", "Support issue-to-stabilization converter exists", pkg.supportIssueToStabilizationConversionReport.inMemoryOnly, "support-issue-to-stabilization-converter.ts converts support issues into queue items."),
    item("product_stabilization_safety_validator", "Product stabilization safety validator exists", pkg.stabilizationSafetyReport.inMemoryOnly, "product-stabilization-safety-validator.ts blocks unsafe stabilization."),
    item("product_stabilization_planner", "Product stabilization planner exists", pkg.stabilizationPlanReport.inMemoryOnly, "product-stabilization-planner.ts classifies queue work."),
    item("feedback_review_simulation_qa", "Feedback review simulation QA exists", pkg.feedbackReviewSimulationQaReport.inMemoryOnly, "feedback-review-simulation-qa.ts validates simulation boundaries."),
    item("support_workflow_qa", "Support workflow QA exists", pkg.supportWorkflowQaReport.inMemoryOnly, "support-workflow-qa.ts validates support boundaries."),
    item("product_stabilization_queue_qa", "Product stabilization queue QA exists", pkg.stabilizationQueueQaReport.inMemoryOnly, "product-stabilization-queue-qa.ts validates queue safety."),
    item("owner_review", "Phase 7.2 owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-7-2-owner-review.ts prepares owner review."),
    item("phase_7_2_package", "Phase 7.2 package exists", report.inMemoryOnly, "phase-7-2-package.ts combines Phase 7.2 reports."),
    item("smoke_check", "Phase 7.2 smoke check exists", true, "phase-7-2-feedback-review-stabilization-smoke-check.ts verifies Phase 7.2."),
    item("documentation", "Phase 7.2 documentation exists", true, "phase-7-2-manual-feedback-review-simulation-support-issue-triage-product-stabilization-queue.md documents the step.")
  ];
}

export function getPhase72MissingItems(): TeoyubePhase72AuditChecklistItem[] {
  return getPhase72AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase72Warnings(): string[] {
  return createPhase72PackageReport(createPhase72Package({ ownerReviewed: true })).warnings;
}

export function getPhase72CompletionPercentage(): number {
  const checklist = getPhase72AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase72Audit(): TeoyubePhase72AuditReport {
  const checklist = getPhase72AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase72PackageReport(createPhase72Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase72CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase72Warnings(),
    blockers,
    nextStep: "Phase 7.3 - Product Stabilization Pass, Regression QA & Beta Operations Readiness Score",
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
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
