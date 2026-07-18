export type TeoyubeLaunchIssueSeverity =
  | "severity_1_critical"
  | "severity_2_high"
  | "severity_3_medium"
  | "severity_4_low";

export type TeoyubeLaunchIssueArea =
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

export type TeoyubeLaunchIssueStatus =
  | "new"
  | "reviewing"
  | "accepted_known_issue"
  | "fix_required"
  | "paused_release"
  | "rollback_required"
  | "resolved"
  | "deferred"
  | "unknown";

export type TeoyubeLaunchIssueDecision =
  | "continue"
  | "pause"
  | "rollback"
  | "fix_before_continue"
  | "defer_to_stabilization"
  | "unknown";

export type TeoyubeLaunchIssue = {
  id: string;
  area: TeoyubeLaunchIssueArea;
  severity: TeoyubeLaunchIssueSeverity;
  status: TeoyubeLaunchIssueStatus;
  summary: string;
  routeOrSurface?: string;
  scriptureSafetyConcern: boolean;
  privateOrSecretExposure: boolean;
  notes: string[];
};

export type TeoyubeLaunchIssueClassificationResult = {
  issue: TeoyubeLaunchIssue;
  severity: TeoyubeLaunchIssueSeverity;
  decision: TeoyubeLaunchIssueDecision;
  rationale: string;
};

export type TeoyubeLaunchIssueClassificationReport = {
  valid: boolean;
  result: TeoyubeLaunchIssueClassificationResult;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noAutomaticUserContact: true;
  inMemoryOnly: true;
  generatedAt: string;
};
