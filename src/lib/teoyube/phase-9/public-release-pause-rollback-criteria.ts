export type TeoyubePublicReleasePauseRollbackInput = Partial<{
  appNotLoading: boolean;
  missingScriptureAnchors: boolean;
  missingExplanationTraces: boolean;
  unsafeFallback: boolean;
  missingConfidenceLabels: boolean;
  missingPrivacyConsentSensitiveDataWarnings: boolean;
  missingKnownLimitations: boolean;
  reviewOnlyContentVisible: boolean;
  disabledServiceAccidentallyEnabled: boolean;
  debugPayloadExposed: boolean;
  criticalMobileBlocker: boolean;
  criticalAccessibilityBlocker: boolean;
  divineCertaintyLanguagePresent: boolean;
  professionalAdviceLanguagePresent: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  automaticUserContactEnabled: boolean;
  publicUrlFetchingFromCode: boolean;
  unexpectedExternalServiceDependency: boolean;
}>;

export type TeoyubePublicReleasePauseRollbackCriterion = {
  id: string;
  label: string;
  severity: "pause" | "rollback_review";
  triggered: boolean;
};

function criterion(id: string, label: string, severity: "pause" | "rollback_review", triggered = false): TeoyubePublicReleasePauseRollbackCriterion {
  return { id, label, severity, triggered };
}

export function getPublicReleasePauseCriteria(input: TeoyubePublicReleasePauseRollbackInput = {}): TeoyubePublicReleasePauseRollbackCriterion[] {
  return [
    criterion("app_not_loading", "App does not load", "rollback_review", Boolean(input.appNotLoading)),
    criterion("missing_scripture_anchors", "Scripture anchors missing", "pause", Boolean(input.missingScriptureAnchors)),
    criterion("missing_explanation_traces", "Explanation traces missing", "pause", Boolean(input.missingExplanationTraces)),
    criterion("unsafe_fallback", "Fallback is unsafe", "pause", Boolean(input.unsafeFallback)),
    criterion("missing_confidence_labels", "Confidence labels missing", "pause", Boolean(input.missingConfidenceLabels)),
    criterion("missing_privacy_warnings", "Privacy/consent/sensitive data warnings missing", "pause", Boolean(input.missingPrivacyConsentSensitiveDataWarnings)),
    criterion("missing_known_limitations", "Known limitations missing", "pause", Boolean(input.missingKnownLimitations)),
    criterion("review_only_content_visible", "Review-only content visible", "rollback_review", Boolean(input.reviewOnlyContentVisible)),
    criterion("disabled_service_enabled", "Disabled service accidentally enabled", "rollback_review", Boolean(input.disabledServiceAccidentallyEnabled)),
    criterion("debug_payload_exposed", "Debug payload exposed", "pause", Boolean(input.debugPayloadExposed)),
    criterion("critical_mobile_blocker", "Critical mobile blocker", "pause", Boolean(input.criticalMobileBlocker)),
    criterion("critical_accessibility_blocker", "Critical accessibility blocker", "pause", Boolean(input.criticalAccessibilityBlocker)),
    criterion("divine_certainty_language", "Divine-certainty language present", "pause", Boolean(input.divineCertaintyLanguagePresent)),
    criterion("professional_advice_language", "Professional-advice language present", "pause", Boolean(input.professionalAdviceLanguagePresent)),
    criterion("automatic_feedback_collection", "Automatic feedback collection enabled", "rollback_review", Boolean(input.automaticFeedbackCollectionEnabled)),
    criterion("automatic_user_contact", "Automatic user contact enabled", "rollback_review", Boolean(input.automaticUserContactEnabled)),
    criterion("public_url_fetching", "Public URL fetching from code", "rollback_review", Boolean(input.publicUrlFetchingFromCode)),
    criterion("external_service_dependency", "Unexpected external service dependency", "rollback_review", Boolean(input.unexpectedExternalServiceDependency))
  ];
}

export function getPublicReleaseRollbackCriteria(input: TeoyubePublicReleasePauseRollbackInput = {}): TeoyubePublicReleasePauseRollbackCriterion[] {
  return getPublicReleasePauseCriteria(input).filter((entry) => entry.severity === "rollback_review");
}

export function evaluatePublicReleasePauseCriteria(input: TeoyubePublicReleasePauseRollbackInput = {}): TeoyubePublicReleasePauseRollbackCriterion[] {
  return getPublicReleasePauseCriteria(input).filter((entry) => entry.triggered);
}

export function evaluatePublicReleaseRollbackCriteria(input: TeoyubePublicReleasePauseRollbackInput = {}): TeoyubePublicReleasePauseRollbackCriterion[] {
  return getPublicReleaseRollbackCriteria(input).filter((entry) => entry.triggered);
}

export function createPublicReleasePauseRollbackDecision(input: TeoyubePublicReleasePauseRollbackInput = {}): "continue_controlled_planning" | "pause_recommended" | "rollback_review_recommended" {
  if (evaluatePublicReleaseRollbackCriteria(input).length) return "rollback_review_recommended";
  if (evaluatePublicReleasePauseCriteria(input).length) return "pause_recommended";
  return "continue_controlled_planning";
}

export function createPublicReleasePauseRollbackReport(input: TeoyubePublicReleasePauseRollbackInput = {}) {
  const triggered = evaluatePublicReleasePauseCriteria(input);
  return {
    valid: triggered.length === 0,
    decision: createPublicReleasePauseRollbackDecision(input),
    pauseCriteria: getPublicReleasePauseCriteria(input),
    rollbackCriteria: getPublicReleaseRollbackCriteria(input),
    triggered,
    blockers: triggered.map((entry) => `${entry.id}: ${entry.label}`),
    warnings: ["Pause/rollback criteria are decision support only; Phase 9.4 does not perform rollback."],
    noRollbackPerformed: true,
    noPublicLaunchPerformed: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
