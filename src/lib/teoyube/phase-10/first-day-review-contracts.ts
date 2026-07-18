export type TeoyubeFirstDayReviewStatus =
  | "not_started"
  | "reviewing"
  | "complete"
  | "complete_with_warnings"
  | "safe_fixes_required"
  | "paused"
  | "rollback_required"
  | "blocked"
  | "unknown";

export type TeoyubeFirstDayReviewArea =
  | "first_hour_summary"
  | "issue_triage"
  | "manual_feedback"
  | "safe_fix_queue"
  | "known_issues"
  | "rollback_readiness"
  | "owner_decision"
  | "next_day_watch"
  | "first_week_stabilization"
  | "unknown";

export type TeoyubeFirstDayReviewDecision =
  | "continue_controlled_release"
  | "continue_with_watch"
  | "pause_promotion"
  | "rollback_required"
  | "safe_fixes_required_before_continue"
  | "move_to_first_week_stabilization"
  | "blocked"
  | "unknown";

export type TeoyubeFirstDayReviewCheck = {
  id: string;
  area: TeoyubeFirstDayReviewArea;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
};

export type TeoyubeFirstDayReviewRecord = {
  id: string;
  status: TeoyubeFirstDayReviewStatus;
  checks: TeoyubeFirstDayReviewCheck[];
  ownerDecision: TeoyubeFirstDayReviewDecision;
  nextDayWatchItems: string[];
  firstWeekStabilizationReady: boolean;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeFirstDayReviewBlocker = {
  id: string;
  area: TeoyubeFirstDayReviewArea;
  message: string;
};

export type TeoyubeFirstDayReviewWarning = {
  id: string;
  area: TeoyubeFirstDayReviewArea;
  message: string;
};

export type TeoyubeFirstDayReviewReport = {
  valid: boolean;
  decision: TeoyubeFirstDayReviewDecision;
  record: TeoyubeFirstDayReviewRecord;
  blockers: TeoyubeFirstDayReviewBlocker[];
  warnings: TeoyubeFirstDayReviewWarning[];
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
