export type TeoyubePublicGoNoGoReadinessScoreStatus =
  | "scored"
  | "scored_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicGoNoGoReadinessScoreArea =
  | "release_candidate_qa"
  | "fix_queue"
  | "remediation"
  | "final_regression_qa"
  | "public_copy"
  | "privacy_consent"
  | "sensitive_data_warning"
  | "known_limitations"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "support_readiness"
  | "feedback_readiness"
  | "issue_triage"
  | "manual_monitoring"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "owner_review"
  | "unknown";

export type TeoyubePublicGoNoGoReadinessScoreBand =
  | "excellent"
  | "good"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubePublicGoNoGoReadinessScoreInput = Partial<{
  areaScores: Partial<Record<TeoyubePublicGoNoGoReadinessScoreArea, number>>;
  criticalBlockers: number;
  missingScriptureAnchors: boolean;
  missingExplanationTraces: boolean;
  unsafeFallback: boolean;
  missingConfidenceLabels: boolean;
  missingPrivacyConsent: boolean;
  missingSensitiveDataWarning: boolean;
  missingKnownLimitations: boolean;
  reviewOnlyContentVisible: boolean;
  disabledServiceEnabled: boolean;
  publicLaunchFromCode: boolean;
  automaticUserContactEnabled: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  automaticPublicUrlFetchingEnabled: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  liveAiEnabled: boolean;
  mobileBlocker: boolean;
  accessibilityBlocker: boolean;
}>;

export type TeoyubePublicGoNoGoReadinessScoreResult = {
  area: TeoyubePublicGoNoGoReadinessScoreArea;
  score: number;
  blocker: boolean;
  notes: string[];
};

export type TeoyubePublicGoNoGoReadinessScoreBlocker = {
  id: string;
  area: TeoyubePublicGoNoGoReadinessScoreArea;
  message: string;
};

export type TeoyubePublicGoNoGoReadinessScoreWarning = {
  id: string;
  area: TeoyubePublicGoNoGoReadinessScoreArea;
  message: string;
};

export type TeoyubePublicGoNoGoReadinessScoreDecision =
  | "ready_for_phase_9_4"
  | "ready_with_warnings"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubePublicGoNoGoReadinessScoreReport = {
  valid: boolean;
  status: TeoyubePublicGoNoGoReadinessScoreStatus;
  score: number;
  band: TeoyubePublicGoNoGoReadinessScoreBand;
  decision: TeoyubePublicGoNoGoReadinessScoreDecision;
  results: TeoyubePublicGoNoGoReadinessScoreResult[];
  blockers: TeoyubePublicGoNoGoReadinessScoreBlocker[];
  warnings: TeoyubePublicGoNoGoReadinessScoreWarning[];
  noPublicLaunchPerformed: true;
  noAutomaticUserContact: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
