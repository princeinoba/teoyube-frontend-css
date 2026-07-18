export type TeoyubeProductHardeningStatus =
  | "planned"
  | "ready_for_review"
  | "deferred"
  | "blocked"
  | "verified"
  | "unknown";

export type TeoyubeProductHardeningArea =
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "user_journey"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "mobile"
  | "accessibility"
  | "performance"
  | "content_clarity"
  | "support_workflow"
  | "manual_feedback_review"
  | "unknown";

export type TeoyubeProductHardeningPriority = "critical" | "high" | "medium" | "low";
export type TeoyubeProductHardeningRiskLevel = "low" | "medium" | "high" | "blocked";

export type TeoyubeProductHardeningVerificationRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeProductHardeningItem = {
  id: string;
  area: TeoyubeProductHardeningArea;
  title: string;
  summary: string;
  status: TeoyubeProductHardeningStatus;
  priority: TeoyubeProductHardeningPriority;
  riskLevel: TeoyubeProductHardeningRiskLevel;
  source: "phase_7_remaining_risk" | "phase_7_regression_qa" | "phase_7_readiness_score" | "product_stabilization_queue" | "manual_feedback_support" | "mobile_accessibility_regression" | "performance_review" | "owner_planning" | "unknown";
  safeLocalPatchCandidate: boolean;
  deferredReason?: string;
  blockedReason?: string;
  verificationRequirements: TeoyubeProductHardeningVerificationRequirement[];
  preservesScriptureAnchors: boolean;
  preservesExplanationTraces: boolean;
  preservesFallbackSafety: boolean;
  preservesConfidenceLabels: boolean;
  preservesPrivacyConsent: boolean;
  noServiceConnection: true;
  noProductionJsonWrite: true;
  noAutomaticPublishing: true;
  noBrowserPersistence: true;
  noHiddenPersonalization: true;
  noDivineCertaintyClaimed: true;
};

export type TeoyubeProductHardeningDecision =
  | "hardening_plan_ready"
  | "hardening_plan_ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeProductHardeningBlocker = {
  id: string;
  itemId?: string;
  area: TeoyubeProductHardeningArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeProductHardeningWarning = {
  id: string;
  itemId?: string;
  area: TeoyubeProductHardeningArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeProductHardeningPlan = {
  id: string;
  items: TeoyubeProductHardeningItem[];
  noProductChangesApplied: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeProductHardeningReport = {
  valid: boolean;
  decision: TeoyubeProductHardeningDecision;
  plan: TeoyubeProductHardeningPlan;
  blockers: TeoyubeProductHardeningBlocker[];
  warnings: TeoyubeProductHardeningWarning[];
  highPriorityItems: TeoyubeProductHardeningItem[];
  deferredItems: TeoyubeProductHardeningItem[];
  blockedItems: TeoyubeProductHardeningItem[];
  noProductChangesApplied: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
