import type {
  TeoyubeEnvironmentValidationIssue,
  TeoyubeEnvironmentValidationResult,
  TeoyubeLaunchEnvironment,
  TeoyubeLaunchFeatureFlags,
  TeoyubeRuntimeMode
} from "./launch-environment-contracts";
import { getDisabledUntilLaterEnvironmentVariables, getPublicLaunchEnvironmentVariables } from "./launch-environment-registry";
import { getDefaultLaunchFeatureFlags, validateLaunchFeatureFlags } from "./launch-feature-flags";

export type TeoyubeRawLaunchEnvironmentConfig = {
  environment?: TeoyubeLaunchEnvironment;
  runtimeMode?: TeoyubeRuntimeMode;
  featureFlags?: Partial<TeoyubeLaunchFeatureFlags>;
  publicEnv?: Record<string, string | undefined>;
  serverEnv?: Record<string, string | undefined>;
};

export type TeoyubeNormalizedLaunchEnvironmentConfig = {
  environment: TeoyubeLaunchEnvironment;
  runtimeMode: TeoyubeRuntimeMode;
  featureFlags: TeoyubeLaunchFeatureFlags;
  publicEnv: Record<string, string | undefined>;
  serverEnv: Record<string, string | undefined>;
};

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

function looksSecret(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.toLowerCase();
  return (
    normalized.includes("sk-") ||
    normalized.includes("secret") ||
    normalized.includes("token") ||
    normalized.includes("private") ||
    normalized.includes("password") ||
    normalized.length > 80
  );
}

export function normalizeLaunchEnvironmentConfig(
  rawConfig: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeNormalizedLaunchEnvironmentConfig {
  return {
    environment: rawConfig.environment || "local",
    runtimeMode: rawConfig.runtimeMode || "launch_preparation",
    featureFlags: {
      ...getDefaultLaunchFeatureFlags(),
      ...(rawConfig.featureFlags || {})
    },
    publicEnv: rawConfig.publicEnv || {},
    serverEnv: rawConfig.serverEnv || {}
  };
}

export function validatePublicEnvironmentSafety(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationIssue[] {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  const publicKeys = getPublicLaunchEnvironmentVariables().map((entry) => entry.key);
  const issues: TeoyubeEnvironmentValidationIssue[] = [];

  Object.entries(normalized.publicEnv).forEach(([key, value]) => {
    if (!publicKeys.includes(key)) {
      issues.push(issue("unknown_public_env", `Unknown public environment variable: ${key}.`, "warning", "Confirm this public variable is intentional."));
    }
    if (looksSecret(value)) {
      issues.push(issue("public_secret_like_value", `Public environment variable ${key} looks secret-like.`, "error", "Move secrets to server-only configuration and use placeholders in examples."));
    }
  });

  if (normalized.featureFlags.debugOutputVisibleToUsers && normalized.environment === "production") {
    issues.push(issue("production_debug_ui_enabled", "Production debug UI must be disabled.", "error", "Set debug output visible to users to false."));
  }

  return issues;
}

export function validateServerEnvironmentSafety(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationIssue[] {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  const disabledKeys = getDisabledUntilLaterEnvironmentVariables().map((entry) => entry.key);
  const issues: TeoyubeEnvironmentValidationIssue[] = [];

  disabledKeys.forEach((key) => {
    const value = normalized.serverEnv[key];
    if (value && value !== "disabled_until_later" && value !== "not_configured") {
      issues.push(issue("future_service_value_present", `${key} has a value even though the service is disabled until later.`, "warning", "Do not configure future provider secrets until the relevant guarded launch step."));
    }
  });

  return issues;
}

export function getLaunchEnvironmentConfigWarnings(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationIssue[] {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  const warnings = [
    issue("deployment_not_started", "This validator does not deploy or connect providers.", "info", "Use it to prepare safe launch configuration only.")
  ];

  if (normalized.environment === "production" && normalized.runtimeMode !== "production") {
    warnings.push(issue("production_env_non_production_mode", "Production environment is paired with a non-production runtime mode.", "warning", "Confirm this is intentional for pre-launch validation."));
  }

  return warnings;
}

export function validateLaunchEnvironmentConfig(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
): TeoyubeEnvironmentValidationResult {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  const flagValidation = validateLaunchFeatureFlags(normalized.featureFlags);
  const issues = [
    ...flagValidation.issues,
    ...validatePublicEnvironmentSafety(normalized),
    ...validateServerEnvironmentSafety(normalized),
    ...getLaunchEnvironmentConfigWarnings(normalized)
  ];
  const errors = issues.filter((entry) => entry.severity === "error");

  return {
    valid: errors.length === 0,
    safetyLevel: errors.length === 0 ? "safe" : "unsafe",
    issues,
    warnings: issues.filter((entry) => entry.severity === "warning"),
    errors
  };
}

export function createLaunchEnvironmentValidationReport(
  config: TeoyubeRawLaunchEnvironmentConfig = {}
) {
  const normalized = normalizeLaunchEnvironmentConfig(config);
  const validation = validateLaunchEnvironmentConfig(normalized);

  return {
    config: normalized,
    valid: validation.valid,
    safetyLevel: validation.safetyLevel,
    issueCount: validation.issues.length,
    issues: validation.issues,
    generatedAt: new Date().toISOString()
  };
}

