export type TeoyubeControlledReleaseExpansionReadinessStatus =
  | "not_started"
  | "reviewing"
  | "ready_for_limited_expansion"
  | "ready_with_conditions"
  | "remain_limited"
  | "pause_recommended"
  | "rollback_required"
  | "blocked"
  | "unknown";

export type TeoyubeControlledReleaseExpansionReadinessArea =
  | "first_week_stability"
  | "core_routes"
  | "manual_feedback"
  | "issue_patterns"
  | "known_issues"
  | "safe_fix_batches"
  | "public_trust"
  | "known_limitations"
  | "content_safety"
  | "privacy_consent"
  | "rollback_readiness"
  | "support_expectations"
  | "owner_approval"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "service_disabled_state"
  | "unknown";

export type TeoyubeControlledReleaseExpansionReadinessDecision =
  | "approve_limited_expansion"
  | "approve_with_conditions"
  | "remain_limited"
  | "pause_promotion"
  | "rollback_required"
  | "blocked"
  | "unknown";

export type TeoyubeControlledReleaseExpansionReadinessCheck = {
  id: string;
  area: TeoyubeControlledReleaseExpansionReadinessArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubeControlledReleaseExpansionReadinessResult = {
  id: string;
  area: TeoyubeControlledReleaseExpansionReadinessArea;
  status: TeoyubeControlledReleaseExpansionReadinessStatus;
  summary: string;
  reviewedAt: string;
  notes: string[];
};

export type TeoyubeControlledReleaseExpansionReadinessRecord = {
  id: string;
  status: TeoyubeControlledReleaseExpansionReadinessStatus;
  releaseOwner: string;
  expansionWindow: string;
  results: TeoyubeControlledReleaseExpansionReadinessResult[];
  notes: string[];
  noAutomaticPublicExpansion: true;
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
};

export type TeoyubeControlledReleaseExpansionReadinessBlocker = {
  id: string;
  area: TeoyubeControlledReleaseExpansionReadinessArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledReleaseExpansionReadinessWarning = {
  id: string;
  area: TeoyubeControlledReleaseExpansionReadinessArea;
  message: string;
};

export type TeoyubeControlledReleaseExpansionReadinessReport = {
  valid: boolean;
  status: TeoyubeControlledReleaseExpansionReadinessStatus;
  decision: TeoyubeControlledReleaseExpansionReadinessDecision;
  record: TeoyubeControlledReleaseExpansionReadinessRecord;
  checklist: TeoyubeControlledReleaseExpansionReadinessCheck[];
  blockers: TeoyubeControlledReleaseExpansionReadinessBlocker[];
  warnings: TeoyubeControlledReleaseExpansionReadinessWarning[];
  noAutomaticPublicExpansion: true;
  noAutomaticDeployment: true;
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
