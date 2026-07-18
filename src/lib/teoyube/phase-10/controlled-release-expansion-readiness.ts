import type {
  TeoyubeControlledReleaseExpansionReadinessArea,
  TeoyubeControlledReleaseExpansionReadinessBlocker,
  TeoyubeControlledReleaseExpansionReadinessCheck,
  TeoyubeControlledReleaseExpansionReadinessDecision,
  TeoyubeControlledReleaseExpansionReadinessRecord,
  TeoyubeControlledReleaseExpansionReadinessReport,
  TeoyubeControlledReleaseExpansionReadinessResult,
  TeoyubeControlledReleaseExpansionReadinessStatus,
  TeoyubeControlledReleaseExpansionReadinessWarning
} from "./controlled-release-expansion-readiness-contracts";

export type TeoyubeControlledReleaseExpansionReadinessInput = Partial<{
  status: TeoyubeControlledReleaseExpansionReadinessStatus;
  releaseOwner: string;
  expansionWindow: string;
  results: TeoyubeControlledReleaseExpansionReadinessResult[];
  notes: string[];
  phase105FirstWeekStabilizationReviewed: boolean;
  manualFeedbackLoopReviewed: boolean;
  repeatedIssuePatternsReviewed: boolean;
  knownIssueRegisterReviewed: boolean;
  safeFixBatchReviewCompleted: boolean;
  noUnresolvedSeverity1Issues: boolean;
  noUnresolvedExpansionBlockingSeverity2Issues: boolean;
  noPrivateDataExposureReported: boolean;
  noSecretExposureReported: boolean;
  noUnsafeSpiritualResponsePatternReported: boolean;
  rollbackReadinessConfirmed: boolean;
  supportExpectationsDocumented: boolean;
  publicTrustReviewCompleted: boolean;
  ownerApprovalRecorded: boolean;
  scriptureAnchorsPreserved: boolean;
  explanationTracesPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelsPreserved: boolean;
  privacyConsentBoundariesPreserved: boolean;
  knownLimitationsVisibleOrDocumented: boolean;
  serviceDisabledStatePreserved: boolean;
}>;

function check(id: string, area: TeoyubeControlledReleaseExpansionReadinessArea, label: string, passed: boolean, details: string, critical = true): TeoyubeControlledReleaseExpansionReadinessCheck {
  return { id, area, label, passed, critical, details };
}

export function createControlledReleaseExpansionReadinessChecklist(input: TeoyubeControlledReleaseExpansionReadinessInput = {}): TeoyubeControlledReleaseExpansionReadinessCheck[] {
  return [
    check("phase_10_5_reviewed", "first_week_stability", "Phase 10.5 first-week stabilization reviewed", input.phase105FirstWeekStabilizationReviewed === true, "Phase 10.5 stabilization package must be reviewed."),
    check("manual_feedback_loop_reviewed", "manual_feedback", "Manual feedback loop reviewed", input.manualFeedbackLoopReviewed === true, "Manual feedback loop must be reviewed."),
    check("issue_patterns_reviewed", "issue_patterns", "Repeated issue patterns reviewed", input.repeatedIssuePatternsReviewed === true, "Repeated issue patterns must be reviewed."),
    check("known_issues_reviewed", "known_issues", "Known issue register reviewed", input.knownIssueRegisterReviewed === true, "Known issue register must be reviewed."),
    check("safe_fix_batch_completed", "safe_fix_batches", "Safe-fix batch review completed", input.safeFixBatchReviewCompleted === true, "Safe-fix batches must be reviewed before expansion."),
    check("no_severity_1", "known_issues", "No unresolved Severity 1 issues", input.noUnresolvedSeverity1Issues === true, "Unresolved Severity 1 issues block expansion."),
    check("no_blocking_severity_2", "known_issues", "No unresolved expansion-blocking Severity 2 issues", input.noUnresolvedExpansionBlockingSeverity2Issues === true, "Expansion-blocking Severity 2 issues require remain-limited or pause decision."),
    check("no_private_data_exposure", "privacy_consent", "No private data exposure reported", input.noPrivateDataExposureReported === true, "Private data exposure blocks expansion."),
    check("no_secret_exposure", "privacy_consent", "No secret exposure reported", input.noSecretExposureReported === true, "Secret exposure blocks expansion."),
    check("no_unsafe_spiritual_pattern", "content_safety", "No unsafe spiritual response pattern reported", input.noUnsafeSpiritualResponsePatternReported === true, "Unsafe spiritual response patterns block expansion."),
    check("rollback_ready", "rollback_readiness", "Rollback readiness confirmed", input.rollbackReadinessConfirmed === true, "Rollback readiness must be confirmed manually."),
    check("support_expectations", "support_expectations", "Support expectations documented", input.supportExpectationsDocumented === true, "Support expectations must be documented before broader access."),
    check("public_trust_review", "public_trust", "Public trust review completed", input.publicTrustReviewCompleted === true, "Public trust review must be complete."),
    check("owner_approval", "owner_approval", "Owner approval recorded", input.ownerApprovalRecorded === true, "Owner approval is required."),
    check("scripture_anchors", "scripture_anchor", "Scripture anchors preserved", input.scriptureAnchorsPreserved === true, "Scripture anchors must not be removed."),
    check("explanation_traces", "explanation_trace", "Explanation traces preserved", input.explanationTracesPreserved === true, "Explanation traces must remain available."),
    check("fallback_safety", "fallback", "Fallback safety preserved", input.fallbackSafetyPreserved === true, "Fallback states must remain safe."),
    check("confidence_labels", "confidence_label", "Confidence labels preserved", input.confidenceLabelsPreserved === true, "Confidence labels must remain visible."),
    check("privacy_consent", "privacy_consent", "Privacy/consent boundaries preserved", input.privacyConsentBoundariesPreserved === true, "Privacy and consent boundaries must remain visible."),
    check("known_limitations", "known_limitations", "Known limitations visible or documented", input.knownLimitationsVisibleOrDocumented === true, "Known limitations must not be hidden."),
    check("service_disabled", "service_disabled_state", "Service-disabled state preserved", input.serviceDisabledStatePreserved === true, "No database, analytics, monitoring provider, admin auth, CMS, accounts, live AI, or notifications are enabled.")
  ];
}

export function createControlledReleaseExpansionReadinessRecord(input: TeoyubeControlledReleaseExpansionReadinessInput = {}): TeoyubeControlledReleaseExpansionReadinessRecord {
  return {
    id: "phase_10_6_controlled_release_expansion_readiness",
    status: input.status || "reviewing",
    releaseOwner: input.releaseOwner || "project_owner",
    expansionWindow: input.expansionWindow || "manual_controlled_expansion_window",
    results: input.results || [],
    notes: input.notes || [],
    noAutomaticPublicExpansion: true,
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}

export function recordControlledReleaseExpansionReadinessResult(records: TeoyubeControlledReleaseExpansionReadinessResult[], result: TeoyubeControlledReleaseExpansionReadinessResult): TeoyubeControlledReleaseExpansionReadinessResult[] {
  return [...records.filter((entry) => entry.id !== result.id), result];
}

export function getControlledReleaseExpansionReadinessBlockers(input: TeoyubeControlledReleaseExpansionReadinessInput = {}): TeoyubeControlledReleaseExpansionReadinessBlocker[] {
  const checklistBlockers = createControlledReleaseExpansionReadinessChecklist(input)
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details, requiredAction: "Resolve manually before controlled release expansion." }));
  const resultBlockers = (input.results || [])
    .filter((entry) => entry.status === "rollback_required" || entry.status === "blocked" || entry.status === "pause_recommended")
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.summary, requiredAction: "Resolve or record owner remain-limited decision." }));
  return [...checklistBlockers, ...resultBlockers];
}

export function getControlledReleaseExpansionReadinessWarnings(input: TeoyubeControlledReleaseExpansionReadinessInput = {}): TeoyubeControlledReleaseExpansionReadinessWarning[] {
  const warnings = createControlledReleaseExpansionReadinessChecklist(input)
    .filter((entry) => !entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  if (!(input.results || []).length) warnings.push({ id: "no_readiness_results", area: "owner_approval", message: "No controlled expansion readiness results were recorded." });
  warnings.push({ id: "manual_only_boundary", area: "service_disabled_state", message: "Expansion readiness is local-only and does not expand access, monitor users, collect feedback, fetch URLs, or connect services." });
  return warnings;
}

export function createControlledReleaseExpansionReadinessDecision(input: TeoyubeControlledReleaseExpansionReadinessInput = {}): TeoyubeControlledReleaseExpansionReadinessDecision {
  const blockers = getControlledReleaseExpansionReadinessBlockers(input);
  if (input.status === "rollback_required" || blockers.some((entry) => entry.area === "privacy_consent" || entry.area === "content_safety")) return "rollback_required";
  if (input.status === "pause_recommended") return "pause_promotion";
  if (blockers.length) return "blocked";
  if (input.status === "ready_with_conditions") return "approve_with_conditions";
  if (input.status === "ready_for_limited_expansion") return "approve_limited_expansion";
  return getControlledReleaseExpansionReadinessWarnings(input).length ? "remain_limited" : "approve_limited_expansion";
}

export function createControlledReleaseExpansionReadinessReport(input: TeoyubeControlledReleaseExpansionReadinessInput = {}): TeoyubeControlledReleaseExpansionReadinessReport {
  const blockers = getControlledReleaseExpansionReadinessBlockers(input);
  return {
    valid: blockers.length === 0,
    status: input.status || (blockers.length ? "blocked" : "ready_with_conditions"),
    decision: createControlledReleaseExpansionReadinessDecision(input),
    record: createControlledReleaseExpansionReadinessRecord(input),
    checklist: createControlledReleaseExpansionReadinessChecklist(input),
    blockers,
    warnings: getControlledReleaseExpansionReadinessWarnings(input),
    noAutomaticPublicExpansion: true,
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
