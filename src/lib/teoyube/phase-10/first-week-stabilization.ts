import type {
  TeoyubeFirstWeekStabilizationArea,
  TeoyubeFirstWeekStabilizationBlocker,
  TeoyubeFirstWeekStabilizationCheck,
  TeoyubeFirstWeekStabilizationDecision,
  TeoyubeFirstWeekStabilizationRecord,
  TeoyubeFirstWeekStabilizationReport,
  TeoyubeFirstWeekStabilizationResult,
  TeoyubeFirstWeekStabilizationStatus,
  TeoyubeFirstWeekStabilizationWarning
} from "./first-week-stabilization-contracts";

export type TeoyubeFirstWeekStabilizationInput = Partial<{
  status: TeoyubeFirstWeekStabilizationStatus;
  releaseOwner: string;
  firstWeekWindow: string;
  results: TeoyubeFirstWeekStabilizationResult[];
  notes: string[];
  firstDayReviewCompleted: boolean;
  unresolvedSeverity1IssuesReviewed: boolean;
  unresolvedSeverity2IssuesReviewed: boolean;
  severity3And4IssuesCategorized: boolean;
  manualFeedbackReviewedDaily: boolean;
  repeatedIssuesIdentified: boolean;
  safeFixQueueReviewed: boolean;
  safeFixBatchCandidatesReviewed: boolean;
  knownIssueRegisterUpdated: boolean;
  rollbackReadinessReconfirmed: boolean;
  ownerDecisionRecorded: boolean;
  noPrivateDataExposureReported: boolean;
  noSecretExposureReported: boolean;
  noUnsafeSpiritualResponsePatternReported: boolean;
  scriptureAnchorsPreserved: boolean;
  explanationTracesPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelsPreserved: boolean;
  privacyConsentBoundariesPreserved: boolean;
  serviceDisabledStatePreserved: boolean;
}>;

function check(id: string, area: TeoyubeFirstWeekStabilizationArea, label: string, passed: boolean, details: string, critical = true): TeoyubeFirstWeekStabilizationCheck {
  return { id, area, label, passed, critical, details };
}

export function createFirstWeekStabilizationChecklist(input: TeoyubeFirstWeekStabilizationInput = {}): TeoyubeFirstWeekStabilizationCheck[] {
  return [
    check("first_day_review_completed", "owner_review", "First-day review completed", input.firstDayReviewCompleted === true, "Phase 10.4 first-day review must be reviewed before first-week decisions."),
    check("severity_1_reviewed", "known_issues", "Unresolved Severity 1 issues reviewed", input.unresolvedSeverity1IssuesReviewed === true, "Severity 1 issues require rollback or release pause review."),
    check("severity_2_reviewed", "known_issues", "Unresolved Severity 2 issues reviewed", input.unresolvedSeverity2IssuesReviewed === true, "Severity 2 issues require owner conditions before expansion."),
    check("severity_3_4_categorized", "known_issues", "Severity 3 and 4 issues categorized", input.severity3And4IssuesCategorized === true, "Medium and low issues must be categorized for watch or backlog."),
    check("manual_feedback_daily", "manual_feedback", "Manual feedback reviewed at least daily", input.manualFeedbackReviewedDaily === true, "Feedback review remains manual and should happen daily during the first week."),
    check("repeated_issues_identified", "issue_patterns", "Repeated issues identified", input.repeatedIssuesIdentified === true, "Repeated manual reports should be grouped before expansion decisions.", false),
    check("safe_fix_queue_reviewed", "safe_fix_queue", "Safe-fix queue reviewed", input.safeFixQueueReviewed === true, "Safe-fix queue must be reviewed before batching fixes."),
    check("safe_fix_batch_reviewed", "safe_fix_queue", "Safe-fix batch candidates reviewed", input.safeFixBatchCandidatesReviewed === true, "Safe-fix batches must preserve Teoyube safety boundaries."),
    check("known_issue_register_updated", "known_issues", "Known issue register updated", input.knownIssueRegisterUpdated === true, "Known issues must be accepted, rejected, or deferred with owner notes."),
    check("rollback_readiness_reconfirmed", "rollback_readiness", "Rollback readiness reconfirmed", input.rollbackReadinessReconfirmed === true, "Rollback readiness remains a manual gate."),
    check("owner_decision_recorded", "owner_review", "Owner decision recorded", input.ownerDecisionRecorded === true, "Owner must record continue, pause, rollback, remain limited, or expansion decision."),
    check("no_private_data_exposure", "privacy_consent", "No private data exposure reported", input.noPrivateDataExposureReported === true, "Private data exposure blocks expansion."),
    check("no_secret_exposure", "privacy_consent", "No secret exposure reported", input.noSecretExposureReported === true, "Secret exposure blocks expansion."),
    check("no_unsafe_spiritual_pattern", "spiritual_response_sections", "No unsafe spiritual response pattern reported", input.noUnsafeSpiritualResponsePatternReported === true, "Unsafe spiritual response patterns require owner review."),
    check("scripture_anchors_preserved", "scripture_anchor", "Scripture anchors preserved", input.scriptureAnchorsPreserved === true, "Scripture anchors must not be removed."),
    check("explanation_traces_preserved", "explanation_trace", "Explanation traces preserved", input.explanationTracesPreserved === true, "Explanation traces must remain visible where expected."),
    check("fallback_safety_preserved", "fallback", "Fallback safety preserved", input.fallbackSafetyPreserved === true, "Fallback states must remain safe."),
    check("confidence_labels_preserved", "confidence_label", "Confidence labels preserved", input.confidenceLabelsPreserved === true, "Confidence labels must not be hidden."),
    check("privacy_consent_preserved", "privacy_consent", "Privacy and consent boundaries preserved", input.privacyConsentBoundariesPreserved === true, "Privacy and consent notices must remain visible."),
    check("service_disabled_preserved", "service_disabled_state", "Service-disabled state preserved", input.serviceDisabledStatePreserved === true, "No database, analytics, monitoring provider, admin auth, CMS, accounts, live AI, or notifications are enabled.")
  ];
}

export function createFirstWeekStabilizationRecord(input: TeoyubeFirstWeekStabilizationInput = {}): TeoyubeFirstWeekStabilizationRecord {
  return {
    id: "phase_10_5_first_week_stabilization",
    status: input.status || "reviewing",
    releaseOwner: input.releaseOwner || "project_owner",
    firstWeekWindow: input.firstWeekWindow || "manual_first_week_window",
    results: input.results || [],
    notes: input.notes || [],
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}

export function recordFirstWeekStabilizationResult(records: TeoyubeFirstWeekStabilizationResult[], result: TeoyubeFirstWeekStabilizationResult): TeoyubeFirstWeekStabilizationResult[] {
  return [...records.filter((entry) => entry.id !== result.id), result];
}

export function getFirstWeekStabilizationBlockers(input: TeoyubeFirstWeekStabilizationInput = {}): TeoyubeFirstWeekStabilizationBlocker[] {
  const checklistBlockers = createFirstWeekStabilizationChecklist(input)
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      area: entry.area,
      message: entry.details,
      requiredAction: "Review manually before controlled release expansion."
    }));
  const resultBlockers = (input.results || [])
    .filter((entry) => entry.status === "rollback_required" || entry.status === "blocked" || entry.status === "pause_recommended")
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      area: entry.area,
      message: entry.summary,
      requiredAction: "Resolve or record owner decision before expansion."
    }));
  return [...checklistBlockers, ...resultBlockers];
}

export function getFirstWeekStabilizationWarnings(input: TeoyubeFirstWeekStabilizationInput = {}): TeoyubeFirstWeekStabilizationWarning[] {
  const warnings = createFirstWeekStabilizationChecklist(input)
    .filter((entry) => !entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  if (!(input.results || []).length) warnings.push({ id: "no_first_week_results", area: "owner_review", message: "No first-week stabilization results were recorded." });
  warnings.push({ id: "manual_only_boundary", area: "service_disabled_state", message: "First-week stabilization is local-only and does not monitor users, collect feedback, fetch URLs, or connect services." });
  return warnings;
}

export function createFirstWeekStabilizationDecision(input: TeoyubeFirstWeekStabilizationInput = {}): TeoyubeFirstWeekStabilizationDecision {
  const blockers = getFirstWeekStabilizationBlockers(input);
  if (input.status === "rollback_required" || blockers.some((entry) => entry.area === "privacy_consent" || entry.area === "spiritual_response_sections")) return "rollback_required";
  if (blockers.length) return input.status === "needs_safe_fix_batch" ? "safe_fix_batch_required" : "blocked";
  if (input.status === "ready_for_limited_expansion") return "ready_for_limited_expansion";
  if (input.status === "pause_recommended") return "pause_promotion";
  return getFirstWeekStabilizationWarnings(input).length ? "continue_with_watch" : "continue_controlled_release";
}

export function createFirstWeekStabilizationReport(input: TeoyubeFirstWeekStabilizationInput = {}): TeoyubeFirstWeekStabilizationReport {
  const blockers = getFirstWeekStabilizationBlockers(input);
  return {
    valid: blockers.length === 0,
    status: input.status || (blockers.length ? "blocked" : "stable_with_warnings"),
    decision: createFirstWeekStabilizationDecision(input),
    record: createFirstWeekStabilizationRecord(input),
    checklist: createFirstWeekStabilizationChecklist(input),
    blockers,
    warnings: getFirstWeekStabilizationWarnings(input),
    noPublicExpansionPerformedByCode: true,
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
