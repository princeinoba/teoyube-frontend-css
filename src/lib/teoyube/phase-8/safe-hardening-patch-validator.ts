import type {
  TeoyubeProductHardeningArea,
  TeoyubeProductHardeningItem
} from "./product-hardening-plan-contracts";

export type TeoyubeSafeHardeningPatchValidationBlocker = {
  id: string;
  itemId: string;
  area: TeoyubeProductHardeningArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeSafeHardeningPatchValidationWarning = {
  id: string;
  itemId: string;
  area: TeoyubeProductHardeningArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSafeHardeningPatchValidationReport = {
  valid: boolean;
  items: TeoyubeProductHardeningItem[];
  blockers: TeoyubeSafeHardeningPatchValidationBlocker[];
  warnings: TeoyubeSafeHardeningPatchValidationWarning[];
  noProductChangesApplied: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function blocker(item: TeoyubeProductHardeningItem, id: string, message: string): TeoyubeSafeHardeningPatchValidationBlocker {
  return { id: `${item.id}_${id}`, itemId: item.id, area: item.area, message, requiredAction: "Reject or redesign this hardening patch before implementation." };
}

function warning(item: TeoyubeProductHardeningItem, id: string, message: string): TeoyubeSafeHardeningPatchValidationWarning {
  return { id: `${item.id}_${id}`, itemId: item.id, area: item.area, message, recommendedAction: "Review manually before Phase 8.2 execution." };
}

export function validateSafeHardeningPatch(item: TeoyubeProductHardeningItem): TeoyubeSafeHardeningPatchValidationReport {
  return createSafeHardeningPatchValidationReport([item]);
}

export function validateSafeHardeningPatchBatch(items: TeoyubeProductHardeningItem[]): TeoyubeSafeHardeningPatchValidationReport {
  return createSafeHardeningPatchValidationReport(items);
}

export function getSafeHardeningPatchBlockers(items: TeoyubeProductHardeningItem[]): TeoyubeSafeHardeningPatchValidationBlocker[] {
  return items.flatMap((item) => [
    ...(!item.preservesScriptureAnchors ? [blocker(item, "scripture_anchor_removed", "Hardening must not remove Scripture anchors.")] : []),
    ...(!item.preservesExplanationTraces ? [blocker(item, "explanation_trace_removed", "Hardening must not remove explanation traces.")] : []),
    ...(!item.preservesFallbackSafety ? [blocker(item, "fallback_weakened", "Hardening must not weaken fallback safety.")] : []),
    ...(!item.preservesConfidenceLabels ? [blocker(item, "confidence_label_removed", "Hardening must not remove confidence labels.")] : []),
    ...(!item.preservesPrivacyConsent ? [blocker(item, "privacy_consent_hidden", "Hardening must not hide privacy or consent notices.")] : []),
    ...(!item.noServiceConnection ? [blocker(item, "service_enabled", "Hardening must not enable unapproved services.")] : []),
    ...(!item.noAutomaticPublishing ? [blocker(item, "auto_publish", "Hardening must not publish reviewed or review-only content automatically.")] : []),
    ...(!item.noProductionJsonWrite ? [blocker(item, "production_json_write", "Hardening must not write unreviewed content into production JSON.")] : []),
    ...(!item.noBrowserPersistence ? [blocker(item, "browser_persistence", "Hardening must not add localStorage, cookies, IndexedDB, or browser persistence.")] : []),
    ...(!item.noHiddenPersonalization ? [blocker(item, "hidden_personalization", "Hardening must not create hidden personalization.")] : []),
    ...(!item.noDivineCertaintyClaimed ? [blocker(item, "divine_certainty", "Hardening must not claim divine certainty.")] : []),
    ...(item.riskLevel === "blocked" || item.status === "blocked" ? [blocker(item, "item_blocked", item.blockedReason || "Hardening item is blocked.")] : [])
  ]);
}

export function getSafeHardeningPatchWarnings(items: TeoyubeProductHardeningItem[]): TeoyubeSafeHardeningPatchValidationWarning[] {
  return items.flatMap((item) => [
    ...(!item.safeLocalPatchCandidate ? [warning(item, "planning_only", "Item is not marked as a safe local patch candidate.")] : []),
    ...(item.priority === "critical" || item.riskLevel === "high" ? [warning(item, "high_risk_review", "High priority/risk hardening needs owner review before implementation.")] : [])
  ]);
}

export function createSafeHardeningPatchValidationReport(items: TeoyubeProductHardeningItem[] = []): TeoyubeSafeHardeningPatchValidationReport {
  const blockers = getSafeHardeningPatchBlockers(items);
  return {
    valid: blockers.length === 0,
    items,
    blockers,
    warnings: getSafeHardeningPatchWarnings(items),
    noProductChangesApplied: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
