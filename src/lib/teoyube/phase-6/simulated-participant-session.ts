import type {
  TeoyubeSimulatedParticipantBoundaryCheck,
  TeoyubeSimulatedParticipantInstruction,
  TeoyubeSimulatedParticipantObservation,
  TeoyubeSimulatedParticipantSession,
  TeoyubeSimulatedParticipantSessionBlocker,
  TeoyubeSimulatedParticipantSessionDecision,
  TeoyubeSimulatedParticipantSessionReport,
  TeoyubeSimulatedParticipantSessionStatus,
  TeoyubeSimulatedParticipantSessionWarning,
  TeoyubeSimulatedParticipantStep
} from "./simulated-participant-session-contracts";

export type TeoyubeSimulatedParticipantSessionInput = Partial<{
  observations: TeoyubeSimulatedParticipantObservation[];
  privacyReminderVisible: boolean;
  knownLimitationsVisible: boolean;
  sensitiveInfoReminderVisible: boolean;
  automaticContactEnabled: boolean;
  participantIdentityStored: boolean;
  persistenceEnabled: boolean;
  automaticFeedbackCollectionEnabled: boolean;
}>;

function now(): string {
  return new Date().toISOString();
}

export function getSimulatedParticipantSessionSteps(): TeoyubeSimulatedParticipantStep[] {
  return [
    { id: "receive_manual_instruction", label: "Participant receives manual instruction", order: 1, manualOnly: true, details: "Instruction is reviewed manually and not sent by code." },
    { id: "see_known_limitations", label: "Participant sees known limitations", order: 2, manualOnly: true, details: "Known limitations are visible before surface walkthrough." },
    { id: "see_privacy_consent", label: "Participant sees privacy/consent reminder", order: 3, manualOnly: true, details: "Privacy and consent reminders are visible." },
    { id: "use_surfaces_manually", label: "Participant uses Teoyube surfaces manually", order: 4, manualOnly: true, details: "WordCard, Promise Table, Prayer, Calling, TIG, and fallbacks are simulated manually." },
    { id: "avoid_sensitive_info", label: "Participant avoids sensitive personal information", order: 5, manualOnly: true, details: "Participant is reminded not to submit sensitive information." },
    { id: "manual_feedback_outside_collection", label: "Participant provides manual feedback outside automatic collection", order: 6, manualOnly: true, details: "Feedback is represented by sanitized owner observations only." },
    { id: "owner_records_sanitized_observations", label: "Owner records sanitized observations manually", order: 7, manualOnly: true, details: "Observations are in-memory and simulated only." }
  ];
}

function instructions(input: TeoyubeSimulatedParticipantSessionInput = {}): TeoyubeSimulatedParticipantInstruction[] {
  return [
    { id: "manual_instruction", label: "Manual instruction", text: "This is a simulated dry run; no participant is contacted by code.", visible: true },
    { id: "known_limitations", label: "Known limitations", text: "Known limitations are reviewed before the simulated walkthrough.", visible: input.knownLimitationsVisible !== false },
    { id: "privacy_consent", label: "Privacy/consent reminder", text: "Do not submit sensitive personal, crisis, medical, legal, financial, or emergency information.", visible: input.privacyReminderVisible !== false },
    { id: "manual_feedback", label: "Manual feedback reminder", text: "Feedback is represented by sanitized owner observations only.", visible: true }
  ];
}

function boundaryChecks(input: TeoyubeSimulatedParticipantSessionInput = {}): TeoyubeSimulatedParticipantBoundaryCheck[] {
  return [
    { id: "no_contact", label: "No user contact", passed: !input.automaticContactEnabled, details: "No participant contact is made by code." },
    { id: "no_identity_storage", label: "No participant identity storage", passed: !input.participantIdentityStored, details: "No participant identity is stored." },
    { id: "no_persistence", label: "No persistence", passed: !input.persistenceEnabled, details: "Session is in-memory only." },
    { id: "no_auto_feedback", label: "No automatic feedback collection", passed: !input.automaticFeedbackCollectionEnabled, details: "Feedback is not collected automatically." },
    { id: "privacy_visible", label: "Privacy/consent reminder visible", passed: input.privacyReminderVisible !== false, details: "Privacy reminder is visible." },
    { id: "known_limitations_visible", label: "Known limitations visible", passed: input.knownLimitationsVisible !== false, details: "Known limitations are visible." },
    { id: "sensitive_info_reminder", label: "Sensitive information reminder visible", passed: input.sensitiveInfoReminderVisible !== false, details: "Sensitive information reminder is visible." }
  ];
}

export function createSimulatedParticipantSession(input: TeoyubeSimulatedParticipantSessionInput = {}): TeoyubeSimulatedParticipantSession {
  const createdAt = now();
  return {
    id: "phase_6_2_simulated_participant_session",
    status: "not_started",
    steps: getSimulatedParticipantSessionSteps(),
    instructions: instructions(input),
    observations: input.observations || [],
    boundaryChecks: boundaryChecks(input),
    storesParticipantIdentity: false,
    noUsersContacted: true,
    noPersistence: true,
    noAutomaticFeedbackCollection: true,
    inMemoryOnly: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordSimulatedParticipantObservation(session: TeoyubeSimulatedParticipantSession, observation: Omit<TeoyubeSimulatedParticipantObservation, "id" | "recordedByOwner" | "simulatedOnly" | "createdAt"> & { id?: string }): TeoyubeSimulatedParticipantSession {
  return {
    ...session,
    status: "in_progress",
    observations: [
      ...session.observations,
      {
        ...observation,
        id: observation.id || `simulated_observation_${session.observations.length + 1}`,
        recordedByOwner: true,
        simulatedOnly: true,
        createdAt: now()
      }
    ],
    updatedAt: now()
  };
}

export function validateSimulatedParticipantBoundaries(session: TeoyubeSimulatedParticipantSession): TeoyubeSimulatedParticipantBoundaryCheck[] {
  return session.boundaryChecks;
}

export function getSimulatedParticipantSessionBlockers(session: TeoyubeSimulatedParticipantSession): TeoyubeSimulatedParticipantSessionBlocker[] {
  return validateSimulatedParticipantBoundaries(session)
    .filter((entry) => !entry.passed)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      message: `${entry.label} failed.`,
      requiredAction: entry.details
    }));
}

export function getSimulatedParticipantSessionWarnings(session: TeoyubeSimulatedParticipantSession): TeoyubeSimulatedParticipantSessionWarning[] {
  return [
    ...(!session.observations.length ? [{
      id: "no_observations_recorded",
      message: "No sanitized observations have been recorded.",
      recommendedAction: "Record simulated owner observations during the dry run."
    }] : []),
    ...session.instructions.filter((entry) => !entry.visible).map((entry) => ({
      id: `${entry.id}_not_visible`,
      message: `${entry.label} is not visible.`,
      recommendedAction: "Restore participant-facing instruction visibility."
    }))
  ];
}

export function createSimulatedParticipantSessionDecision(session: TeoyubeSimulatedParticipantSession): TeoyubeSimulatedParticipantSessionDecision {
  const blockers = getSimulatedParticipantSessionBlockers(session);
  const warnings = getSimulatedParticipantSessionWarnings(session);
  if (blockers.length) return "session_simulation_blocked";
  return warnings.length ? "session_simulation_passed_with_warnings" : "session_simulation_passed";
}

function statusFromDecision(decision: TeoyubeSimulatedParticipantSessionDecision): TeoyubeSimulatedParticipantSessionStatus {
  if (decision === "session_simulation_passed") return "completed";
  if (decision === "session_simulation_passed_with_warnings") return "completed_with_warnings";
  if (decision === "session_simulation_blocked") return "blocked";
  if (decision === "needs_owner_review") return "in_progress";
  return "unknown";
}

export function createSimulatedParticipantSessionReport(session: TeoyubeSimulatedParticipantSession): TeoyubeSimulatedParticipantSessionReport {
  const blockers = getSimulatedParticipantSessionBlockers(session);
  const decision = createSimulatedParticipantSessionDecision(session);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    session,
    blockers,
    warnings: getSimulatedParticipantSessionWarnings(session),
    storesParticipantIdentity: false,
    noUsersContacted: true,
    noPersistence: true,
    noAutomaticFeedbackCollection: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

