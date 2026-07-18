import { compareDeploymentTargetOptions, createDeploymentTargetDecision } from "../deployment-target-selection";
import { createEnvironmentTemplateDocumentation, createPreviewEnvTemplate } from "../launch-env-template";
import { createLaunchEnvironmentSafetyReport } from "../launch-environment-safety-audit";
import { getLaunchEnvironmentVariableRegistry } from "../launch-environment-registry";
import { createLaunchEnvironmentValidationReport } from "../launch-environment-validator";
import { getDefaultLaunchFeatureFlags } from "../launch-feature-flags";
import { getPreviewLaunchConfigProfile } from "../launch-config-profiles";
import { runProductionLaunchReadinessAudit } from "../production-launch-readiness-audit";

export function createProductionLaunchEnvironmentSelectionExample() {
  const featureFlags = getDefaultLaunchFeatureFlags();
  const profile = getPreviewLaunchConfigProfile();

  return {
    featureFlags,
    registry: getLaunchEnvironmentVariableRegistry(),
    profile,
    validation: createLaunchEnvironmentValidationReport({
      environment: profile.environment,
      runtimeMode: profile.runtimeMode,
      featureFlags: profile.featureFlags
    }),
    deploymentComparison: compareDeploymentTargetOptions({ framework: "nextjs", needsPreviewDeployments: true }),
    deploymentDecision: createDeploymentTargetDecision({ framework: "nextjs", needsPreviewDeployments: true }),
    envTemplatePreview: createPreviewEnvTemplate(),
    templateDocumentation: createEnvironmentTemplateDocumentation(),
    environmentSafety: createLaunchEnvironmentSafetyReport({
      environment: profile.environment,
      runtimeMode: profile.runtimeMode,
      featureFlags: profile.featureFlags
    }),
    launchReadiness: runProductionLaunchReadinessAudit()
  };
}

