import type {
  TeoyubeEnvironmentValidationIssue,
  TeoyubeEnvironmentValidationResult
} from "./launch-environment-contracts";
import { validateLaunchFeatureFlags } from "./launch-feature-flags";
import {
  normalizeLaunchEnvironmentConfig,
  type TeoyubeRawLaunchEnvironmentConfig,
  validatePublicEnvironmentSafety
} from "./launch-environment-validator";

function issue(
  id: string,
  message: string,
  severity: TeoyubeEnvironmentValidationIssue["severity"],
  recommendedAction: string
): TeoyubeEnvironmentValidationIssue {
  return {
    id,
    message,
    severity,
    riskLevel: severity === "error" ? "critical" : severity === "warning" ? "medium" : "low",
    recommendedAction
  };
}

function result(issues: TeoyubeEnvironmentValidationIssue[]): TeoyubeEnvironmentValidationResult {
  const errors = issues.filter((entry) => entry.severity === "error");
  return {
    valid: errors.length === 0,
    safetyLevel: errors.length === 0 ? "safe" : "unsafe",
    issues,
    warnings: issues.filter((entry) => entry.severity === "warning"),
    errors
  };
}

export function validateNoSecretLeakage(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationResult {
  return result(validatePublicEnvironmentSafety(config));
}

export function validateNoAccidentalExternalSending(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationResult {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  return result(
    normalized.featureFlags.externalAnalyticsSendingEnabled
      ? [issue("analytics_sending_enabled", "External analytics sending is enabled.", "error", "Disable external analytics sending.")]
      : []
  );
}

export function validateNoAccidentalPersistence(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationResult {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  return result(
    normalized.featureFlags.productionDatabasePersistenceEnabled
      ? [issue("production_persistence_enabled", "Production database persistence is enabled.", "error", "Disable production persistence.")]
      : []
  );
}

export function validateNoLiveAiOrchestration(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationResult {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  return result(
    normalized.featureFlags.liveAiOrchestrationEnabled
      ? [issue("live_ai_enabled", "Live AI orchestration is enabled.", "error", "Disable live AI orchestration.")]
      : []
  );
}

export function validateLaunchSafetyFeatureFlags(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationResult {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  const flagValidation = validateLaunchFeatureFlags(normalized.featureFlags);
  const additionalIssues = [
    normalized.featureFlags.debugOutputVisibleToUsers
      ? issue("debug_visible", "Debug output is visible to normal users.", "error", "Hide debug output.")
      : undefined,
    !normalized.featureFlags.personalizationPreviewEnabled
      ? issue("personalization_preview_disabled", "Personalization preview is disabled.", "warning", "Keep preview enabled only with consent controls.")
      : undefined
  ].filter((entry): entry is TeoyubeEnvironmentValidationIssue => Boolean(entry));

  return result([...flagValidation.issues, ...additionalIssues]);
}

export function createLaunchEnvironmentSafetyReport(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
) {
  const checks = [
    { id: "no_secret_leakage", result: validateNoSecretLeakage(config) },
    { id: "no_external_sending", result: validateNoAccidentalExternalSending(config) },
    { id: "no_persistence", result: validateNoAccidentalPersistence(config) },
    { id: "no_live_ai", result: validateNoLiveAiOrchestration(config) },
    { id: "safety_feature_flags", result: validateLaunchSafetyFeatureFlags(config) }
  ];
  const issues = checks.flatMap((entry) => entry.result.issues.map((item) => ({ ...item, id: `${entry.id}_${item.id}` })));
  const errors = issues.filter((entry) => entry.severity === "error");

  return {
    valid: errors.length === 0,
    safetyLevel: errors.length === 0 ? "safe" : "unsafe",
    checks,
    issues,
    warnings: issues.filter((entry) => entry.severity === "warning"),
    errors,
    generatedAt: new Date().toISOString()
  };
}

export function runLaunchEnvironmentSafetyAudit(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
) {
  return createLaunchEnvironmentSafetyReport(config);
}

