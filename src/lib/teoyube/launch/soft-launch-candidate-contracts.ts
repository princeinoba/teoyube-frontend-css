import type { ISODateString } from "../../tig";
import type { TeoyubeSoftLaunchCandidateStatus } from "./preview-deployment-contracts";

export type TeoyubeSoftLaunchDecision =
  | "ready_for_soft_launch_candidate"
  | "ready_after_manual_review"
  | "blocked"
  | "needs_preview_deployment_first"
  | "needs_qa_fix"
  | "unknown";

export type TeoyubeSoftLaunchScope = {
  id: string;
  label: string;
  audience: "internal_review" | "limited_preview_later";
  notes: string[];
};

export type TeoyubeSoftLaunchSurface = {
  id: string;
  label: string;
  route?: string;
  included: boolean;
  mobileFirstQaRequired: boolean;
  scriptureQaRequired: boolean;
  explanationQaRequired: boolean;
  fallbackQaRequired: boolean;
  consentQaRequired: boolean;
  accessibilityQaRequired: boolean;
};

export type TeoyubeSoftLaunchChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
  manualReviewRequired?: boolean;
};

export type TeoyubeSoftLaunchRisk = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
};

export type TeoyubeSoftLaunchFeedbackPlan = {
  collectionMode: "manual_only";
  channels: string[];
  questions: string[];
  privacyNotes: string[];
};

export type TeoyubeSoftLaunchMonitoringPlan = {
  monitoringMode: "manual_review_only";
  checks: string[];
  disabledUntilLater: string[];
};

export type TeoyubeSoftLaunchRollbackCriteria = {
  triggers: string[];
  steps: string[];
};

export type TeoyubeSoftLaunchCandidate = {
  id: string;
  label: string;
  status: TeoyubeSoftLaunchCandidateStatus;
  scope: TeoyubeSoftLaunchScope;
  surfaces: TeoyubeSoftLaunchSurface[];
  checklist: TeoyubeSoftLaunchChecklistItem[];
  risks: TeoyubeSoftLaunchRisk[];
  feedbackPlan: TeoyubeSoftLaunchFeedbackPlan;
  monitoringPlan: TeoyubeSoftLaunchMonitoringPlan;
  rollbackCriteria: TeoyubeSoftLaunchRollbackCriteria;
  generatedAt: ISODateString;
};

export type TeoyubeSoftLaunchReadinessReport = {
  status: TeoyubeSoftLaunchCandidateStatus;
  decision: TeoyubeSoftLaunchDecision;
  ready: boolean;
  checklistCount: number;
  completeChecklistCount: number;
  surfaceCount: number;
  risks: TeoyubeSoftLaunchRisk[];
  candidate: TeoyubeSoftLaunchCandidate;
  generatedAt: ISODateString;
};

