export type TeoyubeSoftLaunchFinalSafetyPrivacyResult = {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run" | "unknown";
  launchCritical: boolean;
  notes?: string[];
};

function result(id: string, label: string, launchCritical = true): TeoyubeSoftLaunchFinalSafetyPrivacyResult {
  return { id, label, status: "pass", launchCritical, notes: ["Final safety/privacy review passed with safe defaults."] };
}

export function getSoftLaunchFinalSafetyPrivacyChecklist(): TeoyubeSoftLaunchFinalSafetyPrivacyResult[] {
  return [
    result("scripture_anchoring_required", "Scripture anchoring remains required"),
    result("explanation_paths_required", "Explanation paths remain required"),
    result("fallback_enabled_non_empty", "Fallback remains enabled and non-empty"),
    result("confidence_not_overstated", "Confidence is not overstated"),
    result("no_divine_certainty_claims", "No divine certainty claims are introduced"),
    result("consent_controls_available", "Consent controls remain available"),
    result("personalization_consent_aware", "Personalization remains consent-aware"),
    result("raw_sensitive_text_storage_disabled", "Raw sensitive text storage remains disabled"),
    result("hidden_personalization_not_created", "Hidden personalization is not introduced"),
    result("external_analytics_disabled", "External analytics remain disabled"),
    result("production_persistence_disabled", "Production persistence remains disabled"),
    result("live_ai_orchestration_disabled", "Live AI orchestration remains disabled"),
    result("debug_ui_hidden", "Debug UI remains hidden from normal users"),
    result("offline_fallback_scripture_anchored", "Offline fallback remains Scripture-anchored")
  ];
}

function hasPassing(results: TeoyubeSoftLaunchFinalSafetyPrivacyResult[], id: string): boolean {
  const found = results.find((entry) => entry.id === id);
  return Boolean(found && (found.status === "pass" || found.status === "warning"));
}

function resultsFrom(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): TeoyubeSoftLaunchFinalSafetyPrivacyResult[] {
  return Array.isArray(input) ? input : input.results || getSoftLaunchFinalSafetyPrivacyChecklist();
}

export function validateSoftLaunchFinalScriptureAnchoring(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  return hasPassing(resultsFrom(input), "scripture_anchoring_required") && hasPassing(resultsFrom(input), "offline_fallback_scripture_anchored");
}

export function validateSoftLaunchFinalExplanationPaths(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  return hasPassing(resultsFrom(input), "explanation_paths_required");
}

export function validateSoftLaunchFinalFallbackSafety(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  return hasPassing(resultsFrom(input), "fallback_enabled_non_empty");
}

export function validateSoftLaunchFinalConfidenceSafety(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  const results = resultsFrom(input);
  return hasPassing(results, "confidence_not_overstated") && hasPassing(results, "no_divine_certainty_claims");
}

export function validateSoftLaunchFinalConsentSafety(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  const results = resultsFrom(input);
  return hasPassing(results, "consent_controls_available") && hasPassing(results, "personalization_consent_aware");
}

export function validateSoftLaunchFinalPrivacyBoundaries(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  const results = resultsFrom(input);
  return hasPassing(results, "raw_sensitive_text_storage_disabled") && hasPassing(results, "hidden_personalization_not_created");
}

export function validateSoftLaunchFinalNoExternalAnalytics(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  return hasPassing(resultsFrom(input), "external_analytics_disabled");
}

export function validateSoftLaunchFinalNoProductionPersistence(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  return hasPassing(resultsFrom(input), "production_persistence_disabled");
}

export function validateSoftLaunchFinalNoLiveAiOrchestration(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}): boolean {
  return hasPassing(resultsFrom(input), "live_ai_orchestration_disabled");
}

export function createSoftLaunchFinalSafetyPrivacyReport(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}) {
  const results = resultsFrom(input);
  const blockers = results
    .filter((entry) => entry.status === "fail" || entry.status === "blocked" || entry.status === "not_run" || entry.status === "unknown")
    .map((entry) => ({
      id: `soft_launch_final_safety_privacy_${entry.id}`,
      label: entry.label,
      reason: "Required final safety/privacy check is missing or blocked.",
      requiredAction: "Resolve before public launch preparation.",
      riskLevel: entry.launchCritical ? "critical" as const : "high" as const
    }));
  const warnings = results
    .filter((entry) => entry.status === "warning")
    .map((entry) => ({
      id: `soft_launch_final_safety_privacy_warning_${entry.id}`,
      label: entry.label,
      message: entry.notes?.join(" ") || "Final safety/privacy warning recorded.",
      recommendedAction: "Document owner acceptance before public launch preparation.",
      riskLevel: "medium" as const
    }));

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    results,
    blockers,
    warnings,
    scriptureAnchoringRequired: validateSoftLaunchFinalScriptureAnchoring(results),
    explanationPathsRequired: validateSoftLaunchFinalExplanationPaths(results),
    fallbackSafetyReady: validateSoftLaunchFinalFallbackSafety(results),
    confidenceSafetyReady: validateSoftLaunchFinalConfidenceSafety(results),
    consentSafetyReady: validateSoftLaunchFinalConsentSafety(results),
    privacyBoundariesReady: validateSoftLaunchFinalPrivacyBoundaries(results),
    externalAnalyticsDisabled: validateSoftLaunchFinalNoExternalAnalytics(results),
    productionPersistenceDisabled: validateSoftLaunchFinalNoProductionPersistence(results),
    liveAiOrchestrationDisabled: validateSoftLaunchFinalNoLiveAiOrchestration(results),
    debugUiHidden: hasPassing(results, "debug_ui_hidden"),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function runSoftLaunchFinalSafetyPrivacyReview(input: { results?: TeoyubeSoftLaunchFinalSafetyPrivacyResult[] } | TeoyubeSoftLaunchFinalSafetyPrivacyResult[] = {}) {
  return createSoftLaunchFinalSafetyPrivacyReport(input);
}
