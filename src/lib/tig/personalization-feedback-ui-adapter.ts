import type {
  TeoyubeConsentControlResult,
  TeoyubeConsentControlState
} from "./personalization-consent-controls-contracts";
import type {
  TeoyubePersonalizationFeedbackDecision,
  TeoyubePersonalizationFeedbackResult
} from "./personalization-feedback-contracts";

export function toPersonalizationFeedbackPanelProps(
  feedbackResult: TeoyubePersonalizationFeedbackResult
) {
  return {
    status: feedbackResult.status,
    success: feedbackResult.success,
    feedbackType: feedbackResult.feedback.type,
    targetKind: feedbackResult.feedback.target.kind,
    targetLabel: feedbackResult.feedback.target.label || feedbackResult.feedback.target.id,
    summary: feedbackResult.explanation.summary,
    userControlImpact: feedbackResult.explanation.userControlImpact,
    privacyImpact: feedbackResult.explanation.privacyImpact,
    scriptureAnchorNote: feedbackResult.explanation.scriptureAnchorNote,
    safetyStatus: feedbackResult.safety.status,
    warnings: feedbackResult.warnings
  };
}

export function toPersonalizationConsentControlsProps(
  consentState: TeoyubeConsentControlState
) {
  return {
    personalizationEnabled: consentState.personalizationEnabled,
    sessionOnlyPersonalization: consentState.sessionOnlyPersonalization,
    profilePreviewPersonalization: consentState.profilePreviewPersonalization,
    preferenceHintsEnabled: consentState.preferenceHintsEnabled,
    signalStorageAllowed: consentState.signalStorageAllowed,
    eventToSignalConversionEnabled: consentState.eventToSignalConversionEnabled,
    rawTextStorageEnabled: consentState.rawTextStorageEnabled,
    surfacePersonalization: consentState.surfacePersonalization,
    explanation: consentState.explanation,
    auditCount: consentState.auditTrail.length,
    settings: consentState.settings
  };
}

export function toPersonalizationFeedbackExplanationProps(
  decision: TeoyubePersonalizationFeedbackDecision
) {
  return {
    accepted: decision.accepted,
    reducePreference: decision.reducePreference,
    increasePreference: decision.increasePreference,
    disablePersonalization: decision.disablePersonalization,
    resetPreferences: decision.resetPreferences,
    exportSignals: decision.exportSignals,
    deleteSignals: decision.deleteSignals,
    storeSignal: decision.storeSignal,
    explanation: decision.explanation,
    warnings: decision.warnings
  };
}

export function toPersonalizationResetPanelProps(
  result: TeoyubeConsentControlResult | TeoyubePersonalizationFeedbackResult
) {
  return {
    status: result.status,
    success: result.success,
    title: "Reset personalization",
    message: result.success
      ? "Preference hints were reset for the current preview state."
      : "Reset could not be completed.",
    warnings: result.warnings,
    errors: result.errors
  };
}

export function toPersonalizationExportPanelProps(
  result: TeoyubeConsentControlResult | TeoyubePersonalizationFeedbackResult
) {
  return {
    status: result.status,
    success: result.success,
    title: "Export personalization signals",
    message: result.success
      ? "Export is available as a safe simulated local payload."
      : "Export could not be prepared.",
    warnings: result.warnings,
    errors: result.errors
  };
}

export function toPersonalizationDeletePanelProps(
  result: TeoyubeConsentControlResult | TeoyubePersonalizationFeedbackResult
) {
  return {
    status: result.status,
    success: result.success,
    title: "Delete personalization signals",
    message: result.success
      ? "Delete request can remove matching in-memory signal records."
      : "Delete request could not be completed.",
    warnings: result.warnings,
    errors: result.errors
  };
}
