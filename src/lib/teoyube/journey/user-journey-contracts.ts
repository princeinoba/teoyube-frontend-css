import type {
  TeoyubeTigExplanationTrace,
  TeoyubeTigExplanationTraceStep,
  TeoyubeTigRecommendationConfidenceLabel,
  TeoyubeTigRecommendationFallback,
  TeoyubeTigRecommendationInput,
  TeoyubeTigRecommendationResult
} from "../tig/tig-recommendation-contracts";

export type TeoyubeUserJourneyStage =
  | "entry"
  | "onboarding"
  | "daily_word"
  | "word_card"
  | "promise_cluster"
  | "prayer_companion"
  | "calling_compass"
  | "tig_response"
  | "tig_graph"
  | "action_step"
  | "fallback"
  | "review"
  | "unknown";

export type TeoyubeUserJourneySurface =
  | "home"
  | "canon"
  | "daily_word"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "consent_controls"
  | "privacy_notice"
  | "unknown";

export type TeoyubeUserJourneyInput = {
  query?: string;
  wordId?: string;
  clusterId?: string;
  callingInput?: string;
  prayerInput?: string;
  actionInput?: string;
  stage?: TeoyubeUserJourneyStage;
  surface?: TeoyubeUserJourneySurface;
  safeDisplayLabel?: string;
  retainInputForDisplay?: boolean;
  context?: Record<string, unknown>;
};

export type TeoyubeUserJourneyStep = {
  id: string;
  stage: TeoyubeUserJourneyStage;
  surface: TeoyubeUserJourneySurface;
  label: string;
  summary: string;
  scriptureAnchors: string[];
  explanationPath: string[];
  confidenceLabel?: TeoyubeTigRecommendationConfidenceLabel | "anchored" | "needs_review" | "fallback";
  fallbackUsed: boolean;
  fallbackReason?: string;
  visibleToUser: true;
};

export type TeoyubeUserJourneyRecommendation = {
  id: string;
  surface: TeoyubeUserJourneySurface;
  selectedLabel: string;
  selectedType: string;
  wordId?: string;
  clusterId?: string;
  scriptureAnchors: string[];
  explanationTrace: TeoyubeTigExplanationTrace;
  explanationSteps: TeoyubeTigExplanationTraceStep[];
  confidenceLabel: TeoyubeTigRecommendationConfidenceLabel;
  fallbackUsed: boolean;
  fallbackReason?: string;
  actionSteps: string[];
  sourceResult: TeoyubeTigRecommendationResult;
};

export type TeoyubeUserJourneyTransition = {
  id: string;
  from: TeoyubeUserJourneyStage;
  to: TeoyubeUserJourneyStage;
  reason: string;
  createdAt: string;
};

export type TeoyubeUserJourneyFallback = {
  used: boolean;
  stage: TeoyubeUserJourneyStage;
  surface: TeoyubeUserJourneySurface;
  reason: string;
  message: string;
  scriptureAnchors: string[];
  safe: boolean;
};

export type TeoyubeUserJourneyWarning = {
  id: string;
  surface: TeoyubeUserJourneySurface;
  message: string;
};

export type TeoyubeUserJourneyBlocker = {
  id: string;
  surface: TeoyubeUserJourneySurface;
  message: string;
};

export type TeoyubeUserJourneyState = {
  id: string;
  stage: TeoyubeUserJourneyStage;
  surface: TeoyubeUserJourneySurface;
  input: TeoyubeUserJourneyInput;
  inputSummary: string;
  sensitiveInputCleared: boolean;
  steps: TeoyubeUserJourneyStep[];
  transitions: TeoyubeUserJourneyTransition[];
  recommendation?: TeoyubeUserJourneyRecommendation;
  tigInput?: TeoyubeTigRecommendationInput;
  explanationTrace?: TeoyubeTigExplanationTrace;
  fallback?: TeoyubeUserJourneyFallback;
  scriptureAnchors: string[];
  confidenceLabel?: TeoyubeTigRecommendationConfidenceLabel | "anchored" | "needs_review" | "fallback";
  warnings: TeoyubeUserJourneyWarning[];
  blockers: TeoyubeUserJourneyBlocker[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeUserJourneyReport = {
  valid: boolean;
  stateId: string;
  stage: TeoyubeUserJourneyStage;
  surface: TeoyubeUserJourneySurface;
  stepCount: number;
  transitionCount: number;
  scriptureAnchorCount: number;
  explanationTraceStepCount: number;
  fallbackUsed: boolean;
  confidenceLabel?: TeoyubeUserJourneyState["confidenceLabel"];
  warnings: TeoyubeUserJourneyWarning[];
  blockers: TeoyubeUserJourneyBlocker[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeUserJourneyDecision = {
  id: string;
  decision: "continue" | "show_fallback" | "needs_review" | "blocked";
  reason: string;
  nextStage: TeoyubeUserJourneyStage;
  fallback?: TeoyubeTigRecommendationFallback | TeoyubeUserJourneyFallback;
  warnings: string[];
  blockers: string[];
};
