export type TeoyubeBetaOperationalHandoffStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeBetaOperationalHandoffArea =
  | "manual_qa_evidence"
  | "issue_intake"
  | "feedback_boundaries"
  | "pause_criteria"
  | "rollback_criteria"
  | "support_workflow"
  | "owner_review"
  | "service_disabled_state"
  | "privacy_security"
  | "scripture_explanation_fallback"
  | "mobile_accessibility"
  | "known_limitations"
  | "next_phase_plan"
  | "unknown";

export type TeoyubeBetaOperationalHandoffDecision =
  | "handoff_ready"
  | "handoff_ready_with_warnings"
  | "handoff_blocked"
  | "unknown";

export type TeoyubeBetaOperationalHandoffBlocker = {
  id: string;
  area: TeoyubeBetaOperationalHandoffArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaOperationalHandoffWarning = {
  id: string;
  area: TeoyubeBetaOperationalHandoffArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaOperationalHandoffItem = {
  id: string;
  area: TeoyubeBetaOperationalHandoffArea;
  label: string;
  complete: boolean;
  details: string;
  blockers: TeoyubeBetaOperationalHandoffBlocker[];
  warnings: TeoyubeBetaOperationalHandoffWarning[];
};

export type TeoyubeBetaOperationalHandoffReport = {
  valid: boolean;
  status: TeoyubeBetaOperationalHandoffStatus;
  decision: TeoyubeBetaOperationalHandoffDecision;
  items: TeoyubeBetaOperationalHandoffItem[];
  blockers: TeoyubeBetaOperationalHandoffBlocker[];
  warnings: TeoyubeBetaOperationalHandoffWarning[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noNotificationsSent: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
