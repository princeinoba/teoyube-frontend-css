import { createPostLaunchGrowthRoadmap, createPostLaunchGrowthRoadmapReport } from "../post-launch-growth-roadmap";
import { runPostLaunchOperations71Audit } from "../post-launch-operations-audit";
import { createPostLaunchOperationsPackage, createPostLaunchOperationsPackageReport } from "../post-launch-operations-package";
import { createPostLaunchPublicMonitoringPlan, createPostLaunchPublicMonitoringReport } from "../post-launch-public-monitoring-plan";
import { createPostLaunchSupportWorkflow, createPostLaunchSupportWorkflowReport } from "../post-launch-support-workflow";
import { runPostLaunchOperations71Example } from "./post-launch-operations-7-1-example";

export type TeoyubePostLaunchOperations71SmokeCheck = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string) {
  return { id, passed, details };
}

export function runPostLaunchOperations71SmokeCheck(): TeoyubePostLaunchOperations71SmokeCheck {
  const example = runPostLaunchOperations71Example();
  const publicMonitoringReport = createPostLaunchPublicMonitoringReport(createPostLaunchPublicMonitoringPlan());
  const unsafePublicMonitoringReport = createPostLaunchPublicMonitoringReport(createPostLaunchPublicMonitoringPlan({
    publicUrlFetched: true,
    monitoringProviderConnected: true,
    usersContacted: true
  }));
  const supportWorkflowReport = createPostLaunchSupportWorkflowReport(createPostLaunchSupportWorkflow());
  const unsafeSupportWorkflowReport = createPostLaunchSupportWorkflowReport(createPostLaunchSupportWorkflow({
    usersContacted: true,
    rawSensitiveTextStored: true,
    databaseWritten: true
  }));
  const growthRoadmapReport = createPostLaunchGrowthRoadmapReport(createPostLaunchGrowthRoadmap());
  const unsafeGrowthRoadmapReport = createPostLaunchGrowthRoadmapReport(createPostLaunchGrowthRoadmap({
    analyticsConnected: true,
    persistenceConnected: true,
    liveAiOrchestrationEnabled: true
  }));
  const operationsPackage = createPostLaunchOperationsPackage({
    publicMonitoringReport,
    supportWorkflowReport,
    growthRoadmapReport
  });
  const operationsPackageReport = createPostLaunchOperationsPackageReport(operationsPackage);
  const audit = runPostLaunchOperations71Audit();

  const checks = [
    check("public_monitoring_plan_structured", publicMonitoringReport.ready && publicMonitoringReport.monitoringItems.length >= 8, "Public monitoring plan returns structured manual monitoring items."),
    check("public_monitoring_blocks_external_actions", !unsafePublicMonitoringReport.ready && unsafePublicMonitoringReport.blockers.length >= 3, "Public monitoring blocks public URL fetches, monitoring providers, and user contact."),
    check("support_workflow_structured", supportWorkflowReport.ready && supportWorkflowReport.steps.length >= 10 && supportWorkflowReport.sanitizedOnly, "Support workflow is manual, sanitized, and structured."),
    check("support_workflow_blocks_sensitive_storage", !unsafeSupportWorkflowReport.ready && unsafeSupportWorkflowReport.blockers.length >= 3, "Support workflow blocks user contact, raw sensitive text storage, and persistence."),
    check("growth_roadmap_structured", growthRoadmapReport.ready && growthRoadmapReport.items.length >= 10 && growthRoadmapReport.decisionPointCount >= 3, "Growth roadmap keeps service decisions explicit and future-scoped."),
    check("growth_roadmap_blocks_unapproved_services", !unsafeGrowthRoadmapReport.ready && unsafeGrowthRoadmapReport.blockers.length >= 3, "Growth roadmap blocks analytics, persistence, and live AI connection."),
    check("operations_package_in_memory_only", operationsPackageReport.ready && operationsPackageReport.inMemoryOnly && operationsPackage.inMemoryOnly && operationsPackageReport.noExternalWrite, "Operations package is in-memory only."),
    check("guardrails_preserved", publicMonitoringReport.scriptureAnchoringRequired && publicMonitoringReport.explanationPathsRequired && publicMonitoringReport.fallbackEnabled && publicMonitoringReport.consentControlsRequired && growthRoadmapReport.consentAwarePersonalizationRequired, "Scripture, explanation, fallback, consent, privacy, and consent-aware personalization remain required."),
    check("side_effects_absent", operationsPackageReport.noUsersContacted && operationsPackageReport.noFeedbackCollectedAutomatically && operationsPackageReport.noPublicUrlFetched && operationsPackageReport.noProductionPersistenceEnabled && operationsPackageReport.noExternalAnalyticsEnabled && operationsPackageReport.noLiveAiOrchestrationEnabled && operationsPackageReport.noServiceWorkerRegistered, "No users are contacted, no feedback is collected automatically, no public URLs are fetched, no persistence or analytics are connected, no live AI is enabled, and no service worker is registered."),
    check("audit_complete", audit.complete && audit.completionPercentage === 100, "Post-Launch Operations 7.1 audit is complete."),
    check("example_runs", example.audit.complete && example.operationsPackageReport.ready, "Post-Launch Operations 7.1 example runs.")
  ];

  return {
    valid: checks.every((entry) => entry.passed),
    checks,
    generatedAt: new Date().toISOString()
  };
}
