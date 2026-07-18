import type {
  TeoyubeManualPreviewRegressionCheck,
  TeoyubeManualPreviewRegressionCheckType,
  TeoyubeManualPreviewRegressionResult
} from "./manual-preview-regression-verification-contracts";

export type TeoyubeManualPreviewPostFixSafetyCheck = {
  id: string;
  label: string;
  type: TeoyubeManualPreviewRegressionCheckType;
  required: boolean;
  launchCritical: boolean;
  verificationModule: string;
  details: string;
};

export type TeoyubeManualPreviewPostFixSafetyReport = {
  valid: boolean;
  checkCount: number;
  passCount: number;
  warningCount: number;
  blockerCount: number;
  blockers: string[];
  warnings: string[];
  checklist: TeoyubeManualPreviewPostFixSafetyCheck[];
  scriptureAnchoringRequired: boolean;
  explanationPathRequired: boolean;
  fallbackPathEnabled: boolean;
  consentControlsEnabled: boolean;
  personalizationConsentAware: boolean;
  externalAnalyticsDisabled: boolean;
  productionPersistenceDisabled: boolean;
  liveAiOrchestrationDisabled: boolean;
  debugUiHidden: boolean;
  noRawSensitiveTextStorage: boolean;
  noExternalWrite: true;
  generatedAt: string;
};

function check(
  id: string,
  label: string,
  type: TeoyubeManualPreviewRegressionCheckType,
  details: string,
  launchCritical = true
): TeoyubeManualPreviewPostFixSafetyCheck {
  return {
    id,
    label,
    type,
    required: true,
    launchCritical,
    verificationModule: "manual-preview-post-fix-safety-verification",
    details
  };
}

export function getPostFixSafetyVerificationChecklist(): TeoyubeManualPreviewPostFixSafetyCheck[] {
  return [
    check("post_fix_scripture_anchoring", "Scripture anchoring remains required", "scripture_anchor", "Every usable TIG response keeps a Scripture anchor."),
    check("post_fix_explanation_paths", "Explanation paths remain required", "explanation_path", "Decision trace or graph trace stays visible or accessible."),
    check("post_fix_fallback_safety", "Fallback path remains enabled", "fallback", "Fallbacks stay non-empty, bounded, and Scripture-anchored."),
    check("post_fix_confidence_labels", "Confidence labels remain bounded", "confidence", "Confidence stays visible where applicable and never claims certainty.", false),
    check("post_fix_consent_safety", "Consent controls remain enabled", "consent", "Personalization and feedback remain visible, consent-aware, and reversible."),
    check("post_fix_privacy_boundaries", "Privacy boundaries remain intact", "privacy", "No raw sensitive text or secret-like payload is exposed."),
    check("post_fix_debug_safety", "Debug UI remains hidden from normal users", "debug_safety", "Debug internals remain developer-only."),
    check("post_fix_no_external_sending", "External analytics remain disabled", "privacy", "No external analytics provider is called."),
    check("post_fix_no_persistence", "Production persistence remains disabled", "privacy", "No production database write is introduced."),
    check("post_fix_no_live_ai", "Live AI orchestration remains disabled", "privacy", "No live AI provider orchestration is introduced.")
  ];
}

function hasPassingResult(
  results: Array<TeoyubeManualPreviewRegressionResult | TeoyubeManualPreviewRegressionCheck>,
  type: TeoyubeManualPreviewRegressionCheckType,
  id?: string
): boolean {
  return results.some((result) =>
    result.type === type &&
    (!id || result.id === id || "checkId" in result && result.checkId === id) &&
    (!("status" in result) || result.status === "pass" || result.status === "warning")
  );
}

export function validatePostFixScriptureAnchoring(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "scripture_anchor");
}

export function validatePostFixExplanationPaths(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "explanation_path");
}

export function validatePostFixFallbackSafety(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "fallback");
}

export function validatePostFixConsentSafety(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "consent");
}

export function validatePostFixPrivacyBoundaries(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "privacy");
}

export function validatePostFixNoExternalSending(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "privacy", "post_fix_no_external_sending");
}

export function validatePostFixNoPersistence(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "privacy", "post_fix_no_persistence");
}

export function validatePostFixNoLiveAiOrchestration(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return hasPassingResult(results, "privacy", "post_fix_no_live_ai");
}

export function createPostFixSafetyVerificationReport(
  results: TeoyubeManualPreviewRegressionResult[]
): TeoyubeManualPreviewPostFixSafetyReport {
  const checklist = getPostFixSafetyVerificationChecklist();
  const blockers = checklist
    .filter((entry) => entry.required && entry.launchCritical)
    .filter((entry) => !hasPassingResult(results, entry.type, entry.id))
    .map((entry) => `${entry.label} is not verified.`);
  const warnings = checklist
    .filter((entry) => entry.required && !entry.launchCritical)
    .filter((entry) => !hasPassingResult(results, entry.type, entry.id))
    .map((entry) => `${entry.label} should be reviewed before soft launch.`);

  return {
    valid: blockers.length === 0,
    checkCount: checklist.length,
    passCount: checklist.length - blockers.length - warnings.length,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    blockers,
    warnings,
    checklist,
    scriptureAnchoringRequired: validatePostFixScriptureAnchoring(results),
    explanationPathRequired: validatePostFixExplanationPaths(results),
    fallbackPathEnabled: validatePostFixFallbackSafety(results),
    consentControlsEnabled: validatePostFixConsentSafety(results),
    personalizationConsentAware: validatePostFixConsentSafety(results),
    externalAnalyticsDisabled: validatePostFixNoExternalSending(results),
    productionPersistenceDisabled: validatePostFixNoPersistence(results),
    liveAiOrchestrationDisabled: validatePostFixNoLiveAiOrchestration(results),
    debugUiHidden: hasPassingResult(results, "debug_safety"),
    noRawSensitiveTextStorage: validatePostFixPrivacyBoundaries(results),
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
