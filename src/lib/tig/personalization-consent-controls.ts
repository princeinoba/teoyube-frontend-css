import type {
  TeoyubeConsentControlAction,
  TeoyubeConsentControlAuditEntry,
  TeoyubeConsentControlExplanation,
  TeoyubeConsentControlResult,
  TeoyubeConsentControlSetting,
  TeoyubeConsentControlState
} from "./personalization-consent-controls-contracts";
import type { TeoyubePersonalizationConsent } from "./personalization-contracts";

function now(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function baseConsent(overrides: Partial<TeoyubePersonalizationConsent> = {}): TeoyubePersonalizationConsent {
  return {
    personalizationEnabled: false,
    learningEnabled: false,
    allowedScopes: [],
    source: "system_default",
    updatedAt: now(),
    ...overrides,
    allowRawTextStorage: false
  };
}

function setting(
  scope: TeoyubeConsentControlSetting["scope"],
  enabled: boolean,
  reason?: string
): TeoyubeConsentControlSetting {
  return {
    scope,
    enabled,
    reason,
    updatedAt: now()
  };
}

function explain(state: TeoyubeConsentControlState): TeoyubeConsentControlExplanation {
  const warnings: string[] = [];

  if (!state.personalizationEnabled) {
    warnings.push("Personalization is disabled.");
  }

  if (!state.preferenceHintsEnabled) {
    warnings.push("Preference hints are disabled.");
  }

  return {
    summary: explainConsentControlState(state),
    privacyPosture: state.rawTextStorageEnabled
      ? "Raw text storage should remain disabled for Phase 6.5."
      : "Raw text storage is disabled by default.",
    userControl:
      "Users can disable personalization, use session-only preview, reset preferences, and request export or deletion.",
    storageBoundary:
      "Phase 6.5 consent controls do not connect production database persistence or hidden long-term memory.",
    warnings
  };
}

function withAudit(
  state: TeoyubeConsentControlState,
  action: TeoyubeConsentControlAction,
  status: TeoyubeConsentControlResult["status"],
  reason?: string
): TeoyubeConsentControlState {
  const audit = createConsentControlAuditEntry(action, {
    status,
    state,
    reason
  });

  return {
    ...state,
    auditTrail: [audit, ...state.auditTrail],
    explanation: explainConsentControlState(state),
    updatedAt: now()
  };
}

function result(
  state: TeoyubeConsentControlState,
  action: TeoyubeConsentControlAction,
  status: TeoyubeConsentControlResult["status"],
  warnings: string[] = [],
  errors: string[] = []
): TeoyubeConsentControlResult {
  const audited = withAudit(state, action, status, action.reason);

  return {
    success: errors.length === 0,
    status,
    state: audited,
    action,
    explanation: explain(audited),
    warnings,
    errors
  };
}

export function createDefaultTeoyubeConsentControlState(): TeoyubeConsentControlState {
  const state: TeoyubeConsentControlState = {
    id: createId("consent_control"),
    consent: baseConsent(),
    personalizationEnabled: false,
    sessionOnlyPersonalization: false,
    profilePreviewPersonalization: false,
    preferenceHintsEnabled: false,
    signalStorageAllowed: false,
    eventToSignalConversionEnabled: false,
    rawTextStorageEnabled: false,
    surfacePersonalization: {},
    settings: [
      setting("signals", false, "Default privacy-protective state."),
      setting("preferences", false, "Preference hints require user action."),
      setting("raw_text", false, "Raw text storage is disabled by default."),
      setting("event_to_signal", false, "Event-to-signal conversion requires consent.")
    ],
    auditTrail: [],
    explanation: "Personalization is disabled by default.",
    updatedAt: now()
  };

  return {
    ...state,
    auditTrail: [
      {
        id: createId("consent_audit"),
        actionType: "unknown",
        status: "created",
        reason: "Default privacy-protective consent state created.",
        personalizationEnabled: false,
        preferenceHintsEnabled: false,
        signalStorageAllowed: false,
        createdAt: now()
      }
    ]
  };
}

export function createDisabledConsentControlState(): TeoyubeConsentControlState {
  return createDefaultTeoyubeConsentControlState();
}

export function createSessionOnlyConsentControlState(): TeoyubeConsentControlState {
  return enableSessionOnlyPersonalization(createDefaultTeoyubeConsentControlState()).state;
}

export function disableTeoyubePersonalization(
  state: TeoyubeConsentControlState,
  reason = "User disabled personalization."
): TeoyubeConsentControlResult {
  return result(
    {
      ...state,
      consent: baseConsent({ source: "user" }),
      personalizationEnabled: false,
      sessionOnlyPersonalization: false,
      profilePreviewPersonalization: false,
      preferenceHintsEnabled: false,
      signalStorageAllowed: false,
      eventToSignalConversionEnabled: false,
      rawTextStorageEnabled: false,
      settings: [
        setting("signals", false, reason),
        setting("preferences", false, reason),
        setting("raw_text", false, "Raw text storage remains disabled."),
        setting("event_to_signal", false, reason)
      ]
    },
    { type: "disable_personalization", reason },
    "disabled"
  );
}

export function enableSessionOnlyPersonalization(
  state: TeoyubeConsentControlState
): TeoyubeConsentControlResult {
  const consent = baseConsent({
    personalizationEnabled: true,
    learningEnabled: false,
    allowedScopes: ["signals", "feedback"],
    source: "user"
  });

  return result(
    {
      ...state,
      consent,
      personalizationEnabled: true,
      sessionOnlyPersonalization: true,
      profilePreviewPersonalization: false,
      preferenceHintsEnabled: true,
      signalStorageAllowed: true,
      eventToSignalConversionEnabled: true,
      rawTextStorageEnabled: false,
      settings: [
        setting("session_only", true, "Session-only personalization enabled."),
        setting("signals", true, "Safe session signals are allowed."),
        setting("feedback", true, "Feedback controls are allowed."),
        setting("preferences", true, "Preference hints are session-only."),
        setting("raw_text", false, "Raw text storage remains disabled."),
        setting("event_to_signal", true, "Events may become safe session signals.")
      ]
    },
    { type: "enable_session_personalization" },
    "updated"
  );
}

export function enableProfilePreviewPersonalization(
  state: TeoyubeConsentControlState
): TeoyubeConsentControlResult {
  const consent = baseConsent({
    personalizationEnabled: true,
    learningEnabled: true,
    allowedScopes: ["signals", "preferences", "journey_progress", "feedback"],
    source: "user"
  });

  return result(
    {
      ...state,
      consent,
      personalizationEnabled: true,
      sessionOnlyPersonalization: false,
      profilePreviewPersonalization: true,
      preferenceHintsEnabled: true,
      signalStorageAllowed: true,
      eventToSignalConversionEnabled: true,
      rawTextStorageEnabled: false,
      settings: [
        setting("profile_preview", true, "Profile-preview personalization enabled."),
        setting("signals", true, "Safe structured signals are allowed."),
        setting("preferences", true, "Preference hints are allowed."),
        setting("journey_progress", true, "Journey progress signals are allowed."),
        setting("feedback", true, "Feedback controls are allowed."),
        setting("raw_text", false, "Raw text storage remains disabled."),
        setting("event_to_signal", true, "Events may become safe structured signals.")
      ]
    },
    { type: "enable_profile_preview_personalization" },
    "updated"
  );
}

export function disablePreferenceHints(
  state: TeoyubeConsentControlState,
  reason = "User disabled preference hints."
): TeoyubeConsentControlResult {
  return result(
    {
      ...state,
      preferenceHintsEnabled: false,
      settings: [
        ...state.settings.filter((item) => item.scope !== "preferences"),
        setting("preferences", false, reason)
      ]
    },
    { type: "disable_preference_hints", reason },
    "updated"
  );
}

export function enablePreferenceHints(
  state: TeoyubeConsentControlState
): TeoyubeConsentControlResult {
  if (!state.personalizationEnabled) {
    return result(
      state,
      { type: "enable_preference_hints" },
      "ignored",
      [],
      ["Preference hints cannot be enabled while personalization is disabled."]
    );
  }

  return result(
    {
      ...state,
      preferenceHintsEnabled: true,
      settings: [
        ...state.settings.filter((item) => item.scope !== "preferences"),
        setting("preferences", true, "Preference hints enabled.")
      ]
    },
    { type: "enable_preference_hints" },
    "updated"
  );
}

export function resetTeoyubePersonalizationPreferences(
  state: TeoyubeConsentControlState
): TeoyubeConsentControlResult {
  return result(
    {
      ...state,
      preferenceHintsEnabled: false,
      settings: [
        ...state.settings.filter((item) => item.scope !== "preferences"),
        setting("preferences", false, "Preference hints reset by user.")
      ]
    },
    { type: "reset_preferences", reason: "User reset personalization preferences." },
    "reset"
  );
}

export function updateTeoyubeConsentControlState(
  state: TeoyubeConsentControlState,
  action: TeoyubeConsentControlAction
): TeoyubeConsentControlResult {
  switch (action.type) {
    case "disable_personalization":
      return disableTeoyubePersonalization(state, action.reason);
    case "enable_session_personalization":
      return enableSessionOnlyPersonalization(state);
    case "enable_profile_preview_personalization":
      return enableProfilePreviewPersonalization(state);
    case "disable_preference_hints":
      return disablePreferenceHints(state, action.reason);
    case "enable_preference_hints":
      return enablePreferenceHints(state);
    case "reset_preferences":
      return resetTeoyubePersonalizationPreferences(state);
    case "request_export":
      return result(state, action, "export_requested");
    case "request_delete":
      return result(state, action, "delete_requested");
    case "set_surface_personalization":
      return result(
        {
          ...state,
          surfacePersonalization: {
            ...state.surfacePersonalization,
            [action.surface]: action.enabled
          },
          settings: [
            ...state.settings.filter((item) => item.scope !== "surface"),
            setting("surface", action.enabled, action.reason || `${action.surface} personalization updated.`)
          ]
        },
        action,
        "updated"
      );
    case "set_event_to_signal_conversion":
      return result(
        {
          ...state,
          eventToSignalConversionEnabled: action.enabled,
          settings: [
            ...state.settings.filter((item) => item.scope !== "event_to_signal"),
            setting("event_to_signal", action.enabled, action.reason)
          ]
        },
        action,
        "updated"
      );
    case "disable_raw_text_storage":
      return result(
        {
          ...state,
          consent: {
            ...state.consent,
            allowRawTextStorage: false
          },
          rawTextStorageEnabled: false,
          settings: [
            ...state.settings.filter((item) => item.scope !== "raw_text"),
            setting("raw_text", false, action.reason || "Raw text storage disabled.")
          ]
        },
        action,
        "updated"
      );
    default:
      return result(state, action, "ignored", ["Unknown consent control action ignored."]);
  }
}

export function createConsentControlAuditEntry(
  action: TeoyubeConsentControlAction,
  resultLike: {
    status: TeoyubeConsentControlResult["status"] | "created";
    state: TeoyubeConsentControlState;
    reason?: string;
  }
): TeoyubeConsentControlAuditEntry {
  return {
    id: createId("consent_audit"),
    actionType: action.type,
    status: resultLike.status,
    reason: resultLike.reason || action.reason,
    personalizationEnabled: resultLike.state.personalizationEnabled,
    preferenceHintsEnabled: resultLike.state.preferenceHintsEnabled,
    signalStorageAllowed: resultLike.state.signalStorageAllowed,
    createdAt: now()
  };
}

export function explainConsentControlState(state: TeoyubeConsentControlState): string {
  if (!state.personalizationEnabled) {
    return "Personalization is disabled. Teoyube will use the standard Scripture-anchored production path.";
  }

  if (state.sessionOnlyPersonalization) {
    return "Session-only personalization is enabled. Safe signals may guide this session without implying long-term memory.";
  }

  if (state.profilePreviewPersonalization) {
    return "Profile-preview personalization is enabled for safe structured preview signals, but production database persistence is not connected.";
  }

  return "Personalization controls are configured in a privacy-protective preview state.";
}
