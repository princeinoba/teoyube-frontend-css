import type {
  TeoyubeSoftLaunchFeedbackTriageCategory,
  TeoyubeSoftLaunchFeedbackTriageSeverity,
  TeoyubeSoftLaunchFixQueueItem,
  TeoyubeSoftLaunchFixQueuePriority
} from "./soft-launch-feedback-triage-contracts";

export type TeoyubeSoftLaunchFixQueueStatus =
  | "new"
  | "queued"
  | "planned"
  | "in_progress"
  | "fixed"
  | "verified"
  | "deferred"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchFixQueueRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeSoftLaunchFixQueueDecision =
  | "continue_soft_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchFixVerificationRequirement = {
  id: string;
  label: string;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  required: boolean;
  launchCritical: boolean;
};

export type TeoyubeSoftLaunchFixQueue = {
  id: string;
  label: string;
  items: TeoyubeSoftLaunchFixQueueItem[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  generatedAt: string;
};

export type TeoyubeSoftLaunchFixQueueBlocker = {
  id: string;
  label: string;
  priority: TeoyubeSoftLaunchFixQueuePriority;
  riskLevel: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeSoftLaunchFixQueueWarning = {
  id: string;
  label: string;
  riskLevel: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeSoftLaunchFixQueueReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeSoftLaunchFixQueueDecision;
  queue: TeoyubeSoftLaunchFixQueue;
  itemCount: number;
  launchBlockerCount: number;
  blockers: TeoyubeSoftLaunchFixQueueBlocker[];
  warnings: TeoyubeSoftLaunchFixQueueWarning[];
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeSoftLaunchFixQueueItemInput = Partial<TeoyubeSoftLaunchFixQueueItem> & {
  title: string;
  category: TeoyubeSoftLaunchFeedbackTriageCategory;
  severity?: TeoyubeSoftLaunchFeedbackTriageSeverity;
};
