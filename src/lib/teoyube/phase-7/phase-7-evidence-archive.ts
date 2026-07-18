import { runPhase71Audit, type TeoyubePhase71AuditReport } from "./phase-7-1-audit";
import { runPhase72Audit, type TeoyubePhase72AuditReport } from "./phase-7-2-audit";
import { runPhase73Audit, type TeoyubePhase73AuditReport } from "./phase-7-3-audit";

export type TeoyubePhase7EvidenceArchiveArea =
  | "operations_runbook"
  | "manual_feedback_review"
  | "support_workflow"
  | "manual_monitoring"
  | "issue_escalation"
  | "support_to_issue_conversion"
  | "pause_rollback"
  | "known_limitations"
  | "feedback_simulation"
  | "support_issue_triage"
  | "product_stabilization_queue"
  | "stabilization_pass"
  | "regression_qa"
  | "readiness_score"
  | "disabled_service"
  | "scripture_explanation_fallback"
  | "mobile_accessibility"
  | "owner_review";

export type TeoyubePhase7EvidenceArchiveItem = {
  id: string;
  phase: "phase_7_1" | "phase_7_2" | "phase_7_3";
  area: TeoyubePhase7EvidenceArchiveArea;
  label: string;
  status: "confirmed" | "warning" | "blocked" | "not_reviewed";
  source: string;
  details: string;
};

export type TeoyubePhase7EvidenceArchive = {
  id: string;
  items: TeoyubePhase7EvidenceArchiveItem[];
  gaps: string[];
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase7EvidenceArchiveReport = {
  valid: boolean;
  archive: TeoyubePhase7EvidenceArchive;
  blockers: string[];
  warnings: string[];
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase7EvidenceArchiveInput = {
  phase71Audit?: TeoyubePhase71AuditReport;
  phase72Audit?: TeoyubePhase72AuditReport;
  phase73Audit?: TeoyubePhase73AuditReport;
};

function audits(input: TeoyubePhase7EvidenceArchiveInput = {}) {
  return {
    phase71Audit: input.phase71Audit || runPhase71Audit(),
    phase72Audit: input.phase72Audit || runPhase72Audit(),
    phase73Audit: input.phase73Audit || runPhase73Audit()
  };
}

function item(
  id: string,
  phase: TeoyubePhase7EvidenceArchiveItem["phase"],
  area: TeoyubePhase7EvidenceArchiveArea,
  label: string,
  status: TeoyubePhase7EvidenceArchiveItem["status"],
  source: string,
  details: string
): TeoyubePhase7EvidenceArchiveItem {
  return { id, phase, area, label, status, source, details };
}

function status(complete: boolean, warningCount = 0): TeoyubePhase7EvidenceArchiveItem["status"] {
  if (!complete) return "blocked";
  return warningCount ? "warning" : "confirmed";
}

function auditItemComplete(audit: { checklist: { id: string; complete: boolean }[] }, id: string): boolean {
  return audit.checklist.some((entry) => entry.id === id && entry.complete);
}

export function summarizePhase71Evidence(input: TeoyubePhase7EvidenceArchiveInput = {}): TeoyubePhase7EvidenceArchiveItem[] {
  const { phase71Audit } = audits(input);
  return [
    item("phase_7_1_operations_runbook", "phase_7_1", "operations_runbook", "Controlled beta operations runbook", status(auditItemComplete(phase71Audit, "operations_runbook"), phase71Audit.warnings.length), "controlled-beta-operations-runbook.ts", `Phase 7.1 completion: ${phase71Audit.completionPercentage}%.`),
    item("phase_7_1_manual_feedback_review", "phase_7_1", "manual_feedback_review", "Manual feedback review workflow", status(auditItemComplete(phase71Audit, "manual_feedback_review")), "manual-beta-feedback-review.ts", "Feedback review remains manual, sanitized, and in memory."),
    item("phase_7_1_support_workflow", "phase_7_1", "support_workflow", "Beta support workflow", status(auditItemComplete(phase71Audit, "support_workflow")), "beta-support-workflow.ts", "Support workflow sends no automatic contact."),
    item("phase_7_1_manual_monitoring", "phase_7_1", "manual_monitoring", "Manual operational monitoring", status(auditItemComplete(phase71Audit, "manual_monitoring")), "manual-operational-monitoring.ts", "Monitoring is checklist/manual only."),
    item("phase_7_1_issue_escalation", "phase_7_1", "issue_escalation", "Issue escalation workflow", status(auditItemComplete(phase71Audit, "issue_escalation")), "beta-issue-escalation-workflow.ts", "Issue escalation remains manual."),
    item("phase_7_1_support_to_issue", "phase_7_1", "support_to_issue_conversion", "Support-to-issue conversion", status(auditItemComplete(phase71Audit, "support_to_issue_converter")), "beta-support-to-issue-converter.ts", "Support items convert into manual issue records only."),
    item("phase_7_1_pause_rollback", "phase_7_1", "pause_rollback", "Pause/rollback review", status(auditItemComplete(phase71Audit, "pause_rollback_review")), "beta-operations-pause-rollback-review.ts", "Pause and rollback criteria remain available."),
    item("phase_7_1_known_limitations", "phase_7_1", "known_limitations", "Known limitations", status(auditItemComplete(phase71Audit, "known_limitations")), "beta-operations-known-limitations.ts", "Known limitations remain documented.")
  ];
}

export function summarizePhase72Evidence(input: TeoyubePhase7EvidenceArchiveInput = {}): TeoyubePhase7EvidenceArchiveItem[] {
  const { phase72Audit } = audits(input);
  return [
    item("phase_7_2_feedback_simulation", "phase_7_2", "feedback_simulation", "Manual feedback review simulation", status(auditItemComplete(phase72Audit, "manual_feedback_review_simulation"), phase72Audit.warnings.length), "manual-feedback-review-simulation.ts", "Feedback simulation is sanitized and in memory."),
    item("phase_7_2_support_triage", "phase_7_2", "support_issue_triage", "Support issue triage", status(auditItemComplete(phase72Audit, "support_issue_triage")), "support-issue-triage.ts", "Support issue triage remains manual."),
    item("phase_7_2_product_queue", "phase_7_2", "product_stabilization_queue", "Product stabilization queue", status(auditItemComplete(phase72Audit, "product_stabilization_queue_manager")), "product-stabilization-queue-manager.ts", "Product stabilization queue remains in memory."),
    item("phase_7_2_stabilization_safety", "phase_7_2", "scripture_explanation_fallback", "Stabilization safety validator", status(auditItemComplete(phase72Audit, "product_stabilization_safety_validator")), "product-stabilization-safety-validator.ts", "Safety validator protects Scripture, explanation, fallback, confidence, and privacy boundaries."),
    item("phase_7_2_stabilization_planner", "phase_7_2", "product_stabilization_queue", "Stabilization planner", status(auditItemComplete(phase72Audit, "product_stabilization_planner")), "product-stabilization-planner.ts", "Stabilization planning separates safe, owner-review, blocked, and deferred items."),
    item("phase_7_2_owner_review", "phase_7_2", "owner_review", "Phase 7.2 owner review", status(auditItemComplete(phase72Audit, "owner_review")), "phase-7-2-owner-review.ts", "Owner review is represented before stabilization pass.")
  ];
}

export function summarizePhase73Evidence(input: TeoyubePhase7EvidenceArchiveInput = {}): TeoyubePhase7EvidenceArchiveItem[] {
  const { phase73Audit } = audits(input);
  return [
    item("phase_7_3_stabilization_pass", "phase_7_3", "stabilization_pass", "Product stabilization pass", status(auditItemComplete(phase73Audit, "product_stabilization_pass_runner"), phase73Audit.warnings.length), "product-stabilization-pass-runner.ts", `Phase 7.3 completion: ${phase73Audit.completionPercentage}%.`),
    item("phase_7_3_regression_qa", "phase_7_3", "regression_qa", "Stabilization regression QA", status(auditItemComplete(phase73Audit, "stabilization_regression_qa_runner")), "stabilization-regression-qa-runner.ts", "Regression QA covers operations, safety, support, mobile, and accessibility boundaries."),
    item("phase_7_3_service_disabled", "phase_7_3", "disabled_service", "Service-disabled regression", status(auditItemComplete(phase73Audit, "service_disabled_operations_regression")), "service-disabled-operations-regression.ts", "Disabled services remain confirmed."),
    item("phase_7_3_scripture_fallback", "phase_7_3", "scripture_explanation_fallback", "Scripture/explanation/fallback regression", status(auditItemComplete(phase73Audit, "scripture_explanation_fallback_operations_regression")), "scripture-explanation-fallback-operations-regression.ts", "Scripture anchors, explanation traces, fallback safety, confidence, and privacy remain protected."),
    item("phase_7_3_mobile_accessibility", "phase_7_3", "mobile_accessibility", "Mobile/accessibility regression", status(auditItemComplete(phase73Audit, "mobile_accessibility_operations_regression")), "mobile-accessibility-operations-regression.ts", "Mobile/accessibility state remains protected."),
    item("phase_7_3_readiness_score", "phase_7_3", "readiness_score", "Beta operations readiness score", status(auditItemComplete(phase73Audit, "beta_operations_readiness_score")), "beta-operations-readiness-score.ts", "Readiness scoring is structured and manual."),
    item("phase_7_3_owner_review", "phase_7_3", "owner_review", "Phase 7.3 owner review", status(auditItemComplete(phase73Audit, "owner_review")), "phase-7-3-owner-review.ts", "Owner review is represented before final lock.")
  ];
}

export function getPhase7EvidenceGaps(input: TeoyubePhase7EvidenceArchiveInput = {}): string[] {
  return [
    ...summarizePhase71Evidence(input),
    ...summarizePhase72Evidence(input),
    ...summarizePhase73Evidence(input)
  ].filter((entry) => entry.status === "blocked").map((entry) => `${entry.label}: ${entry.details}`);
}

export function createPhase7EvidenceArchive(input: TeoyubePhase7EvidenceArchiveInput = {}): TeoyubePhase7EvidenceArchive {
  return {
    id: "phase_7_4_evidence_archive",
    items: [
      ...summarizePhase71Evidence(input),
      ...summarizePhase72Evidence(input),
      ...summarizePhase73Evidence(input)
    ],
    gaps: getPhase7EvidenceGaps(input),
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function createPhase7EvidenceArchiveReport(input: TeoyubePhase7EvidenceArchiveInput = {}): TeoyubePhase7EvidenceArchiveReport {
  const archive = createPhase7EvidenceArchive(input);
  return {
    valid: archive.gaps.length === 0,
    archive,
    blockers: archive.gaps,
    warnings: archive.items.filter((entry) => entry.status === "warning" || entry.status === "not_reviewed").map((entry) => `${entry.label}: ${entry.details}`),
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
