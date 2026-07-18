export type TeoyubePublicReleaseReadinessGateStatus =
  | "planned"
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleaseReadinessArea =
  | "product_hardening"
  | "mobile_accessibility"
  | "performance_review"
  | "privacy_security"
  | "controlled_service_decisions"
  | "public_copy"
  | "known_limitations"
  | "support_workflow"
  | "manual_feedback_boundaries"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "owner_review"
  | "unknown";

export type TeoyubePublicReleaseReadinessDecision =
  | "ready_for_public_release_candidate_planning"
  | "ready_with_warnings"
  | "blocked"
  | "needs_product_hardening"
  | "needs_privacy_security_review"
  | "needs_service_decision_review"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicReleaseReadinessEvidence = {
  id: string;
  area: TeoyubePublicReleaseReadinessArea;
  label: string;
  details: string;
};

export type TeoyubePublicReleaseReadinessRisk = {
  id: string;
  area: TeoyubePublicReleaseReadinessArea;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePublicReleaseReadinessCheck = {
  id: string;
  area: TeoyubePublicReleaseReadinessArea;
  label: string;
  passed: boolean;
  details: string;
  evidence: TeoyubePublicReleaseReadinessEvidence[];
};

export type TeoyubePublicReleaseReadinessBlocker = {
  id: string;
  area: TeoyubePublicReleaseReadinessArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePublicReleaseReadinessWarning = {
  id: string;
  area: TeoyubePublicReleaseReadinessArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicReleaseReadinessReport = {
  valid: boolean;
  status: TeoyubePublicReleaseReadinessGateStatus;
  decision: TeoyubePublicReleaseReadinessDecision;
  checks: TeoyubePublicReleaseReadinessCheck[];
  blockers: TeoyubePublicReleaseReadinessBlocker[];
  warnings: TeoyubePublicReleaseReadinessWarning[];
  risks: TeoyubePublicReleaseReadinessRisk[];
  nextActions: string[];
  noPublicLaunchPerformed: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
