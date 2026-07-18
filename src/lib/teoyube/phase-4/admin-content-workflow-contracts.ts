export type TeoyubeAdminContentWorkflowStatus =
  | "design_only"
  | "ready_for_owner_review"
  | "blocked"
  | "future_phase_required"
  | "unknown";

export type TeoyubeAdminContentItemType =
  | "teoyube_word"
  | "promise_cluster"
  | "scripture_anchor"
  | "prayer_prompt"
  | "calling_path"
  | "action_step"
  | "tig_relationship"
  | "surface_copy"
  | "fallback_copy"
  | "unknown";

export type TeoyubeAdminContentReviewState =
  | "draft"
  | "scripture_review"
  | "theology_review"
  | "copy_review"
  | "owner_review"
  | "approved_for_future_release"
  | "blocked"
  | "archived"
  | "unknown";

export type TeoyubeAdminContentRole =
  | "owner"
  | "content_reviewer"
  | "scripture_reviewer"
  | "theology_reviewer"
  | "developer"
  | "unknown";

export type TeoyubeAdminContentAction =
  | "create_draft"
  | "request_scripture_review"
  | "request_theology_review"
  | "request_copy_review"
  | "request_owner_review"
  | "approve_for_future_release"
  | "block"
  | "archive"
  | "rollback"
  | "unknown";

export type TeoyubeAdminContentWorkflowStep = {
  id: string;
  label: string;
  fromState: TeoyubeAdminContentReviewState;
  toState: TeoyubeAdminContentReviewState;
  action: TeoyubeAdminContentAction;
  role: TeoyubeAdminContentRole;
  required: boolean;
  notes: string;
};

export type TeoyubeAdminContentWorkflowBlocker = {
  id: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeAdminContentWorkflowWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeAdminContentWorkflowReport = {
  valid: boolean;
  status: TeoyubeAdminContentWorkflowStatus;
  steps: TeoyubeAdminContentWorkflowStep[];
  reviewStates: TeoyubeAdminContentReviewState[];
  roles: TeoyubeAdminContentRole[];
  approvalRules: string[];
  safetyRules: string[];
  blockers: TeoyubeAdminContentWorkflowBlocker[];
  warnings: TeoyubeAdminContentWorkflowWarning[];
  noAdminUiBuilt: true;
  noAdminAuthAdded: true;
  noDatabasePersistenceEnabled: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
