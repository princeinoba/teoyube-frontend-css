import type {
  TeoyubePostReleaseStabilizationArea,
  TeoyubePostReleaseStabilizationBlocker,
  TeoyubePostReleaseStabilizationCheck,
  TeoyubePostReleaseStabilizationDecision,
  TeoyubePostReleaseStabilizationRecord,
  TeoyubePostReleaseStabilizationReport,
  TeoyubePostReleaseStabilizationResult,
  TeoyubePostReleaseStabilizationStatus,
  TeoyubePostReleaseStabilizationWarning
} from "./post-release-stabilization-contracts";

export type TeoyubePostReleaseStabilizationInput = Partial<{
  status: TeoyubePostReleaseStabilizationStatus;
  releaseOwner: string;
  firstDayWindow: string;
  firstHourMonitoringReviewed: boolean;
  launchDecisionLogReviewed: boolean;
  unresolvedSeverity1IssuesReviewed: boolean;
  unresolvedSeverity2IssuesReviewed: boolean;
  knownSeverity3IssuesReviewed: boolean;
  knownSeverity4IssuesReviewed: boolean;
  feedbackIntakeReviewedManually: boolean;
  noPrivateDataExposureReported: boolean;
  noSecretExposureReported: boolean;
  noCoreRouteCrashReported: boolean;
  noUnsafeSpiritualResponsePatternReported: boolean;
  noMobileBlockingIssueReported: boolean;
  safeFixQueueReviewed: boolean;
  rollbackReadinessStillValid: boolean;
  ownerDecisionRecorded: boolean;
  results: TeoyubePostReleaseStabilizationResult[];
  notes: string[];
}>;

function check(id: string, area: TeoyubePostReleaseStabilizationArea, label: string, passed: boolean, details: string, critical = false): TeoyubePostReleaseStabilizationCheck {
  return { id, area, label, passed, critical, details };
}

export function createPostReleaseStabilizationChecklist(input: TeoyubePostReleaseStabilizationInput = {}): TeoyubePostReleaseStabilizationCheck[] {
  return [
    check("first_hour_monitoring_reviewed", "owner_review", "First-hour monitoring reviewed", input.firstHourMonitoringReviewed === true, "Owner reviews first-hour observations before first-day decision."),
    check("launch_decision_log_reviewed", "owner_review", "Launch decision log reviewed", input.launchDecisionLogReviewed === true, "Owner reviews launch decisions from Phase 10.3."),
    check("severity_1_reviewed", "error_handling", "Unresolved Severity 1 issues reviewed", input.unresolvedSeverity1IssuesReviewed === true, "Critical issues must be reviewed for rollback or pause.", true),
    check("severity_2_reviewed", "error_handling", "Unresolved Severity 2 issues reviewed", input.unresolvedSeverity2IssuesReviewed === true, "High issues must be reviewed before wider promotion.", true),
    check("severity_3_reviewed", "error_handling", "Known Severity 3 issues reviewed", input.knownSeverity3IssuesReviewed === true, "Medium issues are candidates for safe-fix queue or stabilization backlog."),
    check("severity_4_reviewed", "error_handling", "Known Severity 4 issues reviewed", input.knownSeverity4IssuesReviewed === true, "Low issues are deferred or watched."),
    check("manual_feedback_reviewed", "feedback_intake", "Feedback intake reviewed manually", input.feedbackIntakeReviewedManually === true, "Feedback review stays manual; no automatic collection is added."),
    check("no_private_data_exposure", "privacy_consent", "No private data exposure reported", input.noPrivateDataExposureReported === true, "Private data exposure requires rollback review.", true),
    check("no_secret_exposure", "privacy_consent", "No secret exposure reported", input.noSecretExposureReported === true, "Secret exposure requires rollback review.", true),
    check("no_core_route_crash", "navigation", "No core route crash reported", input.noCoreRouteCrashReported === true, "Core route crashes require pause or rollback review.", true),
    check("no_unsafe_spiritual_pattern", "content_safety", "No unsafe spiritual response pattern reported", input.noUnsafeSpiritualResponsePatternReported === true, "Unsafe spiritual guidance patterns must pause promotion.", true),
    check("no_mobile_blocker", "mobile_layout", "No mobile-blocking issue reported", input.noMobileBlockingIssueReported === true, "Mobile blockers must pause wider promotion."),
    check("safe_fix_queue_reviewed", "owner_review", "Safe-fix queue reviewed", input.safeFixQueueReviewed === true, "Owner reviews safe fixes before implementation."),
    check("rollback_readiness_valid", "service_disabled_state", "Rollback readiness still valid", input.rollbackReadinessStillValid === true, "Rollback remains manual and must stay available.", true),
    check("owner_decision_recorded", "owner_review", "Owner decision recorded", input.ownerDecisionRecorded === true, "Owner records continue, pause, rollback, or first-week stabilization decision.", true)
  ];
}

export function createPostReleaseStabilizationRecord(input: TeoyubePostReleaseStabilizationInput = {}): TeoyubePostReleaseStabilizationRecord {
  return {
    id: "phase_10_4_post_release_stabilization",
    status: input.status || "not_started",
    releaseOwner: input.releaseOwner || "manual_owner_required",
    firstDayWindow: input.firstDayWindow || "manual_first_day_review_required",
    results: input.results || [],
    notes: input.notes || ["Post-release stabilization is local-only and manual."],
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}

export function recordPostReleaseStabilizationResult(records: TeoyubePostReleaseStabilizationResult[], result: TeoyubePostReleaseStabilizationResult): TeoyubePostReleaseStabilizationResult[] {
  return [...records.filter((entry) => entry.id !== result.id), result];
}

export function getPostReleaseStabilizationBlockers(input: TeoyubePostReleaseStabilizationInput = {}): TeoyubePostReleaseStabilizationBlocker[] {
  return createPostReleaseStabilizationChecklist(input)
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      area: entry.area,
      message: entry.details,
      requiredAction: "Resolve or owner-review this blocker before first-week release expansion."
    }));
}

export function getPostReleaseStabilizationWarnings(input: TeoyubePostReleaseStabilizationInput = {}): TeoyubePostReleaseStabilizationWarning[] {
  const warnings = createPostReleaseStabilizationChecklist(input)
    .filter((entry) => !entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  warnings.push({
    id: "manual_only_stabilization",
    area: "service_disabled_state",
    message: "This report does not monitor users, collect feedback, fetch URLs, connect analytics, or persist data."
  });
  return warnings;
}

export function createPostReleaseStabilizationDecision(input: TeoyubePostReleaseStabilizationInput = {}): TeoyubePostReleaseStabilizationDecision {
  if (!input.noPrivateDataExposureReported || !input.noSecretExposureReported) return "rollback_required";
  if (!input.noCoreRouteCrashReported || !input.noUnsafeSpiritualResponsePatternReported) return "pause_promotion";
  if (getPostReleaseStabilizationBlockers(input).length) return "blocked";
  if (!input.unresolvedSeverity2IssuesReviewed || !input.noMobileBlockingIssueReported) return "safe_fix_required";
  if (getPostReleaseStabilizationWarnings(input).length > 1) return "continue_with_watch";
  return "move_to_first_week_stabilization";
}

export function createPostReleaseStabilizationReport(input: TeoyubePostReleaseStabilizationInput = {}): TeoyubePostReleaseStabilizationReport {
  const blockers = getPostReleaseStabilizationBlockers(input);
  const decision = createPostReleaseStabilizationDecision(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : input.status || "reviewing",
    decision,
    record: createPostReleaseStabilizationRecord(input),
    checklist: createPostReleaseStabilizationChecklist(input),
    blockers,
    warnings: getPostReleaseStabilizationWarnings(input),
    noPublicLaunchPerformedByCode: true,
    noAutomaticDeployment: true,
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
