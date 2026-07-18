import type {
  TeoyubeConsentScope,
  TeoyubePersonalizationConsent
} from "./personalization-contracts";
import type { TigProductionSurface } from "./production-response-contracts";

export type TeoyubeConsentControlScope =
  | TeoyubeConsentScope
  | "session_only"
  | "profile_preview"
  | "surface"
  | "event_to_signal";

export type TeoyubeConsentControlSetting = {
  scope: TeoyubeConsentControlScope;
  enabled: boolean;
  reason?: string;
  updatedAt: string;
};

export type TeoyubeConsentControlState = {
  id: string;
  consent: TeoyubePersonalizationConsent;
  personalizationEnabled: boolean;
  sessionOnlyPersonalization: boolean;
  profilePreviewPersonalization: boolean;
  preferenceHintsEnabled: boolean;
  signalStorageAllowed: boolean;
  eventToSignalConversionEnabled: boolean;
  rawTextStorageEnabled: false;
  surfacePersonalization: Partial<Record<TigProductionSurface, boolean>>;
  settings: TeoyubeConsentControlSetting[];
  auditTrail: TeoyubeConsentControlAuditEntry[];
  explanation: string;
  updatedAt: string;
};

export type TeoyubeConsentControlAction =
  | {
      type: "disable_personalization";
      reason?: string;
    }
  | {
      type: "enable_session_personalization";
      reason?: string;
    }
  | {
      type: "enable_profile_preview_personalization";
      reason?: string;
    }
  | {
      type: "disable_preference_hints";
      reason?: string;
    }
  | {
      type: "enable_preference_hints";
      reason?: string;
    }
  | {
      type: "reset_preferences";
      reason?: string;
    }
  | {
      type: "request_export";
      reason?: string;
    }
  | {
      type: "request_delete";
      reason?: string;
    }
  | {
      type: "set_surface_personalization";
      surface: TigProductionSurface;
      enabled: boolean;
      reason?: string;
    }
  | {
      type: "set_event_to_signal_conversion";
      enabled: boolean;
      reason?: string;
    }
  | {
      type: "disable_raw_text_storage";
      reason?: string;
    }
  | {
      type: "unknown";
      reason?: string;
    };

export type TeoyubeConsentControlExplanation = {
  summary: string;
  privacyPosture: string;
  userControl: string;
  storageBoundary: string;
  warnings: string[];
};

export type TeoyubeConsentControlResult = {
  success: boolean;
  status: "updated" | "disabled" | "reset" | "export_requested" | "delete_requested" | "ignored";
  state: TeoyubeConsentControlState;
  action: TeoyubeConsentControlAction;
  explanation: TeoyubeConsentControlExplanation;
  warnings: string[];
  errors: string[];
};

export type TeoyubeConsentControlAuditEntry = {
  id: string;
  actionType: TeoyubeConsentControlAction["type"];
  status: TeoyubeConsentControlResult["status"] | "created";
  reason?: string;
  personalizationEnabled: boolean;
  preferenceHintsEnabled: boolean;
  signalStorageAllowed: boolean;
  createdAt: string;
};
