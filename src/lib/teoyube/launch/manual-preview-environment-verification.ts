import { getSafePreviewFeatureFlags } from "./launch-feature-flags";
import type { TeoyubeLaunchFeatureFlags } from "./launch-environment-contracts";
import type {
  TeoyubeManualPreviewDeploymentEnvironmentStatus,
  TeoyubeManualPreviewDeploymentProvider
} from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewEnvironmentConfig = {
  provider?: TeoyubeManualPreviewDeploymentProvider;
  environmentProfile?: "preview" | "production_candidate" | "local" | "unknown";
  featureFlags?: Partial<TeoyubeLaunchFeatureFlags>;
  personalizationConsentAware?: boolean;
  publicEnvironmentVariables?: Record<string, string | undefined>;
};

function mergedFlags(config: TeoyubeManualPreviewEnvironmentConfig = {}): TeoyubeLaunchFeatureFlags {
  return {
    ...getSafePreviewFeatureFlags(),
    ...config.featureFlags
  };
}

function hasSecretLikeName(name: string): boolean {
  const normalized = name.toLowerCase();
  return [
    "secret",
    "token",
    "private",
    "password",
    "passwd",
    "apikey",
    "api_key",
    "client_secret",
    "service_role"
  ].some((needle) => normalized.includes(needle));
}

function hasSecretLikeValue(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim();
  return normalized.length > 24 && /[A-Za-z]/.test(normalized) && /\d/.test(normalized);
}

function publicVariableNames(config: TeoyubeManualPreviewEnvironmentConfig): string[] {
  return Object.keys(config.publicEnvironmentVariables || {}).sort();
}

export function getManualPreviewEnvironmentChecklist(): string[] {
  return [
    "Scripture anchoring is required.",
    "Explanation path is required.",
    "Fallback path is enabled.",
    "Safety guardrails are enabled.",
    "Consent controls are enabled.",
    "Personalization preview is enabled only when consent-aware.",
    "External analytics sending is disabled.",
    "Production database persistence is disabled.",
    "Live AI orchestration is disabled.",
    "Raw sensitive text storage is disabled.",
    "Debug UI is disabled for public preview.",
    "No secret-looking values are exposed in public variables."
  ];
}

export function validateManualPreviewFeatureFlags(config: TeoyubeManualPreviewEnvironmentConfig = {}) {
  const flags = mergedFlags(config);
  const consentAware = config.personalizationConsentAware ?? true;
  const blockers = [
    !flags.scriptureAnchoringRequired ? "Scripture anchoring must remain required." : "",
    !flags.explanationPathRequired ? "Explanation paths must remain required." : "",
    !flags.fallbackPathEnabled ? "Fallback path must remain enabled." : "",
    !flags.safetyGuardrailsEnabled ? "Safety guardrails must remain enabled." : "",
    !flags.consentControlsEnabled ? "Consent controls must remain enabled." : "",
    flags.personalizationPreviewEnabled && !consentAware
      ? "Personalization preview can run only when consent-aware."
      : "",
    flags.externalAnalyticsSendingEnabled ? "External analytics sending must remain disabled." : "",
    flags.productionDatabasePersistenceEnabled ? "Production persistence must remain disabled." : "",
    flags.liveAiOrchestrationEnabled ? "Live AI orchestration must remain disabled." : "",
    flags.rawTextStorageEnabled ? "Raw sensitive text storage must remain disabled." : "",
    flags.debugOutputVisibleToUsers ? "Debug UI must be disabled for public preview." : "",
    flags.serviceWorkerEnabled ? "Service workers must remain disabled for this step." : "",
    flags.nativeMobileModeEnabled ? "Native mobile mode must remain disabled for this step." : "",
    flags.hiddenPersonalizationEnabled ? "Hidden personalization must remain disabled." : ""
  ].filter(Boolean);

  return {
    valid: blockers.length === 0,
    blockers,
    flags
  };
}

export function validateManualPreviewSecretSafety(config: TeoyubeManualPreviewEnvironmentConfig = {}) {
  const names = publicVariableNames(config);
  const blockers = names
    .filter((name) => {
      const value = config.publicEnvironmentVariables?.[name];
      return hasSecretLikeName(name) || hasSecretLikeValue(value);
    })
    .map((name) => `Public environment variable ${name} looks secret-like and must be removed or renamed.`);

  return {
    valid: blockers.length === 0,
    blockers,
    publicVariableNames: names
  };
}

export function validateManualPreviewEnvironment(
  config: TeoyubeManualPreviewEnvironmentConfig = {}
): TeoyubeManualPreviewDeploymentEnvironmentStatus {
  const flags = mergedFlags(config);
  const featureFlagValidation = validateManualPreviewFeatureFlags(config);
  const secretValidation = validateManualPreviewSecretSafety(config);
  const provider = config.provider || "vercel";
  const environmentProfile = config.environmentProfile || "preview";
  const blockers = [
    ...featureFlagValidation.blockers,
    ...secretValidation.blockers
  ];
  const warnings = [
    provider === "undecided" || provider === "unknown"
      ? "Provider selection should be confirmed before manual deployment."
      : "",
    "Preview environment values must be reviewed manually in the provider dashboard."
  ].filter(Boolean);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    valid: blockers.length === 0,
    provider,
    environmentProfile,
    scriptureAnchoringRequired: flags.scriptureAnchoringRequired,
    explanationPathRequired: flags.explanationPathRequired,
    fallbackPathEnabled: flags.fallbackPathEnabled,
    safetyGuardrailsEnabled: flags.safetyGuardrailsEnabled,
    consentControlsEnabled: flags.consentControlsEnabled,
    personalizationPreviewEnabled: flags.personalizationPreviewEnabled,
    personalizationConsentAware: config.personalizationConsentAware ?? true,
    externalAnalyticsSendingDisabled: !flags.externalAnalyticsSendingEnabled,
    productionPersistenceDisabled: !flags.productionDatabasePersistenceEnabled,
    liveAiOrchestrationDisabled: !flags.liveAiOrchestrationEnabled,
    rawTextStorageDisabled: !flags.rawTextStorageEnabled,
    debugUiDisabledForPublicPreview: !flags.debugOutputVisibleToUsers,
    publicVariableNames: secretValidation.publicVariableNames,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}

export function createManualPreviewEnvironmentReport(
  config: TeoyubeManualPreviewEnvironmentConfig = {}
): TeoyubeManualPreviewDeploymentEnvironmentStatus {
  return validateManualPreviewEnvironment(config);
}
