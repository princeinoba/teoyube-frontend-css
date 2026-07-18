export type TeoyubeSimulatedParticipantSessionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "completed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeSimulatedParticipantSessionDecision =
  | "session_simulation_passed"
  | "session_simulation_passed_with_warnings"
  | "session_simulation_blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeSimulatedParticipantStep = {
  id: string;
  label: string;
  order: number;
  manualOnly: true;
  details: string;
};

export type TeoyubeSimulatedParticipantInstruction = {
  id: string;
  label: string;
  text: string;
  visible: boolean;
};

export type TeoyubeSimulatedParticipantObservation = {
  id: string;
  surface: string;
  note: string;
  sanitized: boolean;
  recordedByOwner: true;
  simulatedOnly: true;
  createdAt: string;
};

export type TeoyubeSimulatedParticipantBoundaryCheck = {
  id: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeSimulatedParticipantSession = {
  id: string;
  status: TeoyubeSimulatedParticipantSessionStatus;
  steps: TeoyubeSimulatedParticipantStep[];
  instructions: TeoyubeSimulatedParticipantInstruction[];
  observations: TeoyubeSimulatedParticipantObservation[];
  boundaryChecks: TeoyubeSimulatedParticipantBoundaryCheck[];
  storesParticipantIdentity: false;
  noUsersContacted: true;
  noPersistence: true;
  noAutomaticFeedbackCollection: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeSimulatedParticipantSessionBlocker = {
  id: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeSimulatedParticipantSessionWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSimulatedParticipantSessionReport = {
  valid: boolean;
  status: TeoyubeSimulatedParticipantSessionStatus;
  decision: TeoyubeSimulatedParticipantSessionDecision;
  session: TeoyubeSimulatedParticipantSession;
  blockers: TeoyubeSimulatedParticipantSessionBlocker[];
  warnings: TeoyubeSimulatedParticipantSessionWarning[];
  storesParticipantIdentity: false;
  noUsersContacted: true;
  noPersistence: true;
  noAutomaticFeedbackCollection: true;
  inMemoryOnly: true;
  generatedAt: string;
};

