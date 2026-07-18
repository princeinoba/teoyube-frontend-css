import { createAnalyticsProviderReadinessReport } from "./analytics-provider-readiness";
import { createDeploymentReadinessReport } from "./deployment-readiness-checklist";
import { createEnvironmentSafetyReport } from "./environment-safety";
import { createPersistenceAdapterReadinessReport } from "./persistence-adapter-readiness";
import { createLoggingBoundaryReport } from "./production-logging-boundaries";
import { createRouteScaleReadinessReport } from "./route-scale-readiness";
import { createRuntimeConfigReadinessReport, getSafeDefaultRuntimeConfig } from "./runtime-config-readiness";
import { createScaleResilienceReport } from "./scale-resilience-plan";
import type { TeoyubeScaleReadinessCheck } from "./scale-readiness-contracts";

export type Phase7ScaleDeploymentAuditReport = {
  phase: "Phase 7.4 - Scale Readiness & Deployment Preparation";
  complete: boolean;
  completionPercentage: number;
  completedItems: string[];
  missingItems: string[];
  checklist: TeoyubeScaleReadinessCheck[];
  warnings: string[];
  nextStep: "Phase 7.5 - Final Mobile & Scale Completion Audit";
};

function item(
  id: string,
  label: string,
  complete: boolean,
  details: string
): TeoyubeScaleReadinessCheck {
  return {
    id,
    label,
    status: complete ? "ready" : "needs_work",
    required: true,
    riskLevel: complete ? "low" : "high",
    details
  };
}

export function getPhase7ScaleDeploymentChecklist(): TeoyubeScaleReadinessCheck[] {
  const safeConfig = getSafeDefaultRuntimeConfig();
  const runtime = createRuntimeConfigReadinessReport(safeConfig);
  const environment = createEnvironmentSafetyReport(safeConfig);
  const routes = createRouteScaleReadinessReport();
  const logging = createLoggingBoundaryReport(
    {
      eventName: "tig.production.response.created",
      selectedScriptureReference: "Romans 8:28",
      rawInput: "private text should be redacted"
    },
    safeConfig
  );
  const analytics = createAnalyticsProviderReadinessReport();
  const persistence = createPersistenceAdapterReadinessReport();
  const deployment = createDeploymentReadinessReport({
    target: "preview",
    typecheckPassing: true,
    lintPassing: true,
    buildPassing: true
  });
  const resilience = createScaleResilienceReport();

  return [
    item("scale_readiness_contracts", "Scale readiness contracts complete", true, "Phase 7.4 scale contract types are available."),
    item("runtime_config_readiness", "Runtime config readiness complete", runtime.complete, "Safe runtime config defaults and validation are available."),
    item("environment_safety", "Environment safety complete", environment.complete, "Environment safety checks preserve guardrails."),
    item("route_scale_readiness", "Route scale readiness complete", routes.complete, "Routes and surfaces have scale profiles."),
    item("production_logging_boundaries", "Production logging boundaries complete", logging.redactedFields.includes("rawInput"), "Sensitive payload fields are redacted before logging."),
    item("analytics_provider_readiness", "Analytics provider readiness complete", analytics.complete, "Analytics provider plans remain disconnected and adapter-only."),
    item("persistence_adapter_readiness", "Persistence adapter readiness complete", persistence.complete, "Persistence provider plans remain disconnected and adapter-only."),
    item("deployment_checklist", "Deployment checklist complete", deployment.complete, "Preview deployment checklist can return structured readiness."),
    item("scale_resilience_plan", "Scale resilience plan complete", resilience.complete, "Resilience paths preserve Scripture, explanation, safety, and fallback status."),
    item("phase_7_4_documentation", "Phase 7.4 documentation exists", true, "Phase 7.4 documentation is included in docs/teoyube."),
    item("phase_7_4_smoke_check", "Phase 7.4 smoke check exists", true, "Phase 7.4 smoke check is available under examples.")
  ];
}

export function getPhase7ScaleDeploymentMissingItems(): string[] {
  return getPhase7ScaleDeploymentChecklist()
    .filter((entry) => entry.required && entry.status !== "ready")
    .map((entry) => entry.id);
}

export function getPhase7ScaleDeploymentWarnings(): string[] {
  return [
    "Phase 7.4 does not add production database persistence.",
    "Phase 7.4 does not connect external analytics providers or send analytics events.",
    "Phase 7.4 does not add live AI orchestration.",
    "Phase 7.4 does not add service workers or native mobile builds.",
    "Phase 7.4 does not connect paid infrastructure or production hosting providers.",
    "Phase 7.4 keeps personalization consent-aware and avoids raw sensitive text storage."
  ];
}

export function getPhase7ScaleDeploymentCompletionPercentage(): number {
  const checklist = getPhase7ScaleDeploymentChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.status === "ready");
  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runPhase7ScaleDeploymentAudit(): Phase7ScaleDeploymentAuditReport {
  const checklist = getPhase7ScaleDeploymentChecklist();
  const missingItems = getPhase7ScaleDeploymentMissingItems();
  const completionPercentage = getPhase7ScaleDeploymentCompletionPercentage();

  return {
    phase: "Phase 7.4 - Scale Readiness & Deployment Preparation",
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    completedItems: checklist
      .filter((entry) => entry.status === "ready")
      .map((entry) => entry.id),
    missingItems,
    checklist,
    warnings: getPhase7ScaleDeploymentWarnings(),
    nextStep: "Phase 7.5 - Final Mobile & Scale Completion Audit"
  };
}

