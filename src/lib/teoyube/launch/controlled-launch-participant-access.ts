import type { TeoyubeControlledLaunchActivationBlocker, TeoyubeControlledLaunchActivationCheck, TeoyubeControlledLaunchActivationWarning, TeoyubeControlledLaunchParticipantAccessStatus } from "./controlled-launch-activation-contracts";

function item(id: string, label: string): TeoyubeControlledLaunchActivationCheck {
  return { id, label, phase: "participant_access_confirmation", required: true, complete: true, launchCritical: true, details: label };
}

function blocker(id: string, reason: string): TeoyubeControlledLaunchActivationBlocker {
  return { id, label: id.replace(/_/g, " "), phase: "participant_access_confirmation", severity: "critical", reason, requiredAction: "Fix participant access controls before manual activation." };
}

export function getParticipantAccessChecklist(): TeoyubeControlledLaunchActivationCheck[] {
  return [
    item("internal_reviewers_supported", "Internal reviewers supported"),
    item("trusted_early_reviewers_supported", "Trusted early reviewers supported"),
    item("limited_private_preview_supported", "Limited private preview group supported"),
    item("public_access_excluded", "Public access excluded"),
    item("manual_sharing_only", "Manual sharing only"),
    item("automated_invitations_disabled", "No automated invitations"),
    item("no_user_contact_from_code", "No user contact from code"),
    item("no_sensitive_personal_information_requested", "No sensitive personal information requested"),
    item("no_hidden_tracking", "No hidden tracking"),
    item("no_analytics_sending", "No analytics sending")
  ];
}

export function createParticipantAccessReadinessPlan(input: Partial<TeoyubeControlledLaunchParticipantAccessStatus> = {}): TeoyubeControlledLaunchParticipantAccessStatus {
  return {
    id: input.id || "controlled_launch_participant_access_4_1",
    label: input.label || "Controlled Launch Participant Access Readiness",
    internalReviewersEnabled: input.internalReviewersEnabled ?? true,
    trustedEarlyReviewersEnabled: input.trustedEarlyReviewersEnabled ?? true,
    limitedPrivatePreviewGroupEnabled: input.limitedPrivatePreviewGroupEnabled ?? true,
    publicAccessExcluded: input.publicAccessExcluded ?? true,
    manualSharingOnly: input.manualSharingOnly ?? true,
    automatedInvitationsDisabled: input.automatedInvitationsDisabled ?? true,
    userContactFromCode: false,
    sensitivePersonalInformationRequested: false,
    hiddenTrackingEnabled: false,
    analyticsSent: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getParticipantAccessBlockers(plan: TeoyubeControlledLaunchParticipantAccessStatus): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    !plan.publicAccessExcluded ? blocker("controlled_launch_public_access_not_excluded", "Public access must remain excluded.") : undefined,
    !plan.manualSharingOnly ? blocker("controlled_launch_manual_sharing_disabled", "Participant sharing must remain manual only.") : undefined,
    !plan.automatedInvitationsDisabled ? blocker("controlled_launch_automated_invitations_enabled", "Automated invitations must remain disabled.") : undefined,
    plan.userContactFromCode ? blocker("controlled_launch_user_contact_from_code", "Code must not contact users.") : undefined,
    plan.sensitivePersonalInformationRequested ? blocker("controlled_launch_sensitive_info_requested", "Participant access must not request sensitive personal information.") : undefined,
    plan.hiddenTrackingEnabled ? blocker("controlled_launch_hidden_tracking_enabled", "Hidden tracking must remain disabled.") : undefined,
    plan.analyticsSent ? blocker("controlled_launch_access_analytics_sent", "Participant access must not send analytics.") : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getParticipantAccessWarnings(plan: TeoyubeControlledLaunchParticipantAccessStatus): TeoyubeControlledLaunchActivationWarning[] {
  return [
    {
      id: "controlled_launch_participant_access_manual",
      label: "Participant access is manual",
      phase: "participant_access_confirmation",
      severity: "medium",
      message: plan.limitedPrivatePreviewGroupEnabled ? "Limited private preview access is prepared but not distributed by code." : "Private preview group is not enabled.",
      recommendedAction: "Owner should share access manually only after activation approval."
    }
  ];
}

export function validateParticipantAccessReadiness(plan: TeoyubeControlledLaunchParticipantAccessStatus) {
  const blockers = getParticipantAccessBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getParticipantAccessWarnings(plan) };
}

export function createParticipantAccessReadinessReport(plan: TeoyubeControlledLaunchParticipantAccessStatus = createParticipantAccessReadinessPlan()) {
  const validation = validateParticipantAccessReadiness(plan);
  return { valid: validation.valid, ready: validation.valid, plan, blockers: validation.blockers, warnings: validation.warnings, noAutomatedInvitations: true, noUsersContacted: true, noAnalyticsSent: true, generatedAt: new Date().toISOString() };
}
