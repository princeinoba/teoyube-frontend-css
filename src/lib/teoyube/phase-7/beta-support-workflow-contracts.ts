export type TeoyubeBetaSupportWorkflowStatus =
  | "empty"
  | "ready"
  | "ready_with_warnings"
  | "blocked";

export type TeoyubeBetaSupportCategory =
  | "app_not_loading"
  | "navigation_confusion"
  | "scripture_anchor_question"
  | "explanation_trace_question"
  | "fallback_confusion"
  | "confidence_label_confusion"
  | "prayer_companion_question"
  | "calling_compass_question"
  | "promise_table_question"
  | "tig_graph_question"
  | "privacy_consent_question"
  | "sensitive_information_submitted"
  | "emergency_or_crisis"
  | "professional_advice_request"
  | "technical_issue"
  | "unknown";

export type TeoyubeBetaSupportSeverity = "low" | "medium" | "high" | "critical" | "unknown";

export type TeoyubeBetaSupportRequest = {
  id: string;
  category: TeoyubeBetaSupportCategory;
  severity: TeoyubeBetaSupportSeverity;
  summary: string;
  redactedNotes: string[];
  source: "manual_owner_note" | "manual_participant_note" | "manual_support_note" | "simulated_note";
  sanitized: boolean;
  manualOnly: true;
  emergencyConcern: boolean;
  professionalAdviceRequested: boolean;
  rawSensitiveTextStored: boolean;
  usersContacted: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlFetched: boolean;
  databaseWritten: boolean;
  analyticsSent: boolean;
  externalServicesCalled: boolean;
  liveAiOrchestrationEnabled: boolean;
  hiddenPersonalizationCreated: boolean;
  noDivineCertaintyClaimed: true;
  generatedAt: string;
};

export type TeoyubeBetaSupportBoundary = {
  id: string;
  category: TeoyubeBetaSupportCategory | "all";
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeBetaSupportRecommendedResponse = {
  requestId: string;
  category: TeoyubeBetaSupportCategory;
  severity: TeoyubeBetaSupportSeverity;
  summary: string;
  manualOnly: true;
  sendAutomatically: false;
  externalServiceRequired: false;
};

export type TeoyubeBetaSupportWorkflowDecision =
  | "document_for_manual_review"
  | "escalate_to_owner_review"
  | "pause_and_review"
  | "blocked"
  | "empty";

export type TeoyubeBetaSupportWorkflowBlocker = {
  id: string;
  category: TeoyubeBetaSupportCategory;
  severity: TeoyubeBetaSupportSeverity;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaSupportWorkflowWarning = {
  id: string;
  category: TeoyubeBetaSupportCategory;
  severity: TeoyubeBetaSupportSeverity;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaSupportWorkflowReport = {
  valid: boolean;
  status: TeoyubeBetaSupportWorkflowStatus;
  decision: TeoyubeBetaSupportWorkflowDecision;
  requests: TeoyubeBetaSupportRequest[];
  boundaries: TeoyubeBetaSupportBoundary[];
  recommendedResponses: TeoyubeBetaSupportRecommendedResponse[];
  blockers: TeoyubeBetaSupportWorkflowBlocker[];
  warnings: TeoyubeBetaSupportWorkflowWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  sanitizedOnly: boolean;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  noLiveAiOrchestrationEnabled: true;
  noProfessionalAdviceProvided: true;
  noDivineCertaintyClaimed: true;
  generatedAt: string;
};
