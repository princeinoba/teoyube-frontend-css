export type TeoyubeBetaOperationsReadinessScoreStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubeBetaOperationsReadinessScoreArea =
  | "operations_runbook"
  | "manual_feedback_review"
  | "support_workflow"
  | "issue_triage"
  | "product_stabilization"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "mobile"
  | "accessibility"
  | "known_limitations"
  | "unknown";

export type TeoyubeBetaOperationsReadinessScoreBand =
  | "excellent"
  | "good"
  | "needs_improvement"
  | "blocked"
  | "unknown";

export type TeoyubeBetaOperationsReadinessScoreDecision =
  | "ready_for_phase_7_4_owner_review"
  | "ready_with_warnings"
  | "needs_more_stabilization"
  | "blocked"
  | "unknown";

export type TeoyubeBetaOperationsReadinessScoreInput = {
  areaOverrides?: Partial<Record<TeoyubeBetaOperationsReadinessScoreArea, number>>;
  blockerCountByArea?: Partial<Record<TeoyubeBetaOperationsReadinessScoreArea, number>>;
  warningCountByArea?: Partial<Record<TeoyubeBetaOperationsReadinessScoreArea, number>>;
  criticalBlockerPresent?: boolean;
};

export type TeoyubeBetaOperationsReadinessScoreResult = {
  area: TeoyubeBetaOperationsReadinessScoreArea;
  score: number;
  band: TeoyubeBetaOperationsReadinessScoreBand;
  status: TeoyubeBetaOperationsReadinessScoreStatus;
  blockers: string[];
  warnings: string[];
  weight: number;
};

export type TeoyubeBetaOperationsReadinessScoreBlocker = {
  id: string;
  area: TeoyubeBetaOperationsReadinessScoreArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaOperationsReadinessScoreWarning = {
  id: string;
  area: TeoyubeBetaOperationsReadinessScoreArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaOperationsReadinessScoreReport = {
  valid: boolean;
  decision: TeoyubeBetaOperationsReadinessScoreDecision;
  score: number;
  band: TeoyubeBetaOperationsReadinessScoreBand;
  status: TeoyubeBetaOperationsReadinessScoreStatus;
  results: TeoyubeBetaOperationsReadinessScoreResult[];
  blockers: TeoyubeBetaOperationsReadinessScoreBlocker[];
  warnings: TeoyubeBetaOperationsReadinessScoreWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};
