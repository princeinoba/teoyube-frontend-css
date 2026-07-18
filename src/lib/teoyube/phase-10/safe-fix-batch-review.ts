import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeSafeFixBatchItem = {
  id: string;
  issueId: string;
  severity: TeoyubeFirstDayIssueSeverity;
  affectedRouteComponentOrDataFile: string;
  proposedFix: string;
  fixRisk: "low" | "medium" | "high" | "unknown";
  rollbackImpact: string;
  verificationMethod: string;
  ownerApproved: boolean;
  scriptureAnchorPreserved: boolean;
  explanationTracePreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelPreserved: boolean;
  privacyConsentPreserved: boolean;
  serviceDisabledStatePreserved: boolean;
  hiddenPersonalizationIntroduced: boolean;
  externalServicesAdded: boolean;
  trackingAnalyticsAdded: boolean;
  databasePersistenceAdded: boolean;
  productionContentChangedWithoutReview: boolean;
  notes: string[];
};

export type TeoyubeSafeFixBatch = {
  id: string;
  items: TeoyubeSafeFixBatchItem[];
  ownerReviewRequired: boolean;
  noAutomaticImplementation: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

function checklistItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, details };
}

export function createSafeFixBatchReviewChecklist(batch: TeoyubeSafeFixBatch = createSafeFixBatch()) {
  return [
    checklistItem("batch_items_reviewed", "Safe-fix batch items reviewed", batch.items.length > 0, "Batch should include reviewed safe-fix candidates."),
    checklistItem("owner_approval", "Owner approval recorded", batch.items.every((item) => item.ownerApproved), "Each safe fix requires owner approval."),
    checklistItem("scripture_preserved", "Scripture anchors preserved", batch.items.every((item) => item.scriptureAnchorPreserved), "Safe fixes must not remove Scripture anchors."),
    checklistItem("explanation_preserved", "Explanation traces preserved", batch.items.every((item) => item.explanationTracePreserved), "Safe fixes must not remove explanation traces."),
    checklistItem("fallback_preserved", "Fallback safety preserved", batch.items.every((item) => item.fallbackSafetyPreserved), "Safe fixes must not weaken fallback safety."),
    checklistItem("confidence_preserved", "Confidence labels preserved", batch.items.every((item) => item.confidenceLabelPreserved), "Safe fixes must not hide confidence labels."),
    checklistItem("privacy_preserved", "Privacy/consent preserved", batch.items.every((item) => item.privacyConsentPreserved), "Safe fixes must not bypass privacy or consent notices."),
    checklistItem("service_disabled_preserved", "Service-disabled state preserved", batch.items.every((item) => item.serviceDisabledStatePreserved), "Safe fixes must not add services, analytics, persistence, live AI, accounts, admin, CMS, or notifications."),
    checklistItem("rollback_considered", "Rollback impact considered", batch.items.every((item) => Boolean(item.rollbackImpact && item.rollbackImpact !== "unknown")), "Each safe fix needs rollback consideration."),
    checklistItem("verification_method", "Verification method recorded", batch.items.every((item) => Boolean(item.verificationMethod && item.verificationMethod !== "unknown")), "Each safe fix needs a verification method.")
  ];
}

export function createSafeFixBatch(input: Partial<TeoyubeSafeFixBatch> = {}): TeoyubeSafeFixBatch {
  const now = new Date().toISOString();
  return {
    id: input.id || "phase_10_5_safe_fix_batch",
    items: input.items || [],
    ownerReviewRequired: input.ownerReviewRequired ?? true,
    noAutomaticImplementation: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

export function createSafeFixBatchItem(input: Partial<TeoyubeSafeFixBatchItem> = {}): TeoyubeSafeFixBatchItem {
  return {
    id: input.id || `safe_fix_batch_item_${Date.now()}`,
    issueId: input.issueId || "manual_issue_required",
    severity: input.severity || "severity_4_low",
    affectedRouteComponentOrDataFile: input.affectedRouteComponentOrDataFile || "manual_owner_required",
    proposedFix: input.proposedFix || "Manual safe-fix batch proposal required.",
    fixRisk: input.fixRisk || "unknown",
    rollbackImpact: input.rollbackImpact || "unknown",
    verificationMethod: input.verificationMethod || "unknown",
    ownerApproved: input.ownerApproved ?? false,
    scriptureAnchorPreserved: input.scriptureAnchorPreserved ?? true,
    explanationTracePreserved: input.explanationTracePreserved ?? true,
    fallbackSafetyPreserved: input.fallbackSafetyPreserved ?? true,
    confidenceLabelPreserved: input.confidenceLabelPreserved ?? true,
    privacyConsentPreserved: input.privacyConsentPreserved ?? true,
    serviceDisabledStatePreserved: input.serviceDisabledStatePreserved ?? true,
    hiddenPersonalizationIntroduced: input.hiddenPersonalizationIntroduced ?? false,
    externalServicesAdded: input.externalServicesAdded ?? false,
    trackingAnalyticsAdded: input.trackingAnalyticsAdded ?? false,
    databasePersistenceAdded: input.databasePersistenceAdded ?? false,
    productionContentChangedWithoutReview: input.productionContentChangedWithoutReview ?? false,
    notes: input.notes || []
  };
}

export function addSafeFixBatchItem(batch: TeoyubeSafeFixBatch, item: TeoyubeSafeFixBatchItem): TeoyubeSafeFixBatch {
  return { ...batch, items: [...batch.items, item], updatedAt: new Date().toISOString() };
}

function itemBlockers(item: TeoyubeSafeFixBatchItem): string[] {
  const blockers: string[] = [];
  if (!item.ownerApproved) blockers.push("Owner approval is required.");
  if (!item.scriptureAnchorPreserved) blockers.push("Fix removes Scripture anchors.");
  if (!item.explanationTracePreserved) blockers.push("Fix removes explanation traces.");
  if (!item.fallbackSafetyPreserved) blockers.push("Fix weakens fallback safety.");
  if (!item.confidenceLabelPreserved) blockers.push("Fix hides confidence labels.");
  if (!item.privacyConsentPreserved) blockers.push("Fix bypasses privacy/consent notices.");
  if (!item.serviceDisabledStatePreserved) blockers.push("Fix changes service-disabled state.");
  if (item.hiddenPersonalizationIntroduced) blockers.push("Fix creates hidden personalization.");
  if (item.externalServicesAdded) blockers.push("Fix adds external services.");
  if (item.trackingAnalyticsAdded) blockers.push("Fix adds tracking or analytics.");
  if (item.databasePersistenceAdded) blockers.push("Fix adds database persistence.");
  if (item.productionContentChangedWithoutReview) blockers.push("Fix changes production content without review.");
  if (!item.rollbackImpact || item.rollbackImpact === "unknown") blockers.push("Fix lacks rollback consideration.");
  return blockers;
}

export function getSafeFixBatchBlockers(batch: TeoyubeSafeFixBatch): string[] {
  return batch.items.flatMap((item) => itemBlockers(item).map((message) => `${item.id}: ${message}`));
}

export function getSafeFixBatchWarnings(batch: TeoyubeSafeFixBatch): string[] {
  const warnings: string[] = [];
  if (!batch.items.length) warnings.push("Safe-fix batch is empty.");
  batch.items
    .filter((item) => item.fixRisk === "high" || item.fixRisk === "unknown")
    .forEach((item) => warnings.push(`${item.id}: fix risk needs owner review.`));
  batch.items
    .filter((item) => !item.verificationMethod || item.verificationMethod === "unknown")
    .forEach((item) => warnings.push(`${item.id}: verification method needs owner review.`));
  warnings.push("Safe-fix batch is in-memory only and does not implement fixes automatically.");
  return warnings;
}

export function validateSafeFixBatch(batch: TeoyubeSafeFixBatch): boolean {
  return getSafeFixBatchBlockers(batch).length === 0;
}

export function createSafeFixBatchDecision(batch: TeoyubeSafeFixBatch): "batch_ready" | "blocked" | "ready_with_warnings" | "empty" {
  if (getSafeFixBatchBlockers(batch).length) return "blocked";
  if (!batch.items.length) return "empty";
  return getSafeFixBatchWarnings(batch).length ? "ready_with_warnings" : "batch_ready";
}

export function createSafeFixBatchReport(batch: TeoyubeSafeFixBatch) {
  const blockers = getSafeFixBatchBlockers(batch);
  return {
    valid: blockers.length === 0,
    decision: createSafeFixBatchDecision(batch),
    checklist: createSafeFixBatchReviewChecklist(batch),
    batch,
    blockers,
    warnings: getSafeFixBatchWarnings(batch),
    noAutomaticImplementation: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
