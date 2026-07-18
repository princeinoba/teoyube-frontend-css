import type {
  TeoyubeControlledPublicAccessStatus,
  TeoyubeControlledPublicLaunchActivationBlocker,
  TeoyubeControlledPublicLaunchActivationCheck,
  TeoyubeControlledPublicLaunchActivationWarning
} from "./controlled-public-launch-activation-contracts";

function item(id: string, label: string): TeoyubeControlledPublicLaunchActivationCheck {
  return { id, label, phase: "public_access_confirmation", required: true, complete: true, launchCritical: true, details: label };
}

function blocker(id: string, reason: string): TeoyubeControlledPublicLaunchActivationBlocker {
  return { id, label: id.replace(/_/g, " "), phase: "public_access_confirmation", severity: "critical", reason, requiredAction: "Fix public access readiness before manual public activation." };
}

export function getControlledPublicAccessChecklist(): TeoyubeControlledPublicLaunchActivationCheck[] {
  return [
    item("public_route_access_intentional", "Public route access is intentional"),
    item("public_launch_scope_documented", "Public launch scope is documented"),
    item("excluded_limited_surfaces_documented", "Excluded or limited surfaces are documented"),
    item("privacy_terms_consent_accessible", "Privacy, terms, and consent notices are accessible"),
    item("sensitive_information_warning_visible", "Sensitive personal information warning is visible"),
    item("no_automated_invitations", "No automated invitations are sent"),
    item("no_user_contact_from_code", "No user contact happens from code"),
    item("no_hidden_tracking", "No hidden tracking is enabled"),
    item("no_unapproved_analytics_sending", "No unapproved analytics are sending"),
    item("no_unapproved_database_persistence", "No unapproved database persistence is active"),
    item("no_unapproved_live_ai_orchestration", "No unapproved live AI orchestration is active")
  ];
}

export function createControlledPublicAccessReadinessPlan(input: Partial<TeoyubeControlledPublicAccessStatus> = {}): TeoyubeControlledPublicAccessStatus {
  return {
    id: input.id || "controlled_public_access_6_1",
    label: input.label || "Controlled Public Access Readiness",
    publicRouteAccessIntentional: input.publicRouteAccessIntentional ?? true,
    publicLaunchScopeDocumented: input.publicLaunchScopeDocumented ?? true,
    excludedLimitedSurfacesDocumented: input.excludedLimitedSurfacesDocumented ?? true,
    privacyTermsConsentAccessible: input.privacyTermsConsentAccessible ?? true,
    sensitivePersonalInformationWarningVisible: input.sensitivePersonalInformationWarningVisible ?? true,
    automatedInvitationsDisabled: input.automatedInvitationsDisabled ?? true,
    userContactFromCode: false,
    hiddenTrackingEnabled: false,
    analyticsSent: false,
    databasePersistenceActive: false,
    liveAiOrchestrationActive: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledPublicAccessBlockers(plan: TeoyubeControlledPublicAccessStatus): TeoyubeControlledPublicLaunchActivationBlocker[] {
  return [
    !plan.publicRouteAccessIntentional ? blocker("controlled_public_access_not_intentional", "Public route access must be intentional.") : undefined,
    !plan.publicLaunchScopeDocumented ? blocker("controlled_public_access_scope_missing", "Public launch scope must be documented.") : undefined,
    !plan.excludedLimitedSurfacesDocumented ? blocker("controlled_public_access_exclusions_missing", "Excluded or limited surfaces must be documented.") : undefined,
    !plan.privacyTermsConsentAccessible ? blocker("controlled_public_access_privacy_terms_consent_missing", "Privacy, terms, and consent notices must be accessible.") : undefined,
    !plan.sensitivePersonalInformationWarningVisible ? blocker("controlled_public_access_sensitive_warning_missing", "Sensitive personal information warning must be visible.") : undefined,
    !plan.automatedInvitationsDisabled ? blocker("controlled_public_access_automated_invitations_enabled", "Automated invitations must remain disabled.") : undefined,
    plan.userContactFromCode ? blocker("controlled_public_access_user_contact_from_code", "Code must not contact users.") : undefined,
    plan.hiddenTrackingEnabled ? blocker("controlled_public_access_hidden_tracking_enabled", "Hidden tracking must remain disabled.") : undefined,
    plan.analyticsSent ? blocker("controlled_public_access_analytics_sent", "Public access readiness must not send analytics.") : undefined,
    plan.databasePersistenceActive ? blocker("controlled_public_access_database_active", "Public access readiness must not enable database persistence.") : undefined,
    plan.liveAiOrchestrationActive ? blocker("controlled_public_access_live_ai_active", "Public access readiness must not enable live AI orchestration.") : undefined
  ].filter(Boolean) as TeoyubeControlledPublicLaunchActivationBlocker[];
}

export function getControlledPublicAccessWarnings(): TeoyubeControlledPublicLaunchActivationWarning[] {
  return [
    {
      id: "controlled_public_access_manual_confirmation",
      label: "Public access requires manual confirmation",
      phase: "public_access_confirmation",
      severity: "medium",
      message: "This module records readiness only and does not open routes, invite users, or fetch public URLs.",
      recommendedAction: "Owner should verify public route access manually during the approved launch window."
    }
  ];
}

export function validateControlledPublicAccessReadiness(plan: TeoyubeControlledPublicAccessStatus) {
  const blockers = getControlledPublicAccessBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getControlledPublicAccessWarnings() };
}

export function createControlledPublicAccessReadinessReport(plan: TeoyubeControlledPublicAccessStatus = createControlledPublicAccessReadinessPlan()) {
  const validation = validateControlledPublicAccessReadiness(plan);
  return { valid: validation.valid, ready: validation.valid, plan, blockers: validation.blockers, warnings: validation.warnings, noAutomatedInvitations: true, noUsersContacted: true, noAnalyticsSent: true, noDatabaseWrites: true, noLiveAiOrchestrationEnabled: true, generatedAt: new Date().toISOString() };
}
