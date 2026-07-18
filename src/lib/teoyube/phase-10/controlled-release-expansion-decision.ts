import type {
  TeoyubeControlledReleaseExpansionArea,
  TeoyubeControlledReleaseExpansionBlocker,
  TeoyubeControlledReleaseExpansionCheck,
  TeoyubeControlledReleaseExpansionDecision,
  TeoyubeControlledReleaseExpansionLevel,
  TeoyubeControlledReleaseExpansionRecord,
  TeoyubeControlledReleaseExpansionReport,
  TeoyubeControlledReleaseExpansionStatus,
  TeoyubeControlledReleaseExpansionWarning
} from "./controlled-release-expansion-decision-contracts";

export type TeoyubeControlledReleaseExpansionInput = Partial<{
  status: TeoyubeControlledReleaseExpansionStatus;
  selectedExpansionLevel: TeoyubeControlledReleaseExpansionLevel;
  releaseOwner: string;
  notes: string[];
  conditions: string[];
  firstWeekStabilizationReviewed: boolean;
  manualFeedbackLoopReviewed: boolean;
  repeatedIssuePatternsReviewed: boolean;
  knownIssueRegisterReviewed: boolean;
  safeFixBatchReviewed: boolean;
  noUnresolvedSeverity1Issues: boolean;
  noExpansionBlockingSeverity2Issues: boolean;
  rollbackReadinessConfirmed: boolean;
  ownerApprovalRecorded: boolean;
  safetyBoundariesPreserved: boolean;
  controlledExpansionLevelSelected: boolean;
  conditionsDocumentedIfApplicable: boolean;
}>;

function check(id: string, area: TeoyubeControlledReleaseExpansionArea, label: string, passed: boolean, details: string, critical = true): TeoyubeControlledReleaseExpansionCheck {
  return { id, area, label, passed, critical, details };
}

export function createControlledReleaseExpansionChecklist(input: TeoyubeControlledReleaseExpansionInput = {}): TeoyubeControlledReleaseExpansionCheck[] {
  return [
    check("first_week_reviewed", "app_stability", "First-week stabilization reviewed", input.firstWeekStabilizationReviewed === true, "First-week stabilization report must be reviewed."),
    check("manual_feedback_reviewed", "manual_feedback", "Manual feedback loop reviewed", input.manualFeedbackLoopReviewed === true, "Manual feedback loop must be reviewed."),
    check("patterns_reviewed", "issue_patterns", "Repeated issue patterns reviewed", input.repeatedIssuePatternsReviewed === true, "Repeated issue patterns must be reviewed before expansion."),
    check("known_issues_reviewed", "known_issues", "Known issue register reviewed", input.knownIssueRegisterReviewed === true, "Known issues must be reviewed before expansion."),
    check("safe_fix_batch_reviewed", "safe_fixes", "Safe-fix batch reviewed", input.safeFixBatchReviewed === true, "Safe-fix batch must be reviewed before expansion."),
    check("no_severity_1", "known_issues", "No unresolved Severity 1 issues", input.noUnresolvedSeverity1Issues === true, "Unresolved Severity 1 issues block expansion."),
    check("no_blocking_severity_2", "known_issues", "No expansion-blocking Severity 2 issues", input.noExpansionBlockingSeverity2Issues === true, "Expansion-blocking Severity 2 issues require remain-limited or pause decision."),
    check("rollback_ready", "rollback_readiness", "Rollback readiness confirmed", input.rollbackReadinessConfirmed === true, "Rollback readiness must be confirmed manually."),
    check("owner_approval", "owner_approval", "Owner approval recorded", input.ownerApprovalRecorded === true, "Owner approval is required for controlled expansion."),
    check("safety_boundaries", "content_safety", "Safety boundaries preserved", input.safetyBoundariesPreserved === true, "Scripture, explanation, fallback, confidence, privacy, and service-disabled boundaries must be preserved."),
    check("expansion_level", "owner_approval", "Controlled expansion level selected", input.controlledExpansionLevelSelected === true, "Owner must select remain internal, remain limited, small group, wider group, pause, or rollback."),
    check("conditions_documented", "owner_approval", "Conditions documented if applicable", input.conditionsDocumentedIfApplicable === true, "Conditional expansion needs explicit conditions.", false)
  ];
}

export function createControlledReleaseExpansionRecord(input: TeoyubeControlledReleaseExpansionInput = {}): TeoyubeControlledReleaseExpansionRecord {
  return {
    id: "phase_10_5_controlled_release_expansion_decision",
    status: input.status || "reviewing",
    selectedExpansionLevel: input.selectedExpansionLevel || "unknown",
    conditions: input.conditions || [],
    checks: createControlledReleaseExpansionChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getControlledReleaseExpansionBlockers(record: TeoyubeControlledReleaseExpansionRecord): TeoyubeControlledReleaseExpansionBlocker[] {
  const blockers = record.checks
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
  if (record.selectedExpansionLevel === "rollback_required") blockers.push({ id: "rollback_level_selected", area: "rollback_readiness", message: "Selected expansion level requires rollback." });
  if (record.selectedExpansionLevel === "pause_expansion") blockers.push({ id: "pause_level_selected", area: "owner_approval", message: "Selected expansion level pauses expansion." });
  return blockers;
}

export function getControlledReleaseExpansionWarnings(record: TeoyubeControlledReleaseExpansionRecord): TeoyubeControlledReleaseExpansionWarning[] {
  const warnings = record.checks
    .filter((entry) => !entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  if (record.status === "approved_with_conditions" && !record.conditions.length) {
    warnings.push({ id: "conditions_missing", area: "owner_approval", message: "Conditional approval should include written conditions." });
  }
  if (record.selectedExpansionLevel === "expand_to_wider_public_group") {
    warnings.push({ id: "wider_group_caution", area: "owner_approval", message: "Wider public expansion should wait for explicit owner readiness and local verification." });
  }
  return warnings;
}

export function validateControlledReleaseExpansionRecord(record: TeoyubeControlledReleaseExpansionRecord): boolean {
  return getControlledReleaseExpansionBlockers(record).length === 0;
}

export function createControlledReleaseExpansionDecision(record: TeoyubeControlledReleaseExpansionRecord): TeoyubeControlledReleaseExpansionDecision {
  if (record.selectedExpansionLevel === "rollback_required" || record.status === "rollback_required") return "rollback_required";
  if (record.selectedExpansionLevel === "pause_expansion" || record.status === "pause_promotion") return "pause_promotion";
  if (!validateControlledReleaseExpansionRecord(record)) return "blocked";
  if (record.status === "approved_with_conditions" || record.conditions.length) return "approved_with_conditions";
  if (record.selectedExpansionLevel === "expand_to_small_public_group" || record.selectedExpansionLevel === "expand_to_wider_public_group") return "approved_for_limited_expansion";
  if (record.selectedExpansionLevel === "remain_limited_public" || record.selectedExpansionLevel === "remain_internal") return "remain_limited";
  return "unknown";
}

export function createControlledReleaseExpansionReport(record: TeoyubeControlledReleaseExpansionRecord): TeoyubeControlledReleaseExpansionReport {
  const blockers = getControlledReleaseExpansionBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createControlledReleaseExpansionDecision(record),
    record,
    blockers,
    warnings: getControlledReleaseExpansionWarnings(record),
    noAutomaticPublicExpansion: true,
    noAutomaticDeployment: true,
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
