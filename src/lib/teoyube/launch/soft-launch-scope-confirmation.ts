import { REQUIRED_LAUNCH_SURFACES } from "./launch-surface-readiness-report";

export type TeoyubeSoftLaunchScopeConfirmation = {
  id: string;
  surfacesIncluded: string[];
  surfacesExcluded: string[];
  knownLimitations: string[];
  feedbackCollectionMethod: "manual_only";
  analyticsStatus: "disabled_externally";
  databaseStatus: "disabled";
  liveAiStatus: "disabled";
  personalizationStatus: "preview_safe_consent_aware";
  rollbackCriteria: string[];
  supportContactNotes: string[];
  accepted: boolean;
  generatedAt: string;
};

export type TeoyubeSoftLaunchScopeInput = Partial<Omit<TeoyubeSoftLaunchScopeConfirmation, "id" | "generatedAt">>;

export function getDefaultSoftLaunchScope(): TeoyubeSoftLaunchScopeConfirmation {
  return {
    id: "soft_launch_scope_confirmation",
    surfacesIncluded: [...REQUIRED_LAUNCH_SURFACES],
    surfacesExcluded: [],
    knownLimitations: [
      "Production database persistence is not connected.",
      "External analytics sending is disabled.",
      "Live AI orchestration is disabled.",
      "Feedback collection is manual only."
    ],
    feedbackCollectionMethod: "manual_only",
    analyticsStatus: "disabled_externally",
    databaseStatus: "disabled",
    liveAiStatus: "disabled",
    personalizationStatus: "preview_safe_consent_aware",
    rollbackCriteria: [
      "Missing Scripture anchors",
      "Missing explanation paths",
      "Unsafe fallback behavior",
      "Missing consent controls",
      "Launch-critical mobile or accessibility blockers"
    ],
    supportContactNotes: ["Use manual owner/founder review for support intake in this phase."],
    accepted: false,
    generatedAt: new Date().toISOString()
  };
}

export function createSoftLaunchScopeConfirmation(input: TeoyubeSoftLaunchScopeInput = {}): TeoyubeSoftLaunchScopeConfirmation {
  return {
    ...getDefaultSoftLaunchScope(),
    ...input,
    id: "soft_launch_scope_confirmation",
    generatedAt: new Date().toISOString()
  };
}

export function getSoftLaunchScopeWarnings(scope: TeoyubeSoftLaunchScopeConfirmation): string[] {
  return [
    scope.accepted ? "" : "Soft launch scope has not been manually accepted.",
    scope.surfacesIncluded.length === 0 ? "No soft launch surfaces are included." : "",
    scope.feedbackCollectionMethod !== "manual_only" ? "Feedback must remain manual only for now." : "",
    scope.analyticsStatus !== "disabled_externally" ? "External analytics must remain disabled." : "",
    scope.databaseStatus !== "disabled" ? "Database persistence must remain disabled." : "",
    scope.liveAiStatus !== "disabled" ? "Live AI orchestration must remain disabled." : ""
  ].filter(Boolean);
}

export function validateSoftLaunchScope(scope: TeoyubeSoftLaunchScopeConfirmation) {
  const warnings = getSoftLaunchScopeWarnings(scope);

  return {
    valid: warnings.length === 0,
    warnings
  };
}

export function createSoftLaunchScopeReport(scope: TeoyubeSoftLaunchScopeConfirmation = getDefaultSoftLaunchScope()) {
  const validation = validateSoftLaunchScope(scope);

  return {
    ...validation,
    scope,
    includedSurfaceCount: scope.surfacesIncluded.length,
    excludedSurfaceCount: scope.surfacesExcluded.length,
    generatedAt: new Date().toISOString()
  };
}

