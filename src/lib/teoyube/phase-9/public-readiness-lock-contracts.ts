export type TeoyubePublicReadinessLockStatus =
  | "locked"
  | "locked_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicReadinessLockedArea =
  | "manual_public_release_only"
  | "owner_approval_required"
  | "public_copy"
  | "privacy_consent"
  | "sensitive_data_warning"
  | "known_limitations"
  | "manual_support"
  | "manual_feedback"
  | "manual_issue_triage"
  | "manual_monitoring"
  | "pause_rollback"
  | "service_disabled_state"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "mobile_accessibility"
  | "operational_handoff"
  | "unknown";

export type TeoyubePublicReadinessLockedItem = {
  id: string;
  area: TeoyubePublicReadinessLockedArea;
  label: string;
  locked: boolean;
  details: string;
};

export type TeoyubePublicReadinessLockRule = {
  id: string;
  area: TeoyubePublicReadinessLockedArea;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubePublicReadinessLockBlocker = {
  id: string;
  area: TeoyubePublicReadinessLockedArea;
  message: string;
};

export type TeoyubePublicReadinessLockWarning = {
  id: string;
  area: TeoyubePublicReadinessLockedArea;
  message: string;
};

export type TeoyubePublicReadinessLockDecision =
  | "locked_ready_for_phase_10_planning"
  | "locked_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicReadinessLockReport = {
  valid: boolean;
  status: TeoyubePublicReadinessLockStatus;
  decision: TeoyubePublicReadinessLockDecision;
  lockedItems: TeoyubePublicReadinessLockedItem[];
  rules: TeoyubePublicReadinessLockRule[];
  blockers: TeoyubePublicReadinessLockBlocker[];
  warnings: TeoyubePublicReadinessLockWarning[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
