import { createDeploymentTargetDecision } from "../deployment-target-selection";
import { createLaunchEnvExampleTemplate } from "../launch-env-template";
import { createLaunchEnvironmentSafetyReport } from "../launch-environment-safety-audit";
import { getPublicLaunchEnvironmentVariables, getServerOnlyLaunchEnvironmentVariables } from "../launch-environment-registry";
import { createLaunchEnvironmentValidationReport, validatePublicEnvironmentSafety } from "../launch-environment-validator";
import { getDefaultLaunchFeatureFlags } from "../launch-feature-flags";
import { createLaunchQualityGateReport } from "../launch-quality-gates";

export function runProductionLaunchEnvironmentSelectionSmokeCheck() {
  const flags = getDefaultLaunchFeatureFlags();
  const publicVars = getPublicLaunchEnvironmentVariables();
  const serverVars = getServerOnlyLaunchEnvironmentVariables();
  const secretValidation = validatePublicEnvironmentSafety({
    publicEnv: {
      NEXT_PUBLIC_TEOYUBE_FAKE_SECRET: "sk-secret-looking-value"
    }
  });
  const decision = createDeploymentTargetDecision({ framework: "nextjs", needsPreviewDeployments: true });
  const template = createLaunchEnvExampleTemplate();
  const safety = createLaunchEnvironmentSafetyReport();
  const validation = createLaunchEnvironmentValidationReport();
  const gates = createLaunchQualityGateReport();
  const errors = [
    flags.externalAnalyticsSendingEnabled ? "Analytics sending should be disabled." : "",
    flags.productionDatabasePersistenceEnabled ? "Persistence should be disabled." : "",
    flags.liveAiOrchestrationEnabled ? "Live AI should be disabled." : "",
    publicVars.length > 0 && serverVars.length > 0 ? "" : "Registry should separate public and server-only variables.",
    secretValidation.some((entry) => entry.severity === "error") ? "" : "Public env validation should block secret-looking values.",
    decision.selectedTarget !== "unknown" ? "" : "Deployment target decision should be structured.",
    template.includes("disabled_until_later") ? "" : "Template should include disabled placeholders.",
    template.includes("sk-") ? "Template should not include real-looking API keys." : "",
    safety.valid ? "" : "Environment safety audit should pass.",
    validation.valid ? "" : "Environment validation should pass.",
    gates.gates.some((gate) => gate.id === "environment_config_validated") ? "" : "Quality gates should include environment checks."
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    noExternalSystemsRequired: true,
    notes: [
      "No database, external APIs, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required."
    ],
    generatedAt: new Date().toISOString()
  };
}
