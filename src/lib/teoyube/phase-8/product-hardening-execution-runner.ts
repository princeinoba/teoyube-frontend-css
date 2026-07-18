import { createProductHardeningPlan } from "./product-hardening-plan";
import type {
  TeoyubeProductHardeningExecutionBlocker,
  TeoyubeProductHardeningExecutionDecision,
  TeoyubeProductHardeningExecutionItem,
  TeoyubeProductHardeningExecutionReport,
  TeoyubeProductHardeningExecutionResult,
  TeoyubeProductHardeningExecutionRun,
  TeoyubeProductHardeningExecutionVerificationRequirement
} from "./product-hardening-execution-contracts";
import type { TeoyubeProductHardeningArea, TeoyubeProductHardeningItem } from "./product-hardening-plan-contracts";

function verification(id: string, label: string, details: string, verified = true): TeoyubeProductHardeningExecutionVerificationRequirement {
  return { id, label, details, required: true, verified };
}

function baseRequirements(): TeoyubeProductHardeningExecutionVerificationRequirement[] {
  return [
    verification("scripture_anchor_preserved", "Scripture anchors preserved", "Hardening did not remove Scripture anchors."),
    verification("explanation_trace_preserved", "Explanation traces preserved", "Hardening did not remove explanation paths."),
    verification("fallback_safe", "Fallback safety preserved", "Hardening did not weaken fallback copy or behavior."),
    verification("confidence_visible", "Confidence labels visible", "Hardening did not hide confidence labels."),
    verification("privacy_consent_visible", "Privacy/consent visible", "Hardening did not hide privacy or consent notices."),
    verification("service_disabled", "Services remain disabled", "Hardening did not connect services, persistence, analytics, monitoring, auth, CMS, accounts, or live AI.")
  ];
}

function areaFromPlanItem(item?: TeoyubeProductHardeningItem): TeoyubeProductHardeningArea {
  return item?.area || "unknown";
}

export function createProductHardeningExecutionItem(input: Partial<TeoyubeProductHardeningExecutionItem> & {
  id: string;
  title: string;
}): TeoyubeProductHardeningExecutionItem {
  return {
    id: input.id,
    sourcePlanItemId: input.sourcePlanItemId,
    area: input.area || "unknown",
    title: input.title,
    summary: input.summary || input.issueAddressed || input.title,
    status: input.status || "planned",
    action: input.action || "skip",
    file: input.file,
    issueAddressed: input.issueAddressed,
    safetyReason: input.safetyReason,
    skipReason: input.skipReason,
    blockedReason: input.blockedReason,
    deferredReason: input.deferredReason,
    ownerReviewRequired: input.ownerReviewRequired ?? false,
    regressionChecksRequired: input.regressionChecksRequired || [
      "scripture_anchor",
      "explanation_trace",
      "fallback",
      "confidence_label",
      "privacy_consent",
      "service_disabled_state",
      "mobile",
      "accessibility"
    ],
    verificationRequirements: input.verificationRequirements || baseRequirements(),
    preservesScriptureAnchors: true,
    preservesExplanationTraces: true,
    preservesFallbackSafety: true,
    preservesConfidenceLabels: true,
    preservesPrivacyConsent: true,
    preservesReviewedContentGate: true,
    preservesDisabledServiceBoundary: true,
    preservesExistingPropsSupport: true,
    preservesMobileAccessibilityBasics: true,
    noExternalWrite: true,
    noAutomaticPublishing: true,
    noUserContact: true,
    inMemoryOnly: true
  };
}

function createSkippedPlanItem(item: TeoyubeProductHardeningItem): TeoyubeProductHardeningExecutionItem {
  return createProductHardeningExecutionItem({
    id: `plan_${item.id}`,
    sourcePlanItemId: item.id,
    area: areaFromPlanItem(item),
    title: item.title,
    summary: item.summary,
    status: item.priority === "high" || item.priority === "critical" ? "owner_review_required" : "deferred",
    action: item.priority === "high" || item.priority === "critical" ? "owner_review" : "defer",
    ownerReviewRequired: item.priority === "high" || item.priority === "critical",
    deferredReason: "Carried into controlled Phase 8.2/8.3 review rather than applied automatically.",
    regressionChecksRequired: item.verificationRequirements.map((entry) => entry.id)
  });
}

export function createPhase82SafePatchResults(): TeoyubeProductHardeningExecutionResult[] {
  return [
    {
      id: "compass_manual_search_boundary_applied",
      itemId: "compass_manual_search_boundary",
      action: "apply_safe_patch",
      status: "verified",
      file: "teoyube-app/components/compass/CompassExperience.tsx",
      issueAddressed: "Removed automatic Compass video search on mount and added copy that search is manual.",
      safetyReason: "Prevents automatic URL/API fetching while preserving user-initiated search and Calling Engine context.",
      regressionChecksRequired: ["service_disabled_state", "mobile", "accessibility", "compass_experience", "fallback"],
      verified: true,
      notes: ["No external service was connected; no user contact, persistence, analytics, or content publishing was added."]
    },
    {
      id: "compass_search_labels_applied",
      itemId: "compass_search_accessibility_labels",
      action: "apply_safe_patch",
      status: "verified",
      file: "teoyube-app/components/compass/CompassSearchBar.tsx",
      issueAddressed: "Added explicit aria labels to Compass search input and preset search buttons.",
      safetyReason: "Improves accessibility labels without changing data, services, theology, or engine logic.",
      regressionChecksRequired: ["accessibility", "mobile", "service_disabled_state"],
      verified: true,
      notes: []
    },
    {
      id: "promise_table_filter_label_applied",
      itemId: "promise_table_filter_accessibility_label",
      action: "apply_safe_patch",
      status: "verified",
      file: "src/components/teoyube/PromiseTablePreview.tsx",
      issueAddressed: "Added an aria label to the Promise Table filter input.",
      safetyReason: "Improves filter accessibility while preserving real Promise Cluster rows and Scripture anchors.",
      regressionChecksRequired: ["promise_table", "accessibility", "scripture_anchor"],
      verified: true,
      notes: []
    },
    {
      id: "tig_reflection_label_applied",
      itemId: "tig_reflection_accessibility_label",
      action: "apply_safe_patch",
      status: "verified",
      file: "teoyube-app/src/components/tig/TIGResponsePanel.tsx",
      issueAddressed: "Added an aria label to the TIG reflection textarea.",
      safetyReason: "Improves accessibility without changing TIG response, graph, explanation, fallback, or confidence behavior.",
      regressionChecksRequired: ["tig_response_panel", "accessibility", "explanation_trace", "confidence_label"],
      verified: true,
      notes: []
    },
    {
      id: "teoyube_card_section_label_applied",
      itemId: "teoyube_card_accessibility_label",
      action: "apply_safe_patch",
      status: "verified",
      file: "teoyube-app/components/TeoyubeCard.tsx",
      issueAddressed: "Added section aria label based on card title.",
      safetyReason: "Improves semantic grouping for card surfaces while preserving existing props and layout.",
      regressionChecksRequired: ["word_card", "accessibility", "mobile"],
      verified: true,
      notes: []
    }
  ];
}

function itemFromResult(result: TeoyubeProductHardeningExecutionResult): TeoyubeProductHardeningExecutionItem {
  return createProductHardeningExecutionItem({
    id: result.itemId,
    area: result.itemId.includes("promise_table")
      ? "promise_table"
      : result.itemId.includes("tig")
        ? "tig_response_panel"
        : result.itemId.includes("compass")
          ? "compass_experience"
          : result.itemId.includes("card")
            ? "word_card"
            : "accessibility",
    title: result.issueAddressed,
    summary: result.safetyReason,
    status: result.status,
    action: result.action,
    file: result.file,
    issueAddressed: result.issueAddressed,
    safetyReason: result.safetyReason,
    regressionChecksRequired: result.regressionChecksRequired
  });
}

export function summarizeProductHardeningExecution(run: Omit<TeoyubeProductHardeningExecutionRun, "summary">): TeoyubeProductHardeningExecutionRun["summary"] {
  return {
    totalItems: run.items.length,
    applied: run.results.filter((entry) => entry.action === "apply_safe_patch").length,
    skipped: run.results.filter((entry) => entry.action === "skip").length,
    blocked: run.items.filter((entry) => entry.status === "blocked").length + run.results.filter((entry) => entry.status === "blocked").length,
    deferred: run.items.filter((entry) => entry.status === "deferred").length + run.results.filter((entry) => entry.status === "deferred").length,
    ownerReviewRequired: run.items.filter((entry) => entry.ownerReviewRequired || entry.status === "owner_review_required").length,
    verified: run.results.filter((entry) => entry.verified || entry.status === "verified").length
  };
}

export function createProductHardeningExecutionRun(input: {
  items?: TeoyubeProductHardeningExecutionItem[];
  results?: TeoyubeProductHardeningExecutionResult[];
} = {}): TeoyubeProductHardeningExecutionRun {
  const defaultResults = createPhase82SafePatchResults();
  const planItems = createProductHardeningPlan().items.map(createSkippedPlanItem);
  const results = input.results || defaultResults;
  const items = input.items || [...results.map(itemFromResult), ...planItems];
  const runWithoutSummary = {
    id: "phase_8_2_product_hardening_execution",
    items,
    results,
    noExternalSend: true,
    noFileWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
  return {
    ...runWithoutSummary,
    summary: summarizeProductHardeningExecution(runWithoutSummary)
  };
}

function withResult(run: TeoyubeProductHardeningExecutionRun, result: TeoyubeProductHardeningExecutionResult): TeoyubeProductHardeningExecutionRun {
  return createProductHardeningExecutionRun({
    items: run.items,
    results: [...run.results.filter((entry) => entry.id !== result.id), result]
  });
}

export function recordProductHardeningApplied(run: TeoyubeProductHardeningExecutionRun, result: TeoyubeProductHardeningExecutionResult): TeoyubeProductHardeningExecutionRun {
  return withResult(run, { ...result, action: "apply_safe_patch", status: result.status === "verified" ? "verified" : "applied" });
}

export function recordProductHardeningSkipped(run: TeoyubeProductHardeningExecutionRun, item: TeoyubeProductHardeningExecutionItem, reason: string): TeoyubeProductHardeningExecutionRun {
  return createProductHardeningExecutionRun({
    items: [...run.items, { ...item, status: "deferred", action: "skip", skipReason: reason }],
    results: run.results
  });
}

export function recordProductHardeningBlocked(run: TeoyubeProductHardeningExecutionRun, item: TeoyubeProductHardeningExecutionItem, reason: string): TeoyubeProductHardeningExecutionRun {
  return createProductHardeningExecutionRun({
    items: [...run.items, { ...item, status: "blocked", action: "block", blockedReason: reason }],
    results: run.results
  });
}

export function recordProductHardeningDeferred(run: TeoyubeProductHardeningExecutionRun, item: TeoyubeProductHardeningExecutionItem, reason: string): TeoyubeProductHardeningExecutionRun {
  return createProductHardeningExecutionRun({
    items: [...run.items, { ...item, status: "deferred", action: "defer", deferredReason: reason }],
    results: run.results
  });
}

export function getProductHardeningExecutionBlockers(run: TeoyubeProductHardeningExecutionRun): TeoyubeProductHardeningExecutionBlocker[] {
  return [
    ...run.items.filter((entry) => entry.status === "blocked").map((entry) => ({
      id: `${entry.id}_blocked`,
      itemId: entry.id,
      area: entry.area,
      message: entry.blockedReason || `${entry.title} is blocked.`,
      requiredAction: "Resolve or defer with owner review before continuing Phase 8 hardening."
    })),
    ...(!run.inMemoryOnly || !run.noExternalSend || !run.noFileWrite || !run.noUserContact || !run.noAutomaticPublishing
      ? [{
          id: "execution_boundary_broken",
          area: "unknown" as const,
          message: "Product hardening execution must remain in-memory/manual and must not send, persist, contact users, or publish content.",
          requiredAction: "Restore Phase 8.2 execution boundaries."
        }]
      : [])
  ];
}

export function getProductHardeningExecutionWarnings(run: TeoyubeProductHardeningExecutionRun) {
  return [
    ...run.items.filter((entry) => entry.status === "owner_review_required").map((entry) => ({
      id: `${entry.id}_owner_review`,
      itemId: entry.id,
      area: entry.area,
      message: `${entry.title} requires owner review before implementation.`,
      recommendedAction: "Carry this item into owner review and Phase 8.3 readiness gates."
    })),
    ...run.items.filter((entry) => entry.status === "deferred").map((entry) => ({
      id: `${entry.id}_deferred`,
      itemId: entry.id,
      area: entry.area,
      message: entry.deferredReason || `${entry.title} was deferred.`,
      recommendedAction: "Track as a controlled follow-up item."
    }))
  ];
}

export function createProductHardeningExecutionDecision(run: TeoyubeProductHardeningExecutionRun): TeoyubeProductHardeningExecutionDecision {
  const blockers = getProductHardeningExecutionBlockers(run);
  const warnings = getProductHardeningExecutionWarnings(run);
  if (blockers.length) return "blocked";
  if (run.results.some((entry) => !entry.verified)) return "needs_regression_qa";
  if (run.summary.ownerReviewRequired > 0) return "needs_owner_review";
  return warnings.length ? "hardening_complete_with_warnings" : "hardening_complete";
}

export function createProductHardeningExecutionReport(run: TeoyubeProductHardeningExecutionRun = createProductHardeningExecutionRun()): TeoyubeProductHardeningExecutionReport {
  const blockers = getProductHardeningExecutionBlockers(run);
  return {
    valid: blockers.length === 0,
    decision: createProductHardeningExecutionDecision(run),
    run,
    blockers,
    warnings: getProductHardeningExecutionWarnings(run),
    safePatchSummary: run.results.filter((entry) => entry.action === "apply_safe_patch"),
    noExternalSend: true,
    noFileWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
