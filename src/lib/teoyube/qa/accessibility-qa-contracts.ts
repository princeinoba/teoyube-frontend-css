import type { TeoyubeRealUserJourneyQaSurface } from "./real-user-journey-qa-contracts";

export type TeoyubeAccessibilityQaStatus = "passed" | "passed_with_warnings" | "blocked";

export type TeoyubeAccessibilityQaSurface = TeoyubeRealUserJourneyQaSurface;

export type TeoyubeAccessibilityQaBlocker = {
  id: string;
  surface: TeoyubeAccessibilityQaSurface;
  message: string;
};

export type TeoyubeAccessibilityQaWarning = {
  id: string;
  surface: TeoyubeAccessibilityQaSurface;
  message: string;
};

export type TeoyubeAccessibilityQaCheck = {
  id: string;
  label: string;
  surface: TeoyubeAccessibilityQaSurface;
  passed: boolean;
  details: string;
  manualReviewRecommended: boolean;
};

export type TeoyubeAccessibilityQaResult = {
  surface: TeoyubeAccessibilityQaSurface;
  status: TeoyubeAccessibilityQaStatus;
  checks: TeoyubeAccessibilityQaCheck[];
  blockers: TeoyubeAccessibilityQaBlocker[];
  warnings: TeoyubeAccessibilityQaWarning[];
};

export type TeoyubeAccessibilityQaDecision =
  | "accessibility_ready"
  | "accessibility_ready_with_warnings"
  | "needs_accessibility_fix"
  | "blocked";

export type TeoyubeAccessibilityQaReport = {
  valid: boolean;
  decision: TeoyubeAccessibilityQaDecision;
  results: TeoyubeAccessibilityQaResult[];
  blockers: TeoyubeAccessibilityQaBlocker[];
  warnings: TeoyubeAccessibilityQaWarning[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
