import type {
  TeoyubeLimitedSoftLaunchParticipantGroup,
  TeoyubeLimitedSoftLaunchScope
} from "./limited-soft-launch-execution-contracts";

export type TeoyubeLimitedSoftLaunchParticipantScopeInput = Partial<
  Pick<
    TeoyubeLimitedSoftLaunchScope,
    | "label"
    | "purpose"
    | "participantGroups"
    | "includedSurfaceIds"
    | "excludedSurfaceIds"
    | "maxParticipantCount"
    | "publicLaunchExcluded"
    | "automatedInvitationsDisabled"
    | "sensitivePersonalDataRequestProhibited"
    | "manualFeedbackOnly"
    | "notes"
  >
>;

export type TeoyubeLimitedSoftLaunchParticipantScopeReport = {
  valid: boolean;
  scope: TeoyubeLimitedSoftLaunchScope;
  groupCount: number;
  includedGroupCount: number;
  warnings: string[];
  blockers: string[];
  noPublicLaunch: boolean;
  noAutomatedInvitations: boolean;
  noRealUserContactInThisStep: boolean;
  noFeedbackCollectedInThisStep: boolean;
  generatedAt: string;
};

function group(
  id: string,
  label: string,
  audience: TeoyubeLimitedSoftLaunchParticipantGroup["audience"],
  maxParticipants: number,
  included: boolean,
  notes: string[]
): TeoyubeLimitedSoftLaunchParticipantGroup {
  return {
    id,
    label,
    audience,
    maxParticipants,
    included,
    invitationMode: included ? "manual_only" : "none",
    guidanceRequired: included,
    notes
  };
}

export function getDefaultLimitedSoftLaunchParticipantScope(): TeoyubeLimitedSoftLaunchScope {
  const participantGroups = [
    group("owner_review", "Owner Review", "owner", 1, true, ["Owner validates readiness before any real invitation."]),
    group("internal_reviewers", "Internal Reviewers", "internal_reviewer", 3, true, ["Small internal review group only."]),
    group("trusted_early_reviewers", "Trusted Early Reviewers", "trusted_early_reviewer", 5, true, ["Trusted reviewers only after owner approval."]),
    group("limited_private_preview", "Limited Private Preview", "limited_private_preview", 10, true, ["Private preview group remains manually controlled."]),
    group("public_launch", "Public Launch", "excluded_public", 0, false, ["Public launch is explicitly excluded from this step."])
  ];

  return {
    id: "limited_soft_launch_participant_scope",
    label: "Limited Soft Launch Participant Scope",
    purpose: "Prepare a controlled, consent-aware soft launch participant boundary without inviting users in this step.",
    participantGroups,
    includedSurfaceIds: [],
    excludedSurfaceIds: ["public_launch"],
    maxParticipantCount: participantGroups.filter((entry) => entry.included).reduce((total, entry) => total + entry.maxParticipants, 0),
    publicLaunchExcluded: true,
    automatedInvitationsDisabled: true,
    realUserContactPerformed: false,
    feedbackCollectionPerformed: false,
    sensitivePersonalDataRequestProhibited: true,
    manualFeedbackOnly: true,
    notes: [
      "This scope plan does not invite users.",
      "This scope plan does not collect feedback.",
      "Participants must be instructed not to submit sensitive personal information."
    ]
  };
}

export function createParticipantScopePlan(
  input: TeoyubeLimitedSoftLaunchParticipantScopeInput = {}
): TeoyubeLimitedSoftLaunchScope {
  const base = getDefaultLimitedSoftLaunchParticipantScope();
  const participantGroups = input.participantGroups || base.participantGroups;

  return {
    ...base,
    ...input,
    participantGroups,
    maxParticipantCount: input.maxParticipantCount ??
      participantGroups.filter((entry) => entry.included).reduce((total, entry) => total + entry.maxParticipants, 0),
    publicLaunchExcluded: input.publicLaunchExcluded ?? true,
    automatedInvitationsDisabled: input.automatedInvitationsDisabled ?? true,
    realUserContactPerformed: false,
    feedbackCollectionPerformed: false,
    sensitivePersonalDataRequestProhibited: input.sensitivePersonalDataRequestProhibited ?? true,
    manualFeedbackOnly: input.manualFeedbackOnly ?? true
  };
}

export function getParticipantScopeWarnings(scope: TeoyubeLimitedSoftLaunchScope): string[] {
  return [
    scope.maxParticipantCount > 20 ? "Participant count should remain very small for a limited soft launch." : "",
    scope.participantGroups.some((entry) => entry.included && !entry.guidanceRequired)
      ? "All included participant groups should require guidance."
      : "",
    "This step prepares scope only; it does not invite users or collect feedback."
  ].filter(Boolean);
}

export function validateParticipantScopePlan(scope: TeoyubeLimitedSoftLaunchScope) {
  const blockers = [
    scope.publicLaunchExcluded ? "" : "Public launch must be excluded.",
    scope.automatedInvitationsDisabled ? "" : "Automated invitations must be disabled.",
    scope.realUserContactPerformed ? "This step must not contact real users." : "",
    scope.feedbackCollectionPerformed ? "This step must not collect real feedback." : "",
    scope.sensitivePersonalDataRequestProhibited ? "" : "Sensitive personal data requests must be prohibited.",
    scope.manualFeedbackOnly ? "" : "Feedback must remain manual only."
  ].filter(Boolean);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getParticipantScopeWarnings(scope)
  };
}

export function createParticipantScopeReport(
  scope: TeoyubeLimitedSoftLaunchScope = createParticipantScopePlan()
): TeoyubeLimitedSoftLaunchParticipantScopeReport {
  const validation = validateParticipantScopePlan(scope);

  return {
    valid: validation.valid,
    scope,
    groupCount: scope.participantGroups.length,
    includedGroupCount: scope.participantGroups.filter((entry) => entry.included).length,
    warnings: validation.warnings,
    blockers: validation.blockers,
    noPublicLaunch: scope.publicLaunchExcluded,
    noAutomatedInvitations: scope.automatedInvitationsDisabled,
    noRealUserContactInThisStep: !scope.realUserContactPerformed,
    noFeedbackCollectedInThisStep: !scope.feedbackCollectionPerformed,
    generatedAt: new Date().toISOString()
  };
}
