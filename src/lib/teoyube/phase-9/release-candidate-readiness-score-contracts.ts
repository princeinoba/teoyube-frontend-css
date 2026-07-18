export type TeoyubeReleaseCandidateReadinessScoreStatus =
  | "scored"
  | "scored_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeReleaseCandidateReadinessScoreArea =
  | "public_candidate_qa"
  | "manual_monitoring"
  | "support_readiness"
  | "feedback_readiness"
  | "issue_triage"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "reviewed_content_gate"
  | "mobile"
  | "accessibility"
  | "known_limitations"
  | "owner_review"
  | "unknown";

export type TeoyubeReleaseCandidateReadinessScoreBand =
  | "excellent"
  | "good"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubeReleaseCandidateReadinessScoreInput = Partial<{
  areaScores: Partial<Record<TeoyubeReleaseCandidateReadinessScoreArea, number>>;
  criticalBlockers: number;
  missingScriptureAnchors: boolean;
  missingExplanationTraces: boolean;
  unsafeFallback: boolean;
  missingConfidenceLabels: boolean;
  reviewOnlyContentVisible: boolean;
  disabledServiceEnabled: boolean;
  privacyConsentBlocker: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  automaticUserContactEnabled: boolean;
  mobileBlocker: boolean;
  accessibilityBlocker: boolean;
}>;

export type TeoyubeReleaseCandidateReadinessScoreResult = {
  area: TeoyubeReleaseCandidateReadinessScoreArea;
  score: number;
  blocker: boolean;
  notes: string[];
};

export type TeoyubeReleaseCandidateReadinessScoreBlocker = {
  id: string;
  area: TeoyubeReleaseCandidateReadinessScoreArea;
  message: string;
};

export type TeoyubeReleaseCandidateReadinessScoreWarning = {
  id: string;
  area: TeoyubeReleaseCandidateReadinessScoreArea;
  message: string;
};

export type TeoyubeReleaseCandidateReadinessScoreDecision =
  | "ready_for_phase_9_3"
  | "ready_with_warnings"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubeReleaseCandidateReadinessScoreReport = {
  valid: boolean;
  status: TeoyubeReleaseCandidateReadinessScoreStatus;
  score: number;
  band: TeoyubeReleaseCandidateReadinessScoreBand;
  decision: TeoyubeReleaseCandidateReadinessScoreDecision;
  results: TeoyubeReleaseCandidateReadinessScoreResult[];
  blockers: TeoyubeReleaseCandidateReadinessScoreBlocker[];
  warnings: TeoyubeReleaseCandidateReadinessScoreWarning[];
  noPublicLaunchPerformed: true;
  noAutomaticUserContact: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
