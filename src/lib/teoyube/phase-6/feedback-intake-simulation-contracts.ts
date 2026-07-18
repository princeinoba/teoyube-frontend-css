export type TeoyubeFeedbackIntakeSimulationStatus =
  | "empty"
  | "simulated"
  | "needs_redaction"
  | "manual_handling_required"
  | "blocked"
  | "unknown";

export type TeoyubeFeedbackIntakeSimulationCategory =
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
  | "sensitive_content"
  | "unknown";

export type TeoyubeFeedbackIntakeSimulationPrivacyFlag =
  | "contains_sensitive_personal_text"
  | "contains_contact_information"
  | "contains_crisis_or_emergency_content"
  | "contains_professional_advice_request"
  | "contains_spiritual_disclosure"
  | "safe_simulated_feedback"
  | "unknown";

export type TeoyubeFeedbackIntakeSimulationDecision =
  | "simulation_passed"
  | "simulation_passed_with_warnings"
  | "needs_manual_redaction"
  | "manual_handling_required"
  | "blocked"
  | "unknown";

export type TeoyubeFeedbackIntakeSimulationItem = {
  id: string;
  category: TeoyubeFeedbackIntakeSimulationCategory;
  note: string;
  redactedNote: string;
  privacyFlags: TeoyubeFeedbackIntakeSimulationPrivacyFlag[];
  simulatedOnly: true;
  manuallyEnteredByOwner: true;
  storeRawText: false;
};

export type TeoyubeFeedbackIntakeSimulationResult = {
  total: number;
  redacted: number;
  manualHandling: number;
  safe: number;
};

export type TeoyubeFeedbackIntakeSimulation = {
  id: string;
  items: TeoyubeFeedbackIntakeSimulationItem[];
  noAutomaticCollection: true;
  noDatabaseStorage: true;
  noAnalytics: true;
  noHiddenPersonalization: true;
  noRawSensitiveTextStorageByDefault: true;
  simulatedOnly: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeFeedbackIntakeSimulationBlocker = {
  id: string;
  itemId?: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeFeedbackIntakeSimulationWarning = {
  id: string;
  itemId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeFeedbackIntakeSimulationReport = {
  valid: boolean;
  status: TeoyubeFeedbackIntakeSimulationStatus;
  decision: TeoyubeFeedbackIntakeSimulationDecision;
  simulation: TeoyubeFeedbackIntakeSimulation;
  summary: TeoyubeFeedbackIntakeSimulationResult;
  blockers: TeoyubeFeedbackIntakeSimulationBlocker[];
  warnings: TeoyubeFeedbackIntakeSimulationWarning[];
  noAutomaticCollection: true;
  noDatabaseStorage: true;
  noAnalytics: true;
  noHiddenPersonalization: true;
  noRawSensitiveTextStorageByDefault: true;
  simulatedOnly: true;
  inMemoryOnly: true;
  generatedAt: string;
};

