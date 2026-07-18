export type TeoyubePublicReleaseCandidateQaStatus =
  | "pending"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleaseCandidateQaArea =
  | "home"
  | "canon"
  | "daily_word"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "privacy_notice"
  | "consent_notice"
  | "known_limitations"
  | "support_feedback"
  | "fallback_states"
  | "scripture_anchor"
  | "explanation_trace"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "unknown";

export type TeoyubePublicReleaseCandidateQaDecision =
  | "qa_passed"
  | "qa_passed_with_warnings"
  | "qa_blocked"
  | "needs_fix_queue"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicReleaseCandidateQaCheck = {
  id: string;
  area: TeoyubePublicReleaseCandidateQaArea;
  label: string;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubePublicReleaseCandidateQaScenario = {
  id: string;
  area: TeoyubePublicReleaseCandidateQaArea;
  label: string;
  description: string;
  checks: TeoyubePublicReleaseCandidateQaCheck[];
  manualOnly: true;
  noPublicUrlFetch: true;
  noExternalServicesRequired: true;
};

export type TeoyubePublicReleaseCandidateQaResult = {
  id: string;
  scenarioId: string;
  area: TeoyubePublicReleaseCandidateQaArea;
  status: TeoyubePublicReleaseCandidateQaStatus;
  passed: boolean;
  notes: string[];
  blocker: boolean;
};

export type TeoyubePublicReleaseCandidateQaRun = {
  id: string;
  scenarios: TeoyubePublicReleaseCandidateQaScenario[];
  results: TeoyubePublicReleaseCandidateQaResult[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noAnalyticsSent: true;
  noQaRunPersisted: true;
  noFilesWritten: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePublicReleaseCandidateQaBlocker = {
  id: string;
  area: TeoyubePublicReleaseCandidateQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePublicReleaseCandidateQaWarning = {
  id: string;
  area: TeoyubePublicReleaseCandidateQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicReleaseCandidateQaReport = {
  valid: boolean;
  status: TeoyubePublicReleaseCandidateQaStatus;
  decision: TeoyubePublicReleaseCandidateQaDecision;
  run: TeoyubePublicReleaseCandidateQaRun;
  blockers: TeoyubePublicReleaseCandidateQaBlocker[];
  warnings: TeoyubePublicReleaseCandidateQaWarning[];
  summary: {
    totalScenarios: number;
    totalResults: number;
    passedResults: number;
    blockedResults: number;
  };
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noAnalyticsSent: true;
  noQaRunPersisted: true;
  noFilesWritten: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
