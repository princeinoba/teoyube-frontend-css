import type { TeoyubeUserJourneyInput, TeoyubeUserJourneySurface } from "../journey/user-journey-contracts";

export type TeoyubeRealUserJourneyQaStatus =
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "needs_review";

export type TeoyubeRealUserJourneyQaSurface =
  | "home"
  | "canon"
  | "daily_word"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "fallback_state"
  | "privacy_notice"
  | "consent_controls"
  | "unknown";

export type TeoyubeRealUserJourneyQaBlocker = {
  id: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  message: string;
};

export type TeoyubeRealUserJourneyQaWarning = {
  id: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  message: string;
};

export type TeoyubeRealUserJourneyQaStep = {
  id: string;
  label: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  passed: boolean;
  details: string;
  blockers: TeoyubeRealUserJourneyQaBlocker[];
  warnings: TeoyubeRealUserJourneyQaWarning[];
};

export type TeoyubeRealUserJourneyQaScenario = {
  id: string;
  label: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  input: TeoyubeUserJourneyInput;
  expectedSurfaces: TeoyubeUserJourneySurface[];
  source: "real_vocabulary" | "real_promise_cluster" | "scripture_canon" | "tig_flow" | "journey_orchestrator" | "safe_fallback";
  realDataOnly: true;
};

export type TeoyubeRealUserJourneyQaResult = {
  id: string;
  label: string;
  surface: TeoyubeRealUserJourneyQaSurface;
  status: TeoyubeRealUserJourneyQaStatus;
  valid: boolean;
  steps: TeoyubeRealUserJourneyQaStep[];
  blockers: TeoyubeRealUserJourneyQaBlocker[];
  warnings: TeoyubeRealUserJourneyQaWarning[];
};

export type TeoyubeRealUserJourneyQaDecision =
  | "ready_for_integration_readiness_review"
  | "ready_with_warnings"
  | "blocked"
  | "needs_accessibility_fix"
  | "needs_mobile_fix"
  | "needs_fallback_fix"
  | "needs_scripture_anchor_fix"
  | "needs_explanation_trace_fix"
  | "unknown";

export type TeoyubeRealUserJourneyQaReport = {
  valid: boolean;
  decision: TeoyubeRealUserJourneyQaDecision;
  scenarioCount: number;
  results: TeoyubeRealUserJourneyQaResult[];
  blockers: TeoyubeRealUserJourneyQaBlocker[];
  warnings: TeoyubeRealUserJourneyQaWarning[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
