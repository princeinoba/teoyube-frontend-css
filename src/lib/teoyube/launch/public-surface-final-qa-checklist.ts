import type { TeoyubePublicLaunchQaCheck } from "./public-launch-qa-contracts";
import { getPublicSurfaceCopyIntegrations } from "./public-surface-copy-registry";

function check(input: TeoyubePublicLaunchQaCheck): TeoyubePublicLaunchQaCheck {
  return input;
}

export function getPublicSurfaceFinalQaChecklist(): TeoyubePublicLaunchQaCheck[] {
  const copyChecks = getPublicSurfaceCopyIntegrations().map((entry) =>
    check({
      id: `${entry.surface}_public_copy_visible_5_3`,
      surface: entry.surface,
      label: `${entry.label} copy is visible`,
      category: "copy",
      required: true,
      launchCritical: true,
      expectedResult: "Required public launch copy is visible, reachable, and sourced from the 5.2 copy package."
    })
  );

  return [
    ...copyChecks,
    check({
      id: "public_routes_privacy_terms_consent_exist_5_3",
      surface: "privacy_terms",
      label: "Privacy, terms, and consent routes exist",
      category: "privacy",
      required: true,
      launchCritical: true,
      expectedResult: "/privacy, /terms, and /consent render draft public copy without claiming legal final approval."
    }),
    check({
      id: "tig_free_text_sensitive_warning_visible_5_3",
      surface: "ai_companion",
      label: "Sensitive information warning visible near free-text input",
      category: "safety",
      required: true,
      launchCritical: true,
      expectedResult: "Users can see sensitive information, emergency, and professional-care boundaries before using TIG free-text surfaces."
    }),
    check({
      id: "public_surface_copy_accessible_mobile_5_3",
      surface: "mobile_navigation",
      label: "Public copy remains mobile accessible",
      category: "accessibility",
      required: true,
      launchCritical: true,
      expectedResult: "Public notices use semantic headings, list content, links, contrast-safe colors, and responsive text wrapping."
    }),
    check({
      id: "public_surface_no_launch_or_provider_side_effects_5_3",
      surface: "all",
      label: "Final QA dry run has no launch or provider side effects",
      category: "safety",
      required: true,
      launchCritical: true,
      expectedResult: "Final QA dry run performs no public launch, provider connection, analytics send, database write, or user contact."
    })
  ];
}

export function createPublicSurfaceFinalQaChecklistReport() {
  const checklist = getPublicSurfaceFinalQaChecklist();
  return {
    valid: checklist.length >= 14,
    ready: checklist.length >= 14,
    checklist,
    checkCount: checklist.length,
    surfaceCount: new Set(checklist.map((entry) => entry.surface)).size,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
