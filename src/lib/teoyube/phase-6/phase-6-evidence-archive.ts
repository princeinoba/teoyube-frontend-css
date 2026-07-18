import { runPhase61Audit, type TeoyubePhase61AuditReport } from "./phase-6-1-audit";
import { runPhase62Audit, type TeoyubePhase62AuditReport } from "./phase-6-2-audit";
import { runPhase63Audit, type TeoyubePhase63AuditReport } from "./phase-6-3-audit";

export type TeoyubePhase6EvidenceArchiveArea =
  | "execution_plan"
  | "participant_workflow"
  | "communication_boundary"
  | "feedback_boundary"
  | "dry_run"
  | "simulated_participant"
  | "feedback_simulation"
  | "issue_triage"
  | "pause_rollback"
  | "disabled_service"
  | "scripture_explanation_fallback"
  | "mobile_accessibility"
  | "stabilization"
  | "regression_qa"
  | "operations_readiness"
  | "owner_review";

export type TeoyubePhase6EvidenceArchiveItem = {
  id: string;
  phase: "phase_6_1" | "phase_6_2" | "phase_6_3";
  area: TeoyubePhase6EvidenceArchiveArea;
  label: string;
  status: "confirmed" | "warning" | "blocked" | "not_reviewed";
  source: string;
  details: string;
};

export type TeoyubePhase6EvidenceArchive = {
  id: string;
  items: TeoyubePhase6EvidenceArchiveItem[];
  gaps: string[];
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase6EvidenceArchiveReport = {
  valid: boolean;
  archive: TeoyubePhase6EvidenceArchive;
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

export type TeoyubePhase6EvidenceArchiveInput = {
  phase61Audit?: TeoyubePhase61AuditReport;
  phase62Audit?: TeoyubePhase62AuditReport;
  phase63Audit?: TeoyubePhase63AuditReport;
};

function audits(input: TeoyubePhase6EvidenceArchiveInput = {}) {
  return {
    phase61Audit: input.phase61Audit || runPhase61Audit(),
    phase62Audit: input.phase62Audit || runPhase62Audit(),
    phase63Audit: input.phase63Audit || runPhase63Audit()
  };
}

function item(
  id: string,
  phase: TeoyubePhase6EvidenceArchiveItem["phase"],
  area: TeoyubePhase6EvidenceArchiveArea,
  label: string,
  status: TeoyubePhase6EvidenceArchiveItem["status"],
  source: string,
  details: string
): TeoyubePhase6EvidenceArchiveItem {
  return { id, phase, area, label, status, source, details };
}

function status(complete: boolean, warningCount = 0): TeoyubePhase6EvidenceArchiveItem["status"] {
  if (!complete) return "blocked";
  return warningCount ? "warning" : "confirmed";
}

function auditItemComplete(audit: { checklist: { id: string; complete: boolean }[] }, id: string): boolean {
  return audit.checklist.some((entry) => entry.id === id && entry.complete);
}

export function summarizePhase61Evidence(input: TeoyubePhase6EvidenceArchiveInput = {}): TeoyubePhase6EvidenceArchiveItem[] {
  const { phase61Audit } = audits(input);
  return [
    item("phase_6_1_execution_plan", "phase_6_1", "execution_plan", "Controlled beta execution plan", status(auditItemComplete(phase61Audit, "controlled_beta_execution_plan"), phase61Audit.warnings.length), "phase-6-1-audit.ts", `Phase 6.1 completion: ${phase61Audit.completionPercentage}%.`),
    item("phase_6_1_participant_workflow", "phase_6_1", "participant_workflow", "Manual participant workflow", status(auditItemComplete(phase61Audit, "participant_workflow")), "manual-participant-workflow.ts", "Participant workflow remains manual and no-contact."),
    item("phase_6_1_communication_boundary", "phase_6_1", "communication_boundary", "Manual communication boundaries", status(auditItemComplete(phase61Audit, "manual_communication_boundaries")), "manual-beta-communication-boundaries.ts", "Communication drafts are not sent by code."),
    item("phase_6_1_feedback_boundary", "phase_6_1", "feedback_boundary", "Manual feedback boundaries", status(auditItemComplete(phase61Audit, "manual_feedback_boundaries")), "manual-feedback-boundaries.ts", "Feedback boundaries remain manual and privacy-protective."),
    item("phase_6_1_disabled_service", "phase_6_1", "disabled_service", "Service-disabled boundaries", status(auditItemComplete(phase61Audit, "service_disabled_boundaries")), "beta-service-disabled-boundaries.ts", "Services remain disabled or plan-only."),
    item("phase_6_1_safety_privacy", "phase_6_1", "scripture_explanation_fallback", "Safety/theology and privacy boundaries", status(auditItemComplete(phase61Audit, "safety_theology_boundaries") && auditItemComplete(phase61Audit, "privacy_consent_boundaries")), "beta-safety-theology-boundaries.ts, beta-privacy-consent-boundaries.ts", "Scripture, explanation, fallback, confidence, privacy, and consent boundaries are represented.")
  ];
}

export function summarizePhase62Evidence(input: TeoyubePhase6EvidenceArchiveInput = {}): TeoyubePhase6EvidenceArchiveItem[] {
  const { phase62Audit } = audits(input);
  return [
    item("phase_6_2_dry_run", "phase_6_2", "dry_run", "Manual beta dry run", status(auditItemComplete(phase62Audit, "dry_run_runner"), phase62Audit.warnings.length), "manual-beta-dry-run-runner.ts", `Readiness score: ${phase62Audit.readinessScore}.`),
    item("phase_6_2_simulated_participant", "phase_6_2", "simulated_participant", "Simulated participant session", status(auditItemComplete(phase62Audit, "simulated_participant_session")), "simulated-participant-session.ts", "Simulated participant session is in-memory only."),
    item("phase_6_2_feedback_simulation", "phase_6_2", "feedback_simulation", "Feedback intake simulation", status(auditItemComplete(phase62Audit, "feedback_intake_simulation")), "feedback-intake-simulation.ts", "Feedback intake simulation redacts and remains local."),
    item("phase_6_2_issue_triage", "phase_6_2", "issue_triage", "Dry-run issue triage", status(auditItemComplete(phase62Audit, "issue_triage")), "dry-run-issue-triage.ts", "Dry-run issues are categorized in memory."),
    item("phase_6_2_pause_rollback", "phase_6_2", "pause_rollback", "Pause/rollback simulation", status(auditItemComplete(phase62Audit, "pause_rollback_simulation")), "dry-run-pause-rollback-simulation.ts", "Pause and rollback criteria are represented."),
    item("phase_6_2_disabled_service", "phase_6_2", "disabled_service", "Disabled-service verification", status(auditItemComplete(phase62Audit, "disabled_service_verification")), "dry-run-disabled-service-verification.ts", "Disabled services remain verified."),
    item("phase_6_2_scripture_fallback", "phase_6_2", "scripture_explanation_fallback", "Scripture/explanation/fallback verification", status(auditItemComplete(phase62Audit, "scripture_explanation_fallback_verification")), "dry-run-scripture-explanation-fallback-verification.ts", "Scripture anchors, explanation traces, and fallback are verified."),
    item("phase_6_2_mobile_accessibility", "phase_6_2", "mobile_accessibility", "Mobile/accessibility verification", status(auditItemComplete(phase62Audit, "mobile_accessibility_verification")), "dry-run-mobile-accessibility-verification.ts", "Mobile and accessibility verification exists.")
  ];
}

export function summarizePhase63Evidence(input: TeoyubePhase6EvidenceArchiveInput = {}): TeoyubePhase6EvidenceArchiveItem[] {
  const { phase63Audit } = audits(input);
  return [
    item("phase_6_3_fix_queue", "phase_6_3", "stabilization", "Dry-run fix queue", status(auditItemComplete(phase63Audit, "dry_run_fix_queue_manager"), phase63Audit.warnings.length), "dry-run-fix-queue-manager.ts", "Dry-run fix queue is in-memory only."),
    item("phase_6_3_stabilization", "phase_6_3", "stabilization", "Stabilization planner", status(auditItemComplete(phase63Audit, "dry_run_stabilization_planner")), "dry-run-stabilization-planner.ts", "Stabilization items are separated by safety and owner-review status."),
    item("phase_6_3_operations", "phase_6_3", "operations_readiness", "Operations readiness review", status(auditItemComplete(phase63Audit, "operations_readiness_review")), "operations-readiness-review.ts", "Operations readiness remains manual."),
    item("phase_6_3_regression", "phase_6_3", "regression_qa", "Dry-run regression QA", status(auditItemComplete(phase63Audit, "dry_run_regression_qa_runner")), "dry-run-regression-qa-runner.ts", "Regression QA covers service, safety, fallback, confidence, mobile, and accessibility boundaries."),
    item("phase_6_3_disabled_service_regression", "phase_6_3", "disabled_service", "Disabled-service regression", status(auditItemComplete(phase63Audit, "disabled_service_regression")), "dry-run-disabled-service-regression.ts", "Disabled services remain locked."),
    item("phase_6_3_safety_regression", "phase_6_3", "scripture_explanation_fallback", "Safety regression", status(auditItemComplete(phase63Audit, "safety_regression")), "dry-run-safety-regression.ts", "Scripture, explanation, fallback, confidence, privacy, and no-divine-certainty boundaries remain protected."),
    item("phase_6_3_mobile_regression", "phase_6_3", "mobile_accessibility", "Mobile/accessibility regression", status(auditItemComplete(phase63Audit, "mobile_accessibility_regression")), "dry-run-mobile-accessibility-regression.ts", "Mobile/accessibility state remains protected."),
    item("phase_6_3_owner_review", "phase_6_3", "owner_review", "Owner review", status(auditItemComplete(phase63Audit, "owner_review")), "phase-6-3-owner-review.ts", "Owner review is represented before operations lock.")
  ];
}

export function getPhase6EvidenceGaps(input: TeoyubePhase6EvidenceArchiveInput = {}): string[] {
  return [
    ...summarizePhase61Evidence(input),
    ...summarizePhase62Evidence(input),
    ...summarizePhase63Evidence(input)
  ].filter((entry) => entry.status === "blocked").map((entry) => `${entry.label}: ${entry.details}`);
}

export function createPhase6EvidenceArchive(input: TeoyubePhase6EvidenceArchiveInput = {}): TeoyubePhase6EvidenceArchive {
  return {
    id: "phase_6_4_evidence_archive",
    items: [
      ...summarizePhase61Evidence(input),
      ...summarizePhase62Evidence(input),
      ...summarizePhase63Evidence(input)
    ],
    gaps: getPhase6EvidenceGaps(input),
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function createPhase6EvidenceArchiveReport(input: TeoyubePhase6EvidenceArchiveInput = {}): TeoyubePhase6EvidenceArchiveReport {
  const archive = createPhase6EvidenceArchive(input);
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
