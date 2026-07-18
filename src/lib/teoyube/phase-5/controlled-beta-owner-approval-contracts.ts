export type TeoyubeControlledBetaOwnerApprovalStatus =
  | "approved"
  | "approved_with_warnings"
  | "not_approved"
  | "blocked"
  | "unknown";

export type TeoyubeControlledBetaOwnerApprovalDecision =
  | "approved_for_controlled_beta_execution_planning"
  | "approved_with_warnings"
  | "not_approved"
  | "needs_more_remediation"
  | "needs_service_gate_review"
  | "needs_privacy_security_review"
  | "unknown";

export type TeoyubeControlledBetaOwnerApprovalCheck = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubeControlledBetaOwnerApprovalRecord = {
  id: string;
  reviewed: boolean;
  approved: boolean;
  checklist: TeoyubeControlledBetaOwnerApprovalCheck[];
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeControlledBetaOwnerApprovalBlocker = {
  id: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledBetaOwnerApprovalWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledBetaOwnerApprovalReport = {
  valid: boolean;
  status: TeoyubeControlledBetaOwnerApprovalStatus;
  decision: TeoyubeControlledBetaOwnerApprovalDecision;
  record: TeoyubeControlledBetaOwnerApprovalRecord;
  blockers: TeoyubeControlledBetaOwnerApprovalBlocker[];
  warnings: TeoyubeControlledBetaOwnerApprovalWarning[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
