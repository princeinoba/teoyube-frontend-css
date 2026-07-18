export type TeoyubeStabilizedPublicOperationsStatus =
  | "not_started"
  | "reviewing"
  | "stable"
  | "stable_with_warnings"
  | "needs_weekly_review"
  | "needs_safe_fix_batch"
  | "pause_recommended"
  | "rollback_required"
  | "blocked"
  | "unknown";

export type TeoyubeStabilizedPublicOperationsArea =
  | "app_availability"
  | "core_routes"
  | "canon"
  | "calling_compass"
  | "tig_response_panel"
  | "visual_graph"
  | "manual_feedback"
  | "known_issues"
  | "safe_fix_batches"
  | "public_trust"
  | "known_limitations"
  | "rollback_readiness"
  | "weekly_improvement_loop"
  | "owner_review"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "unknown";

export type TeoyubeStabilizedPublicOperationsDecision =
  | "continue_stabilized_operations"
  | "continue_with_watch"
  | "safe_fix_batch_required"
  | "pause_promotion"
  | "rollback_required"
  | "ready_for_phase_10_completion"
  | "blocked"
  | "unknown";

export type TeoyubeStabilizedPublicOperationsCheck = {
  id: string;
  area: TeoyubeStabilizedPublicOperationsArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubeStabilizedPublicOperationsResult = {
  id: string;
  area: TeoyubeStabilizedPublicOperationsArea;
  status: TeoyubeStabilizedPublicOperationsStatus;
  summary: string;
  reviewedAt: string;
  notes: string[];
};

export type TeoyubeStabilizedPublicOperationsRecord = {
  id: string;
  status: TeoyubeStabilizedPublicOperationsStatus;
  releaseOwner: string;
  operationsWindow: string;
  results: TeoyubeStabilizedPublicOperationsResult[];
  notes: string[];
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
};

export type TeoyubeStabilizedPublicOperationsBlocker = {
  id: string;
  area: TeoyubeStabilizedPublicOperationsArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeStabilizedPublicOperationsWarning = {
  id: string;
  area: TeoyubeStabilizedPublicOperationsArea;
  message: string;
};

export type TeoyubeStabilizedPublicOperationsReport = {
  valid: boolean;
  status: TeoyubeStabilizedPublicOperationsStatus;
  decision: TeoyubeStabilizedPublicOperationsDecision;
  record: TeoyubeStabilizedPublicOperationsRecord;
  checklist: TeoyubeStabilizedPublicOperationsCheck[];
  blockers: TeoyubeStabilizedPublicOperationsBlocker[];
  warnings: TeoyubeStabilizedPublicOperationsWarning[];
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
