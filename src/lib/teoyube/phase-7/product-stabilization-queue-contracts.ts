export type TeoyubeProductStabilizationQueueStatus =
  | "new"
  | "queued"
  | "planned"
  | "safe_to_fix"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "fixed"
  | "verified"
  | "unknown";

export type TeoyubeProductStabilizationQueueItemSource =
  | "manual_feedback_simulation"
  | "support_issue"
  | "phase_7_1_operations"
  | "manual_monitoring"
  | "owner_observation"
  | "qa"
  | "documentation"
  | "unknown";

export type TeoyubeProductStabilizationCategory =
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "controlled_admin"
  | "support_workflow"
  | "feedback_review"
  | "issue_triage"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "content_clarity"
  | "documentation"
  | "unknown";

export type TeoyubeProductStabilizationPriority =
  | "beta_operations_blocker"
  | "high"
  | "medium"
  | "low"
  | "defer"
  | "unknown";

export type TeoyubeProductStabilizationRiskLevel = "low" | "medium" | "high" | "blocked" | "unknown";

export type TeoyubeProductStabilizationDecision =
  | "ready_for_safe_stabilization"
  | "ready_with_warnings"
  | "owner_review_required"
  | "blocked"
  | "empty"
  | "unknown";

export type TeoyubeProductStabilizationVerificationRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeProductStabilizationQueueItem = {
  id: string;
  title: string;
  description: string;
  source: TeoyubeProductStabilizationQueueItemSource;
  sourceId?: string;
  category: TeoyubeProductStabilizationCategory;
  priority: TeoyubeProductStabilizationPriority;
  riskLevel: TeoyubeProductStabilizationRiskLevel;
  status: TeoyubeProductStabilizationQueueStatus;
  safeLocalFixAllowed: boolean;
  ownerReviewRequired: boolean;
  blockedReason?: string;
  deferredReason?: string;
  proposedFix: string;
  verificationRequirements: TeoyubeProductStabilizationVerificationRequirement[];
  noProductionDataWrite: true;
  noServiceConnection: true;
  noUserContact: true;
  noAutomaticPublishing: true;
  noFeedbackCollection: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  preservesScriptureAnchors: boolean;
  preservesExplanationTraces: boolean;
  preservesFallbackSafety: boolean;
  preservesConfidenceLabels: boolean;
  preservesPrivacyConsent: boolean;
  noDivineCertaintyClaimed: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type TeoyubeProductStabilizationQueue = {
  id: string;
  status: TeoyubeProductStabilizationQueueStatus;
  items: TeoyubeProductStabilizationQueueItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noFilesWritten: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noExternalServicesRequired: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeProductStabilizationQueueBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeProductStabilizationCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeProductStabilizationQueueWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeProductStabilizationCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeProductStabilizationQueueReport = {
  valid: boolean;
  decision: TeoyubeProductStabilizationDecision;
  queue: TeoyubeProductStabilizationQueue;
  blockers: TeoyubeProductStabilizationQueueBlocker[];
  warnings: TeoyubeProductStabilizationQueueWarning[];
  itemCount: number;
  betaOperationsBlockerCount: number;
  ownerReviewRequiredCount: number;
  deferredCount: number;
  safeToFixCount: number;
  manualOnly: true;
  inMemoryOnly: true;
  noFilesWritten: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noExternalServicesRequired: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};
