import type { TeoyubeLaunchIssueArea, TeoyubeLaunchIssueSeverity } from "./launch-issue-classification-contracts";

export type TeoyubeLaunchDecisionType =
  | "start_release"
  | "continue_release"
  | "continue_with_warnings"
  | "pause_release"
  | "rollback_release"
  | "safe_fix_approved"
  | "safe_fix_rejected"
  | "resume_release"
  | "end_first_hour_monitoring"
  | "unknown";

export type TeoyubeLaunchDecisionStatus =
  | "draft"
  | "recorded"
  | "owner_review_required"
  | "superseded"
  | "unknown";

export type TeoyubeLaunchDecisionReason =
  | "all_core_checks_passed"
  | "minor_warnings_only"
  | "critical_issue_found"
  | "high_priority_issue_found"
  | "private_data_risk"
  | "secret_exposure_risk"
  | "spiritual_safety_risk"
  | "rollback_required"
  | "owner_choice"
  | "unknown";

export type TeoyubeLaunchDecisionLogEntry = {
  id: string;
  timestamp: string;
  decisionType: TeoyubeLaunchDecisionType;
  status: TeoyubeLaunchDecisionStatus;
  releaseOwner: string;
  decisionReason: TeoyubeLaunchDecisionReason;
  affectedArea: TeoyubeLaunchIssueArea | "unknown";
  issueSeverity?: TeoyubeLaunchIssueSeverity;
  summary: string;
  actionTaken: string;
  conditions: string[];
  rollbackRequired: boolean;
  followUpRequired: boolean;
  notes: string[];
};

export type TeoyubeLaunchDecisionLog = {
  id: string;
  entries: TeoyubeLaunchDecisionLogEntry[];
  noExternalStorage: true;
  noAutomaticUserContact: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeLaunchDecisionLogBlocker = {
  id: string;
  message: string;
};

export type TeoyubeLaunchDecisionLogWarning = {
  id: string;
  message: string;
};

export type TeoyubeLaunchDecisionLogReport = {
  valid: boolean;
  log: TeoyubeLaunchDecisionLog;
  latestDecision?: TeoyubeLaunchDecisionLogEntry;
  blockers: TeoyubeLaunchDecisionLogBlocker[];
  warnings: TeoyubeLaunchDecisionLogWarning[];
  noExternalStorage: true;
  noAutomaticUserContact: true;
  inMemoryOnly: true;
  generatedAt: string;
};
