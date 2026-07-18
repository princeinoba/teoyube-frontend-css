import type { TeoyubePublicNoticeType } from "./public-launch-privacy-consent-contracts";
import type { TeoyubePublicLaunchQaSurface } from "./public-launch-qa-contracts";
import type {
  TeoyubePublicNoticePlacement,
  TeoyubePublicSurfaceCopyBlocker,
  TeoyubePublicSurfaceCopyIntegration,
  TeoyubePublicSurfaceCopyIntegrationReport,
  TeoyubePublicSurfaceCopyRequirement,
  TeoyubePublicSurfaceCopyWarning
} from "./public-surface-copy-contracts";

function requirement(
  surface: TeoyubePublicLaunchQaSurface,
  noticeType: TeoyubePublicNoticeType,
  label: string,
  placement: TeoyubePublicNoticePlacement,
  details: string,
  input: Partial<TeoyubePublicSurfaceCopyRequirement> = {}
): TeoyubePublicSurfaceCopyRequirement {
  return {
    id: input.id || `${surface}_${noticeType}_${placement}`,
    surface,
    noticeType,
    label,
    required: input.required ?? true,
    launchCritical: input.launchCritical ?? true,
    placement,
    visibility: input.visibility || "visible",
    status: input.status || "ready",
    copySource: input.copySource || "public_launch_5_2",
    details
  };
}

function integration(
  surface: TeoyubePublicLaunchQaSurface,
  label: string,
  route: string,
  component: string,
  requirements: TeoyubePublicSurfaceCopyRequirement[]
): TeoyubePublicSurfaceCopyIntegration {
  return {
    id: `${surface}_public_surface_copy_integration_5_3`,
    surface,
    label,
    route,
    component,
    requirements,
    integrated: requirements.every((entry) => entry.status === "ready" && entry.visibility !== "hidden" && entry.visibility !== "missing"),
    ownerReviewStatus: "owner_reviewed",
    accessibilityStatus: "pass",
    manualOnly: true,
    noExternalWrite: true
  };
}

export function getPublicSurfaceCopyIntegrations(): TeoyubePublicSurfaceCopyIntegration[] {
  return [
    integration("onboarding", "Onboarding public notices", "/tig/onboarding", "PublicConsentNotice", [
      requirement("onboarding", "consent_notice", "Consent copy shown before personalization controls", "inline", "Onboarding explains consent-aware personalization and local-only preview behavior."),
      requirement("onboarding", "privacy_notice", "Privacy notice linked from onboarding", "footer", "Onboarding keeps privacy copy reachable before users continue."),
      requirement("onboarding", "sensitive_information_warning", "Sensitive information warning shown near free-text expectations", "banner", "Users are warned not to submit sensitive personal information.")
    ]),
    integration("ai_companion", "AI/TIG transparency notices", "/tig", "PublicAiTigTransparencyNotice", [
      requirement("ai_companion", "ai_notice", "AI/TIG transparency shown near TIG input", "below_input", "TIG explains confidence, Scripture anchoring, and disabled live AI."),
      requirement("ai_companion", "sensitive_information_warning", "Sensitive information warning shown near TIG input", "below_input", "Free-text TIG surfaces warn users before entry."),
      requirement("ai_companion", "public_launch_limitation_notice", "Known limitations shown near AI/TIG surfaces", "inline", "Live AI, analytics, and persistence remain disconnected.")
    ]),
    integration("tig_response_panel", "TIG response public notices", "/tig", "TIGResponsePanel", [
      requirement("tig_response_panel", "scripture_explanation_notice", "Scripture explanation copy remains visible with responses", "near_recommendation", "Responses preserve Scripture anchors and explanation paths."),
      requirement("tig_response_panel", "ai_notice", "Confidence is not divine certainty", "near_recommendation", "Response copy avoids overclaiming confidence."),
      requirement("tig_response_panel", "sensitive_information_warning", "Professional-care boundary remains visible", "inline", "Response surface preserves emergency and professional-care boundaries.")
    ]),
    integration("personalization_preview_panel", "Personalization preview notices", "/tig/journey", "TigPersonalizationPreviewPanel", [
      requirement("personalization_preview_panel", "personalization_notice", "Personalization is visible and reversible", "inline", "Preview personalization remains consent-aware and explainable."),
      requirement("personalization_preview_panel", "consent_notice", "Consent state shown around personalization controls", "inline", "Users can reset, export, delete, or disable preview preferences.")
    ]),
    integration("consent_controls", "Consent control notices", "/tig/privacy", "PublicConsentNotice", [
      requirement("consent_controls", "consent_notice", "Consent copy shown with controls", "inline", "Consent controls describe session-only and profile-preview behavior."),
      requirement("consent_controls", "privacy_notice", "Privacy copy available with consent controls", "footer", "Privacy notice is linked from local data and consent surfaces.")
    ]),
    integration("feedback_controls", "Feedback control notices", "/tig/journey", "PublicFeedbackNotice", [
      requirement("feedback_controls", "feedback_notice", "Feedback notice shown near feedback controls", "inline", "Feedback is manual or explicit and does not create hidden personalization."),
      requirement("feedback_controls", "sensitive_information_warning", "Sensitive feedback warning shown", "inline", "Feedback should not include sensitive personal information.")
    ]),
    integration("privacy_terms", "Privacy, terms, and consent public routes", "/privacy /terms /consent", "PublicPrivacyNotice", [
      requirement("privacy_terms", "privacy_notice", "Public privacy route exists", "page", "Privacy draft copy is available on a public route."),
      requirement("privacy_terms", "terms_of_use", "Public terms route exists", "page", "Terms draft copy is available on a public route."),
      requirement("privacy_terms", "consent_notice", "Public consent route exists", "page", "Consent copy is available on a public route."),
      requirement("privacy_terms", "public_launch_limitation_notice", "Known limitations are visible on public legal-copy routes", "inline", "Public routes disclose disabled providers and draft-review status.")
    ]),
    integration("sensitive_information_warnings", "Sensitive information warnings", "/tig /tig/onboarding /tig/privacy", "PublicSensitiveInfoWarning", [
      requirement("sensitive_information_warnings", "sensitive_information_warning", "Sensitive information warning component exists", "banner", "Sensitive, emergency, and professional-care boundaries are visible.")
    ]),
    integration("error_fallback_states", "Fallback public notices", "/tig", "PublicLaunchLimitationsNotice", [
      requirement("error_fallback_states", "scripture_explanation_notice", "Fallback states keep Scripture explanation copy", "inline", "Fallback behavior is explained as Scripture-anchored support."),
      requirement("error_fallback_states", "public_launch_limitation_notice", "Fallback states keep launch limitations visible", "inline", "Fallback copy does not imply providers or persistence are connected.")
    ]),
    integration("offline_fallback", "Offline public notices", "/tig", "PublicLaunchLimitationsNotice", [
      requirement("offline_fallback", "public_launch_limitation_notice", "Offline limitations copy exists", "inline", "Offline copy keeps provider and launch limitations visible."),
      requirement("offline_fallback", "scripture_explanation_notice", "Offline Scripture explanation copy exists", "inline", "Offline behavior preserves Scripture anchoring.")
    ])
  ];
}

export function getPublicSurfaceCopyRequirements(): TeoyubePublicSurfaceCopyRequirement[] {
  return getPublicSurfaceCopyIntegrations().flatMap((entry) => entry.requirements);
}

export function getPublicSurfaceCopyBlockers(
  integrations: TeoyubePublicSurfaceCopyIntegration[] = getPublicSurfaceCopyIntegrations()
): TeoyubePublicSurfaceCopyBlocker[] {
  return integrations.flatMap((integrationEntry) =>
    integrationEntry.requirements
      .filter((entry) => entry.required && (entry.status === "missing" || entry.status === "blocked" || entry.visibility === "hidden" || entry.visibility === "missing"))
      .map((entry) => ({
        id: `surface_copy_blocker_${entry.id}`,
        surface: entry.surface,
        noticeType: entry.noticeType,
        label: entry.label,
        reason: "Required public surface copy is missing, blocked, or hidden.",
        requiredAction: "Make the required notice visible before public launch.",
        riskLevel: entry.launchCritical ? "critical" : "high"
      }))
  );
}

export function getPublicSurfaceCopyWarnings(
  integrations: TeoyubePublicSurfaceCopyIntegration[] = getPublicSurfaceCopyIntegrations()
): TeoyubePublicSurfaceCopyWarning[] {
  const reviewWarnings = integrations.flatMap((integrationEntry) =>
    integrationEntry.requirements
      .filter((entry) => entry.status === "needs_review" || entry.status === "ready_with_warnings" || entry.visibility === "available_by_link")
      .map((entry) => ({
        id: `surface_copy_warning_${entry.id}`,
        surface: entry.surface,
        noticeType: entry.noticeType,
        label: entry.label,
        message: "Public surface copy is present but still needs final human review or stronger visibility.",
        recommendedAction: "Review notice visibility during final QA dry run.",
        riskLevel: "medium" as const
      }))
  );

  return [
    ...reviewWarnings,
    {
      id: "public_surface_copy_legal_review_pending",
      surface: "privacy_terms",
      noticeType: "terms_of_use",
      label: "Legal review pending",
      message: "5.3 integrates draft public copy but does not claim final legal approval.",
      recommendedAction: "Complete appropriate owner/legal review before public launch.",
      riskLevel: "medium"
    }
  ];
}

export function createPublicSurfaceCopyRegistryReport(
  integrations: TeoyubePublicSurfaceCopyIntegration[] = getPublicSurfaceCopyIntegrations()
): TeoyubePublicSurfaceCopyIntegrationReport {
  const blockers = getPublicSurfaceCopyBlockers(integrations);
  const warnings = getPublicSurfaceCopyWarnings(integrations);
  const requirements = integrations.flatMap((entry) => entry.requirements);
  const readyIntegrationCount = integrations.filter((entry) => entry.integrated).length;

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: blockers.length === 0 ? "ready_for_final_qa_dry_run" : "blocked",
    integrationCount: integrations.length,
    readyIntegrationCount,
    requirementCount: requirements.length,
    visibleNoticeCount: requirements.filter((entry) => entry.visibility === "visible").length,
    integrations,
    blockers,
    warnings,
    draftOnly: true,
    notLegalAdvice: true,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
