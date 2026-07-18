import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";

export type TeoyubePreviewConsentPrivacyResult = {
  id: string;
  surface: TeoyubePostDeploymentQaSurface;
  personalizationConsentAware?: boolean;
  consentControlsAvailable?: boolean;
  disableResetExportDeleteClear?: boolean;
  rawTextStorageDisabled?: boolean;
  hiddenPersonalizationAbsent?: boolean;
  externalAnalyticsNotSending?: boolean;
  productionPersistenceDisabled?: boolean;
  liveAiOrchestrationDisabled?: boolean;
  debugOutputHidden?: boolean;
  notes?: string;
};

function resultBlockers(result: TeoyubePreviewConsentPrivacyResult): string[] {
  return [
    result.personalizationConsentAware === false ? `${result.surface}: personalization is not visibly consent-aware.` : "",
    result.consentControlsAvailable === false ? `${result.surface}: consent controls are missing.` : "",
    result.rawTextStorageDisabled === false ? `${result.surface}: raw text storage appears enabled.` : "",
    result.hiddenPersonalizationAbsent === false ? `${result.surface}: hidden personalization appears present.` : "",
    result.externalAnalyticsNotSending === false ? `${result.surface}: external analytics appears to be sending.` : "",
    result.productionPersistenceDisabled === false ? `${result.surface}: production persistence appears enabled.` : "",
    result.liveAiOrchestrationDisabled === false ? `${result.surface}: live AI orchestration appears enabled.` : "",
    result.debugOutputHidden === false ? `${result.surface}: debug output is visible to normal users.` : ""
  ].filter(Boolean);
}

export function getPreviewConsentPrivacyChecklist(): string[] {
  return [
    "Personalization is visibly consent-aware.",
    "Consent controls are available.",
    "Disable/reset/export/delete simulation controls are clear where present.",
    "Raw text storage is disabled by default.",
    "Hidden personalization is not introduced.",
    "External analytics are not sending.",
    "Production persistence is not enabled.",
    "Live AI orchestration is not enabled.",
    "Debug output is hidden from normal users."
  ];
}

export function validatePreviewConsentControlsResult(result: TeoyubePreviewConsentPrivacyResult): boolean {
  return result.personalizationConsentAware !== false && result.consentControlsAvailable !== false;
}

export function validatePreviewPrivacyBoundaryResult(result: TeoyubePreviewConsentPrivacyResult): boolean {
  return result.rawTextStorageDisabled !== false &&
    result.hiddenPersonalizationAbsent !== false &&
    result.debugOutputHidden !== false;
}

export function validatePreviewNoExternalSendingResult(result: TeoyubePreviewConsentPrivacyResult): boolean {
  return result.externalAnalyticsNotSending !== false &&
    result.productionPersistenceDisabled !== false &&
    result.liveAiOrchestrationDisabled !== false;
}

export function getPreviewConsentPrivacyBlockers(
  results: TeoyubePreviewConsentPrivacyResult[] = []
): string[] {
  return results.flatMap(resultBlockers);
}

export function getPreviewConsentPrivacyWarnings(
  results: TeoyubePreviewConsentPrivacyResult[] = []
): string[] {
  return [
    results.length === 0 ? "Consent/privacy verification results have not been recorded yet." : "",
    ...results
      .filter((result) => result.disableResetExportDeleteClear === false)
      .map((result) => `${result.surface}: disable/reset/export/delete controls need clearer wording.`)
  ].filter(Boolean);
}

export function createPreviewConsentPrivacyReport(
  results: TeoyubePreviewConsentPrivacyResult[] = []
) {
  const blockers = getPreviewConsentPrivacyBlockers(results);
  const warnings = getPreviewConsentPrivacyWarnings(results);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "needs_review" : "ready",
    checklist: getPreviewConsentPrivacyChecklist(),
    resultCount: results.length,
    blockers,
    warnings,
    results,
    analyticsDisabled: results.every((result) => result.externalAnalyticsNotSending !== false),
    persistenceDisabled: results.every((result) => result.productionPersistenceDisabled !== false),
    liveAiDisabled: results.every((result) => result.liveAiOrchestrationDisabled !== false),
    generatedAt: new Date().toISOString()
  };
}
