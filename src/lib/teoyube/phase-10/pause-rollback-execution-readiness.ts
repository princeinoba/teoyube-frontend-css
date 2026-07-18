export type TeoyubePauseRollbackExecutionInput = Partial<{
  appNotLoading: boolean;
  buildFailure: boolean;
  routeFailure: boolean;
  realDataFailure: boolean;
  missingScriptureAnchors: boolean;
  missingExplanationTraces: boolean;
  unsafeFallback: boolean;
  missingConfidenceLabels: boolean;
  privacyConsentIssue: boolean;
  sensitiveDataWarningIssue: boolean;
  knownLimitationsMissing: boolean;
  serviceAccidentallyEnabled: boolean;
  debugPayloadVisible: boolean;
  criticalMobileAccessibilityBlocker: boolean;
  publicCopySafetyIssue: boolean;
  divineCertaintyLanguage: boolean;
  professionalAdviceLanguage: boolean;
  automaticFeedbackCollection: boolean;
  automaticUserContact: boolean;
  publicUrlFetchingFromCode: boolean;
  unexpectedExternalServiceDependency: boolean;
}>;

export type TeoyubePauseRollbackExecutionCriterion = {
  id: string;
  label: string;
  severity: "pause" | "rollback_review";
  triggered: boolean;
};

function criterion(id: string, label: string, severity: "pause" | "rollback_review", triggered = false): TeoyubePauseRollbackExecutionCriterion {
  return { id, label, severity, triggered };
}

export function getPublicReleasePauseCriteria(input: TeoyubePauseRollbackExecutionInput = {}): TeoyubePauseRollbackExecutionCriterion[] {
  return [
    criterion("app_not_loading", "App not loading", "rollback_review", Boolean(input.appNotLoading)),
    criterion("build_failure", "Build failure", "pause", Boolean(input.buildFailure)),
    criterion("route_failure", "Route failure", "pause", Boolean(input.routeFailure)),
    criterion("real_data_failure", "Real data failure", "pause", Boolean(input.realDataFailure)),
    criterion("missing_scripture_anchors", "Missing Scripture anchors", "pause", Boolean(input.missingScriptureAnchors)),
    criterion("missing_explanation_traces", "Missing explanation traces", "pause", Boolean(input.missingExplanationTraces)),
    criterion("unsafe_fallback", "Unsafe fallback", "pause", Boolean(input.unsafeFallback)),
    criterion("missing_confidence_labels", "Missing confidence labels", "pause", Boolean(input.missingConfidenceLabels)),
    criterion("privacy_consent_issue", "Privacy/consent issue", "pause", Boolean(input.privacyConsentIssue)),
    criterion("sensitive_data_warning_issue", "Sensitive data warning issue", "pause", Boolean(input.sensitiveDataWarningIssue)),
    criterion("known_limitations_missing", "Known limitations missing", "pause", Boolean(input.knownLimitationsMissing)),
    criterion("service_accidentally_enabled", "Service accidentally enabled", "rollback_review", Boolean(input.serviceAccidentallyEnabled)),
    criterion("debug_payload_visible", "Debug payload visible", "pause", Boolean(input.debugPayloadVisible)),
    criterion("critical_mobile_accessibility_blocker", "Critical mobile/accessibility blocker", "pause", Boolean(input.criticalMobileAccessibilityBlocker)),
    criterion("public_copy_safety_issue", "Public copy safety issue", "pause", Boolean(input.publicCopySafetyIssue)),
    criterion("divine_certainty_language", "Divine-certainty language", "pause", Boolean(input.divineCertaintyLanguage)),
    criterion("professional_advice_language", "Professional-advice language", "pause", Boolean(input.professionalAdviceLanguage)),
    criterion("automatic_feedback_collection", "Automatic feedback collection", "rollback_review", Boolean(input.automaticFeedbackCollection)),
    criterion("automatic_user_contact", "Automatic user contact", "rollback_review", Boolean(input.automaticUserContact)),
    criterion("public_url_fetching_from_code", "Public URL fetching from code", "rollback_review", Boolean(input.publicUrlFetchingFromCode)),
    criterion("unexpected_external_service_dependency", "Unexpected external service dependency", "rollback_review", Boolean(input.unexpectedExternalServiceDependency))
  ];
}

export function getPublicReleaseRollbackCriteria(input: TeoyubePauseRollbackExecutionInput = {}): TeoyubePauseRollbackExecutionCriterion[] {
  return getPublicReleasePauseCriteria(input).filter((entry) => entry.severity === "rollback_review");
}

export function createPauseRollbackExecutionChecklist(input: TeoyubePauseRollbackExecutionInput = {}): TeoyubePauseRollbackExecutionCriterion[] {
  return getPublicReleasePauseCriteria(input);
}

export function evaluatePauseReadiness(input: TeoyubePauseRollbackExecutionInput = {}): TeoyubePauseRollbackExecutionCriterion[] {
  return getPublicReleasePauseCriteria(input).filter((entry) => entry.triggered);
}

export function evaluateRollbackReadiness(input: TeoyubePauseRollbackExecutionInput = {}): TeoyubePauseRollbackExecutionCriterion[] {
  return getPublicReleaseRollbackCriteria(input).filter((entry) => entry.triggered);
}

export function createPauseRollbackExecutionReadinessDecision(input: TeoyubePauseRollbackExecutionInput = {}): "continue_manual_planning" | "pause_recommended" | "rollback_review_recommended" {
  if (evaluateRollbackReadiness(input).length) return "rollback_review_recommended";
  if (evaluatePauseReadiness(input).length) return "pause_recommended";
  return "continue_manual_planning";
}

export function createPauseRollbackExecutionReadinessReport(input: TeoyubePauseRollbackExecutionInput = {}) {
  const triggered = evaluatePauseReadiness(input);
  return {
    valid: triggered.length === 0,
    decision: createPauseRollbackExecutionReadinessDecision(input),
    checklist: createPauseRollbackExecutionChecklist(input),
    pauseCriteria: getPublicReleasePauseCriteria(input),
    rollbackCriteria: getPublicReleaseRollbackCriteria(input),
    triggered,
    blockers: triggered.map((entry) => `${entry.id}: ${entry.label}`),
    warnings: ["Pause/rollback readiness is decision support only and does not perform rollback."],
    noRollbackPerformed: true,
    noPublicLaunchPerformed: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
