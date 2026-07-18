import { getPreviewLaunchConfigProfile, validateLaunchConfigProfile } from "./launch-config-profiles";
import type { TeoyubeLaunchFeatureFlags } from "./launch-environment-contracts";
import type {
  TeoyubePreviewDeploymentTarget,
  TeoyubePreviewEnvironmentProfile,
  TeoyubePreviewDeploymentWarning,
  TeoyubePreviewDeploymentBlocker
} from "./preview-deployment-contracts";

export type TeoyubePreviewEnvironmentPackage = {
  id: string;
  label: string;
  target: TeoyubePreviewDeploymentTarget;
  runtimeMode: "safe_preview";
  featureFlags: TeoyubeLaunchFeatureFlags;
  environmentVariablePlaceholders: string[];
  disabledUntilLater: string[];
  safetyRequirements: string[];
  manualReviewNotes: string[];
  rollbackNotes: string[];
  generatedAt: string;
};

function targetFromConfig(value: string): TeoyubePreviewDeploymentTarget {
  if (["vercel", "netlify", "render", "railway", "self_hosted", "undecided"].includes(value)) {
    return value as TeoyubePreviewDeploymentTarget;
  }

  return "unknown";
}

export function getPreviewEnvironmentFeatureFlags(): TeoyubeLaunchFeatureFlags {
  return getPreviewLaunchConfigProfile().featureFlags;
}

export function getPreviewEnvironmentVariablePlan(): string[] {
  const profile = getPreviewLaunchConfigProfile();
  return [
    ...profile.requiredEnvironmentVariables.map((key) => `${key}=<set safe preview value>`),
    ...profile.optionalEnvironmentVariables.map((key) => `${key}=<optional placeholder>`)
  ];
}

export function getPreviewEnvironmentChecklist(): string[] {
  return [
    "Use placeholder values only; do not commit real secrets.",
    "Keep external analytics sending disabled.",
    "Keep production database persistence disabled.",
    "Keep live AI orchestration disabled.",
    "Keep raw text storage disabled.",
    "Keep Scripture anchoring, explanations, fallbacks, guardrails, consent, and offline fallback enabled.",
    "Keep debug UI hidden from public preview users.",
    "Review rollback notes before any manual provider deployment."
  ];
}

export function createPreviewEnvironmentPackage(): TeoyubePreviewEnvironmentPackage {
  const profile = getPreviewLaunchConfigProfile();

  return {
    id: "preview_environment_package",
    label: "Teoyube Safe Preview Environment Package",
    target: targetFromConfig(profile.deploymentTarget),
    runtimeMode: "safe_preview",
    featureFlags: profile.featureFlags,
    environmentVariablePlaceholders: getPreviewEnvironmentVariablePlan(),
    disabledUntilLater: [
      "production database persistence",
      "external analytics provider sending",
      "live AI orchestration",
      "service worker",
      "native mobile app build",
      "raw sensitive text storage",
      "hidden personalization"
    ],
    safetyRequirements: [
      ...profile.safetyRequirements,
      "Offline fallback enabled",
      "Manual QA review before public sharing"
    ],
    manualReviewNotes: [
      "Confirm the preview provider target manually before deployment.",
      "Run available local checks before creating a preview deployment.",
      "Confirm no real secrets are present in preview configuration."
    ],
    rollbackNotes: [
      "If preview behavior is unsafe, remove the preview URL from circulation.",
      "Revert to the last known safe commit or disable the affected surface.",
      "Keep provider rollback/manual review provider-specific until deployment target is final."
    ],
    generatedAt: new Date().toISOString()
  };
}

export function toPreviewEnvironmentProfile(
  previewPackage: TeoyubePreviewEnvironmentPackage = createPreviewEnvironmentPackage()
): TeoyubePreviewEnvironmentProfile {
  return {
    id: previewPackage.id,
    label: previewPackage.label,
    target: previewPackage.target,
    runtimeMode: previewPackage.runtimeMode,
    featureFlags: previewPackage.featureFlags as unknown as Record<string, boolean>,
    environmentVariablePlaceholders: previewPackage.environmentVariablePlaceholders,
    disabledUntilLater: previewPackage.disabledUntilLater,
    safetyRequirements: previewPackage.safetyRequirements,
    manualReviewNotes: previewPackage.manualReviewNotes,
    rollbackNotes: previewPackage.rollbackNotes
  };
}

export function validatePreviewEnvironmentPackage(previewPackage: TeoyubePreviewEnvironmentPackage) {
  const validation = validateLaunchConfigProfile(getPreviewLaunchConfigProfile());
  const flags = previewPackage.featureFlags;
  const blockers: TeoyubePreviewDeploymentBlocker[] = [
    validation.valid
      ? undefined
      : {
          id: "preview_environment_invalid",
          reason: "Preview launch configuration failed validation.",
          requiredAction: "Fix preview environment feature flags before preview deployment."
        },
    flags.externalAnalyticsSendingEnabled
      ? {
          id: "preview_analytics_enabled",
          reason: "External analytics sending must remain disabled.",
          requiredAction: "Disable external analytics sending."
        }
      : undefined,
    flags.productionDatabasePersistenceEnabled
      ? {
          id: "preview_persistence_enabled",
          reason: "Production database persistence must remain disabled.",
          requiredAction: "Disable production persistence."
        }
      : undefined,
    flags.liveAiOrchestrationEnabled
      ? {
          id: "preview_live_ai_enabled",
          reason: "Live AI orchestration must remain disabled.",
          requiredAction: "Disable live AI orchestration."
        }
      : undefined,
    flags.rawTextStorageEnabled
      ? {
          id: "preview_raw_text_enabled",
          reason: "Raw sensitive text storage must remain disabled.",
          requiredAction: "Disable raw text storage."
        }
      : undefined
  ].filter((entry): entry is TeoyubePreviewDeploymentBlocker => Boolean(entry));
  const warnings: TeoyubePreviewDeploymentWarning[] = [
    {
      id: "manual_provider_review_required",
      message: "Provider-specific preview deployment settings must still be reviewed manually.",
      recommendedAction: "Review the chosen preview provider dashboard before any deployment."
    }
  ];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createPreviewEnvironmentPackageReport(
  previewPackage: TeoyubePreviewEnvironmentPackage = createPreviewEnvironmentPackage()
) {
  const validation = validatePreviewEnvironmentPackage(previewPackage);

  return {
    valid: validation.valid,
    target: previewPackage.target,
    placeholderCount: previewPackage.environmentVariablePlaceholders.length,
    disabledServiceCount: previewPackage.disabledUntilLater.length,
    safetyRequirementCount: previewPackage.safetyRequirements.length,
    package: previewPackage,
    blockers: validation.blockers,
    warnings: validation.warnings,
    generatedAt: new Date().toISOString()
  };
}

