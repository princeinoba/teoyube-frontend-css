import type {
  TeoyubeStabilizedPublicOperationsArea,
  TeoyubeStabilizedPublicOperationsBlocker,
  TeoyubeStabilizedPublicOperationsCheck,
  TeoyubeStabilizedPublicOperationsDecision,
  TeoyubeStabilizedPublicOperationsRecord,
  TeoyubeStabilizedPublicOperationsReport,
  TeoyubeStabilizedPublicOperationsResult,
  TeoyubeStabilizedPublicOperationsStatus,
  TeoyubeStabilizedPublicOperationsWarning
} from "./stabilized-public-operations-contracts";

export type TeoyubeStabilizedPublicOperationsInput = Partial<{
  status: TeoyubeStabilizedPublicOperationsStatus;
  releaseOwner: string;
  operationsWindow: string;
  results: TeoyubeStabilizedPublicOperationsResult[];
  notes: string[];
  stabilizedOperationsHandoffReviewed: boolean;
  manualMonitoringCadenceDocumented: boolean;
  weeklyFeedbackReviewCadenceDocumented: boolean;
  knownIssueRegisterReviewed: boolean;
  safeFixBatchProcessReviewed: boolean;
  rollbackProcessReviewed: boolean;
  publicTrustRefreshProcessReviewed: boolean;
  noUnresolvedSeverity1Issues: boolean;
  noUnapprovedSeverity2Blockers: boolean;
  noPrivateDataExposureReported: boolean;
  noSecretExposureReported: boolean;
  noUnsafeSpiritualResponsePatternReported: boolean;
  scriptureAnchorsPreserved: boolean;
  explanationTracesPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelsPreserved: boolean;
  privacyConsentBoundariesPreserved: boolean;
  knownLimitationsDocumented: boolean;
  serviceDisabledStatePreserved: boolean;
  ownerDecisionRecorded: boolean;
}>;

function check(id: string, area: TeoyubeStabilizedPublicOperationsArea, label: string, passed: boolean, details: string, critical = true): TeoyubeStabilizedPublicOperationsCheck {
  return { id, area, label, passed, critical, details };
}

export function createStabilizedPublicOperationsChecklist(input: TeoyubeStabilizedPublicOperationsInput = {}): TeoyubeStabilizedPublicOperationsCheck[] {
  return [
    check("handoff_reviewed", "owner_review", "Stabilized operations handoff reviewed", input.stabilizedOperationsHandoffReviewed === true, "Phase 10.6 operations handoff must be reviewed."),
    check("manual_monitoring", "app_availability", "Manual monitoring cadence documented", input.manualMonitoringCadenceDocumented === true, "Manual monitoring cadence must be documented."),
    check("weekly_feedback", "manual_feedback", "Weekly feedback review cadence documented", input.weeklyFeedbackReviewCadenceDocumented === true, "Weekly feedback review cadence must be documented."),
    check("known_issues", "known_issues", "Known issue register reviewed", input.knownIssueRegisterReviewed === true, "Known issue register must be reviewed."),
    check("safe_fix_batches", "safe_fix_batches", "Safe-fix batch process reviewed", input.safeFixBatchProcessReviewed === true, "Safe-fix batch process must be reviewed."),
    check("rollback_process", "rollback_readiness", "Rollback process reviewed", input.rollbackProcessReviewed === true, "Rollback process must be reviewed."),
    check("public_trust_refresh", "public_trust", "Public trust refresh process reviewed", input.publicTrustRefreshProcessReviewed === true, "Public trust refresh process must be reviewed."),
    check("no_severity_1", "known_issues", "No unresolved Severity 1 issues", input.noUnresolvedSeverity1Issues === true, "Unresolved Severity 1 issues block Phase 10 completion."),
    check("no_unapproved_severity_2", "known_issues", "No unapproved Severity 2 blockers", input.noUnapprovedSeverity2Blockers === true, "Unapproved Severity 2 blockers prevent completion."),
    check("no_private_data_exposure", "privacy_consent", "No private data exposure reported", input.noPrivateDataExposureReported === true, "Private data exposure blocks completion."),
    check("no_secret_exposure", "privacy_consent", "No secret exposure reported", input.noSecretExposureReported === true, "Secret exposure blocks completion."),
    check("no_unsafe_spiritual_pattern", "public_trust", "No unsafe spiritual response pattern reported", input.noUnsafeSpiritualResponsePatternReported === true, "Unsafe spiritual response patterns block completion."),
    check("scripture_anchors", "scripture_anchor", "Scripture anchors preserved", input.scriptureAnchorsPreserved === true, "Scripture anchors must be preserved."),
    check("explanation_traces", "explanation_trace", "Explanation traces preserved", input.explanationTracesPreserved === true, "Explanation traces must be preserved."),
    check("fallback_safety", "fallback", "Fallback safety preserved", input.fallbackSafetyPreserved === true, "Fallback safety must be preserved."),
    check("confidence_labels", "confidence_label", "Confidence labels preserved", input.confidenceLabelsPreserved === true, "Confidence labels must remain visible."),
    check("privacy_consent", "privacy_consent", "Privacy/consent boundaries preserved", input.privacyConsentBoundariesPreserved === true, "Privacy and consent boundaries must be preserved."),
    check("known_limitations", "known_limitations", "Known limitations documented", input.knownLimitationsDocumented === true, "Known limitations must remain documented."),
    check("service_disabled", "service_disabled_state", "Service-disabled state preserved", input.serviceDisabledStatePreserved === true, "No database, analytics, monitoring provider, admin auth, CMS, accounts, live AI, or notifications are enabled."),
    check("owner_decision", "owner_review", "Owner decision recorded", input.ownerDecisionRecorded === true, "Owner decision must be recorded.")
  ];
}

export function createStabilizedPublicOperationsRecord(input: TeoyubeStabilizedPublicOperationsInput = {}): TeoyubeStabilizedPublicOperationsRecord {
  return {
    id: "phase_10_7_stabilized_public_operations",
    status: input.status || "reviewing",
    releaseOwner: input.releaseOwner || "project_owner",
    operationsWindow: input.operationsWindow || "manual_weekly_operations_window",
    results: input.results || [],
    notes: input.notes || [],
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}

export function recordStabilizedPublicOperationsResult(records: TeoyubeStabilizedPublicOperationsResult[], result: TeoyubeStabilizedPublicOperationsResult): TeoyubeStabilizedPublicOperationsResult[] {
  return [...records.filter((entry) => entry.id !== result.id), result];
}

export function getStabilizedPublicOperationsBlockers(input: TeoyubeStabilizedPublicOperationsInput = {}): TeoyubeStabilizedPublicOperationsBlocker[] {
  const checklistBlockers = createStabilizedPublicOperationsChecklist(input)
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details, requiredAction: "Resolve manually before Phase 10 completion." }));
  const resultBlockers = (input.results || [])
    .filter((entry) => entry.status === "rollback_required" || entry.status === "blocked" || entry.status === "pause_recommended")
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.summary, requiredAction: "Resolve or record owner decision before completion." }));
  return [...checklistBlockers, ...resultBlockers];
}

export function getStabilizedPublicOperationsWarnings(input: TeoyubeStabilizedPublicOperationsInput = {}): TeoyubeStabilizedPublicOperationsWarning[] {
  const warnings: TeoyubeStabilizedPublicOperationsWarning[] = [];
  if (!(input.results || []).length) warnings.push({ id: "no_operations_results", area: "owner_review", message: "No stabilized operations results were recorded." });
  warnings.push({ id: "manual_only_boundary", area: "service_disabled_state", message: "Stabilized operations are local-only and do not monitor users, collect feedback, fetch URLs, or connect services." });
  return warnings;
}

export function createStabilizedPublicOperationsDecision(input: TeoyubeStabilizedPublicOperationsInput = {}): TeoyubeStabilizedPublicOperationsDecision {
  const blockers = getStabilizedPublicOperationsBlockers(input);
  if (input.status === "rollback_required" || blockers.some((entry) => entry.area === "privacy_consent" || entry.area === "public_trust")) return "rollback_required";
  if (input.status === "needs_safe_fix_batch") return "safe_fix_batch_required";
  if (input.status === "pause_recommended") return "pause_promotion";
  if (blockers.length) return "blocked";
  if (input.status === "stable") return "ready_for_phase_10_completion";
  return getStabilizedPublicOperationsWarnings(input).length ? "continue_with_watch" : "continue_stabilized_operations";
}

export function createStabilizedPublicOperationsReport(input: TeoyubeStabilizedPublicOperationsInput = {}): TeoyubeStabilizedPublicOperationsReport {
  const blockers = getStabilizedPublicOperationsBlockers(input);
  return {
    valid: blockers.length === 0,
    status: input.status || (blockers.length ? "blocked" : "stable_with_warnings"),
    decision: createStabilizedPublicOperationsDecision(input),
    record: createStabilizedPublicOperationsRecord(input),
    checklist: createStabilizedPublicOperationsChecklist(input),
    blockers,
    warnings: getStabilizedPublicOperationsWarnings(input),
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
