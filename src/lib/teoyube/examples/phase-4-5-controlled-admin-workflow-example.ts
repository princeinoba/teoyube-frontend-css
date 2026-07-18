import {
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
  createPhase45OwnerReviewRecord,
  createPhase45OwnerReviewReport,
  createPhase45Package,
  createPhase45PackageReport,
  createServiceReadinessReviewReport,
  runPhase45Audit,
  simulateRequestScriptureReview
} from "../phase-4";

export function runPhase45ControlledAdminWorkflowExample() {
  const workspace = createControlledAdminWorkspace();
  const workspaceReport = createControlledAdminWorkspaceReport(workspace);
  const adminReviewBoard = createAdminReviewBoardViewModel({ workspace });
  const simulatedWorkspace = workspace.items[0]
    ? simulateRequestScriptureReview(workspace, workspace.items[0].id)
    : workspace;
  const serviceReadiness = createServiceReadinessReviewReport();
  const betaQaPlan = createBetaQaPlan();
  const betaQaPlanReport = createBetaQaPlanReport(betaQaPlan);
  const betaQaRunbook = createBetaQaRunbookReport();
  const sampleIssue = createBetaQaIssue({
    id: "example_missing_scripture_anchor",
    area: "scripture_anchor",
    title: "Missing Scripture anchor in recommendation",
    description: "A beta reviewer found a recommendation without visible Scripture support.",
    tags: ["missing scripture"]
  });
  const betaIssueTriage = createBetaQaIssueTriageReport([sampleIssue]);
  const betaReadinessPackage = createBetaReadinessPackage();
  const betaReadinessPackageReport = createBetaReadinessPackageReport(betaReadinessPackage);
  const ownerReview = createPhase45OwnerReviewRecord({ reviewed: false });
  const ownerReviewReport = createPhase45OwnerReviewReport(ownerReview);
  const phase45Package = createPhase45Package({ workspace: simulatedWorkspace, ownerReview });
  const phase45PackageReport = createPhase45PackageReport(phase45Package);
  const phase45Audit = runPhase45Audit();

  return {
    workspace,
    workspaceReport,
    adminReviewBoard,
    simulatedWorkspace,
    serviceReadiness,
    betaQaPlan,
    betaQaPlanReport,
    betaQaRunbook,
    betaIssueTriage,
    betaReadinessPackage,
    betaReadinessPackageReport,
    ownerReview,
    ownerReviewReport,
    phase45Package,
    phase45PackageReport,
    phase45Audit
  };
}
