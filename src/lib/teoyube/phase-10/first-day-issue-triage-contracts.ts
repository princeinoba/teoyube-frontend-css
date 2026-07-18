export type TeoyubeFirstDayIssueSeverity =
  | "severity_1_critical"
  | "severity_2_high"
  | "severity_3_medium"
  | "severity_4_low";

export type TeoyubeFirstDayIssueArea =
  | "app_load"
  | "route_crash"
  | "private_data_exposure"
  | "secret_exposure"
  | "spiritual_safety"
  | "tig_failure"
  | "canon_failure"
  | "calling_compass_failure"
  | "visual_graph_failure"
  | "feedback_failure"
  | "mobile_blocker"
  | "desktop_layout"
  | "content_typo"
  | "minor_layout"
  | "future_enhancement"
  | "unknown";

export type TeoyubeFirstDayIssueStatus =
  | "new"
  | "reviewing"
  | "confirmed"
  | "not_reproducible"
  | "accepted_known_issue"
  | "safe_fix_requested"
  | "safe_fix_approved"
  | "safe_fix_rejected"
  | "resolved"
  | "deferred"
  | "rollback_required"
  | "unknown";

export type TeoyubeFirstDayIssueSource =
  | "owner_observation"
  | "manual_feedback"
  | "first_hour_monitoring"
  | "route_qa"
  | "build_verification"
  | "content_review"
  | "unknown";

export type TeoyubeFirstDayIssueTriageDecision =
  | "continue"
  | "pause"
  | "rollback"
  | "fix_before_continue"
  | "add_to_safe_fix_queue"
  | "defer_to_backlog"
  | "unknown";

export type TeoyubeFirstDayIssue = {
  id: string;
  source: TeoyubeFirstDayIssueSource;
  area: TeoyubeFirstDayIssueArea;
  severity: TeoyubeFirstDayIssueSeverity;
  status: TeoyubeFirstDayIssueStatus;
  summary: string;
  affectedRouteOrSurface?: string;
  scriptureSafetyConcern: boolean;
  privateOrSecretExposure: boolean;
  notes: string[];
};

export type TeoyubeFirstDayIssueTriageResult = {
  issue: TeoyubeFirstDayIssue;
  decision: TeoyubeFirstDayIssueTriageDecision;
  rationale: string;
  safeFixCandidate: boolean;
  rollbackReviewRequired: boolean;
};

export type TeoyubeFirstDayIssueTriageBlocker = {
  id: string;
  issueId: string;
  message: string;
};

export type TeoyubeFirstDayIssueTriageWarning = {
  id: string;
  issueId: string;
  message: string;
};

export type TeoyubeFirstDayIssueTriageReport = {
  valid: boolean;
  result: TeoyubeFirstDayIssueTriageResult;
  blockers: TeoyubeFirstDayIssueTriageBlocker[];
  warnings: TeoyubeFirstDayIssueTriageWarning[];
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
