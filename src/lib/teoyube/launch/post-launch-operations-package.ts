import type {
  TeoyubePostLaunchOperationsDecision,
  TeoyubePostLaunchOperationsPackage
} from "./post-launch-operations-contracts";
import { createPostLaunchGrowthRoadmap, createPostLaunchGrowthRoadmapReport } from "./post-launch-growth-roadmap";
import { createPostLaunchPublicMonitoringPlan, createPostLaunchPublicMonitoringReport } from "./post-launch-public-monitoring-plan";
import { createPostLaunchReadinessPackage, createPostLaunchReadinessPackageReport } from "./post-launch-readiness-package";
import { createPostLaunchSupportWorkflow, createPostLaunchSupportWorkflowReport } from "./post-launch-support-workflow";

export type TeoyubePostLaunchOperationsPackageInput = Partial<TeoyubePostLaunchOperationsPackage>;

export function createPostLaunchOperationsPackage(
  input: TeoyubePostLaunchOperationsPackageInput = {}
): TeoyubePostLaunchOperationsPackage {
  const publicMonitoringReport = input.publicMonitoringReport || createPostLaunchPublicMonitoringReport(createPostLaunchPublicMonitoringPlan());
  const supportWorkflowReport = input.supportWorkflowReport || createPostLaunchSupportWorkflowReport(createPostLaunchSupportWorkflow());
  const growthRoadmapReport = input.growthRoadmapReport || createPostLaunchGrowthRoadmapReport(createPostLaunchGrowthRoadmap());
  const readinessPackageReport = input.readinessPackageReport || createPostLaunchReadinessPackageReport(createPostLaunchReadinessPackage());

  return {
    id: input.id || "post_launch_operations_package_7_1",
    label: input.label || "Post-Launch Operations 7.1 Package",
    publicMonitoringReport,
    supportWorkflowReport,
    growthRoadmapReport,
    readinessPackageReport,
    recommendedNextStage: "Post-Launch Operations",
    recommendedNextStep: "7.2 - Support Desk, Feedback Review & Weekly Improvement Loop",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicUrlFetched: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    productionPersistenceEnabled: false,
    externalAnalyticsEnabled: false,
    liveAiOrchestrationEnabled: false,
    serviceWorkerRegistered: false,
    rawSensitiveTextStored: false,
    hiddenPersonalizationCreated: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPostLaunchOperationsPackageBlockers(pkg: TeoyubePostLaunchOperationsPackage) {
  const publicMonitoringReport = pkg.publicMonitoringReport as ReturnType<typeof createPostLaunchPublicMonitoringReport>;
  const supportWorkflowReport = pkg.supportWorkflowReport as ReturnType<typeof createPostLaunchSupportWorkflowReport>;
  const growthRoadmapReport = pkg.growthRoadmapReport as ReturnType<typeof createPostLaunchGrowthRoadmapReport>;
  const readinessPackageReport = pkg.readinessPackageReport as ReturnType<typeof createPostLaunchReadinessPackageReport>;
  return [
    ...publicMonitoringReport.blockers,
    ...supportWorkflowReport.blockers,
    ...growthRoadmapReport.blockers,
    ...readinessPackageReport.blockers,
    pkg.fileWritten ? { id: "post_launch_operations_package_file_written", label: pkg.label, reason: "7.1 package must not write files.", requiredAction: "Keep package in memory.", riskLevel: "high" as const } : undefined,
    pkg.databaseWritten || pkg.productionPersistenceEnabled ? { id: "post_launch_operations_package_persistence", label: pkg.label, reason: "7.1 package must not connect production persistence.", requiredAction: "Keep persistence disabled.", riskLevel: "critical" as const } : undefined,
    pkg.analyticsSent || pkg.externalAnalyticsEnabled ? { id: "post_launch_operations_package_analytics", label: pkg.label, reason: "7.1 package must not send or enable external analytics.", requiredAction: "Keep analytics disabled.", riskLevel: "critical" as const } : undefined,
    pkg.externalServicesCalled ? { id: "post_launch_operations_package_external_services", label: pkg.label, reason: "7.1 package must not call external services.", requiredAction: "Keep provider decisions manual and future-scoped.", riskLevel: "critical" as const } : undefined,
    pkg.publicUrlFetched ? { id: "post_launch_operations_package_public_url", label: pkg.label, reason: "7.1 package must not fetch public URLs.", requiredAction: "Keep public URL checks manual.", riskLevel: "critical" as const } : undefined,
    pkg.usersContacted ? { id: "post_launch_operations_package_users_contacted", label: pkg.label, reason: "7.1 package must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "post_launch_operations_package_auto_feedback", label: pkg.label, reason: "7.1 package must not collect feedback automatically.", requiredAction: "Use manual feedback only.", riskLevel: "critical" as const } : undefined,
    pkg.liveAiOrchestrationEnabled ? { id: "post_launch_operations_package_live_ai", label: pkg.label, reason: "7.1 package must not enable live AI orchestration.", requiredAction: "Keep live AI disabled.", riskLevel: "critical" as const } : undefined,
    pkg.serviceWorkerRegistered ? { id: "post_launch_operations_package_service_worker", label: pkg.label, reason: "7.1 package must not add service workers.", requiredAction: "Remove service worker work.", riskLevel: "critical" as const } : undefined,
    pkg.rawSensitiveTextStored ? { id: "post_launch_operations_package_raw_sensitive_text", label: pkg.label, reason: "7.1 package must not store raw sensitive text.", requiredAction: "Use redacted summaries only.", riskLevel: "critical" as const } : undefined,
    pkg.hiddenPersonalizationCreated ? { id: "post_launch_operations_package_hidden_personalization", label: pkg.label, reason: "7.1 package must not create hidden personalization.", requiredAction: "Keep personalization consent-aware and visible.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPostLaunchOperationsPackageWarnings(pkg: TeoyubePostLaunchOperationsPackage) {
  const publicMonitoringReport = pkg.publicMonitoringReport as ReturnType<typeof createPostLaunchPublicMonitoringReport>;
  const supportWorkflowReport = pkg.supportWorkflowReport as ReturnType<typeof createPostLaunchSupportWorkflowReport>;
  const growthRoadmapReport = pkg.growthRoadmapReport as ReturnType<typeof createPostLaunchGrowthRoadmapReport>;
  const readinessPackageReport = pkg.readinessPackageReport as ReturnType<typeof createPostLaunchReadinessPackageReport>;
  return [
    ...publicMonitoringReport.warnings,
    ...supportWorkflowReport.warnings,
    ...growthRoadmapReport.warnings,
    ...readinessPackageReport.warnings
  ];
}

export function createPostLaunchOperationsPackageDecision(pkg: TeoyubePostLaunchOperationsPackage): TeoyubePostLaunchOperationsDecision {
  const blockers = getPostLaunchOperationsPackageBlockers(pkg);
  const warnings = getPostLaunchOperationsPackageWarnings(pkg);
  if (blockers.length > 0) return "blocked";
  if (warnings.some((entry) => entry.id.includes("no_public_launch_record"))) return "not_applicable_no_public_launch_recorded";
  if (warnings.length > 0) return "ready_after_owner_review";
  return "ready_for_public_monitoring_support_growth";
}

export function validatePostLaunchOperationsPackage(pkg: TeoyubePostLaunchOperationsPackage) {
  const blockers = getPostLaunchOperationsPackageBlockers(pkg);
  const warnings = getPostLaunchOperationsPackageWarnings(pkg);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPostLaunchOperationsPackageReport(
  pkg: TeoyubePostLaunchOperationsPackage = createPostLaunchOperationsPackage()
) {
  const validation = validatePostLaunchOperationsPackage(pkg);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPostLaunchOperationsPackageDecision(pkg),
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noProductionPersistenceEnabled: true,
    noExternalAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noServiceWorkerRegistered: true,
    noRawSensitiveTextStored: true,
    noHiddenPersonalizationCreated: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
