export type TeoyubeFinalOwnerApprovalGateStatus =
  | "approved"
  | "approved_with_warnings"
  | "not_approved"
  | "blocked"
  | "unknown";

export type TeoyubeFinalOwnerApprovalGateDecision =
  | "approved_for_public_release_candidate_qa"
  | "approved_with_warnings"
  | "not_approved"
  | "needs_copy_review"
  | "needs_privacy_security_review"
  | "needs_service_lock_review"
  | "needs_operational_readiness_review"
  | "unknown";

export type TeoyubeFinalOwnerApprovalGateCheck = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubeFinalOwnerApprovalGateRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubeFinalOwnerApprovalGateCheck[];
  nextPhaseAccepted: boolean;
  notes: string[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeFinalOwnerApprovalGateBlocker = {
  id: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeFinalOwnerApprovalGateWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeFinalOwnerApprovalGateReport = {
  valid: boolean;
  status: TeoyubeFinalOwnerApprovalGateStatus;
  decision: TeoyubeFinalOwnerApprovalGateDecision;
  record: TeoyubeFinalOwnerApprovalGateRecord;
  blockers: TeoyubeFinalOwnerApprovalGateBlocker[];
  warnings: TeoyubeFinalOwnerApprovalGateWarning[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
