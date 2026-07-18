import { createFinalLaunchReadinessPackage, createFinalLaunchReadinessPackageReport } from "./final-launch-readiness-package";
import { createFinalLaunchSafetyCertificationReport } from "./final-launch-safety-certification";
import { createLaunchQualityGateReport } from "./launch-quality-gates";
import { createManualPreviewEnvironmentReport, type TeoyubeManualPreviewEnvironmentConfig } from "./manual-preview-environment-verification";
import { createManualPreviewLocalCheckReport } from "./manual-preview-local-checks";
import type {
  TeoyubeManualPreviewDeploymentCommandResult,
  TeoyubeManualPreviewDeploymentDecision,
  TeoyubeManualPreviewDeploymentProvider,
  TeoyubeManualPreviewDeploymentReport
} from "./manual-preview-deployment-contracts";
import { createProviderSetupReport } from "./manual-preview-provider-setup";

export type TeoyubeManualPreviewDeploymentGoNoGoInput = {
  provider?: TeoyubeManualPreviewDeploymentProvider;
  environmentConfig?: TeoyubeManualPreviewEnvironmentConfig;
  localCheckResults?: TeoyubeManualPreviewDeploymentCommandResult[];
  ownerApproved?: boolean;
};

export function createManualPreviewDeploymentGoNoGoChecklist() {
  return [
    "Provider selected and manually reviewed.",
    "Preview environment verification passes.",
    "Local build checks are recorded.",
    "Launch quality gates have no critical failures.",
    "Final safety certification passes.",
    "Final readiness package is valid.",
    "External analytics sending is disabled.",
    "Production persistence is disabled.",
    "Live AI orchestration is disabled.",
    "No public secret-looking values are exposed.",
    "Scripture anchoring is required.",
    "Explanation path is required.",
    "Fallback readiness is enabled.",
    "Consent controls are enabled."
  ];
}

export function getManualPreviewDeploymentGoNoGoBlockers(
  input: TeoyubeManualPreviewDeploymentGoNoGoInput = {}
): string[] {
  const provider = input.provider || input.environmentConfig?.provider || "vercel";
  const providerReport = createProviderSetupReport(provider);
  const environment = createManualPreviewEnvironmentReport({
    ...input.environmentConfig,
    provider
  });
  const localChecks = createManualPreviewLocalCheckReport(input.localCheckResults || []);
  const quality = createLaunchQualityGateReport();
  const safety = createFinalLaunchSafetyCertificationReport();
  const readinessPackage = createFinalLaunchReadinessPackageReport(createFinalLaunchReadinessPackage());

  return [
    providerReport.selected ? "" : "Provider selection must be resolved before manual deployment.",
    providerReport.previewSupported ? "" : `Provider ${provider} does not have confirmed preview deployment support.`,
    environment.valid ? "" : `Preview environment is blocked: ${environment.blockers.join(" ")}`,
    localChecks.ready ? "" : `Required local checks are incomplete or blocked: ${localChecks.blockers.join(" ")}`,
    quality.status !== "blocked" ? "" : "Launch quality gates are blocked.",
    safety.valid ? "" : "Final launch safety certification must pass.",
    readinessPackage.valid ? "" : "Final readiness package must be valid.",
    environment.externalAnalyticsSendingDisabled ? "" : "External analytics sending must remain disabled.",
    environment.productionPersistenceDisabled ? "" : "Production persistence must remain disabled.",
    environment.liveAiOrchestrationDisabled ? "" : "Live AI orchestration must remain disabled.",
    environment.scriptureAnchoringRequired ? "" : "Scripture anchoring must remain required.",
    environment.explanationPathRequired ? "" : "Explanation paths must remain required.",
    environment.fallbackPathEnabled ? "" : "Fallback path must remain enabled.",
    environment.consentControlsEnabled ? "" : "Consent controls must remain enabled."
  ].filter(Boolean);
}

export function getManualPreviewDeploymentGoNoGoWarnings(
  input: TeoyubeManualPreviewDeploymentGoNoGoInput = {}
): string[] {
  const provider = input.provider || input.environmentConfig?.provider || "vercel";
  const environment = createManualPreviewEnvironmentReport({
    ...input.environmentConfig,
    provider
  });
  const localChecks = createManualPreviewLocalCheckReport(input.localCheckResults || []);

  return [
    ...environment.warnings,
    ...localChecks.warnings,
    input.ownerApproved ? "" : "Owner approval should be recorded before manually triggering provider deployment.",
    "This go/no-go report does not execute provider deployment commands."
  ].filter(Boolean);
}

export function getManualPreviewDeploymentGoNoGoReasons(
  input: TeoyubeManualPreviewDeploymentGoNoGoInput = {}
): string[] {
  const provider = input.provider || input.environmentConfig?.provider || "vercel";
  const environment = createManualPreviewEnvironmentReport({
    ...input.environmentConfig,
    provider
  });

  return [
    `Provider under review: ${provider}.`,
    `Environment status: ${environment.status}.`,
    "Scripture anchoring, explanation path, fallback handling, safety guardrails, and consent controls are treated as launch-critical.",
    "External analytics, production persistence, live AI orchestration, raw text storage, service workers, and native mobile work remain disabled."
  ];
}

export function evaluateManualPreviewDeploymentGoNoGo(
  input: TeoyubeManualPreviewDeploymentGoNoGoInput = {}
): TeoyubeManualPreviewDeploymentDecision {
  const provider = input.provider || input.environmentConfig?.provider || "vercel";
  const blockers = getManualPreviewDeploymentGoNoGoBlockers(input);
  const warnings = getManualPreviewDeploymentGoNoGoWarnings(input);

  if (provider === "undecided" || provider === "unknown") return "needs_provider_selection";
  if (blockers.some((entry) => entry.toLowerCase().includes("local checks"))) return "needs_build_fix";
  if (blockers.some((entry) => entry.toLowerCase().includes("environment"))) return "needs_environment_fix";
  if (blockers.length > 0) return "blocked";
  return warnings.length ? "ready_after_environment_review" : "ready_for_manual_provider_deployment";
}

export function createManualPreviewDeploymentGoNoGoReport(
  input: TeoyubeManualPreviewDeploymentGoNoGoInput = {}
): TeoyubeManualPreviewDeploymentReport & {
  reasons: string[];
  goNoGoChecklist: string[];
  ownerApproved: boolean;
} {
  const provider = input.provider || input.environmentConfig?.provider || "vercel";
  const providerStatus = createProviderSetupReport(provider);
  const environmentStatus = createManualPreviewEnvironmentReport({
    ...input.environmentConfig,
    provider
  });
  const blockers = getManualPreviewDeploymentGoNoGoBlockers(input);
  const warnings = getManualPreviewDeploymentGoNoGoWarnings(input);
  const decision = evaluateManualPreviewDeploymentGoNoGo(input);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: decision === "ready_for_manual_provider_deployment" || decision === "ready_after_environment_review",
    decision,
    provider,
    providerStatus,
    environmentStatus,
    blockers,
    warnings,
    reasons: getManualPreviewDeploymentGoNoGoReasons(input),
    goNoGoChecklist: createManualPreviewDeploymentGoNoGoChecklist(),
    ownerApproved: input.ownerApproved ?? false,
    nextStep:
      decision === "ready_for_manual_provider_deployment"
        ? "Manually run the provider preview deployment after owner approval."
        : "Resolve environment, provider, or local check warnings before manual deployment.",
    noActualDeploymentPerformed: true,
    noExternalSystemsRequired: true,
    generatedAt: new Date().toISOString()
  };
}
