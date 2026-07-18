import type {
  TeoyubePublicFeedbackTriageCategory,
  TeoyubePublicFeedbackTriageSeverity,
  TeoyubePublicFixQueueItem,
  TeoyubePublicFixQueuePriority
} from "./public-feedback-triage-contracts";

export type TeoyubePublicFixQueueStatus =
  | "new"
  | "queued"
  | "planned"
  | "in_progress"
  | "fixed"
  | "verified"
  | "deferred"
  | "blocked"
  | "unknown";

export type TeoyubePublicFixQueueRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubePublicFixQueueDecision =
  | "continue_public_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "unknown";

export type TeoyubePublicFixVerificationRequirement = {
  id: string;
  label: string;
  category: TeoyubePublicFeedbackTriageCategory;
  required: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePublicFixQueue = {
  id: string;
  label: string;
  items: TeoyubePublicFixQueueItem[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  liveAiOrchestrationEnabled: false;
  generatedAt: string;
};

export type TeoyubePublicFixQueueBlocker = {
  id: string;
  label: string;
  priority: TeoyubePublicFixQueuePriority;
  riskLevel: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicFixQueueWarning = {
  id: string;
  label: string;
  riskLevel: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicFixQueueReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicFixQueueDecision;
  queue: TeoyubePublicFixQueue;
  itemCount: number;
  publicLaunchBlockerCount: number;
  blockers: TeoyubePublicFixQueueBlocker[];
  warnings: TeoyubePublicFixQueueWarning[];
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePublicFixQueueItemInput = Partial<TeoyubePublicFixQueueItem> & {
  title: string;
  category: TeoyubePublicFeedbackTriageCategory;
  severity?: TeoyubePublicFeedbackTriageSeverity;
};
