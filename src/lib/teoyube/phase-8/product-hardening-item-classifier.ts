import { createProductHardeningPlan } from "./product-hardening-plan";
import { getProductHardeningVerificationRequirements } from "./product-hardening-plan";
import type {
  TeoyubeProductHardeningItem,
  TeoyubeProductHardeningRiskLevel
} from "./product-hardening-plan-contracts";

export type TeoyubeProductHardeningClassification =
  | "safe_local_patch"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeProductHardeningClassificationResult = {
  itemId: string;
  classification: TeoyubeProductHardeningClassification;
  riskLevel: TeoyubeProductHardeningRiskLevel;
  verificationRequirements: ReturnType<typeof getProductHardeningVerificationRequirements>;
  reasons: string[];
};

export type TeoyubeProductHardeningClassificationReport = {
  valid: boolean;
  results: TeoyubeProductHardeningClassificationResult[];
  safeLocalItems: TeoyubeProductHardeningClassificationResult[];
  ownerReviewItems: TeoyubeProductHardeningClassificationResult[];
  blockedItems: TeoyubeProductHardeningClassificationResult[];
  deferredItems: TeoyubeProductHardeningClassificationResult[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function preservesHardeningBoundaries(item: TeoyubeProductHardeningItem): boolean {
  return item.preservesScriptureAnchors &&
    item.preservesExplanationTraces &&
    item.preservesFallbackSafety &&
    item.preservesConfidenceLabels &&
    item.preservesPrivacyConsent &&
    item.noServiceConnection &&
    item.noProductionJsonWrite &&
    item.noAutomaticPublishing &&
    item.noBrowserPersistence &&
    item.noHiddenPersonalization &&
    item.noDivineCertaintyClaimed;
}

export function isBlockedHardeningItem(item: TeoyubeProductHardeningItem): boolean {
  return item.status === "blocked" || item.riskLevel === "blocked" || !preservesHardeningBoundaries(item);
}

export function isDeferredHardeningItem(item: TeoyubeProductHardeningItem): boolean {
  return item.status === "deferred";
}

export function isSafeLocalHardeningItem(item: TeoyubeProductHardeningItem): boolean {
  return item.safeLocalPatchCandidate && !isBlockedHardeningItem(item) && !isDeferredHardeningItem(item) && item.priority !== "critical";
}

export function requiresOwnerReviewForHardening(item: TeoyubeProductHardeningItem): boolean {
  return !isSafeLocalHardeningItem(item) || item.priority === "high" || item.priority === "critical" || item.riskLevel === "high";
}

export function getHardeningItemRiskLevel(item: TeoyubeProductHardeningItem): TeoyubeProductHardeningRiskLevel {
  if (isBlockedHardeningItem(item)) return "blocked";
  return item.riskLevel;
}

export function getHardeningItemVerificationRequirements(item: TeoyubeProductHardeningItem) {
  return getProductHardeningVerificationRequirements(item);
}

export function classifyProductHardeningItem(item: TeoyubeProductHardeningItem): TeoyubeProductHardeningClassificationResult {
  const reasons = [
    ...(item.safeLocalPatchCandidate ? ["Marked as a safe local patch candidate."] : ["Not marked as a safe local patch candidate."]),
    ...(preservesHardeningBoundaries(item) ? ["Safety/privacy/service boundaries are preserved."] : ["One or more hardening safety boundaries would be weakened."]),
    ...(item.priority === "high" || item.priority === "critical" ? ["High-priority item requires owner review."] : []),
    ...(item.status === "deferred" ? ["Item is deferred."] : []),
    ...(item.status === "blocked" || item.riskLevel === "blocked" ? ["Item is blocked."] : [])
  ];
  const classification: TeoyubeProductHardeningClassification = isBlockedHardeningItem(item)
    ? "blocked"
    : isDeferredHardeningItem(item)
      ? "deferred"
      : isSafeLocalHardeningItem(item)
        ? "safe_local_patch"
        : requiresOwnerReviewForHardening(item)
          ? "owner_review_required"
          : "unknown";

  return {
    itemId: item.id,
    classification,
    riskLevel: getHardeningItemRiskLevel(item),
    verificationRequirements: getHardeningItemVerificationRequirements(item),
    reasons
  };
}

export function createProductHardeningClassificationReport(items: TeoyubeProductHardeningItem[] = createProductHardeningPlan().items): TeoyubeProductHardeningClassificationReport {
  const results = items.map(classifyProductHardeningItem);
  return {
    valid: !results.some((entry) => entry.classification === "blocked"),
    results,
    safeLocalItems: results.filter((entry) => entry.classification === "safe_local_patch"),
    ownerReviewItems: results.filter((entry) => entry.classification === "owner_review_required"),
    blockedItems: results.filter((entry) => entry.classification === "blocked"),
    deferredItems: results.filter((entry) => entry.classification === "deferred"),
    warnings: results
      .filter((entry) => entry.classification === "owner_review_required" || entry.classification === "deferred")
      .map((entry) => `${entry.itemId}: ${entry.classification.replace(/_/g, " ")}`),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
