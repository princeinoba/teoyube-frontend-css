import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeWeeklyImprovementLoopStatus =
  | "new"
  | "reviewing"
  | "categorized"
  | "watching"
  | "safe_fix_candidate"
  | "backlog"
  | "prioritized"
  | "resolved"
  | "unknown";

export type TeoyubeWeeklyImprovementLoopCadence =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "as_needed"
  | "unknown";

export type TeoyubeWeeklyImprovementLoopArea =
  | "manual_feedback"
  | "known_issues"
  | "safe_fixes"
  | "content_clarity"
  | "spiritual_safety"
  | "mobile_usability"
  | "route_stability"
  | "public_trust"
  | "known_limitations"
  | "roadmap"
  | "documentation"
  | "unknown";

export type TeoyubeWeeklyImprovementLoopDecision =
  | "no_action"
  | "watch"
  | "safe_fix_candidate"
  | "add_to_backlog"
  | "prioritize_next_cycle"
  | "pause_release"
  | "rollback_required"
  | "unknown";

export type TeoyubeWeeklyImprovementLoopItem = {
  id: string;
  cadence: TeoyubeWeeklyImprovementLoopCadence;
  area: TeoyubeWeeklyImprovementLoopArea;
  status: TeoyubeWeeklyImprovementLoopStatus;
  summary: string;
  issueSeverity?: TeoyubeFirstDayIssueSeverity;
  repeatedIssue: boolean;
  affectsSafetyBoundary: boolean;
  roadmapChangeNeeded: boolean;
  notes: string[];
};

export type TeoyubeWeeklyImprovementLoopReview = {
  item: TeoyubeWeeklyImprovementLoopItem;
  decision: TeoyubeWeeklyImprovementLoopDecision;
  rationale: string;
};

export type TeoyubeWeeklyImprovementLoopBlocker = {
  id: string;
  itemId: string;
  message: string;
};

export type TeoyubeWeeklyImprovementLoopWarning = {
  id: string;
  itemId: string;
  message: string;
};

export type TeoyubeWeeklyImprovementLoopReport = {
  valid: boolean;
  checklist: Array<{ id: string; label: string; passed: boolean; details: string }>;
  reviews: TeoyubeWeeklyImprovementLoopReview[];
  blockers: TeoyubeWeeklyImprovementLoopBlocker[];
  warnings: TeoyubeWeeklyImprovementLoopWarning[];
  decision: TeoyubeWeeklyImprovementLoopDecision;
  noAutomaticFeedbackCollection: true;
  noSensitiveDataStoredInCode: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
