export type TeoyubeBetaReadinessReviewStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "manual_review_required"
  | "unknown";

export type TeoyubeBetaReadinessReviewArea =
  | "real_data_flow"
  | "user_journey"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "reviewed_content_gate"
  | "controlled_admin_prototype"
  | "service_disabled_state"
  | "mobile"
  | "accessibility"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "unknown";

export type TeoyubeBetaReadinessReviewDecision =
  | "ready_for_controlled_beta_preparation"
  | "ready_with_warnings"
  | "blocked"
  | "needs_content_review"
  | "needs_service_lock_review"
  | "needs_ui_fix"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeBetaReadinessNextAction =
  | "Phase 5.1 - Controlled Beta Preparation, Manual QA Execution Plan & Service Gate Review"
  | "Resolve blockers before Phase 5"
  | "Owner review"
  | "Manual beta QA"
  | "Unknown";

export type TeoyubeBetaReadinessReviewBlocker = {
  id: string;
  area: TeoyubeBetaReadinessReviewArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaReadinessReviewWarning = {
  id: string;
  area: TeoyubeBetaReadinessReviewArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaReadinessReviewRisk = {
  id: string;
  area: TeoyubeBetaReadinessReviewArea;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "accepted" | "mitigated";
  message: string;
  mitigation: string;
};

export type TeoyubeBetaReadinessReviewCheck = {
  id: string;
  area: TeoyubeBetaReadinessReviewArea;
  label: string;
  status: TeoyubeBetaReadinessReviewStatus;
  passed: boolean;
  details: string;
  blockers: TeoyubeBetaReadinessReviewBlocker[];
  warnings: TeoyubeBetaReadinessReviewWarning[];
};

export type TeoyubeBetaReadinessReviewReport = {
  valid: boolean;
  decision: TeoyubeBetaReadinessReviewDecision;
  status: TeoyubeBetaReadinessReviewStatus;
  checks: TeoyubeBetaReadinessReviewCheck[];
  blockers: TeoyubeBetaReadinessReviewBlocker[];
  warnings: TeoyubeBetaReadinessReviewWarning[];
  risks: TeoyubeBetaReadinessReviewRisk[];
  nextAction: TeoyubeBetaReadinessNextAction;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  reviewOnlyContentNotPublished: true;
  inMemoryOnly: true;
  generatedAt: string;
};
