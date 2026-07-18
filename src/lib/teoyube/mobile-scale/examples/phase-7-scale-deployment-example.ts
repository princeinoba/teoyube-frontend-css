import {
  createAnalyticsProviderAdapterPlan,
  createAnalyticsProviderReadinessReport
} from "../analytics-provider-readiness";
import {
  createDeploymentReadinessReport,
  getPreviewDeploymentChecklist
} from "../deployment-readiness-checklist";
import {
  createEnvironmentSafetyReport,
  validateEnvironmentSafety
} from "../environment-safety";
import {
  createPersistenceAdapterPlan,
  createPersistenceAdapterReadinessReport
} from "../persistence-adapter-readiness";
import {
  createLoggingBoundaryReport,
  sanitizeProductionLogPayload
} from "../production-logging-boundaries";
import {
  createRouteScaleReadinessReport,
  getTeoyubeRouteScaleInventory
} from "../route-scale-readiness";
import {
  createRuntimeConfigReadinessReport,
  getSafeDefaultRuntimeConfig
} from "../runtime-config-readiness";
import {
  createScaleResilienceReport,
  getScaleResiliencePlan
} from "../scale-resilience-plan";
import { runPhase7ScaleDeploymentAudit } from "../phase-7-scale-deployment-audit";

export function runPhase7ScaleDeploymentExample() {
  const runtimeConfig = getSafeDefaultRuntimeConfig();
  const environmentSafety = validateEnvironmentSafety(runtimeConfig);
  const routeInventory = getTeoyubeRouteScaleInventory();
  const logPayload = {
    eventName: "tig.production.response.created",
    selectedScriptureReference: "Romans 8:28",
    confidenceLabel: "strong",
    rawInput: "This should be redacted before any production log."
  };
  const sanitizedLogPayload = sanitizeProductionLogPayload(logPayload);
  const loggingReport = createLoggingBoundaryReport(logPayload, runtimeConfig);
  const analyticsPlan = createAnalyticsProviderAdapterPlan("none");
  const persistencePlan = createPersistenceAdapterPlan("none");
  const deploymentReport = createDeploymentReadinessReport({
    target: "preview",
    typecheckPassing: true,
    lintPassing: true,
    buildPassing: true
  });
  const resiliencePlans = getScaleResiliencePlan();
  const audit = runPhase7ScaleDeploymentAudit();

  return {
    runtimeConfig,
    runtimeConfigReadiness: createRuntimeConfigReadinessReport(runtimeConfig),
    environmentSafety,
    environmentSafetyReport: createEnvironmentSafetyReport(runtimeConfig),
    routeInventory,
    routeScaleReadiness: createRouteScaleReadinessReport(),
    sanitizedLogPayload,
    loggingReport,
    analyticsPlan,
    analyticsReadiness: createAnalyticsProviderReadinessReport(),
    persistencePlan,
    persistenceReadiness: createPersistenceAdapterReadinessReport(),
    previewDeploymentChecklist: getPreviewDeploymentChecklist(),
    deploymentReport,
    resiliencePlans,
    resilienceReport: createScaleResilienceReport(),
    audit
  };
}

