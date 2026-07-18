import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationContext,
  TeoyubePersonalizationDecision,
  TeoyubePersonalizationProfile
} from "./personalization-contracts";
import type { TeoyubePersonalizationFeedback } from "./personalization-feedback-contracts";
import type { TeoyubeSignalStoreAdapter } from "./personalization-signal-store-contracts";
import type {
  TigProductionEvent,
  TigProductionInput,
  TigProductionResponse,
  TigProductionSurface
} from "./production-response-contracts";

export type TeoyubePersonalizationPreviewMode =
  | "baseline_only"
  | "personalized_preview"
  | "comparison"
  | "disabled"
  | "unknown";

export type TeoyubePersonalizationPreviewStatus =
  | "ready"
  | "baseline_only"
  | "personalized"
  | "comparison_ready"
  | "disabled"
  | "blocked"
  | "error";

export type TeoyubePersonalizationPreviewSurface = TigProductionSurface;

export type TeoyubePersonalizationPreviewInput = {
  productionInput: TigProductionInput;
  mode?: TeoyubePersonalizationPreviewMode;
  consent?: Partial<TeoyubePersonalizationConsent>;
  context?: TeoyubePersonalizationContext;
  profile?: TeoyubePersonalizationProfile;
  signalStore?: TeoyubeSignalStoreAdapter;
  preferenceHints?: string[];
  feedbackItems?: Array<Partial<TeoyubePersonalizationFeedback>>;
  showDebugInfo?: boolean;
};

export type TeoyubePersonalizationPreviewDecision = {
  enabled: boolean;
  allowed: boolean;
  blocked: boolean;
  previewOnly: true;
  mode: TeoyubePersonalizationPreviewMode;
  reason: string;
  preferenceHintsUsed: string[];
  warnings: string[];
};

export type TeoyubePersonalizationPreviewSafetyStatus = {
  safe: boolean;
  blocked: boolean;
  status: "safe" | "warning" | "blocked" | "disabled";
  reasons: string[];
  warnings: string[];
  guardrails: string[];
};

export type TeoyubePersonalizationPreviewComparisonItem = {
  label: string;
  baselineValue?: string;
  personalizedValue?: string;
  changed: boolean;
  explanation: string;
};

export type TeoyubePersonalizationPreviewComparison = {
  changed: boolean;
  items: TeoyubePersonalizationPreviewComparisonItem[];
  confidenceDelta: number;
  confidenceImproved: boolean;
  fallbackAvoided: boolean;
  scriptureAnchorPreserved: boolean;
  explanationPathPreserved: boolean;
  preferenceHintsUsed: string[];
  summary: string;
};

export type TeoyubePersonalizationPreviewExplanation = {
  summary: string;
  whatChanged: string[];
  whyChanged: string[];
  scriptureAnchor: string;
  confidenceSummary: string;
  fallbackSummary: string;
  warnings: string[];
};

export type TeoyubePersonalizationPreviewEvent = TigProductionEvent & {
  previewMode: TeoyubePersonalizationPreviewMode;
  consentEnabled: boolean;
  baselineWordId?: string;
  personalizedWordId?: string;
  baselineClusterId?: string;
  personalizedClusterId?: string;
  scriptureReference?: string;
  confidenceDelta: number;
  fallbackAvoided: boolean;
  preferenceHintsUsed: string[];
  previewSafetyStatus: TeoyubePersonalizationPreviewSafetyStatus["status"];
  previewBlocked: boolean;
};

export type TeoyubePersonalizationPreviewResponse = {
  id: string;
  status: TeoyubePersonalizationPreviewStatus;
  mode: TeoyubePersonalizationPreviewMode;
  baseline: TigProductionResponse;
  personalized?: TigProductionResponse;
  preferenceHintsUsed: string[];
  personalizationDecision: TeoyubePersonalizationPreviewDecision;
  personalizationEngineDecision?: TeoyubePersonalizationDecision;
  comparison: TeoyubePersonalizationPreviewComparison;
  explanation: TeoyubePersonalizationPreviewExplanation;
  safety: TeoyubePersonalizationPreviewSafetyStatus;
  consent: TeoyubePersonalizationConsent;
  fallbackStatus: {
    baselineFallbackUsed: boolean;
    personalizedFallbackUsed?: boolean;
    fallbackAvoided: boolean;
    reasons: string[];
  };
  confidenceComparison: {
    baselineScore: number;
    personalizedScore?: number;
    delta: number;
    improved: boolean;
  };
  event: TeoyubePersonalizationPreviewEvent;
  warnings: string[];
  generatedAt: string;
};
