export type TeoyubeStabilizedOperationsRunbookDecision =
  | "runbook_ready"
  | "runbook_ready_with_conditions"
  | "continue_preparation"
  | "blocked";

export type TeoyubeStabilizedOperationsRunbookRecord = {
  id: string;
  checks: Array<{ id: string; label: string; passed: boolean; critical: boolean; details: string }>;
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeStabilizedOperationsRunbookInput = Partial<{
  releaseOwner: string;
  notes: string[];
  dailyManualCheckProcess: boolean;
  weeklyFeedbackReviewProcess: boolean;
  weeklyKnownIssueReviewProcess: boolean;
  safeFixBatchReviewProcess: boolean;
  rollbackReviewProcess: boolean;
  ownerDecisionLogProcess: boolean;
  publicTrustReviewRefreshProcess: boolean;
  severity1And2EscalationProcess: boolean;
  documentationUpdateProcess: boolean;
  roadmapUpdateProcess: boolean;
}>;

function runbookItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, critical: true, details };
}

export function createStabilizedOperationsRunbookChecklist(input: TeoyubeStabilizedOperationsRunbookInput = {}) {
  return [
    runbookItem("daily_manual_check", "Daily manual check process", input.dailyManualCheckProcess === true, "Daily manual check process must be documented."),
    runbookItem("weekly_feedback_review", "Weekly feedback review process", input.weeklyFeedbackReviewProcess === true, "Weekly feedback review process must be documented."),
    runbookItem("weekly_known_issue_review", "Weekly known issue review process", input.weeklyKnownIssueReviewProcess === true, "Weekly known issue review process must be documented."),
    runbookItem("safe_fix_batch_review", "Safe-fix batch review process", input.safeFixBatchReviewProcess === true, "Safe-fix batch review process must be documented."),
    runbookItem("rollback_review", "Rollback review process", input.rollbackReviewProcess === true, "Rollback review process must be documented."),
    runbookItem("owner_decision_log", "Owner decision log process", input.ownerDecisionLogProcess === true, "Owner decision log process must be documented."),
    runbookItem("public_trust_refresh", "Public trust review refresh process", input.publicTrustReviewRefreshProcess === true, "Public trust review refresh process must be documented."),
    runbookItem("severity_escalation", "Severity 1 and 2 escalation process", input.severity1And2EscalationProcess === true, "Severity 1 and 2 escalation process must be documented."),
    runbookItem("documentation_update", "Documentation update process", input.documentationUpdateProcess === true, "Documentation update process must be documented."),
    runbookItem("roadmap_update", "Roadmap update process", input.roadmapUpdateProcess === true, "Roadmap update process must be documented.")
  ];
}

export function createStabilizedOperationsRunbookRecord(input: TeoyubeStabilizedOperationsRunbookInput = {}): TeoyubeStabilizedOperationsRunbookRecord {
  return {
    id: "phase_10_6_stabilized_operations_runbook",
    checks: createStabilizedOperationsRunbookChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getStabilizedOperationsRunbookBlockers(record: TeoyubeStabilizedOperationsRunbookRecord): string[] {
  return record.checks.filter((entry) => entry.critical && !entry.passed).map((entry) => entry.details);
}

export function getStabilizedOperationsRunbookWarnings(record: TeoyubeStabilizedOperationsRunbookRecord): string[] {
  const warnings: string[] = [];
  if (!record.notes.length) warnings.push("Stabilized operations runbook has no owner notes.");
  warnings.push("Runbook is local-only and does not create monitoring, alerts, feedback collection, or user contact.");
  return warnings;
}

export function validateStabilizedOperationsRunbook(record: TeoyubeStabilizedOperationsRunbookRecord): boolean {
  return getStabilizedOperationsRunbookBlockers(record).length === 0;
}

export function createStabilizedOperationsRunbookDecision(record: TeoyubeStabilizedOperationsRunbookRecord): TeoyubeStabilizedOperationsRunbookDecision {
  if (!validateStabilizedOperationsRunbook(record)) return "continue_preparation";
  return getStabilizedOperationsRunbookWarnings(record).length ? "runbook_ready_with_conditions" : "runbook_ready";
}

export function createStabilizedOperationsRunbookReport(record: TeoyubeStabilizedOperationsRunbookRecord) {
  const blockers = getStabilizedOperationsRunbookBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createStabilizedOperationsRunbookDecision(record),
    record,
    blockers,
    warnings: getStabilizedOperationsRunbookWarnings(record),
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
