import type {
  TeoyubeStabilizedOperationsHandoffArea,
  TeoyubeStabilizedOperationsHandoffBlocker,
  TeoyubeStabilizedOperationsHandoffCheck,
  TeoyubeStabilizedOperationsHandoffDecision,
  TeoyubeStabilizedOperationsHandoffRecord,
  TeoyubeStabilizedOperationsHandoffReport,
  TeoyubeStabilizedOperationsHandoffStatus,
  TeoyubeStabilizedOperationsHandoffWarning
} from "./stabilized-operations-handoff-contracts";

export type TeoyubeStabilizedOperationsHandoffInput = Partial<{
  status: TeoyubeStabilizedOperationsHandoffStatus;
  releaseOwner: string;
  conditions: string[];
  notes: string[];
  releaseOwnerIdentified: boolean;
  manualMonitoringCadenceDocumented: boolean;
  manualFeedbackReviewCadenceDocumented: boolean;
  issueTriageProcessDocumented: boolean;
  knownIssueRegisterMaintained: boolean;
  safeFixBatchProcessDocumented: boolean;
  rollbackProcessDocumented: boolean;
  publicTrustReviewCompleted: boolean;
  weeklyImprovementLoopPrepared: boolean;
  remainingLimitationsDocumented: boolean;
  nextOperationsPhaseAcceptedByOwner: boolean;
}>;

function check(id: string, area: TeoyubeStabilizedOperationsHandoffArea, label: string, passed: boolean, details: string, critical = true): TeoyubeStabilizedOperationsHandoffCheck {
  return { id, area, label, passed, critical, details };
}

export function createStabilizedOperationsHandoffChecklist(input: TeoyubeStabilizedOperationsHandoffInput = {}): TeoyubeStabilizedOperationsHandoffCheck[] {
  return [
    check("release_owner", "release_owner", "Release owner identified", input.releaseOwnerIdentified === true, "Release owner must be identified."),
    check("manual_monitoring", "manual_monitoring", "Manual monitoring cadence documented", input.manualMonitoringCadenceDocumented === true, "Manual monitoring cadence must be documented."),
    check("feedback_review", "feedback_review", "Manual feedback review cadence documented", input.manualFeedbackReviewCadenceDocumented === true, "Manual feedback review cadence must be documented."),
    check("issue_triage", "issue_triage", "Issue triage process documented", input.issueTriageProcessDocumented === true, "Issue triage process must be documented."),
    check("known_issue_register", "known_issue_register", "Known issue register maintained", input.knownIssueRegisterMaintained === true, "Known issue register must be maintained."),
    check("safe_fix_process", "safe_fix_process", "Safe-fix batch process documented", input.safeFixBatchProcessDocumented === true, "Safe-fix batch process must be documented."),
    check("rollback_process", "rollback_process", "Rollback process documented", input.rollbackProcessDocumented === true, "Rollback process must be documented."),
    check("public_trust_review", "public_trust_review", "Public trust review completed", input.publicTrustReviewCompleted === true, "Public trust review must be completed."),
    check("weekly_loop", "weekly_improvement_loop", "Weekly improvement loop prepared", input.weeklyImprovementLoopPrepared === true, "Weekly improvement loop must be prepared."),
    check("limitations", "documentation", "Remaining limitations documented", input.remainingLimitationsDocumented === true, "Remaining limitations must be documented."),
    check("next_phase", "roadmap", "Next operations phase accepted by owner", input.nextOperationsPhaseAcceptedByOwner === true, "Owner must accept or block the next operations phase.")
  ];
}

export function createStabilizedOperationsHandoffRecord(input: TeoyubeStabilizedOperationsHandoffInput = {}): TeoyubeStabilizedOperationsHandoffRecord {
  return {
    id: "phase_10_6_stabilized_operations_handoff",
    status: input.status || "reviewing",
    checks: createStabilizedOperationsHandoffChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    conditions: input.conditions || [],
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getStabilizedOperationsHandoffBlockers(record: TeoyubeStabilizedOperationsHandoffRecord): TeoyubeStabilizedOperationsHandoffBlocker[] {
  const blockers = record.checks
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
  if (record.status === "blocked") blockers.push({ id: "handoff_blocked", area: "unknown", message: "Stabilized operations handoff is blocked." });
  return blockers;
}

export function getStabilizedOperationsHandoffWarnings(record: TeoyubeStabilizedOperationsHandoffRecord): TeoyubeStabilizedOperationsHandoffWarning[] {
  const warnings = record.checks
    .filter((entry) => !entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  if (record.status === "ready_with_conditions" && !record.conditions.length) warnings.push({ id: "conditions_missing", area: "documentation", message: "Conditional handoff should include written conditions." });
  return warnings;
}

export function validateStabilizedOperationsHandoffRecord(record: TeoyubeStabilizedOperationsHandoffRecord): boolean {
  return getStabilizedOperationsHandoffBlockers(record).length === 0;
}

export function createStabilizedOperationsHandoffDecision(record: TeoyubeStabilizedOperationsHandoffRecord): TeoyubeStabilizedOperationsHandoffDecision {
  if (!validateStabilizedOperationsHandoffRecord(record)) return record.status === "needs_more_stabilization" ? "continue_stabilization" : "block_handoff";
  if (record.status === "ready_with_conditions" || record.conditions.length) return "handoff_ready_with_conditions";
  if (record.status === "ready_for_handoff") return "handoff_ready";
  return getStabilizedOperationsHandoffWarnings(record).length ? "handoff_ready_with_conditions" : "handoff_ready";
}

export function createStabilizedOperationsHandoffReport(record: TeoyubeStabilizedOperationsHandoffRecord): TeoyubeStabilizedOperationsHandoffReport {
  const blockers = getStabilizedOperationsHandoffBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createStabilizedOperationsHandoffDecision(record),
    record,
    blockers,
    warnings: getStabilizedOperationsHandoffWarnings(record),
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
