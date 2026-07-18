export type TeoyubeLaunchQaSurface =
  | "canon"
  | "daily_word"
  | "prayer"
  | "calling_compass"
  | "promise_cluster"
  | "ai_companion"
  | "onboarding"
  | "tig_response_panel"
  | "tig_graph_preview"
  | "personalization_preview"
  | "consent_controls"
  | "feedback_controls"
  | "unknown";

export type TeoyubeLaunchQaStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "not_tested"
  | "unknown";

export type TeoyubeLaunchQaRiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type TeoyubeLaunchQaCheck = {
  id: string;
  surface: TeoyubeLaunchQaSurface | "all";
  title: string;
  purpose: string;
  riskLevel: TeoyubeLaunchQaRiskLevel;
  launchCritical: boolean;
  category: "surface" | "mobile" | "accessibility" | "safety" | "tig" | "personalization" | "fallback";
  expectedResult: string;
};

export type TeoyubeLaunchQaCheckResult = {
  checkId: string;
  surface: TeoyubeLaunchQaSurface | "all";
  status: TeoyubeLaunchQaStatus;
  notes?: string;
  testedAt?: string;
};

export type TeoyubeLaunchQaBlocker = {
  id: string;
  surface: TeoyubeLaunchQaSurface | "all";
  title: string;
  riskLevel: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeLaunchQaWarning = {
  id: string;
  surface: TeoyubeLaunchQaSurface | "all";
  title: string;
  riskLevel: Exclude<TeoyubeLaunchQaRiskLevel, "critical">;
  message: string;
  recommendedAction: string;
};

export type TeoyubeLaunchQaReport = {
  valid: boolean;
  status: TeoyubeLaunchQaStatus;
  checkCount: number;
  passedCount: number;
  warningCount: number;
  blockerCount: number;
  blockers: TeoyubeLaunchQaBlocker[];
  warnings: TeoyubeLaunchQaWarning[];
  generatedAt: string;
};

export type TeoyubeAccessibilityCheck = TeoyubeLaunchQaCheck & {
  wcagHint?: string;
};

export type TeoyubeAccessibilityReport = TeoyubeLaunchQaReport & {
  accessibilityCheckCount: number;
};

export type TeoyubeSurfaceTestCase = {
  id: string;
  surface: TeoyubeLaunchQaSurface;
  title: string;
  purpose: string;
  steps: string[];
  expectedResult: string;
  riskLevel: TeoyubeLaunchQaRiskLevel;
  launchCritical: boolean;
  testType: "manual" | "automated" | "smoke";
  relatedSafetyRequirement: string;
};

export type TeoyubeSurfaceTestResult = {
  testCaseId: string;
  status: TeoyubeLaunchQaStatus;
  notes?: string;
  testedAt?: string;
};

export type TeoyubeMobileQaCheck = TeoyubeLaunchQaCheck & {
  viewport: "small_mobile" | "large_mobile" | "tablet" | "desktop" | "all";
};

export type TeoyubeSafetyQaCheck = TeoyubeLaunchQaCheck & {
  safetyRequirement: string;
};

