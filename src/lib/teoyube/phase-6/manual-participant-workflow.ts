import type {
  TeoyubeManualParticipantBoundary,
  TeoyubeManualParticipantInstruction,
  TeoyubeManualParticipantProfile,
  TeoyubeManualParticipantStep,
  TeoyubeManualParticipantWorkflowBlocker,
  TeoyubeManualParticipantWorkflowDecision,
  TeoyubeManualParticipantWorkflowReport,
  TeoyubeManualParticipantWorkflowStatus,
  TeoyubeManualParticipantWorkflowWarning
} from "./manual-participant-workflow-contracts";

export type TeoyubeManualParticipantWorkflowInput = Partial<{
  role: TeoyubeManualParticipantProfile["role"];
  ownerReviewed: boolean;
  automaticInvitationEnabled: boolean;
  automaticContactEnabled: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  sensitivePersonalInformationRequested: boolean;
  emergencyAdviceDependenceAllowed: boolean;
  hiddenPersonalizationEnabled: boolean;
  persistenceEnabled: boolean;
  consentPrivacyReminderRequired: boolean;
}>;

function now(): string {
  return new Date().toISOString();
}

export function createManualParticipantProfile(input: TeoyubeManualParticipantWorkflowInput = {}): TeoyubeManualParticipantProfile {
  return {
    id: "manual_beta_participant_profile",
    label: "Manual beta participant profile",
    role: input.role || "limited_beta_participant",
    storesContactData: false,
    contactHandledOutsideCode: true,
    sensitiveInformationRequested: false
  };
}

export function getManualParticipantWorkflowSteps(): TeoyubeManualParticipantStep[] {
  return [
    { id: "manual_identification", order: 1, label: "Manual participant identification", manualOnly: true, details: "Owner identifies participants outside code." },
    { id: "manual_consent_privacy", order: 2, label: "Manual consent/privacy reminder", manualOnly: true, details: "Owner presents privacy and consent reminders before participation." },
    { id: "manual_scope_explanation", order: 3, label: "Manual beta scope explanation", manualOnly: true, details: "Participant sees controlled beta scope and limitations." },
    { id: "manual_known_limitations", order: 4, label: "Manual known limitations notice", manualOnly: true, details: "Known limitations are presented before testing." },
    { id: "manual_test_scenarios", order: 5, label: "Manual test scenario guidance", manualOnly: true, details: "Participant follows reviewed scenario guidance." },
    { id: "manual_feedback_instructions", order: 6, label: "Manual feedback instructions", manualOnly: true, details: "Feedback is provided through an approved manual route." },
    { id: "manual_issue_reporting", order: 7, label: "Manual issue reporting instructions", manualOnly: true, details: "Participant reports issues manually without automatic collection." },
    { id: "manual_pause_stop", order: 8, label: "Manual pause/stop instruction", manualOnly: true, details: "Participant can stop participation and ask for owner review." },
    { id: "manual_owner_review", order: 9, label: "Manual owner review checkpoints", manualOnly: true, details: "Owner reviews feedback and issues manually." }
  ];
}

export function getManualParticipantInstructions(): TeoyubeManualParticipantInstruction[] {
  return [
    { id: "keep_manual", label: "Keep the workflow manual", text: "The app will not invite, contact, track, or collect from you automatically.", mustBeReviewedManually: true },
    { id: "avoid_sensitive_info", label: "Avoid sensitive personal information", text: "Do not submit sensitive personal, crisis, medical, legal, financial, or emergency information.", mustBeReviewedManually: true },
    { id: "devotional_boundary", label: "Devotional boundary", text: "Teoyube offers devotional encouragement and does not provide professional advice or divine-certainty claims.", mustBeReviewedManually: true },
    { id: "manual_feedback_route", label: "Manual feedback route", text: "Use the owner-approved manual route for feedback and issue reporting.", mustBeReviewedManually: true }
  ];
}

export function getManualParticipantBoundaries(input: TeoyubeManualParticipantWorkflowInput = {}): TeoyubeManualParticipantBoundary[] {
  return [
    { id: "no_automatic_invitation", label: "No automatic invitation", required: true, satisfied: !input.automaticInvitationEnabled, details: "Code must not invite participants." },
    { id: "no_automatic_contact", label: "No automatic contact", required: true, satisfied: !input.automaticContactEnabled, details: "Code must not email, SMS, notify, or otherwise contact users." },
    { id: "no_automatic_feedback_collection", label: "No automatic feedback collection", required: true, satisfied: !input.automaticFeedbackCollectionEnabled, details: "Feedback remains manual only." },
    { id: "no_sensitive_personal_information_requested", label: "No sensitive personal information requested", required: true, satisfied: !input.sensitivePersonalInformationRequested, details: "Participant instructions avoid sensitive personal information." },
    { id: "no_emergency_or_professional_advice_dependence", label: "No emergency/professional advice dependence", required: true, satisfied: !input.emergencyAdviceDependenceAllowed, details: "Participants are not directed to rely on Teoyube for emergency or professional advice." },
    { id: "no_hidden_personalization", label: "No hidden personalization", required: true, satisfied: !input.hiddenPersonalizationEnabled, details: "No hidden personalization is used." },
    { id: "no_persistence", label: "No persistence", required: true, satisfied: !input.persistenceEnabled, details: "Participant data is not stored by this module." },
    { id: "consent_privacy_reminder_required", label: "Consent/privacy reminder required", required: true, satisfied: input.consentPrivacyReminderRequired !== false, details: "Consent and privacy reminders are required before testing." }
  ];
}

export function createManualParticipantWorkflow(input: TeoyubeManualParticipantWorkflowInput = {}) {
  return {
    id: "phase_6_1_manual_participant_workflow",
    profile: createManualParticipantProfile(input),
    steps: getManualParticipantWorkflowSteps(),
    instructions: getManualParticipantInstructions(),
    boundaries: getManualParticipantBoundaries(input),
    ownerReviewed: input.ownerReviewed === true,
    noAutomaticInvitation: true,
    noAutomaticContact: true,
    noAutomaticFeedbackCollection: true,
    noSensitivePersonalInformationRequested: true,
    noPersistence: true,
    noHiddenPersonalization: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

export function getManualParticipantWorkflowBlockers(input: TeoyubeManualParticipantWorkflowInput = {}): TeoyubeManualParticipantWorkflowBlocker[] {
  return getManualParticipantBoundaries(input)
    .filter((entry) => entry.required && !entry.satisfied)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      message: `${entry.label} boundary is not satisfied.`,
      requiredAction: entry.details
    }));
}

export function getManualParticipantWorkflowWarnings(input: TeoyubeManualParticipantWorkflowInput = {}): TeoyubeManualParticipantWorkflowWarning[] {
  return [
    ...(!input.ownerReviewed ? [{
      id: "owner_review_pending",
      message: "Manual participant workflow has not been owner-reviewed.",
      recommendedAction: "Owner review should happen before Phase 6.2 dry-run simulation."
    }] : [])
  ];
}

export function createManualParticipantWorkflowDecision(input: TeoyubeManualParticipantWorkflowInput = {}): TeoyubeManualParticipantWorkflowDecision {
  const blockers = getManualParticipantWorkflowBlockers(input);
  const warnings = getManualParticipantWorkflowWarnings(input);
  if (blockers.length) return "blocked";
  if (warnings.some((entry) => entry.id === "owner_review_pending")) return "needs_owner_review";
  return warnings.length ? "manual_workflow_ready_with_warnings" : "manual_workflow_ready";
}

function statusFromDecision(decision: TeoyubeManualParticipantWorkflowDecision): TeoyubeManualParticipantWorkflowStatus {
  if (decision === "manual_workflow_ready") return "manual_ready";
  if (decision === "manual_workflow_ready_with_warnings") return "manual_ready";
  if (decision === "needs_owner_review") return "owner_review_required";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function validateManualParticipantWorkflow(input: TeoyubeManualParticipantWorkflowInput = {}): TeoyubeManualParticipantWorkflowReport {
  return createManualParticipantWorkflowReport(input);
}

export function createManualParticipantWorkflowReport(input: TeoyubeManualParticipantWorkflowInput = {}): TeoyubeManualParticipantWorkflowReport {
  const workflow = createManualParticipantWorkflow(input);
  const blockers = getManualParticipantWorkflowBlockers(input);
  const decision = createManualParticipantWorkflowDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    profile: workflow.profile,
    steps: workflow.steps,
    instructions: workflow.instructions,
    boundaries: workflow.boundaries,
    blockers,
    warnings: getManualParticipantWorkflowWarnings(input),
    noAutomaticInvitation: true,
    noAutomaticContact: true,
    noAutomaticFeedbackCollection: true,
    noSensitivePersonalInformationRequested: true,
    noPersistence: true,
    noHiddenPersonalization: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

