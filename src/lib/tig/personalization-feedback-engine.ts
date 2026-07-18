import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationProfile,
  TeoyubeUserPreference
} from "./personalization-contracts";
import { validatePersonalizationConsent } from "./personalization-safety";
import { addTeoyubePersonalizationSignal } from "./personalization-signal-store";
import { validateSignalStoreConsent } from "./personalization-signal-store-safety";
import type { TeoyubeSignalStoreAdapter } from "./personalization-signal-store-contracts";
import type {
  TeoyubePersonalizationFeedback,
  TeoyubePersonalizationFeedbackDecision,
  TeoyubePersonalizationFeedbackExplanation,
  TeoyubePersonalizationFeedbackResult,
  TeoyubePersonalizationFeedbackSafetyStatus,
  TeoyubePersonalizationFeedbackType
} from "./personalization-feedback-contracts";

function now(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function cleanText(value?: string): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || undefined;
}

function clamp(value: number | undefined, fallback = 0.5): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

function containsSensitiveText(value?: string): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return ["password", "ssn", "social security", "credit card", "medical", "legal", "financial", "emergency"].some(
    (pattern) => normalized.includes(pattern)
  );
}

function preferenceKeyFor(feedback: TeoyubePersonalizationFeedback): string | undefined {
  if (feedback.target.kind === "preference_hint") return feedback.target.id || feedback.target.label;
  if (feedback.target.kind === "word") return feedback.target.id ? `word:${feedback.target.id}` : undefined;
  if (feedback.target.kind === "promise_cluster") {
    return feedback.target.id ? `cluster:${feedback.target.id}` : undefined;
  }
  if (feedback.target.kind === "surface") {
    return feedback.target.surface ? `surface:${feedback.target.surface}` : feedback.target.id;
  }
  return feedback.target.id;
}

function feedbackAllowsControlWithoutConsent(type: TeoyubePersonalizationFeedbackType): boolean {
  return [
    "disable_personalization",
    "reset_preferences",
    "export_signals",
    "delete_signals",
    "unknown"
  ].includes(type);
}

export function normalizePersonalizationFeedback(
  feedback: Partial<TeoyubePersonalizationFeedback>
): TeoyubePersonalizationFeedback {
  const target = feedback.target || { kind: "unknown" as const };

  return {
    id: cleanText(feedback.id) || createId("personalization_feedback"),
    type: feedback.type || "unknown",
    target: {
      kind: target.kind || "unknown",
      id: cleanText(target.id),
      label: cleanText(target.label),
      surface: target.surface,
      metadata: target.metadata ? { ...target.metadata } : undefined
    },
    source: feedback.source || "user_control",
    surface: feedback.surface || target.surface,
    sessionId: cleanText(feedback.sessionId),
    userId: cleanText(feedback.userId),
    responseId: cleanText(feedback.responseId),
    previewId: cleanText(feedback.previewId),
    weight: clamp(feedback.weight),
    comment: cleanText(feedback.comment),
    storesRawText: Boolean(feedback.storesRawText && feedback.rawTextPreview),
    rawTextPreview: feedback.storesRawText ? cleanText(feedback.rawTextPreview) : undefined,
    metadata: feedback.metadata ? { ...feedback.metadata } : undefined,
    createdAt: cleanText(feedback.createdAt) || now()
  };
}

export function sanitizePersonalizationFeedback(
  feedback: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationFeedback {
  const normalized = normalizePersonalizationFeedback(feedback);
  const normalizedConsent = validatePersonalizationConsent(consent);
  const canKeepRawText =
    normalizedConsent.allowRawTextStorage &&
    normalizedConsent.allowedScopes.includes("raw_text") &&
    !containsSensitiveText(normalized.rawTextPreview) &&
    !containsSensitiveText(normalized.comment);

  if (canKeepRawText) {
    return {
      ...normalized,
      metadata: {
        ...normalized.metadata,
        sanitized: true,
        rawTextAllowedByConsent: true
      }
    };
  }

  return {
    ...normalized,
    comment: undefined,
    storesRawText: false,
    rawTextPreview: undefined,
    metadata: {
      ...normalized.metadata,
      sanitized: true,
      rawTextRedacted: true
    }
  };
}

export function shouldReducePreferenceFromFeedback(
  feedback: Partial<TeoyubePersonalizationFeedback>
): boolean {
  const type = normalizePersonalizationFeedback(feedback).type;
  return [
    "less_like_this",
    "dismiss_recommendation",
    "not_relevant",
    "fallback_not_helpful",
    "confidence_too_low"
  ].includes(type);
}

export function shouldDisablePersonalizationFromFeedback(
  feedback: Partial<TeoyubePersonalizationFeedback>
): boolean {
  return normalizePersonalizationFeedback(feedback).type === "disable_personalization";
}

export function validatePersonalizationFeedback(
  feedback: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): {
  valid: boolean;
  feedback: TeoyubePersonalizationFeedback;
  safety: TeoyubePersonalizationFeedbackSafetyStatus;
  errors: string[];
  warnings: string[];
} {
  const sanitized = sanitizePersonalizationFeedback(feedback, consent);
  const consentStatus = validateSignalStoreConsent(consent);
  const errors: string[] = [];
  const warnings = [...consentStatus.warnings];

  if (!sanitized.id) errors.push("Feedback is missing id.");
  if (!sanitized.type || sanitized.type === "unknown") warnings.push("Feedback type is unknown.");
  if (!sanitized.target.kind || sanitized.target.kind === "unknown") {
    warnings.push("Feedback target is unknown.");
  }
  if (!consentStatus.allowed && !feedbackAllowsControlWithoutConsent(sanitized.type)) {
    warnings.push("Feedback accepted as user control, but it will not store personalization signals without consent.");
  }
  if (containsSensitiveText(feedback.rawTextPreview) || containsSensitiveText(feedback.comment)) {
    warnings.push("Raw feedback text was redacted for safety.");
  }

  const safety: TeoyubePersonalizationFeedbackSafetyStatus = {
    safe: errors.length === 0,
    blocked: errors.length > 0,
    status: errors.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "safe",
    reasons: errors,
    warnings,
    guardrails: [
      "Feedback is user control, not hidden profiling.",
      "Raw private text is redacted by default.",
      "Feedback may soften or disable hints but must not override Scripture anchors.",
      "Feedback must remain reversible and explainable."
    ]
  };

  return {
    valid: errors.length === 0,
    feedback: sanitized,
    safety,
    errors,
    warnings
  };
}

export function createFeedbackDecision(
  feedbackInput: Partial<TeoyubePersonalizationFeedback>,
  _profile?: TeoyubePersonalizationProfile,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationFeedbackDecision {
  const feedback = sanitizePersonalizationFeedback(feedbackInput, consent);
  const reducePreference = shouldReducePreferenceFromFeedback(feedback);
  const disablePersonalization = shouldDisablePersonalizationFromFeedback(feedback);
  const resetPreferences = feedback.type === "reset_preferences";
  const exportSignals = feedback.type === "export_signals";
  const deleteSignals = feedback.type === "delete_signals";
  const increasePreference = ["more_like_this", "save_scripture", "save_word", "save_prayer", "repeat_prayer_sequence"].includes(feedback.type);
  const consentStatus = validateSignalStoreConsent(consent);
  const storeSignal =
    consentStatus.allowed &&
    !disablePersonalization &&
    !resetPreferences &&
    !exportSignals &&
    !deleteSignals;
  const preferenceKey = preferenceKeyFor(feedback);

  return {
    id: createId("feedback_decision"),
    feedbackId: feedback.id,
    accepted: true,
    reducePreference,
    increasePreference,
    disablePersonalization,
    resetPreferences,
    exportSignals,
    deleteSignals,
    storeSignal,
    preferenceKey,
    targetId: feedback.target.id,
    explanation: reducePreference
      ? "Feedback will reduce related preference hints for future previews."
      : disablePersonalization
        ? "Feedback requests disabling personalization."
        : increasePreference
          ? "Feedback can strengthen related session-safe preference hints."
          : "Feedback was recorded as an explicit user control signal.",
    warnings: consentStatus.allowed ? [] : ["Signal storage is disabled until consent allows it."],
    createdAt: now()
  };
}

export function explainPersonalizationFeedbackDecision(
  decision: TeoyubePersonalizationFeedbackDecision
): TeoyubePersonalizationFeedbackExplanation {
  return {
    summary: decision.explanation,
    userControlImpact: decision.disablePersonalization
      ? "Personalized preview should be disabled."
      : decision.resetPreferences
        ? "Preference hints should be reset."
        : decision.reducePreference
          ? "Related hints should be softened or removed."
          : "Related hints may be strengthened only as soft preview guidance.",
    privacyImpact: decision.storeSignal
      ? "A sanitized structured signal may be stored in the in-memory signal store."
      : "No personalization signal storage is required for this decision.",
    scriptureAnchorNote:
      "Feedback can guide preview hints, but it cannot remove Scripture anchoring or claim certainty.",
    warnings: decision.warnings
  };
}

export function applyFeedbackToPreferenceProfile(
  profile: TeoyubePersonalizationProfile,
  feedbackInput: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationProfile {
  const feedback = sanitizePersonalizationFeedback(feedbackInput, consent || profile.consent);
  const decision = createFeedbackDecision(feedback, profile, consent || profile.consent);
  const key = decision.preferenceKey || feedback.type;

  if (decision.disablePersonalization) {
    return {
      ...profile,
      consent: {
        ...profile.consent,
        personalizationEnabled: false,
        learningEnabled: false,
        allowedScopes: [],
        updatedAt: now(),
        source: "user"
      },
      updatedAt: now()
    };
  }

  if (decision.resetPreferences) {
    return {
      ...profile,
      preferences: [],
      surfacePreferences: [],
      updatedAt: now()
    };
  }

  if (decision.reducePreference) {
    return {
      ...profile,
      preferences: profile.preferences
        .map((preference) =>
          preference.key === key || preference.value === feedback.target.id
            ? {
                ...preference,
                confidence: Math.max(0, preference.confidence - 0.35),
                updatedAt: now()
              }
            : preference
        )
        .filter((preference) => preference.confidence > 0.2),
      updatedAt: now()
    };
  }

  if (decision.increasePreference && key) {
    const existing = profile.preferences.find((preference) => preference.key === key);
    const nextPreference: TeoyubeUserPreference = {
      key,
      value: feedback.target.id || feedback.target.label || feedback.type,
      source: "manual_feedback",
      confidence: existing ? Math.min(1, existing.confidence + 0.18) : 0.55,
      updatedAt: now()
    };

    return {
      ...profile,
      preferences: [
        nextPreference,
        ...profile.preferences.filter((preference) => preference.key !== key)
      ],
      updatedAt: now()
    };
  }

  return {
    ...profile,
    updatedAt: now()
  };
}

export function applyFeedbackToSignalStore(
  store: TeoyubeSignalStoreAdapter,
  feedbackInput: Partial<TeoyubePersonalizationFeedback>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationFeedbackResult {
  const validation = validatePersonalizationFeedback(feedbackInput, consent);
  const decision = createFeedbackDecision(validation.feedback, undefined, consent);
  const explanation = explainPersonalizationFeedbackDecision(decision);
  const errors = [...validation.errors];
  const warnings = [...validation.warnings, ...decision.warnings];

  if (decision.storeSignal) {
    const feedback = validation.feedback;
    const write = addTeoyubePersonalizationSignal(
      store,
      {
        source: "manual_feedback",
        type: feedback.target.kind === "action_step" ? "action_completed" : "confidence_feedback",
        surface: feedback.surface || feedback.target.surface,
        selectedWordId: feedback.target.kind === "word" ? feedback.target.id : undefined,
        selectedClusterId: feedback.target.kind === "promise_cluster" ? feedback.target.id : undefined,
        selectedScriptureReference: feedback.target.kind === "scripture_anchor" ? feedback.target.label || feedback.target.id : undefined,
        selectedPrayerSequenceId: feedback.target.kind === "prayer_sequence" ? feedback.target.id : undefined,
        selectedActionStepId: feedback.target.kind === "action_step" ? feedback.target.id : undefined,
        confidenceScore: feedback.type === "more_like_this" ? 0.72 : feedback.type === "less_like_this" ? 0.35 : 0.5,
        weight: feedback.weight,
        storesRawText: false,
        metadata: {
          feedbackId: feedback.id,
          feedbackType: feedback.type,
          targetKind: feedback.target.kind
        }
      },
      consent
    );
    errors.push(...write.errors);
    warnings.push(...write.warnings);
  }

  const status: TeoyubePersonalizationFeedbackResult["status"] = decision.resetPreferences
    ? "reset"
    : decision.exportSignals
      ? "export_ready"
      : decision.deleteSignals
        ? "delete_ready"
        : errors.length
          ? "blocked"
          : "accepted";

  return {
    success: errors.length === 0,
    status,
    feedback: validation.feedback,
    decision,
    explanation,
    safety: validation.safety,
    consent: validatePersonalizationConsent(consent),
    errors,
    warnings
  };
}
