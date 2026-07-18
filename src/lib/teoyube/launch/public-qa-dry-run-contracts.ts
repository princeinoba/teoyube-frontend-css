import type {
  TeoyubePublicLaunchQaCheck,
  TeoyubePublicLaunchQaDecision,
  TeoyubePublicLaunchQaResult
} from "./public-launch-qa-contracts";
import type { TeoyubePublicSurfaceCopyBlocker, TeoyubePublicSurfaceCopyWarning } from "./public-surface-copy-contracts";

export type TeoyubePublicQaDryRunStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubePublicQaDryRun = {
  id: string;
  label: string;
  checklist: TeoyubePublicLaunchQaCheck[];
  results: TeoyubePublicLaunchQaResult[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  createdAt: string;
};

export type TeoyubePublicQaDryRunReport = {
  valid: boolean;
  ready: boolean;
  status: TeoyubePublicQaDryRunStatus;
  decision: TeoyubePublicLaunchQaDecision | "ready_for_final_qa_dry_run";
  run: TeoyubePublicQaDryRun;
  checkCount: number;
  passCount: number;
  warningCount: number;
  blockerCount: number;
  blockers: TeoyubePublicSurfaceCopyBlocker[];
  warnings: TeoyubePublicSurfaceCopyWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalAnalyticsSent: true;
  noProductionPersistenceEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};
