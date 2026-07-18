export type TeoyubeFinalPublicOwnerApprovalStatus =
  | "approved"
  | "approved_with_warnings"
  | "not_approved"
  | "needs_review"
  | "blocked"
  | "unknown";

export type TeoyubeFinalPublicOwnerApprovalDecision =
  | "approved_for_controlled_public_release_execution_planning"
  | "approved_with_warnings"
  | "not_approved"
  | "needs_final_remediation"
  | "needs_privacy_security_review"
  | "needs_service_lock_review"
  | "needs_operational_readiness_review"
  | "unknown";

export type TeoyubeFinalPublicOwnerApprovalCheck = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubeFinalPublicOwnerApprovalRecord = {
  id: string;
  reviewed: boolean;
  status: TeoyubeFinalPublicOwnerApprovalStatus;
  checklist: TeoyubeFinalPublicOwnerApprovalCheck[];
  nextPhaseAccepted: boolean;
  notes: string[];
  noSignatureRequired: true;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeFinalPublicOwnerApprovalBlocker = {
  id: string;
  message: string;
};

export type TeoyubeFinalPublicOwnerApprovalWarning = {
  id: string;
  message: string;
};

export type TeoyubeFinalPublicOwnerApprovalReport = {
  valid: boolean;
  decision: TeoyubeFinalPublicOwnerApprovalDecision;
  record: TeoyubeFinalPublicOwnerApprovalRecord;
  blockers: TeoyubeFinalPublicOwnerApprovalBlocker[];
  warnings: TeoyubeFinalPublicOwnerApprovalWarning[];
  noSignatureRequired: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
