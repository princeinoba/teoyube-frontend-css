import type { TeoyubePersonalizationConsent } from "./personalization-contracts";
import type { TigProductionSurface } from "./production-response-contracts";

export type TeoyubePersonalizationFeedbackType =
  | "save_scripture"
  | "save_word"
  | "save_prayer"
  | "complete_action_step"
  | "repeat_prayer_sequence"
  | "more_like_this"
  | "less_like_this"
  | "dismiss_recommendation"
  | "not_relevant"
  | "fallback_helpful"
  | "fallback_not_helpful"
  | "confidence_too_low"
  | "disable_personalization"
  | "enable_session_personalization"
  | "reset_preferences"
  | "export_signals"
  | "delete_signals"
  | "unknown";

export type TeoyubePersonalizationFeedbackTargetKind =
  | "word"
  | "promise_cluster"
  | "scripture_anchor"
  | "prayer_sequence"
  | "action_step"
  | "surface"
  | "production_response"
  | "personalized_preview"
  | "preference_hint"
  | "unknown";

export type TeoyubePersonalizationFeedbackSource =
  | "user_control"
  | "response_panel"
  | "preview_panel"
  | "consent_panel"
  | "journey_panel"
  | "system_preview";

export type TeoyubePersonalizationFeedbackTarget = {
  kind: TeoyubePersonalizationFeedbackTargetKind;
  id?: string;
  label?: string;
  surface?: TigProductionSurface;
  metadata?: Record<string, unknown>;
};

export type TeoyubePersonalizationFeedback = {
  id: string;
  type: TeoyubePersonalizationFeedbackType;
  target: TeoyubePersonalizationFeedbackTarget;
  source: TeoyubePersonalizationFeedbackSource;
  surface?: TigProductionSurface;
  sessionId?: string;
  userId?: string;
  responseId?: string;
  previewId?: string;
  weight: number;
  comment?: string;
  storesRawText: boolean;
  rawTextPreview?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type TeoyubePersonalizationFeedbackSafetyStatus = {
  safe: boolean;
  blocked: boolean;
  status: "safe" | "warning" | "blocked";
  reasons: string[];
  warnings: string[];
  guardrails: string[];
};

export type TeoyubePersonalizationFeedbackDecision = {
  id: string;
  feedbackId: string;
  accepted: boolean;
  reducePreference: boolean;
  increasePreference: boolean;
  disablePersonalization: boolean;
  resetPreferences: boolean;
  exportSignals: boolean;
  deleteSignals: boolean;
  storeSignal: boolean;
  preferenceKey?: string;
  targetId?: string;
  explanation: string;
  warnings: string[];
  createdAt: string;
};

export type TeoyubePersonalizationFeedbackExplanation = {
  summary: string;
  userControlImpact: string;
  privacyImpact: string;
  scriptureAnchorNote: string;
  warnings: string[];
};

export type TeoyubePersonalizationFeedbackResult = {
  success: boolean;
  status: "accepted" | "ignored" | "blocked" | "export_ready" | "delete_ready" | "reset";
  feedback: TeoyubePersonalizationFeedback;
  decision: TeoyubePersonalizationFeedbackDecision;
  explanation: TeoyubePersonalizationFeedbackExplanation;
  safety: TeoyubePersonalizationFeedbackSafetyStatus;
  consent: TeoyubePersonalizationConsent;
  errors: string[];
  warnings: string[];
};

export type TeoyubePersonalizationFeedbackEvent = {
  eventName: string;
  timestamp: string;
  feedbackType: TeoyubePersonalizationFeedbackType;
  targetKind: TeoyubePersonalizationFeedbackTargetKind;
  targetId?: string;
  surface?: TigProductionSurface;
  consentStatus: "enabled" | "disabled" | "partial";
  personalizationEnabled: boolean;
  preferenceHintsEnabled: boolean;
  signalStorageAllowed: boolean;
  resultStatus:
    | TeoyubePersonalizationFeedbackResult["status"]
    | "updated"
    | "disabled"
    | "export_requested"
    | "delete_requested"
    | "unknown";
  safetyStatus: TeoyubePersonalizationFeedbackSafetyStatus["status"];
  metadata?: Record<string, unknown>;
};
