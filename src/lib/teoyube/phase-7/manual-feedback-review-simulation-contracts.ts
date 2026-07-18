export type TeoyubeManualFeedbackReviewSimulationStatus =
  | "empty"
  | "ready"
  | "ready_with_warnings"
  | "blocked";

export type TeoyubeManualFeedbackReviewSimulationCategory =
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "accessibility"
  | "privacy_consent"
  | "content_clarity"
  | "positive_feedback"
  | "feature_request"
  | "support_request"
  | "sensitive_content"
  | "unknown";

export type TeoyubeManualFeedbackReviewSimulationPrivacyFlag =
  | "contains_sensitive_text"
  | "contains_contact_info"
  | "contains_secret"
  | "emergency_or_crisis"
  | "medical_legal_financial"
  | "professional_advice"
  | "spiritual_safety_review"
  | "none";

export type TeoyubeManualFeedbackReviewSimulationItem = {
  id: string;
  category: TeoyubeManualFeedbackReviewSimulationCategory;
  summary: string;
  redactedNotes: string[];
  privacyFlags: TeoyubeManualFeedbackReviewSimulationPrivacyFlag[];
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "reviewed" | "converted_to_support_issue" | "queued_for_stabilization" | "deferred";
  source: "manual_owner_note" | "manual_participant_note" | "manual_support_note" | "simulated_note";
  simulatedOnly: true;
  manualOnly: true;
  sanitized: boolean;
  rawSensitiveTextStored: boolean;
  feedbackCollectedAutomatically: boolean;
  usersContacted: boolean;
  publicUrlFetched: boolean;
  externalServicesCalled: boolean;
  databaseWritten: boolean;
  analyticsSent: boolean;
  monitoringProviderConnected: boolean;
  liveAiOrchestrationEnabled: boolean;
  hiddenPersonalizationCreated: boolean;
  generatedAt: string;
};

export type TeoyubeManualFeedbackReviewSimulation = {
  id: string;
  items: TeoyubeManualFeedbackReviewSimulationItem[];
  simulatedOnly: true;
  manualOnly: true;
  inMemoryOnly: true;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noHiddenPersonalizationCreated: true;
  generatedAt: string;
};

export type TeoyubeManualFeedbackReviewSimulationBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeManualFeedbackReviewSimulationCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualFeedbackReviewSimulationWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeManualFeedbackReviewSimulationCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualFeedbackReviewSimulationResult = {
  valid: boolean;
  item: TeoyubeManualFeedbackReviewSimulationItem;
  blockers: TeoyubeManualFeedbackReviewSimulationBlocker[];
  warnings: TeoyubeManualFeedbackReviewSimulationWarning[];
};

export type TeoyubeManualFeedbackReviewSimulationDecision =
  | "simulation_passed"
  | "simulation_passed_with_warnings"
  | "simulation_blocked"
  | "needs_issue_triage"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeManualFeedbackReviewSimulationReport = {
  valid: boolean;
  status: TeoyubeManualFeedbackReviewSimulationStatus;
  decision: TeoyubeManualFeedbackReviewSimulationDecision;
  simulation: TeoyubeManualFeedbackReviewSimulation;
  summary: {
    itemCount: number;
    blockerCount: number;
    warningCount: number;
    privacyReviewCount: number;
    issueTriageCandidateCount: number;
    criticalCount: number;
    highCount: number;
  };
  blockers: TeoyubeManualFeedbackReviewSimulationBlocker[];
  warnings: TeoyubeManualFeedbackReviewSimulationWarning[];
  simulatedOnly: true;
  manualOnly: true;
  inMemoryOnly: true;
  sanitizedOnly: boolean;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noHiddenPersonalizationCreated: true;
  generatedAt: string;
};
