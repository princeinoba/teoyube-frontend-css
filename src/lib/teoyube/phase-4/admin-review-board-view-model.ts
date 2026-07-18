import {
  createControlledAdminWorkspace,
  createControlledAdminWorkspaceReport,
  getAdminWorkspaceItemsBySurface
} from "./controlled-admin-workspace";
import type {
  TeoyubeControlledAdminPrototypeReport,
  TeoyubeControlledAdminPrototypeStatus,
  TeoyubeControlledAdminPrototypeSurface,
  TeoyubeControlledAdminReviewItem,
  TeoyubeControlledAdminReviewPanel,
  TeoyubeControlledAdminWorkspace
} from "./controlled-admin-prototype-contracts";
import { createServiceReadinessReviewReport } from "./service-readiness-review";
import { createBetaQaPlanReport } from "./beta-qa-plan-builder";

export type TeoyubeAdminReviewBoardViewModel = {
  id: string;
  title: string;
  workspace: TeoyubeControlledAdminWorkspace;
  panels: TeoyubeControlledAdminReviewPanel[];
  summary: {
    reviewItemCount: number;
    blockerCount: number;
    warningCount: number;
    releaseCandidateCount: number;
    serviceReadinessDecision: string;
    betaQaDecision: string;
  };
  prototypeOnly: true;
  noProductionCms: true;
  noAdminAuthAdded: true;
  noDatabasePersistenceEnabled: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeAdminReviewBoardReport = TeoyubeControlledAdminPrototypeReport & {
  viewModel: TeoyubeAdminReviewBoardViewModel;
  panelCount: number;
};

function statusForPanel(items: TeoyubeControlledAdminReviewItem[]): TeoyubeControlledAdminPrototypeStatus {
  if (!items.length) return "empty";
  if (items.some((item) => item.status === "blocked")) return "blocked";
  if (items.some((item) => item.requiredReviews.some((review) => !item.completedReviews.includes(review)))) return "needs_review";
  if (items.some((item) => item.status === "ready_for_future_release")) return "ready_for_future_release";
  return "ready_for_review";
}

function panel(
  surface: TeoyubeControlledAdminPrototypeSurface,
  title: string,
  summary: string,
  workspace: TeoyubeControlledAdminWorkspace
): TeoyubeControlledAdminReviewPanel {
  const items = getAdminWorkspaceItemsBySurface(workspace, surface);
  return {
    id: `panel_${surface}`,
    title,
    surface,
    status: statusForPanel(items),
    summary,
    items,
    requiredReviewCount: items.reduce((count, item) => count + item.requiredReviews.length, 0),
    blockerCount: items.reduce((count, item) => count + item.blockers.length, 0),
    warningCount: items.reduce((count, item) => count + item.warnings.length, 0),
    prototypeOnly: true
  };
}

export function createContentQueueReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  return panel("content_review_queue", "Content Review Queue", "Review-only content backlog items and required review states.", input.workspace || createControlledAdminWorkspace());
}

export function createPromiseDraftReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  return panel("promise_cluster_drafts", "Promise Cluster Drafts", "Prototype panel for Promise Cluster draft review and required Scripture/theology checks.", input.workspace || createControlledAdminWorkspace());
}

export function createScriptureAnchorReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  return panel("scripture_anchor_review", "Scripture Anchor Review", "Prototype panel for visible Scripture anchor review status.", input.workspace || createControlledAdminWorkspace());
}

export function createPrayerCallingActionReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  return panel("prayer_calling_action_review", "Prayer, Calling, and Action Review", "Prototype panel for devotional boundary and explanation-path review.", input.workspace || createControlledAdminWorkspace());
}

export function createTigRelationshipReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  return panel("tig_relationship_review", "TIG Relationship Review", "Prototype panel for TIG relationship review, anchors, and confidence boundaries.", input.workspace || createControlledAdminWorkspace());
}

export function createReleaseCandidateReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  return panel("release_candidate_review", "Release Candidate Review", "Manual release candidates remain in-memory and are not added to live recommendation flows.", input.workspace || createControlledAdminWorkspace());
}

export function createServiceReadinessReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  const workspace = input.workspace || createControlledAdminWorkspace();
  const serviceReport = createServiceReadinessReviewReport();
  return {
    ...panel("service_readiness_review", "Service Readiness Review", `Service decision: ${serviceReport.decision}. No services are connected.`, workspace),
    warningCount: serviceReport.warnings.length,
    blockerCount: serviceReport.blockers.length
  };
}

export function createBetaQaReviewPanel(input: { workspace?: TeoyubeControlledAdminWorkspace } = {}) {
  const workspace = input.workspace || createControlledAdminWorkspace();
  const betaReport = createBetaQaPlanReport();
  return {
    ...panel("beta_qa_plan", "Beta QA Plan", `${betaReport.scenarioCount} beta QA scenario(s) prepared; manual execution remains required.`, workspace),
    warningCount: betaReport.warnings.length,
    blockerCount: betaReport.blockers.length
  };
}

export function createAdminReviewBoardViewModel(input: {
  workspace?: TeoyubeControlledAdminWorkspace;
} = {}): TeoyubeAdminReviewBoardViewModel {
  const workspace = input.workspace || createControlledAdminWorkspace();
  const serviceReport = createServiceReadinessReviewReport();
  const betaReport = createBetaQaPlanReport();
  const panels = [
    createContentQueueReviewPanel({ workspace }),
    createPromiseDraftReviewPanel({ workspace }),
    createScriptureAnchorReviewPanel({ workspace }),
    createPrayerCallingActionReviewPanel({ workspace }),
    createTigRelationshipReviewPanel({ workspace }),
    createReleaseCandidateReviewPanel({ workspace }),
    createServiceReadinessReviewPanel({ workspace }),
    createBetaQaReviewPanel({ workspace })
  ];

  return {
    id: "phase_4_5_admin_review_board_view_model",
    title: "Controlled Admin Workflow Prototype",
    workspace,
    panels,
    summary: {
      reviewItemCount: workspace.items.length,
      blockerCount: panels.reduce((count, entry) => count + entry.blockerCount, 0),
      warningCount: panels.reduce((count, entry) => count + entry.warningCount, 0),
      releaseCandidateCount: workspace.items.filter((item) => item.surface === "release_candidate_review").length,
      serviceReadinessDecision: serviceReport.decision,
      betaQaDecision: betaReport.decision
    },
    prototypeOnly: true,
    noProductionCms: true,
    noAdminAuthAdded: true,
    noDatabasePersistenceEnabled: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function createAdminReviewBoardReport(input: {
  viewModel?: TeoyubeAdminReviewBoardViewModel;
  workspace?: TeoyubeControlledAdminWorkspace;
} = {}): TeoyubeAdminReviewBoardReport {
  const viewModel = input.viewModel || createAdminReviewBoardViewModel({ workspace: input.workspace });
  const workspaceReport = createControlledAdminWorkspaceReport(viewModel.workspace);
  return {
    ...workspaceReport,
    panels: viewModel.panels,
    viewModel,
    panelCount: viewModel.panels.length
  };
}
