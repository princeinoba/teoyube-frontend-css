import type {
  TeoyubeFirstDayReviewArea,
  TeoyubeFirstDayReviewBlocker,
  TeoyubeFirstDayReviewCheck,
  TeoyubeFirstDayReviewDecision,
  TeoyubeFirstDayReviewRecord,
  TeoyubeFirstDayReviewReport,
  TeoyubeFirstDayReviewStatus,
  TeoyubeFirstDayReviewWarning
} from "./first-day-review-contracts";

export type TeoyubeFirstDayReviewInput = Partial<{
  firstHourMonitoringReviewed: boolean;
  launchDecisionLogReviewed: boolean;
  allSeverity1IssuesReviewed: boolean;
  allSeverity2IssuesReviewed: boolean;
  severity3And4IssuesCategorized: boolean;
  manualFeedbackReviewed: boolean;
  safeFixQueueReviewed: boolean;
  rollbackReadinessReconfirmed: boolean;
  knownIssuesAcceptedOrRejected: boolean;
  ownerDecisionRecorded: boolean;
  nextDayWatchItemsIdentified: boolean;
  firstWeekStabilizationReadinessAssessed: boolean;
  ownerDecision: TeoyubeFirstDayReviewDecision;
  nextDayWatchItems: string[];
  notes: string[];
  status: TeoyubeFirstDayReviewStatus;
}>;

function check(id: string, area: TeoyubeFirstDayReviewArea, label: string, passed: boolean, details: string, required = true): TeoyubeFirstDayReviewCheck {
  return { id, area, label, passed, required, details };
}

export function createFirstDayReviewChecklist(input: TeoyubeFirstDayReviewInput = {}): TeoyubeFirstDayReviewCheck[] {
  return [
    check("first_hour_reviewed", "first_hour_summary", "First-hour monitoring reviewed", input.firstHourMonitoringReviewed === true, "First-hour summary must be reviewed."),
    check("launch_decision_reviewed", "owner_decision", "Launch decision log reviewed", input.launchDecisionLogReviewed === true, "Launch decision log must be reviewed."),
    check("severity_1_reviewed", "issue_triage", "All Severity 1 issues reviewed", input.allSeverity1IssuesReviewed === true, "Severity 1 issues require rollback or pause review."),
    check("severity_2_reviewed", "issue_triage", "All Severity 2 issues reviewed", input.allSeverity2IssuesReviewed === true, "Severity 2 issues require safe-fix or pause review."),
    check("severity_3_4_categorized", "known_issues", "Severity 3 and 4 issues categorized", input.severity3And4IssuesCategorized === true, "Medium and low issues must be categorized."),
    check("manual_feedback_reviewed", "manual_feedback", "Manual feedback reviewed", input.manualFeedbackReviewed === true, "Manual feedback must be reviewed without automatic collection."),
    check("safe_fix_queue_reviewed", "safe_fix_queue", "Safe-fix queue reviewed", input.safeFixQueueReviewed === true, "Safe-fix queue must preserve safety boundaries."),
    check("rollback_reconfirmed", "rollback_readiness", "Rollback readiness reconfirmed", input.rollbackReadinessReconfirmed === true, "Rollback readiness remains manual and must be available."),
    check("known_issues_decided", "known_issues", "Known issues accepted or rejected", input.knownIssuesAcceptedOrRejected === true, "Known issues need owner acceptance or rejection."),
    check("owner_decision_recorded", "owner_decision", "Owner decision recorded", input.ownerDecisionRecorded === true, "Owner must record continue, watch, pause, rollback, or first-week stabilization decision."),
    check("next_day_watch", "next_day_watch", "Next-day watch items identified", input.nextDayWatchItemsIdentified === true, "Owner identifies next-day watch items.", false),
    check("first_week_readiness", "first_week_stabilization", "First-week stabilization readiness assessed", input.firstWeekStabilizationReadinessAssessed === true, "Owner assesses readiness for Phase 10.5.", false)
  ];
}

export function createFirstDayReviewRecord(input: TeoyubeFirstDayReviewInput = {}): TeoyubeFirstDayReviewRecord {
  return {
    id: "phase_10_4_first_day_review",
    status: input.status || "reviewing",
    checks: createFirstDayReviewChecklist(input),
    ownerDecision: input.ownerDecision || "unknown",
    nextDayWatchItems: input.nextDayWatchItems || [],
    firstWeekStabilizationReady: input.firstWeekStabilizationReadinessAssessed === true,
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getFirstDayReviewBlockers(record: TeoyubeFirstDayReviewRecord): TeoyubeFirstDayReviewBlocker[] {
  const blockers = record.checks
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
  if (record.ownerDecision === "rollback_required") blockers.push({ id: "owner_decision_rollback", area: "owner_decision", message: "Owner decision requires rollback review." });
  if (record.ownerDecision === "blocked") blockers.push({ id: "owner_decision_blocked", area: "owner_decision", message: "Owner decision blocks first-week stabilization." });
  return blockers;
}

export function getFirstDayReviewWarnings(record: TeoyubeFirstDayReviewRecord): TeoyubeFirstDayReviewWarning[] {
  const warnings = record.checks
    .filter((entry) => !entry.required && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  if (!record.nextDayWatchItems.length) warnings.push({ id: "no_next_day_watch_items", area: "next_day_watch", message: "No next-day watch items were recorded." });
  return warnings;
}

export function validateFirstDayReviewRecord(record: TeoyubeFirstDayReviewRecord): boolean {
  return getFirstDayReviewBlockers(record).length === 0;
}

export function createFirstDayReviewDecision(record: TeoyubeFirstDayReviewRecord): TeoyubeFirstDayReviewDecision {
  if (getFirstDayReviewBlockers(record).length) return record.ownerDecision === "rollback_required" ? "rollback_required" : "blocked";
  if (record.ownerDecision !== "unknown") return record.ownerDecision;
  return getFirstDayReviewWarnings(record).length ? "continue_with_watch" : "move_to_first_week_stabilization";
}

export function createFirstDayReviewReport(record: TeoyubeFirstDayReviewRecord): TeoyubeFirstDayReviewReport {
  const blockers = getFirstDayReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createFirstDayReviewDecision(record),
    record,
    blockers,
    warnings: getFirstDayReviewWarnings(record),
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
