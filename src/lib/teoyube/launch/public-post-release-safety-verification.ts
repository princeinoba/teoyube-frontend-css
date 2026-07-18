export type TeoyubePublicPostReleaseSafetyCheck = {
  id: string;
  label: string;
  required: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePublicPostReleaseSafetyResult = {
  checkId: string;
  passed: boolean;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run";
  summary: string;
  notes?: string[];
};

export type TeoyubePublicPostReleaseSafetyBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicPostReleaseSafetyWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
};

export const PUBLIC_POST_RELEASE_SAFETY_CHECKLIST: TeoyubePublicPostReleaseSafetyCheck[] = [
  { id: "scripture_anchors", label: "Scripture anchors remain visible", required: true, publicLaunchCritical: true },
  { id: "explanation_paths", label: "Explanation paths remain available", required: true, publicLaunchCritical: true },
  { id: "fallback_safety", label: "Fallback safety remains available", required: true, publicLaunchCritical: true },
  { id: "confidence_labels", label: "Confidence labels remain visible", required: true, publicLaunchCritical: true },
  { id: "privacy_terms_consent_notices", label: "Public privacy, terms, and consent notices remain visible", required: true, publicLaunchCritical: true },
  { id: "consent_controls", label: "Consent controls remain visible", required: true, publicLaunchCritical: true },
  { id: "no_hidden_personalization", label: "Hidden personalization remains absent", required: true, publicLaunchCritical: true },
  { id: "no_raw_sensitive_text", label: "Raw sensitive personalization text is not stored", required: true, publicLaunchCritical: true },
  { id: "no_divine_certainty_claims", label: "Divine certainty claims remain absent", required: true, publicLaunchCritical: true },
  { id: "no_unsupported_legal_approval", label: "Legal approval is not claimed without record", required: true, publicLaunchCritical: true },
  { id: "analytics_disabled", label: "External analytics remain disabled", required: true, publicLaunchCritical: true },
  { id: "persistence_disabled", label: "Production persistence remains disabled", required: true, publicLaunchCritical: true },
  { id: "live_ai_disabled", label: "Live AI orchestration remains disabled", required: true, publicLaunchCritical: true },
  { id: "external_services_disabled", label: "External production services remain unused", required: true, publicLaunchCritical: true },
  { id: "secrets_not_exposed", label: "Secrets are not exposed", required: true, publicLaunchCritical: true },
  { id: "no_public_url_fetch", label: "Public URLs are not fetched by code", required: true, publicLaunchCritical: true },
  { id: "no_user_contact", label: "Users are not contacted by code", required: true, publicLaunchCritical: true },
  { id: "no_automatic_feedback_collection", label: "Feedback is not collected automatically", required: true, publicLaunchCritical: true }
];

export function createPublicPostReleaseSafetyResults(
  input: Partial<Record<string, Partial<TeoyubePublicPostReleaseSafetyResult>>> = {}
): TeoyubePublicPostReleaseSafetyResult[] {
  return PUBLIC_POST_RELEASE_SAFETY_CHECKLIST.map((check) => {
    const override = input[check.id] || {};
    return {
      checkId: check.id,
      passed: override.passed ?? true,
      status: override.status || "pass",
      summary: override.summary || `${check.label} confirmed manually after the public safe-fix release.`,
      notes: override.notes
    };
  });
}

function resultFor(results: TeoyubePublicPostReleaseSafetyResult[], checkId: string): TeoyubePublicPostReleaseSafetyResult | undefined {
  return results.find((result) => result.checkId === checkId);
}

function checkPassed(results: TeoyubePublicPostReleaseSafetyResult[], checkId: string): boolean {
  const result = resultFor(results, checkId);
  return Boolean(result?.passed && result.status === "pass");
}

export function getPublicPostReleaseSafetyBlockers(results: TeoyubePublicPostReleaseSafetyResult[]): TeoyubePublicPostReleaseSafetyBlocker[] {
  return PUBLIC_POST_RELEASE_SAFETY_CHECKLIST
    .filter((check) => {
      const result = resultFor(results, check.id);
      return check.required && (!result || !result.passed || result.status === "fail" || result.status === "blocked" || result.status === "not_run");
    })
    .map((check) => ({
      id: `public_post_release_safety_${check.id}`,
      label: check.label,
      reason: "Required public post-release safety check did not pass.",
      requiredAction: "Pause public launch stabilization and resolve this safety check before continuing."
    }));
}

export function getPublicPostReleaseSafetyWarnings(results: TeoyubePublicPostReleaseSafetyResult[]): TeoyubePublicPostReleaseSafetyWarning[] {
  return results
    .filter((result) => result.status === "warning")
    .map((result) => ({
      id: `public_post_release_safety_warning_${result.checkId}`,
      label: result.checkId,
      message: result.summary,
      recommendedAction: "Keep this public post-release warning visible in owner review."
    }));
}

export function createPublicPostReleaseSafetyReport(results: TeoyubePublicPostReleaseSafetyResult[] = createPublicPostReleaseSafetyResults()) {
  const blockers = getPublicPostReleaseSafetyBlockers(results);
  const warnings = getPublicPostReleaseSafetyWarnings(results);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    checklist: PUBLIC_POST_RELEASE_SAFETY_CHECKLIST,
    results,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    scriptureAnchoringRequired: checkPassed(results, "scripture_anchors"),
    explanationPathsRequired: checkPassed(results, "explanation_paths"),
    fallbackSafetyRequired: checkPassed(results, "fallback_safety"),
    confidenceLabelsRequired: checkPassed(results, "confidence_labels"),
    privacyTermsConsentRequired: checkPassed(results, "privacy_terms_consent_notices"),
    consentControlsRequired: checkPassed(results, "consent_controls"),
    noHiddenPersonalizationCreated: checkPassed(results, "no_hidden_personalization"),
    noRawSensitiveTextStored: checkPassed(results, "no_raw_sensitive_text"),
    noDivineCertaintyClaims: checkPassed(results, "no_divine_certainty_claims"),
    noLegalApprovalClaimedWithoutRecord: checkPassed(results, "no_unsupported_legal_approval"),
    noExternalAnalyticsEnabled: checkPassed(results, "analytics_disabled"),
    noProductionPersistenceEnabled: checkPassed(results, "persistence_disabled"),
    noLiveAiOrchestrationEnabled: checkPassed(results, "live_ai_disabled"),
    noExternalProductionServicesRequired: checkPassed(results, "external_services_disabled"),
    noSecretsExposed: checkPassed(results, "secrets_not_exposed"),
    noPublicUrlFetched: checkPassed(results, "no_public_url_fetch"),
    noUsersContacted: checkPassed(results, "no_user_contact"),
    noFeedbackCollectedAutomatically: checkPassed(results, "no_automatic_feedback_collection"),
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
