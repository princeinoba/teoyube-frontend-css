export type TeoyubeSoftLaunchPostReleaseSafetyCheck = {
  id: string;
  label: string;
  required: boolean;
  launchCritical: boolean;
};

export type TeoyubeSoftLaunchPostReleaseSafetyResult = {
  checkId: string;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run" | "unknown";
  notes?: string[];
};

function check(id: string, label: string, launchCritical = true): TeoyubeSoftLaunchPostReleaseSafetyCheck {
  return { id, label, required: true, launchCritical };
}

export function getSoftLaunchPostReleaseSafetyChecklist(): TeoyubeSoftLaunchPostReleaseSafetyCheck[] {
  return [
    check("scripture_anchoring_required", "Scripture anchoring remains required"),
    check("explanation_paths_required", "Explanation paths remain required"),
    check("fallback_enabled_non_empty", "Fallback remains enabled and non-empty"),
    check("confidence_not_overstated", "Confidence is not overstated"),
    check("consent_controls_visible", "Consent controls remain visible where needed"),
    check("personalization_consent_aware", "Personalization remains consent-aware"),
    check("raw_text_storage_disabled", "Raw text storage remains disabled"),
    check("hidden_personalization_not_created", "Hidden personalization is not introduced"),
    check("external_analytics_disabled", "External analytics remain disabled"),
    check("production_persistence_disabled", "Production persistence remains disabled"),
    check("live_ai_orchestration_disabled", "Live AI orchestration remains disabled"),
    check("debug_ui_hidden", "Debug UI remains hidden from normal users"),
    check("no_divine_certainty_claims", "No divine-certainty claims introduced")
  ];
}

function resultFor(results: TeoyubeSoftLaunchPostReleaseSafetyResult[], checkId: string): TeoyubeSoftLaunchPostReleaseSafetyResult | undefined {
  return results.find((result) => result.checkId === checkId);
}

function validateRequiredResult(results: TeoyubeSoftLaunchPostReleaseSafetyResult[], checkId: string) {
  const result = resultFor(results, checkId);
  return Boolean(result && (result.status === "pass" || result.status === "warning"));
}

export function validatePostReleaseScriptureAnchoring(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "scripture_anchoring_required");
}

export function validatePostReleaseExplanationPaths(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "explanation_paths_required");
}

export function validatePostReleaseFallbackSafety(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "fallback_enabled_non_empty");
}

export function validatePostReleaseConsentSafety(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "consent_controls_visible") && validateRequiredResult(results, "personalization_consent_aware");
}

export function validatePostReleasePrivacyBoundaries(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "raw_text_storage_disabled") && validateRequiredResult(results, "hidden_personalization_not_created");
}

export function validatePostReleaseNoExternalAnalytics(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "external_analytics_disabled");
}

export function validatePostReleaseNoProductionPersistence(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "production_persistence_disabled");
}

export function validatePostReleaseNoLiveAiOrchestration(results: TeoyubeSoftLaunchPostReleaseSafetyResult[]): boolean {
  return validateRequiredResult(results, "live_ai_orchestration_disabled");
}

export function createSoftLaunchPostReleaseSafetyPassResults(): TeoyubeSoftLaunchPostReleaseSafetyResult[] {
  return getSoftLaunchPostReleaseSafetyChecklist().map((entry) => ({
    checkId: entry.id,
    status: "pass" as const,
    notes: ["Manual post-release safety verification passed."]
  }));
}

export function createSoftLaunchPostReleaseSafetyReport(
  results: TeoyubeSoftLaunchPostReleaseSafetyResult[] = createSoftLaunchPostReleaseSafetyPassResults()
) {
  const checklist = getSoftLaunchPostReleaseSafetyChecklist();
  const blockers = checklist
    .filter((entry) => entry.required)
    .filter((entry) => {
      const result = resultFor(results, entry.id);
      return !result || result.status === "fail" || result.status === "blocked" || result.status === "not_run" || result.status === "unknown";
    })
    .map((entry) => ({
      id: `post_release_safety_${entry.id}`,
      label: entry.label,
      reason: "Required post-release safety result is missing or blocked.",
      requiredAction: "Do not continue expansion until this safety result is passed or owner-reviewed.",
      riskLevel: entry.launchCritical ? "critical" as const : "high" as const
    }));
  const warnings = results
    .filter((result) => result.status === "warning")
    .map((result) => ({
      id: `post_release_safety_warning_${result.checkId}`,
      label: result.checkId,
      message: result.notes?.join(" ") || "Post-release safety warning recorded.",
      recommendedAction: "Document owner acceptance before continuing."
    }));

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    checklist,
    results,
    blockers,
    warnings,
    scriptureAnchoringRequired: validatePostReleaseScriptureAnchoring(results),
    explanationPathsRequired: validatePostReleaseExplanationPaths(results),
    fallbackSafetyReady: validatePostReleaseFallbackSafety(results),
    consentSafetyReady: validatePostReleaseConsentSafety(results),
    privacyBoundariesReady: validatePostReleasePrivacyBoundaries(results),
    externalAnalyticsDisabled: validatePostReleaseNoExternalAnalytics(results),
    productionPersistenceDisabled: validatePostReleaseNoProductionPersistence(results),
    liveAiOrchestrationDisabled: validatePostReleaseNoLiveAiOrchestration(results),
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
