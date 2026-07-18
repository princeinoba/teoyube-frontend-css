export type TeoyubeManualParticipantWorkflowStatus =
  | "planning_only"
  | "manual_ready"
  | "owner_review_required"
  | "blocked"
  | "unknown";

export type TeoyubeManualParticipantWorkflowDecision =
  | "manual_workflow_ready"
  | "manual_workflow_ready_with_warnings"
  | "needs_owner_review"
  | "blocked"
  | "unknown";

export type TeoyubeManualParticipantProfile = {
  id: string;
  label: string;
  role: "internal_reviewer" | "trusted_reviewer" | "limited_beta_participant" | "unknown";
  storesContactData: false;
  contactHandledOutsideCode: true;
  sensitiveInformationRequested: false;
};

export type TeoyubeManualParticipantStep = {
  id: string;
  label: string;
  order: number;
  manualOnly: true;
  details: string;
};

export type TeoyubeManualParticipantInstruction = {
  id: string;
  label: string;
  text: string;
  mustBeReviewedManually: true;
};

export type TeoyubeManualParticipantBoundary = {
  id: string;
  label: string;
  required: true;
  satisfied: boolean;
  details: string;
};

export type TeoyubeManualParticipantWorkflowBlocker = {
  id: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualParticipantWorkflowWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualParticipantWorkflowReport = {
  valid: boolean;
  status: TeoyubeManualParticipantWorkflowStatus;
  decision: TeoyubeManualParticipantWorkflowDecision;
  profile: TeoyubeManualParticipantProfile;
  steps: TeoyubeManualParticipantStep[];
  instructions: TeoyubeManualParticipantInstruction[];
  boundaries: TeoyubeManualParticipantBoundary[];
  blockers: TeoyubeManualParticipantWorkflowBlocker[];
  warnings: TeoyubeManualParticipantWorkflowWarning[];
  noAutomaticInvitation: true;
  noAutomaticContact: true;
  noAutomaticFeedbackCollection: true;
  noSensitivePersonalInformationRequested: true;
  noPersistence: true;
  noHiddenPersonalization: true;
  inMemoryOnly: true;
  generatedAt: string;
};

