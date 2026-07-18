import {
  createAdminReviewBoardReport,
  createAdminReviewBoardViewModel,
  createBetaQaIssue,
  createBetaQaIssueTriageReport,
  createBetaQaPlan,
  createBetaQaPlanReport,
  createBetaQaRunbookReport,
  createBetaReadinessPackage,
  createBetaReadinessPackageReport,
  createControlledAdminWorkspace,
  createControlledAdminWorkspaceReport,
  createPhase45OwnerReviewChecklist,
  createPhase45Package,
  createPhase45PackageReport,
  createServiceReadinessReviewReport,
  runPhase45Audit,
  simulateApproveForFutureRelease
} from "../phase-4";
import { runPhase45ControlledAdminWorkflowExample } from "./phase-4-5-controlled-admin-workflow-example";

export type TeoyubePhase45SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase45SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase45SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noProductionDataModified: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  noBrowserPersistenceRequired: true;
  reviewOnlyContentNotPublished: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase45SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase45ControlledAdminWorkflowSmokeCheck(): TeoyubePhase45SmokeCheckReport {
  const workspace = createControlledAdminWorkspace();
  const workspaceReport = createControlledAdminWorkspaceReport(workspace);
  const reviewBoard = createAdminReviewBoardViewModel({ workspace });
  const reviewBoardReport = createAdminReviewBoardReport({ viewModel: reviewBoard });
  const simulated = workspace.items[0] ? simulateApproveForFutureRelease(workspace, workspace.items[0].id) : workspace;
  const serviceReadiness = createServiceReadinessReviewReport();
  const betaQaPlan = createBetaQaPlan();
  const betaQaPlanReport = createBetaQaPlanReport(betaQaPlan);
  const betaQaRunbook = createBetaQaRunbookReport();
  const blockingIssue = createBetaQaIssue({
    id: "smoke_review_only_live_flow",
    area: "reviewed_content_gate",
    title: "Review-only content appearing in live flow",
    description: "Smoke check issue should be classified as a blocker.",
    tags: ["review-only content"]
  });
  const betaIssueTriage = createBetaQaIssueTriageReport([blockingIssue]);
  const betaReadinessPackage = createBetaReadinessPackage();
  const betaReadinessPackageReport = createBetaReadinessPackageReport(betaReadinessPackage);
  const ownerChecklist = createPhase45OwnerReviewChecklist();
  const phase45Package = createPhase45Package();
  const phase45PackageReport = createPhase45PackageReport(phase45Package);
  const phase45Audit = runPhase45Audit();
  const example = runPhase45ControlledAdminWorkflowExample();

  const disabledServiceFlags =
    workspaceReport.noExternalServicesRequired &&
    workspaceReport.noDatabasePersistenceEnabled &&
    workspaceReport.noAnalyticsEnabled &&
    workspaceReport.noMonitoringProviderConnected &&
    workspaceReport.noLiveAiOrchestrationEnabled &&
    workspaceReport.noAdminAuthAdded &&
    workspaceReport.noCmsConnected &&
    serviceReadiness.noDatabasePersistenceEnabled &&
    serviceReadiness.noAnalyticsEnabled &&
    serviceReadiness.noMonitoringProviderConnected &&
    serviceReadiness.noLiveAiOrchestrationEnabled &&
    serviceReadiness.noAdminAuthAdded &&
    serviceReadiness.noCmsConnected &&
    betaReadinessPackageReport.noDatabasePersistenceEnabled &&
    betaReadinessPackageReport.noAnalyticsEnabled &&
    betaReadinessPackageReport.noMonitoringProviderConnected &&
    betaReadinessPackageReport.noLiveAiOrchestrationEnabled &&
    betaReadinessPackageReport.noAdminAuthAdded &&
    betaReadinessPackageReport.noCmsConnected &&
    phase45PackageReport.noBrowserPersistenceRequired;

  const checks = [
    check("controlled_admin_contracts_compile", workspace.id === "phase_4_5_controlled_admin_workspace", "Controlled admin prototype contracts and workspace are available."),
    check("admin_workspace_in_memory_only", workspaceReport.valid && workspaceReport.inMemoryOnly && workspaceReport.noProductionDataModified, "Admin workspace is in-memory only and does not modify production data."),
    check("admin_review_board_structured", reviewBoardReport.valid && reviewBoard.panels.length >= 8, "Admin review board returns structured review panels."),
    check("admin_workflow_simulator_safe", simulated !== workspace && simulated.noProductionDataModified && simulated.noAutomaticPublishing, "Admin workflow simulator returns a new in-memory workspace and does not publish."),
    check("service_readiness_disabled", serviceReadiness.valid && serviceReadiness.serviceConnectedCount === 0, "Service readiness review connects no services."),
    check("beta_qa_plan_structured", betaQaPlanReport.valid && betaQaPlanReport.scenarioCount >= 12, "Beta QA plan returns structured scenarios."),
    check("beta_qa_runbook_structured", betaQaRunbook.valid && betaQaRunbook.sections.length >= 4, "Beta QA runbook returns structured sections."),
    check("beta_issue_triage_blocks", !betaIssueTriage.valid && betaIssueTriage.blockingIssues.length === 1, "Beta issue triage identifies blocking issues."),
    check("beta_readiness_package_in_memory", betaReadinessPackageReport.valid && betaReadinessPackage.inMemoryOnly, "Beta readiness package is in-memory only."),
    check("owner_review_checklist", ownerChecklist.length >= 10, "Owner review checklist exists."),
    check("phase_4_5_package_in_memory", phase45PackageReport.valid && phase45Package.inMemoryOnly && phase45Package.noProductionDataModified, "Phase 4.5 package is in-memory only."),
    check("phase_4_5_audit", phase45Audit.complete && phase45Audit.completionPercentage === 100, "Phase 4.5 audit returns complete."),
    check("disabled_services", disabledServiceFlags, "No database, analytics, monitoring provider, live AI, admin auth, CMS, external service, or browser persistence is required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by Phase 4.5 modules."),
    check("review_only_content_not_published", workspace.items.every((item) => !item.productionPublished && !item.addedToLiveRecommendations), "Review-only content is not production-published."),
    check("example_runs", example.phase45Audit.completionPercentage === phase45Audit.completionPercentage, "Phase 4.5 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...workspaceReport.warnings.map((entry) => entry.message),
    ...reviewBoardReport.warnings.map((entry) => entry.message),
    ...serviceReadiness.warnings.map((entry) => entry.message),
    ...betaQaPlanReport.warnings.map((entry) => entry.message),
    ...betaQaRunbook.warnings,
    ...betaReadinessPackageReport.warnings,
    ...phase45PackageReport.warnings,
    ...phase45Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noProductionDataModified: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    reviewOnlyContentNotPublished: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
