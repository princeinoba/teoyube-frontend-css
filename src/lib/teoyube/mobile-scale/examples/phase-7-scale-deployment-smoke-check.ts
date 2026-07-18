import {
  createAnalyticsProviderAdapterPlan,
  sanitizeAnalyticsEventForProvider,
  validateAnalyticsProviderConnectionPlan
} from "../analytics-provider-readiness";
import {
  createDeploymentReadinessReport,
  validateDeploymentReadiness
} from "../deployment-readiness-checklist";
import { createEnvironmentSafetyReport } from "../environment-safety";
import {
  createPersistenceAdapterPlan,
  sanitizePersistenceRecordPreview,
  validatePersistenceAdapterPlan
} from "../persistence-adapter-readiness";
import {
  createLoggingBoundaryReport,
  sanitizeProductionLogPayload
} from "../production-logging-boundaries";
import { createRouteScaleReadinessReport } from "../route-scale-readiness";
import {
  createRuntimeConfigReadinessReport,
  getSafeDefaultRuntimeConfig,
  validateTeoyubeRuntimeConfig
} from "../runtime-config-readiness";
import { createScaleResilienceReport } from "../scale-resilience-plan";
import { runPhase7ScaleDeploymentAudit } from "../phase-7-scale-deployment-audit";
import { runPhase7ScaleDeploymentExample } from "./phase-7-scale-deployment-example";

export type Phase7ScaleDeploymentSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase7ScaleDeploymentSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase7ScaleDeploymentSmokeCheckResult[];
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

function result(name: string, errors: string[]): Phase7ScaleDeploymentSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function containsForbiddenStorageReference(value: unknown): boolean {
  const serialized = JSON.stringify(value ?? {}).toLowerCase();
  return [
    "localstorage",
    "indexeddb",
    "document.cookie",
    "serviceworker.register",
    "fs.write",
    "database write"
  ].some((pattern) => serialized.includes(pattern));
}

export function runPhase7ScaleDeploymentSmokeCheck(): Phase7ScaleDeploymentSmokeCheckReport {
  const config = getSafeDefaultRuntimeConfig();
  const runtimeValidation = validateTeoyubeRuntimeConfig(config);
  const runtimeReport = createRuntimeConfigReadinessReport(config);
  const environmentReport = createEnvironmentSafetyReport(config);
  const routeReport = createRouteScaleReadinessReport();
  const payload = {
    eventName: "tig.production.response.created",
    selectedScriptureReference: "Romans 8:28",
    rawInput: "Private input should be redacted.",
    debugPayload: {
      stack: "Debug stack should be redacted."
    }
  };
  const sanitizedPayload = sanitizeProductionLogPayload(payload);
  const loggingReport = createLoggingBoundaryReport(payload, config);
  const analyticsPlan = createAnalyticsProviderAdapterPlan("none");
  const analyticsValidation = validateAnalyticsProviderConnectionPlan(analyticsPlan);
  const sanitizedAnalytics = sanitizeAnalyticsEventForProvider(payload, config);
  const persistencePlan = createPersistenceAdapterPlan("none");
  const persistenceValidation = validatePersistenceAdapterPlan(persistencePlan);
  const persistencePreview = sanitizePersistenceRecordPreview(
    {
      savedScripture: "Romans 8:28",
      rawInput: "Private text should be redacted."
    },
    config
  );
  const deploymentValidation = validateDeploymentReadiness({
    target: "preview",
    typecheckPassing: true,
    lintPassing: true,
    buildPassing: true
  });
  const deploymentReport = createDeploymentReadinessReport({
    target: "preview",
    typecheckPassing: true,
    lintPassing: true,
    buildPassing: true
  });
  const resilience = createScaleResilienceReport();
  const audit = runPhase7ScaleDeploymentAudit();
  const example = runPhase7ScaleDeploymentExample();

  const results = [
    result("safe default runtime config exists", clean([
      config.deploymentTarget === "local" ? "" : "Default deployment target should be local.",
      runtimeValidation.valid ? "" : "Default runtime config should be valid.",
      runtimeReport.complete ? "" : "Runtime config readiness report should be complete."
    ])),
    result("risky features disabled by default", clean([
      config.featureFlags.analyticsEnabled ? "Analytics should be disabled by default." : "",
      config.featureFlags.externalEventSendingEnabled ? "External event sending should be disabled by default." : "",
      config.featureFlags.productionPersistenceEnabled ? "Production persistence should be disabled by default." : "",
      config.featureFlags.liveAiOrchestrationEnabled ? "Live AI orchestration should be disabled by default." : "",
      config.featureFlags.debugModeEnabled ? "Debug mode should be disabled by default." : ""
    ])),
    result("environment safety is structured", clean([
      environmentReport.complete ? "" : "Environment safety report should be complete.",
      environmentReport.checks.length >= 5 ? "" : "Environment safety should include detailed checks."
    ])),
    result("route scale readiness is structured", clean([
      routeReport.complete ? "" : "Route scale readiness should be complete.",
      routeReport.checks.length >= 10 ? "" : "Route scale inventory should cover major surfaces."
    ])),
    result("logging payloads are sanitized", clean([
      JSON.stringify(sanitizedPayload).includes("Private input")
        ? "Sanitized payload should remove raw private input."
        : "",
      loggingReport.redactedFields.includes("rawInput")
        ? ""
        : "Logging report should redact rawInput.",
      loggingReport.boundaries.length ? "" : "Logging boundaries should be present."
    ])),
    result("analytics provider plan does not send events", clean([
      analyticsValidation.valid ? "" : "Analytics provider plan should be valid.",
      analyticsPlan.sendsExternally ? "Analytics plan should not send externally." : "",
      analyticsPlan.connected ? "Analytics plan should not be connected." : "",
      sanitizedAnalytics.externalAnalyticsSent === false
        ? ""
        : "Sanitized analytics payload should mark externalAnalyticsSent false."
    ])),
    result("persistence adapter plan does not write to database", clean([
      persistenceValidation.valid ? "" : "Persistence adapter plan should be valid.",
      persistencePlan.writesToDatabase ? "Persistence plan should not write to a database." : "",
      persistencePlan.connected ? "Persistence plan should not be connected." : "",
      persistencePreview.rawInput === "[redacted]"
        ? ""
        : "Persistence preview should redact raw input."
    ])),
    result("deployment checklist returns structured results", clean([
      deploymentValidation.valid ? "" : "Preview deployment validation should be valid when checks are marked passing.",
      deploymentReport.checks.length >= 12 ? "" : "Deployment checklist should include required readiness checks."
    ])),
    result("resilience plan includes fallback paths", clean([
      resilience.complete ? "" : "Resilience report should be complete.",
      resilience.pathCount >= 8 ? "" : "Resilience plan should include multiple fallback paths.",
      resilience.invalidPathIds.length ? "Every resilience path should preserve required safety properties." : ""
    ])),
    result("audit returns structured report", clean([
      audit.complete ? "" : "Phase 7.4 audit should be complete.",
      audit.completionPercentage === 100 ? "" : "Phase 7.4 audit should be 100%.",
      audit.nextStep === "Phase 7.5 - Final Mobile & Scale Completion Audit"
        ? ""
        : "Phase 7.4 audit should point to Phase 7.5."
    ])),
    result("no prohibited runtime storage or providers required", clean([
      containsForbiddenStorageReference({
        config,
        runtimeReport,
        environmentReport,
        routeReport,
        loggingReport,
        analyticsPlan,
        persistencePlan,
        deploymentReport,
        resilience,
        audit
      })
        ? "Phase 7.4 structures should not require service workers, localStorage, IndexedDB, cookies, file writes, or database writes."
        : ""
    ])),
    result("example demonstrates scale deployment flow", clean([
      example.audit.complete ? "" : "Example should include completed Phase 7.4 audit.",
      example.analyticsPlan.sendsExternally ? "Example analytics plan should not send events." : "",
      example.persistencePlan.writesToDatabase ? "Example persistence plan should not write to a database." : ""
    ]))
  ];
  const errors = results.flatMap((entry) =>
    entry.errors.map((error) => `${entry.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}

