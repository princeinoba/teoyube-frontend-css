import type {
  TeoyubeEnvironmentConfigProfile,
  TeoyubeEnvironmentValidationResult
} from "./launch-environment-contracts";
import {
  getProductionCandidateFeatureFlags,
  getSafePreviewFeatureFlags,
  getSoftLaunchFeatureFlags
} from "./launch-feature-flags";
import {
  getOptionalLaunchEnvironmentVariables,
  getRequiredLaunchEnvironmentVariables
} from "./launch-environment-registry";
import { validateLaunchEnvironmentConfig } from "./launch-environment-validator";

const disabledServices = [
  "external analytics sending",
  "production database persistence",
  "live AI orchestration",
  "service worker",
  "native mobile mode",
  "hidden personalization",
  "raw sensitive text storage"
];

const safetyRequirements = [
  "Scripture anchoring required",
  "Explanation path required",
  "Fallback path enabled",
  "Safety guardrails enabled",
  "Consent controls enabled",
  "Debug output hidden from normal users"
];

function baseProfile(overrides: Partial<TeoyubeEnvironmentConfigProfile>): TeoyubeEnvironmentConfigProfile {
  return {
    id: "launch_profile",
    label: "Launch Profile",
    environment: "local",
    runtimeMode: "launch_preparation",
    deploymentTarget: "undecided",
    featureFlags: getSafePreviewFeatureFlags(),
    requiredEnvironmentVariables: getRequiredLaunchEnvironmentVariables().map((entry) => entry.key),
    optionalEnvironmentVariables: getOptionalLaunchEnvironmentVariables().map((entry) => entry.key),
    disabledServices,
    safetyRequirements,
    debugVisibleToUsers: false,
    launchRiskLevel: "low",
    ...overrides
  };
}

export function getLocalLaunchConfigProfile(): TeoyubeEnvironmentConfigProfile {
  return baseProfile({
    id: "local_launch_profile",
    label: "Local Launch Preparation Profile"
  });
}

export function getPreviewLaunchConfigProfile(): TeoyubeEnvironmentConfigProfile {
  return baseProfile({
    id: "preview_launch_profile",
    label: "Preview Launch Configuration Profile",
    environment: "preview",
    runtimeMode: "safe_preview",
    deploymentTarget: "vercel",
    featureFlags: getSafePreviewFeatureFlags()
  });
}

export function getStagingLaunchConfigProfile(): TeoyubeEnvironmentConfigProfile {
  return baseProfile({
    id: "staging_launch_profile",
    label: "Staging Launch Configuration Profile",
    environment: "staging",
    runtimeMode: "soft_launch",
    deploymentTarget: "vercel",
    featureFlags: getSoftLaunchFeatureFlags(),
    launchRiskLevel: "medium"
  });
}

export function getProductionCandidateLaunchConfigProfile(): TeoyubeEnvironmentConfigProfile {
  return baseProfile({
    id: "production_candidate_launch_profile",
    label: "Production Candidate Launch Configuration Profile",
    environment: "production",
    runtimeMode: "production",
    deploymentTarget: "vercel",
    featureFlags: getProductionCandidateFeatureFlags(),
    launchRiskLevel: "medium"
  });
}

export function validateLaunchConfigProfile(
  profile: TeoyubeEnvironmentConfigProfile
): TeoyubeEnvironmentValidationResult {
  return validateLaunchEnvironmentConfig({
    environment: profile.environment,
    runtimeMode: profile.runtimeMode,
    featureFlags: profile.featureFlags
  });
}

export function createLaunchConfigProfileReport(profile: TeoyubeEnvironmentConfigProfile) {
  const validation = validateLaunchConfigProfile(profile);

  return {
    profile,
    valid: validation.valid,
    safetyLevel: validation.safetyLevel,
    disabledServices: profile.disabledServices,
    safetyRequirements: profile.safetyRequirements,
    issues: validation.issues,
    generatedAt: new Date().toISOString()
  };
}
