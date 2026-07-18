export type TeoyubePublicOperationalHandoffStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicOperationalHandoffArea =
  | "readiness_evidence"
  | "final_owner_approval"
  | "manual_monitoring"
  | "manual_support"
  | "manual_feedback"
  | "issue_triage"
  | "pause_rollback"
  | "service_disabled_state"
  | "privacy_consent"
  | "known_limitations"
  | "scripture_explanation_fallback"
  | "mobile_accessibility"
  | "remaining_risks"
  | "next_phase_plan"
  | "unknown";

export type TeoyubePublicOperationalHandoffItem = {
  id: string;
  area: TeoyubePublicOperationalHandoffArea;
  label: string;
  ready: boolean;
  details: string;
};

export type TeoyubePublicOperationalHandoffBlocker = {
  id: string;
  area: TeoyubePublicOperationalHandoffArea;
  message: string;
};

export type TeoyubePublicOperationalHandoffWarning = {
  id: string;
  area: TeoyubePublicOperationalHandoffArea;
  message: string;
};

export type TeoyubePublicOperationalHandoffDecision =
  | "handoff_ready_for_phase_9_5"
  | "handoff_ready_with_warnings"
  | "handoff_blocked"
  | "unknown";

export type TeoyubePublicOperationalHandoffReport = {
  valid: boolean;
  status: TeoyubePublicOperationalHandoffStatus;
  decision: TeoyubePublicOperationalHandoffDecision;
  items: TeoyubePublicOperationalHandoffItem[];
  blockers: TeoyubePublicOperationalHandoffBlocker[];
  warnings: TeoyubePublicOperationalHandoffWarning[];
  noUsersContacted: true;
  noSchedulingPerformed: true;
  noNotificationsSent: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
