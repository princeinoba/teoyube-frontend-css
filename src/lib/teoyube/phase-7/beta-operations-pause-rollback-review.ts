export type TeoyubeBetaOperationsPauseRollbackInput = Partial<{
  appNotLoading: boolean;
  scriptureAnchorsMissing: boolean;
  explanationTracesMissing: boolean;
  fallbackUnsafe: boolean;
  confidenceLabelsMissing: boolean;
  reviewOnlyContentVisible: boolean;
  privacyConsentConcern: boolean;
  disabledServiceEnabled: boolean;
  adminPrototypePersistenceDetected: boolean;
  debugPayloadExposed: boolean;
  criticalMobileBlocker: boolean;
  criticalAccessibilityBlocker: boolean;
  divineCertaintyLanguage: boolean;
  professionalAdviceLanguage: boolean;
}>;

export type TeoyubeBetaOperationsPauseRollbackCriterion = {
  id: keyof TeoyubeBetaOperationsPauseRollbackInput;
  label: string;
  severity: "high" | "critical";
  recommendedAction: "pause" | "rollback_review";
};

export type TeoyubeBetaOperationsPauseRollbackReport = {
  valid: boolean;
  pauseRecommended: boolean;
  rollbackReviewRecommended: boolean;
  matchedPauseCriteria: TeoyubeBetaOperationsPauseRollbackCriterion[];
  matchedRollbackCriteria: TeoyubeBetaOperationsPauseRollbackCriterion[];
  decision: ReturnType<typeof createBetaOperationsPauseRollbackDecision>;
  manualOnly: true;
  inMemoryOnly: true;
  noRollbackPerformed: true;
  noUsersContacted: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

function criterion(id: keyof TeoyubeBetaOperationsPauseRollbackInput, label: string, severity: "high" | "critical", recommendedAction: "pause" | "rollback_review"): TeoyubeBetaOperationsPauseRollbackCriterion {
  return { id, label, severity, recommendedAction };
}

export function getBetaOperationsPauseCriteria(): TeoyubeBetaOperationsPauseRollbackCriterion[] {
  return [
    criterion("appNotLoading", "App not loading", "critical", "pause"),
    criterion("scriptureAnchorsMissing", "Scripture anchors missing", "high", "pause"),
    criterion("explanationTracesMissing", "Explanation traces missing", "high", "pause"),
    criterion("fallbackUnsafe", "Fallback unsafe", "critical", "pause"),
    criterion("confidenceLabelsMissing", "Confidence labels missing", "high", "pause"),
    criterion("reviewOnlyContentVisible", "Review-only content visible", "high", "pause"),
    criterion("privacyConsentConcern", "Privacy/consent concern", "critical", "pause"),
    criterion("disabledServiceEnabled", "Disabled service accidentally enabled", "critical", "pause"),
    criterion("debugPayloadExposed", "Debug payload exposed", "high", "pause"),
    criterion("criticalMobileBlocker", "Critical mobile blocker", "high", "pause"),
    criterion("criticalAccessibilityBlocker", "Critical accessibility blocker", "high", "pause"),
    criterion("divineCertaintyLanguage", "Divine-certainty language", "critical", "pause"),
    criterion("professionalAdviceLanguage", "Professional-advice language", "critical", "pause")
  ];
}

export function getBetaOperationsRollbackCriteria(): TeoyubeBetaOperationsPauseRollbackCriterion[] {
  return [
    criterion("disabledServiceEnabled", "Disabled service accidentally enabled", "critical", "rollback_review"),
    criterion("adminPrototypePersistenceDetected", "Admin prototype persistence detected", "critical", "rollback_review"),
    criterion("reviewOnlyContentVisible", "Review-only content visible", "high", "rollback_review"),
    criterion("privacyConsentConcern", "Privacy/consent concern", "critical", "rollback_review"),
    criterion("fallbackUnsafe", "Fallback unsafe", "critical", "rollback_review"),
    criterion("divineCertaintyLanguage", "Divine-certainty language", "critical", "rollback_review"),
    criterion("professionalAdviceLanguage", "Professional-advice language", "critical", "rollback_review")
  ];
}

export function evaluateBetaOperationsPauseCriteria(input: TeoyubeBetaOperationsPauseRollbackInput = {}): TeoyubeBetaOperationsPauseRollbackCriterion[] {
  return getBetaOperationsPauseCriteria().filter((entry) => input[entry.id]);
}

export function evaluateBetaOperationsRollbackCriteria(input: TeoyubeBetaOperationsPauseRollbackInput = {}): TeoyubeBetaOperationsPauseRollbackCriterion[] {
  return getBetaOperationsRollbackCriteria().filter((entry) => input[entry.id]);
}

export function createBetaOperationsPauseRollbackDecision(input: TeoyubeBetaOperationsPauseRollbackInput = {}): "continue_manual_review" | "pause_recommended" | "rollback_review_recommended" {
  if (evaluateBetaOperationsRollbackCriteria(input).length) return "rollback_review_recommended";
  if (evaluateBetaOperationsPauseCriteria(input).length) return "pause_recommended";
  return "continue_manual_review";
}

export function createBetaOperationsPauseRollbackReviewReport(input: TeoyubeBetaOperationsPauseRollbackInput = {}): TeoyubeBetaOperationsPauseRollbackReport {
  const matchedPauseCriteria = evaluateBetaOperationsPauseCriteria(input);
  const matchedRollbackCriteria = evaluateBetaOperationsRollbackCriteria(input);
  return {
    valid: true,
    pauseRecommended: matchedPauseCriteria.length > 0,
    rollbackReviewRecommended: matchedRollbackCriteria.length > 0,
    matchedPauseCriteria,
    matchedRollbackCriteria,
    decision: createBetaOperationsPauseRollbackDecision(input),
    manualOnly: true,
    inMemoryOnly: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
