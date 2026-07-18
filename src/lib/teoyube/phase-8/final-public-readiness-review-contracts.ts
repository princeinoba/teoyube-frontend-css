export type TeoyubeFinalPublicReadinessStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeFinalPublicReadinessArea =
  | "phase_8_readiness"
  | "product_hardening"
  | "privacy_security"
  | "service_decision_locks"
  | "public_release_candidate"
  | "known_limitations"
  | "support_feedback"
  | "safety_readiness"
  | "mobile_accessibility"
  | "performance"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "owner_review"
  | "unknown";

export type TeoyubeFinalPublicReadinessDecision =
  | "ready_for_phase_9_planning"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_privacy_security_review"
  | "needs_service_lock_review"
  | "unknown";

export type TeoyubeFinalPublicReadinessEvidence = {
  id: string;
  area: TeoyubeFinalPublicReadinessArea;
  label: string;
  details: string;
};

export type TeoyubeFinalPublicReadinessBlocker = {
  id: string;
  area: TeoyubeFinalPublicReadinessArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeFinalPublicReadinessWarning = {
  id: string;
  area: TeoyubeFinalPublicReadinessArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeFinalPublicReadinessCheck = {
  id: string;
  area: TeoyubeFinalPublicReadinessArea;
  label: string;
  passed: boolean;
  details: string;
  evidence: TeoyubeFinalPublicReadinessEvidence[];
};

export type TeoyubeFinalPublicReadinessRisk = {
  id: string;
  area: TeoyubeFinalPublicReadinessArea;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubeFinalPublicReadinessReport = {
  valid: boolean;
  status: TeoyubeFinalPublicReadinessStatus;
  decision: TeoyubeFinalPublicReadinessDecision;
  checks: TeoyubeFinalPublicReadinessCheck[];
  blockers: TeoyubeFinalPublicReadinessBlocker[];
  warnings: TeoyubeFinalPublicReadinessWarning[];
  risks: TeoyubeFinalPublicReadinessRisk[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
