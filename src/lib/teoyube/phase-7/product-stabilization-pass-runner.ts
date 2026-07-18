import {
  createProductStabilizationPlan,
  type TeoyubeProductStabilizationPlan
} from "./product-stabilization-planner";
import type {
  TeoyubeProductStabilizationQueueItem
} from "./product-stabilization-queue-contracts";
import type {
  TeoyubeProductStabilizationPass,
  TeoyubeProductStabilizationPassAction,
  TeoyubeProductStabilizationPassBlocker,
  TeoyubeProductStabilizationPassDecision,
  TeoyubeProductStabilizationPassItem,
  TeoyubeProductStabilizationPassReport,
  TeoyubeProductStabilizationPassResult,
  TeoyubeProductStabilizationPassStatus,
  TeoyubeProductStabilizationPassVerificationRequirement,
  TeoyubeProductStabilizationPassWarning
} from "./product-stabilization-pass-contracts";

type ProductStabilizationPassItemInput = TeoyubeProductStabilizationQueueItem | Partial<TeoyubeProductStabilizationPassItem> & {
  title: string;
};

function now(): string {
  return new Date().toISOString();
}

function statusFromResults(items: TeoyubeProductStabilizationPassItem[], results: TeoyubeProductStabilizationPassResult[]): TeoyubeProductStabilizationPassStatus {
  if (items.some((item) => item.status === "blocked") || results.some((result) => result.blocker || result.status === "blocked")) return "blocked";
  if (items.some((item) => item.status === "deferred") || results.some((result) => result.status === "deferred")) return "deferred";
  if (items.some((item) => item.status === "owner_review_required")) return "owner_review_required";
  if (results.length && results.every((result) => result.verified || result.status === "verified")) return "verified";
  if (results.length) return "applied";
  if (items.some((item) => item.status === "safe_to_apply")) return "safe_to_apply";
  return "planned";
}

function actionForItem(input: TeoyubeProductStabilizationQueueItem): TeoyubeProductStabilizationPassAction {
  if (input.status === "blocked" || input.priority === "beta_operations_blocker" || input.riskLevel === "blocked") return "block";
  if (input.status === "deferred" || input.priority === "defer") return "defer";
  if (input.ownerReviewRequired) return "owner_review";
  if (input.safeLocalFixAllowed) return "apply_safe_local_fix";
  return "verify_existing_fix";
}

function statusForItem(action: TeoyubeProductStabilizationPassAction): TeoyubeProductStabilizationPassStatus {
  if (action === "block") return "blocked";
  if (action === "defer") return "deferred";
  if (action === "owner_review") return "owner_review_required";
  if (action === "apply_safe_local_fix") return "safe_to_apply";
  if (action === "verify_existing_fix") return "planned";
  return "unknown";
}

function sourceItemIdForInput(input: ProductStabilizationPassItemInput): string | undefined {
  if ("sourceItemId" in input && input.sourceItemId) return input.sourceItemId;
  if ("sourceId" in input && input.sourceId) return input.sourceId;
  return input.id;
}

export function createProductStabilizationPassItem(input: ProductStabilizationPassItemInput): TeoyubeProductStabilizationPassItem {
  const sourceItem = input as TeoyubeProductStabilizationQueueItem;
  const action = "action" in input && input.action ? input.action : actionForItem(sourceItem);
  return {
    id: input.id || `product_stabilization_pass_item_${Date.now()}`,
    sourceItemId: sourceItemIdForInput(input),
    title: input.title,
    description: input.description || "",
    source: input.source || "unknown",
    category: input.category || "unknown",
    action,
    status: input.status || statusForItem(action),
    ownerReviewRequired: Boolean(input.ownerReviewRequired),
    safeLocalFixAllowed: Boolean(input.safeLocalFixAllowed),
    blockedReason: input.blockedReason,
    deferredReason: input.deferredReason,
    verificationRequirements: (input.verificationRequirements || []) as TeoyubeProductStabilizationPassVerificationRequirement[],
    manualOnly: true,
    inMemoryOnly: true,
    noProductionDataWrite: true,
    noServiceConnection: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    noFeedbackCollection: true,
    preservesScriptureAnchors: input.preservesScriptureAnchors ?? true,
    preservesExplanationTraces: input.preservesExplanationTraces ?? true,
    preservesFallbackSafety: input.preservesFallbackSafety ?? true,
    preservesConfidenceLabels: input.preservesConfidenceLabels ?? true,
    preservesPrivacyConsent: input.preservesPrivacyConsent ?? true,
    noDivineCertaintyClaimed: input.noDivineCertaintyClaimed ?? true,
    createdAt: "createdAt" in input && input.createdAt ? input.createdAt : now()
  };
}

export function createProductStabilizationPass(input: {
  id?: string;
  plan?: TeoyubeProductStabilizationPlan;
  items?: Array<TeoyubeProductStabilizationQueueItem | TeoyubeProductStabilizationPassItem>;
  results?: TeoyubeProductStabilizationPassResult[];
} = {}): TeoyubeProductStabilizationPass {
  const createdAt = now();
  const plan = input.plan || createProductStabilizationPlan({ items: input.items as TeoyubeProductStabilizationQueueItem[] | undefined });
  const items = (input.items || plan.items).map((item) => createProductStabilizationPassItem(item));
  const results = input.results || [];
  return {
    id: input.id || "phase_7_3_product_stabilization_pass",
    status: statusFromResults(items, results),
    items,
    results,
    manualOnly: true,
    inMemoryOnly: true,
    noFilesWritten: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noExternalServicesRequired: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordProductStabilizationPassResult(
  pass: TeoyubeProductStabilizationPass,
  result: TeoyubeProductStabilizationPassResult
): TeoyubeProductStabilizationPass {
  const results = [
    ...pass.results.filter((entry) => entry.itemId !== result.itemId),
    { ...result, manualOnly: true as const, inMemoryOnly: true as const, noFilesWritten: true as const, noDatabasePersistenceEnabled: true as const, noAnalyticsEnabled: true as const, noExternalServicesRequired: true as const, recordedAt: result.recordedAt || now() }
  ];
  const items = pass.items.map((item) => item.id === result.itemId ? { ...item, status: result.status } : item);
  return { ...pass, items, results, status: statusFromResults(items, results), updatedAt: now() };
}

function resultFor(item: TeoyubeProductStabilizationPassItem, status: TeoyubeProductStabilizationPassStatus, notes: string): TeoyubeProductStabilizationPassResult {
  return {
    itemId: item.id,
    action: item.action,
    status,
    notes,
    verified: status === "verified",
    blocker: status === "blocked",
    warning: status === "deferred" || status === "owner_review_required",
    manualOnly: true,
    inMemoryOnly: true,
    noFilesWritten: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    recordedAt: now()
  };
}

export function recordProductStabilizationPassSkipped(pass: TeoyubeProductStabilizationPass, item: TeoyubeProductStabilizationPassItem, reason: string): TeoyubeProductStabilizationPass {
  return recordProductStabilizationPassResult(pass, resultFor(item, "owner_review_required", reason));
}

export function recordProductStabilizationPassBlocked(pass: TeoyubeProductStabilizationPass, item: TeoyubeProductStabilizationPassItem, reason: string): TeoyubeProductStabilizationPass {
  return recordProductStabilizationPassResult(pass, resultFor(item, "blocked", reason));
}

export function recordProductStabilizationPassDeferred(pass: TeoyubeProductStabilizationPass, item: TeoyubeProductStabilizationPassItem, reason: string): TeoyubeProductStabilizationPass {
  return recordProductStabilizationPassResult(pass, resultFor(item, "deferred", reason));
}

export function getProductStabilizationPassBlockers(pass: TeoyubeProductStabilizationPass): TeoyubeProductStabilizationPassBlocker[] {
  return [
    ...(!pass.manualOnly || !pass.inMemoryOnly || !pass.noFilesWritten || !pass.noDatabasePersistenceEnabled || !pass.noAnalyticsEnabled || !pass.noMonitoringProviderConnected || !pass.noExternalServicesRequired || !pass.noUsersContacted || !pass.noFeedbackCollectedAutomatically || !pass.noAutomaticPublishing || !pass.noLiveAiOrchestrationEnabled || !pass.noAdminAuthAdded || !pass.noCmsConnected || !pass.noBrowserPersistenceRequired
      ? [{
          id: "product_stabilization_pass_boundary_broken",
          category: "unknown" as const,
          message: "Product stabilization pass must remain manual, in-memory, no-file-write, no-persistence, no-analytics, no-monitoring-provider, no-service, no-contact, no-feedback-collection, no-publishing, no-live-AI, no-admin-auth, no-CMS, and no-browser-persistence.",
          requiredAction: "Restore Phase 7.3 stabilization pass boundaries before continuing."
        }]
      : []),
    ...pass.items
      .filter((item) => item.status === "blocked" || item.action === "block")
      .map((item) => ({
        id: `${item.id}_blocked`,
        itemId: item.id,
        category: item.category,
        message: item.blockedReason || `${item.title} is blocked.`,
        requiredAction: "Resolve, defer with owner approval, or keep beta operations readiness blocked."
      })),
    ...pass.results
      .filter((result) => result.blocker || result.status === "blocked")
      .map((result) => {
        const item = pass.items.find((entry) => entry.id === result.itemId);
        return {
          id: `${result.itemId}_result_blocker`,
          itemId: result.itemId,
          category: item?.category || "unknown" as const,
          message: result.notes || "Stabilization pass result is blocked.",
          requiredAction: "Move the item back to stabilization queue before readiness scoring."
        };
      })
  ];
}

export function getProductStabilizationPassWarnings(pass: TeoyubeProductStabilizationPass): TeoyubeProductStabilizationPassWarning[] {
  return [
    ...pass.items
      .filter((item) => item.status === "owner_review_required" || item.ownerReviewRequired)
      .map((item) => ({
        id: `${item.id}_owner_review`,
        itemId: item.id,
        category: item.category,
        message: `${item.title} requires owner review before any product change.`,
        recommendedAction: "Keep as manual owner-review item and verify before Phase 7.4."
      })),
    ...pass.items
      .filter((item) => item.status === "deferred")
      .map((item) => ({
        id: `${item.id}_deferred`,
        itemId: item.id,
        category: item.category,
        message: item.deferredReason || `${item.title} is deferred.`,
        recommendedAction: "Document deferral and keep it out of automatic remediation."
      })),
    ...pass.results
      .filter((result) => result.warning || result.status === "owner_review_required" || result.status === "deferred")
      .map((result) => {
        const item = pass.items.find((entry) => entry.id === result.itemId);
        return {
          id: `${result.itemId}_result_warning`,
          itemId: result.itemId,
          category: item?.category || "unknown" as const,
          message: result.notes || "Stabilization pass result has a warning.",
          recommendedAction: "Review warning during Phase 7.3 owner review."
        };
      })
  ];
}

export function summarizeProductStabilizationPass(pass: TeoyubeProductStabilizationPass) {
  const blockers = getProductStabilizationPassBlockers(pass);
  const warnings = getProductStabilizationPassWarnings(pass);
  return {
    itemCount: pass.items.length,
    appliedCount: pass.results.filter((entry) => entry.status === "applied" || entry.action === "apply_safe_local_fix").length,
    verifiedCount: pass.results.filter((entry) => entry.verified || entry.status === "verified").length,
    ownerReviewRequiredCount: pass.items.filter((item) => item.ownerReviewRequired || item.status === "owner_review_required").length,
    blockedCount: blockers.length,
    deferredCount: pass.items.filter((item) => item.status === "deferred").length,
    warningCount: warnings.length
  };
}

export function createProductStabilizationPassDecision(pass: TeoyubeProductStabilizationPass): TeoyubeProductStabilizationPassDecision {
  const blockers = getProductStabilizationPassBlockers(pass);
  const warnings = getProductStabilizationPassWarnings(pass);
  if (blockers.length) return "blocked";
  if (pass.items.some((item) => item.ownerReviewRequired || item.status === "owner_review_required")) return "needs_owner_review";
  if (pass.results.length < pass.items.filter((item) => item.safeLocalFixAllowed).length) return "needs_more_regression_qa";
  return warnings.length ? "stabilization_pass_complete_with_warnings" : "stabilization_pass_complete";
}

export function createProductStabilizationPassReport(pass: TeoyubeProductStabilizationPass = createProductStabilizationPass()): TeoyubeProductStabilizationPassReport {
  const blockers = getProductStabilizationPassBlockers(pass);
  return {
    valid: blockers.length === 0,
    decision: createProductStabilizationPassDecision(pass),
    pass,
    summary: summarizeProductStabilizationPass(pass),
    blockers,
    warnings: getProductStabilizationPassWarnings(pass),
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: now()
  };
}
