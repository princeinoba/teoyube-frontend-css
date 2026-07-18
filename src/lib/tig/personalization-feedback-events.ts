import type {
  TeoyubeConsentControlAction,
  TeoyubeConsentControlResult
} from "./personalization-consent-controls-contracts";
import type {
  TeoyubePersonalizationFeedback,
  TeoyubePersonalizationFeedbackEvent,
  TeoyubePersonalizationFeedbackResult
} from "./personalization-feedback-contracts";

function consentStatusFrom(result?: TeoyubePersonalizationFeedbackResult | TeoyubeConsentControlResult): "enabled" | "disabled" | "partial" {
  if (!result) return "disabled";
  const consent = "consent" in result ? result.consent : result.state.consent;
  if (!consent.personalizationEnabled) return "disabled";
  return consent.learningEnabled ? "enabled" : "partial";
}

function baseEvent(params: {
  eventName: string;
  feedback?: TeoyubePersonalizationFeedback;
  result?: TeoyubePersonalizationFeedbackResult | TeoyubeConsentControlResult;
  metadata?: Record<string, unknown>;
}): TeoyubePersonalizationFeedbackEvent {
  const feedback = params.feedback;
  const consent =
    params.result && "consent" in params.result
      ? params.result.consent
      : params.result && "state" in params.result
        ? params.result.state.consent
        : undefined;
  const state = params.result && "state" in params.result ? params.result.state : undefined;
  const safety =
    params.result && "safety" in params.result
      ? params.result.safety.status
      : params.result?.success
        ? "safe"
        : "warning";

  return {
    eventName: params.eventName,
    timestamp: new Date().toISOString(),
    feedbackType: feedback?.type || "unknown",
    targetKind: feedback?.target.kind || "unknown",
    targetId: feedback?.target.id,
    surface: feedback?.surface || feedback?.target.surface,
    consentStatus: consentStatusFrom(params.result),
    personalizationEnabled: Boolean(consent?.personalizationEnabled || state?.personalizationEnabled),
    preferenceHintsEnabled: Boolean(state?.preferenceHintsEnabled ?? consent?.allowedScopes.includes("preferences")),
    signalStorageAllowed: Boolean(state?.signalStorageAllowed ?? consent?.allowedScopes.includes("signals")),
    resultStatus:
      params.result && "status" in params.result
        ? (params.result.status as TeoyubePersonalizationFeedbackEvent["resultStatus"])
        : "unknown",
    safetyStatus: safety,
    metadata: {
      externalAnalyticsSent: false,
      ...(params.metadata || {})
    }
  };
}

export function createPersonalizationFeedbackEvent(
  feedback: TeoyubePersonalizationFeedback,
  result: TeoyubePersonalizationFeedbackResult
): TeoyubePersonalizationFeedbackEvent {
  return baseEvent({
    eventName: "tig.personalization.feedback.submitted",
    feedback,
    result,
    metadata: {
      decisionId: result.decision.id,
      storeSignal: result.decision.storeSignal
    }
  });
}

export function createPersonalizationConsentUpdatedEvent(
  action: TeoyubeConsentControlAction,
  result: TeoyubeConsentControlResult
): TeoyubePersonalizationFeedbackEvent {
  return baseEvent({
    eventName: "tig.personalization.consent.updated",
    result,
    metadata: {
      actionType: action.type,
      reason: action.reason
    }
  });
}

export function createPersonalizationDisabledEvent(
  reason: string
): TeoyubePersonalizationFeedbackEvent {
  return baseEvent({
    eventName: "tig.personalization.disabled",
    metadata: {
      reason,
      personalizationEnabled: false
    }
  });
}

export function createPersonalizationResetEvent(
  result: TeoyubeConsentControlResult | TeoyubePersonalizationFeedbackResult
): TeoyubePersonalizationFeedbackEvent {
  return baseEvent({
    eventName: "tig.personalization.reset_requested",
    result,
    metadata: {
      resetRequested: true
    }
  });
}

export function createPersonalizationExportRequestedEvent(
  result: TeoyubeConsentControlResult | TeoyubePersonalizationFeedbackResult
): TeoyubePersonalizationFeedbackEvent {
  return baseEvent({
    eventName: "tig.personalization.export_requested",
    result,
    metadata: {
      exportRequested: true
    }
  });
}

export function createPersonalizationDeleteRequestedEvent(
  result: TeoyubeConsentControlResult | TeoyubePersonalizationFeedbackResult
): TeoyubePersonalizationFeedbackEvent {
  return baseEvent({
    eventName: "tig.personalization.delete_requested",
    result,
    metadata: {
      deleteRequested: true
    }
  });
}
