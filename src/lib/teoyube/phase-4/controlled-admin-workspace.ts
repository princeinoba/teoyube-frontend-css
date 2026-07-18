import { createBacklogToReviewQueueReport } from "./content-backlog-to-review-queue";
import type {
  TeoyubeContentReviewQueue,
  TeoyubeContentReviewQueueItem
} from "./content-review-queue-contracts";
import type { TeoyubeReviewedContentReleaseCandidate } from "./reviewed-content-integration-contracts";
import { createReviewedContentReleaseCandidates } from "./reviewed-content-release-candidate-builder";
import type {
  TeoyubeControlledAdminPrototypeBlocker,
  TeoyubeControlledAdminPrototypeMode,
  TeoyubeControlledAdminPrototypeReport,
  TeoyubeControlledAdminPrototypeStatus,
  TeoyubeControlledAdminPrototypeSurface,
  TeoyubeControlledAdminPrototypeWarning,
  TeoyubeControlledAdminReviewAction,
  TeoyubeControlledAdminReviewItem,
  TeoyubeControlledAdminWorkspace
} from "./controlled-admin-prototype-contracts";

function now(): string {
  return new Date().toISOString();
}

function statusForItems(items: TeoyubeControlledAdminReviewItem[]): TeoyubeControlledAdminPrototypeStatus {
  if (!items.length) return "empty";
  if (items.some((item) => item.status === "blocked")) return "blocked";
  if (items.some((item) => item.requiredReviews.length > item.completedReviews.length)) return "needs_review";
  if (items.some((item) => item.productionEligible)) return "ready_for_future_release";
  return "ready_for_review";
}

function surfaceForQueueItem(item: TeoyubeContentReviewQueueItem): TeoyubeControlledAdminPrototypeSurface {
  if (item.type === "promise_cluster") return "promise_cluster_drafts";
  if (item.type === "scripture_anchor") return "scripture_anchor_review";
  if (["prayer_prompt", "calling_path", "action_step"].includes(item.type)) return "prayer_calling_action_review";
  if (item.type === "tig_relationship") return "tig_relationship_review";
  return "content_review_queue";
}

function statusForQueueItem(item: TeoyubeContentReviewQueueItem): TeoyubeControlledAdminPrototypeStatus {
  if (item.reviewState === "blocked") return "blocked";
  if (item.reviewState === "approved_for_future_release") return "ready_for_future_release";
  return "needs_review";
}

function itemFromQueueItem(item: TeoyubeContentReviewQueueItem): TeoyubeControlledAdminReviewItem {
  const requiredReviews = item.reviewRequirements.filter((review) => review.required).map((review) => review.id);
  const completedReviews = item.reviewRequirements.filter((review) => review.required && review.complete).map((review) => review.id);
  return {
    id: `admin_${item.id}`,
    title: item.title,
    surface: surfaceForQueueItem(item),
    status: statusForQueueItem(item),
    summary: item.summary,
    sourceId: item.id,
    sourceType: "review_queue",
    requiredReviews,
    completedReviews,
    scriptureAnchors: [],
    explanationPath: item.notes.map((note) => note.message),
    blockers: item.reviewState === "blocked" ? [`${item.title} is blocked in the review queue.`] : [],
    warnings: item.reviewRequirements
      .filter((review) => review.required && !review.complete)
      .map((review) => `${review.label} remains required.`),
    reviewOnly: true,
    productionEligible: false,
    productionPublished: false,
    addedToLiveRecommendations: false,
    fallbackSafetyPreserved: true,
    confidenceBoundariesPreserved: true,
    inMemoryOnly: true,
    updatedAt: now()
  };
}

function itemFromReleaseCandidate(candidate: TeoyubeReviewedContentReleaseCandidate): TeoyubeControlledAdminReviewItem {
  return {
    id: `admin_${candidate.id}`,
    title: candidate.title,
    surface: "release_candidate_review",
    status: candidate.status === "release_candidate" ? "ready_for_future_release" : candidate.status === "blocked" ? "blocked" : "needs_review",
    summary: `Manual release candidate review for ${candidate.type}.`,
    sourceId: candidate.id,
    sourceType: "release_candidate",
    requiredReviews: ["owner_review"],
    completedReviews: candidate.reviewMetadata.ownerReviewed ? ["owner_review"] : [],
    scriptureAnchors: candidate.scriptureAnchors,
    explanationPath: candidate.explanationPath,
    blockers: candidate.blockers,
    warnings: candidate.warnings,
    reviewOnly: false,
    productionEligible: candidate.productionEligible,
    productionPublished: false,
    addedToLiveRecommendations: false,
    fallbackSafetyPreserved: true,
    confidenceBoundariesPreserved: true,
    inMemoryOnly: true,
    updatedAt: now()
  };
}

export function createAdminWorkspaceFromReviewQueue(queue: TeoyubeContentReviewQueue): TeoyubeControlledAdminWorkspace {
  return createControlledAdminWorkspace({ items: queue.items.map(itemFromQueueItem) });
}

export function createAdminWorkspaceFromReleaseCandidates(
  candidates: TeoyubeReviewedContentReleaseCandidate[]
): TeoyubeControlledAdminWorkspace {
  return createControlledAdminWorkspace({ items: candidates.map(itemFromReleaseCandidate) });
}

export function createControlledAdminWorkspace(input: {
  id?: string;
  mode?: TeoyubeControlledAdminPrototypeMode;
  items?: TeoyubeControlledAdminReviewItem[];
  actions?: TeoyubeControlledAdminReviewAction[];
} = {}): TeoyubeControlledAdminWorkspace {
  const defaultItems = input.items || [
    ...createBacklogToReviewQueueReport().queue.items.map(itemFromQueueItem),
    ...createReviewedContentReleaseCandidates().map(itemFromReleaseCandidate)
  ];
  return {
    id: input.id || "phase_4_5_controlled_admin_workspace",
    mode: input.mode || "in_memory_only",
    status: statusForItems(defaultItems),
    items: defaultItems,
    actions: input.actions || [],
    prototypeOnly: true,
    noProductionCms: true,
    noAdminAuthAdded: true,
    noUserAccountsAdded: true,
    noDatabasePersistenceEnabled: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailsOrNotificationsSent: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    createdAt: now()
  };
}

export function addAdminWorkspaceReviewItem(
  workspace: TeoyubeControlledAdminWorkspace,
  item: TeoyubeControlledAdminReviewItem
): TeoyubeControlledAdminWorkspace {
  const items = [...workspace.items, { ...item, productionPublished: false as const, addedToLiveRecommendations: false as const, inMemoryOnly: true as const }];
  return { ...workspace, items, status: statusForItems(items), updatedAt: now() };
}

export function updateAdminWorkspaceReviewItem(
  workspace: TeoyubeControlledAdminWorkspace,
  itemId: string,
  update: Partial<Omit<TeoyubeControlledAdminReviewItem, "id" | "productionPublished" | "addedToLiveRecommendations" | "inMemoryOnly">>
): TeoyubeControlledAdminWorkspace {
  const items = workspace.items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          ...update,
          productionPublished: false as const,
          addedToLiveRecommendations: false as const,
          inMemoryOnly: true as const,
          updatedAt: now()
        }
      : item
  );
  return { ...workspace, items, status: statusForItems(items), updatedAt: now() };
}

export function getAdminWorkspaceItemsBySurface(
  workspace: TeoyubeControlledAdminWorkspace,
  surface: TeoyubeControlledAdminPrototypeSurface
): TeoyubeControlledAdminReviewItem[] {
  return workspace.items.filter((item) => item.surface === surface);
}

export function getAdminWorkspaceItemsByStatus(
  workspace: TeoyubeControlledAdminWorkspace,
  status: TeoyubeControlledAdminPrototypeStatus
): TeoyubeControlledAdminReviewItem[] {
  return workspace.items.filter((item) => item.status === status);
}

export function getAdminWorkspaceBlockers(
  workspace: TeoyubeControlledAdminWorkspace
): TeoyubeControlledAdminPrototypeBlocker[] {
  return [
    !workspace.inMemoryOnly
      ? {
          id: "admin_workspace_not_in_memory",
          surface: "unknown" as const,
          message: "Controlled admin workspace must remain in-memory only.",
          requiredAction: "Remove persistence before using the prototype."
        }
      : undefined,
    !workspace.noProductionDataModified
      ? {
          id: "admin_workspace_production_data_modified",
          surface: "unknown" as const,
          message: "Controlled admin workspace must not modify production data.",
          requiredAction: "Keep all review actions simulated."
        }
      : undefined,
    ...workspace.items.flatMap((item) => [
      ...item.blockers.map((message, index) => ({
        id: `${item.id}_blocker_${index}`,
        itemId: item.id,
        surface: item.surface,
        message,
        requiredAction: "Resolve the content or readiness blocker before future release."
      })),
      item.productionPublished || item.addedToLiveRecommendations
        ? {
            id: `${item.id}_published_from_prototype`,
            itemId: item.id,
            surface: item.surface,
            message: `${item.title} was marked as published from the prototype.`,
            requiredAction: "Remove automatic publishing from the controlled admin prototype."
          }
        : undefined
    ])
  ].filter(Boolean) as TeoyubeControlledAdminPrototypeBlocker[];
}

export function getAdminWorkspaceWarnings(
  workspace: TeoyubeControlledAdminWorkspace
): TeoyubeControlledAdminPrototypeWarning[] {
  return workspace.items.flatMap((item) => {
    const missingReviews = item.requiredReviews.filter((review) => !item.completedReviews.includes(review));
    return [
      ...item.warnings.map((message, index) => ({
        id: `${item.id}_warning_${index}`,
        itemId: item.id,
        surface: item.surface,
        message,
        recommendedAction: "Keep warning visible in the admin prototype."
      })),
      ...missingReviews.map((review) => ({
        id: `${item.id}_${review}_missing`,
        itemId: item.id,
        surface: item.surface,
        message: `${item.title} still needs ${review.replace(/_/g, " ")}.`,
        recommendedAction: "Record the review manually before a future release package."
      }))
    ];
  });
}

export function createControlledAdminWorkspaceReport(
  workspace: TeoyubeControlledAdminWorkspace = createControlledAdminWorkspace()
): TeoyubeControlledAdminPrototypeReport {
  const blockers = getAdminWorkspaceBlockers(workspace);
  const warnings = getAdminWorkspaceWarnings(workspace);
  return {
    valid: blockers.length === 0,
    status: workspace.status,
    mode: workspace.mode,
    workspace,
    blockers,
    warnings,
    reviewItemCount: workspace.items.length,
    reviewOnlyItemCount: workspace.items.filter((item) => item.reviewOnly).length,
    releaseCandidateCount: workspace.items.filter((item) => item.surface === "release_candidate_review").length,
    noProductionCms: true,
    noAdminAuthAdded: true,
    noUserAccountsAdded: true,
    noDatabasePersistenceEnabled: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailsOrNotificationsSent: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
