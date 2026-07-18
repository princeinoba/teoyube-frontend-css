import { createPromiseTable } from "../promises/promise-table";
import type {
  TeoyubeReviewedContentIntegrationBlocker,
  TeoyubeReviewedContentIntegrationDecision,
  TeoyubeReviewedContentIntegrationGate,
  TeoyubeReviewedContentIntegrationReport,
  TeoyubeReviewedContentIntegrationWarning,
  TeoyubeReviewedContentItem
} from "./reviewed-content-integration-contracts";

const UNSAFE_LANGUAGE = [
  "god told",
  "god guarantees",
  "will definitely",
  "must be your calling",
  "medical advice",
  "legal advice",
  "financial advice",
  "emergency advice",
  "diagnose",
  "treat your condition"
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function hasUnsafeLanguage(item: TeoyubeReviewedContentItem): string[] {
  const text = [
    item.title,
    item.summary,
    item.source.reviewEvidence,
    ...item.explanationPath
  ].join(" ").toLowerCase();
  return UNSAFE_LANGUAGE.filter((phrase) => text.includes(phrase));
}

function requiresScriptureAnchor(item: TeoyubeReviewedContentItem): boolean {
  return [
    "promise_cluster",
    "scripture_anchor",
    "prayer_prompt",
    "calling_path",
    "action_step",
    "tig_relationship",
    "teoyube_word"
  ].includes(item.type);
}

export function createReviewedContentItemFromExistingPromiseRow(
  row: ReturnType<typeof createPromiseTable>["rows"][number]
): TeoyubeReviewedContentItem {
  return {
    id: `reviewed_existing_promise_${row.promiseId}`,
    type: "promise_cluster",
    status: row.valid ? "ready_for_future_integration" : "needs_scripture_review",
    reviewState: row.valid ? "production_candidate" : "scripture_review_required",
    title: row.title,
    summary: `Existing Promise Table row generated from real Promise Cluster data with ${row.scriptureAnchors.length} Scripture anchor(s).`,
    source: {
      sourceId: row.promiseId,
      sourceType: "production_data",
      sourceFile: "src/data/promiseClusters.json",
      reviewEvidence: "Existing production data path; Phase 4.4 release candidate remains manual and in-memory."
    },
    scriptureAnchors: unique(row.scriptureAnchors),
    explanationPath: [
      "Promise Table row came from existing Promise Engine data.",
      `Related Teoyube words: ${row.relatedTeoyubeWords.length || 0}.`,
      `TIG relationship edges: ${row.tigEdges.length || 0}.`
    ],
    relatedWordIds: unique(row.relatedTeoyubeWords),
    relatedPromiseClusterIds: [row.promiseId],
    reviewOnly: false,
    scriptureReviewRequired: true,
    theologyReviewRequired: true,
    copyReviewRequired: false,
    ownerReviewRequired: true,
    scriptureReviewed: row.scriptureAnchors.length > 0,
    theologyReviewed: row.valid,
    copyReviewed: true,
    ownerReviewed: row.valid,
    productionEligible: row.valid && row.scriptureAnchors.length > 0,
    excludedFromLiveRecommendations: false,
    fallbackSafetyPreserved: true,
    confidenceBoundariesPreserved: true,
    hiddenPersonalizationIntroduced: false,
    unsupportedScriptureInvented: false,
    unsupportedPromiseIntroduced: false,
    divineCertaintyLanguagePresent: false,
    professionalAdviceLanguagePresent: false,
    createdAt: new Date().toISOString()
  };
}

export function createDefaultReviewedContentItems(limit = 8): TeoyubeReviewedContentItem[] {
  return createPromiseTable().rows.slice(0, limit).map(createReviewedContentItemFromExistingPromiseRow);
}

export function createReviewedContentIntegrationGate(input: {
  items?: TeoyubeReviewedContentItem[];
  id?: string;
} = {}): TeoyubeReviewedContentIntegrationGate {
  return {
    id: input.id || "phase_4_4_reviewed_content_integration_gate",
    items: input.items || createDefaultReviewedContentItems(),
    reviewOnlyDraftsBlocked: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function validateReviewedContentItem(item: TeoyubeReviewedContentItem) {
  const unsafeMatches = hasUnsafeLanguage(item);
  const blockers: TeoyubeReviewedContentIntegrationBlocker[] = [
    item.reviewOnly
      ? {
          id: `${item.id}_review_only_blocked`,
          itemId: item.id,
          message: `${item.title} is still review-only.`,
          requiredAction: "Keep it out of release candidates until review-only is false and all required reviews are recorded."
        }
      : undefined,
    item.scriptureReviewRequired && !item.scriptureReviewed
      ? {
          id: `${item.id}_missing_scripture_review`,
          itemId: item.id,
          message: `${item.title} is missing required Scripture review.`,
          requiredAction: "Complete or explicitly record Scripture review."
        }
      : undefined,
    item.theologyReviewRequired && !item.theologyReviewed
      ? {
          id: `${item.id}_missing_theology_review`,
          itemId: item.id,
          message: `${item.title} is missing required theology review.`,
          requiredAction: "Complete or explicitly record theology review."
        }
      : undefined,
    item.ownerReviewRequired && !item.ownerReviewed
      ? {
          id: `${item.id}_missing_owner_review`,
          itemId: item.id,
          message: `${item.title} is missing required owner review.`,
          requiredAction: "Complete or explicitly record owner review."
        }
      : undefined,
    !item.productionEligible
      ? {
          id: `${item.id}_not_production_eligible`,
          itemId: item.id,
          message: `${item.title} is not production eligible.`,
          requiredAction: "Do not create a release candidate until production eligibility is true."
        }
      : undefined,
    requiresScriptureAnchor(item) && item.scriptureAnchors.length === 0
      ? {
          id: `${item.id}_missing_scripture_anchor`,
          itemId: item.id,
          message: `${item.title} is missing Scripture anchors.`,
          requiredAction: "Add verified Scripture anchors or keep the item deferred."
        }
      : undefined,
    item.explanationPath.length === 0
      ? {
          id: `${item.id}_missing_explanation_path`,
          itemId: item.id,
          message: `${item.title} is missing explanation path compatibility.`,
          requiredAction: "Add explanation path before release candidate review."
        }
      : undefined,
    !item.fallbackSafetyPreserved
      ? {
          id: `${item.id}_fallback_weakened`,
          itemId: item.id,
          message: `${item.title} weakens fallback safety.`,
          requiredAction: "Restore fallback safety before review."
        }
      : undefined,
    !item.confidenceBoundariesPreserved
      ? {
          id: `${item.id}_confidence_removed`,
          itemId: item.id,
          message: `${item.title} removes confidence boundaries.`,
          requiredAction: "Restore visible confidence boundaries."
        }
      : undefined,
    item.hiddenPersonalizationIntroduced
      ? {
          id: `${item.id}_hidden_personalization`,
          itemId: item.id,
          message: `${item.title} introduces hidden personalization.`,
          requiredAction: "Remove hidden personalization before release candidate review."
        }
      : undefined,
    item.unsupportedScriptureInvented
      ? {
          id: `${item.id}_unsupported_scripture`,
          itemId: item.id,
          message: `${item.title} invents unsupported Scripture references.`,
          requiredAction: "Use existing canon/manual review only."
        }
      : undefined,
    item.unsupportedPromiseIntroduced
      ? {
          id: `${item.id}_unsupported_promise`,
          itemId: item.id,
          message: `${item.title} introduces unsupported promise claims.`,
          requiredAction: "Remove unsupported promise claims."
        }
      : undefined,
    item.divineCertaintyLanguagePresent || unsafeMatches.length
      ? {
          id: `${item.id}_unsafe_certainty_language`,
          itemId: item.id,
          message: `${item.title} contains unsafe or over-certain language${unsafeMatches.length ? `: ${unsafeMatches.join(", ")}` : ""}.`,
          requiredAction: "Rewrite the content before release candidate review."
        }
      : undefined,
    item.professionalAdviceLanguagePresent
      ? {
          id: `${item.id}_professional_advice`,
          itemId: item.id,
          message: `${item.title} contains professional-advice language.`,
          requiredAction: "Remove medical, legal, financial, emergency, or other professional advice claims."
        }
      : undefined
  ].filter(Boolean) as TeoyubeReviewedContentIntegrationBlocker[];
  const warnings: TeoyubeReviewedContentIntegrationWarning[] = [
    item.copyReviewRequired && !item.copyReviewed
      ? {
          id: `${item.id}_copy_review_needed`,
          itemId: item.id,
          message: `${item.title} still needs copy review.`,
          recommendedAction: "Complete copy review before a future release."
        }
      : undefined,
    item.excludedFromLiveRecommendations
      ? {
          id: `${item.id}_not_live`,
          itemId: item.id,
          message: `${item.title} is excluded from live recommendations.`,
          recommendedAction: "Keep excluded unless approved for future release."
        }
      : undefined,
    item.source.sourceType === "phase_4_3_draft"
      ? {
          id: `${item.id}_draft_source`,
          itemId: item.id,
          message: `${item.title} originated from a Phase 4.3 draft source.`,
          recommendedAction: "Require explicit manual review evidence before release."
        }
      : undefined
  ].filter(Boolean) as TeoyubeReviewedContentIntegrationWarning[];

  return { valid: blockers.length === 0, blockers, warnings };
}

export function isReviewedContentProductionEligible(item: TeoyubeReviewedContentItem): boolean {
  return validateReviewedContentItem(item).valid && item.productionEligible && !item.reviewOnly;
}

export function getReviewedContentIntegrationBlockers(
  items: TeoyubeReviewedContentItem[]
): TeoyubeReviewedContentIntegrationBlocker[] {
  return items.flatMap((item) => validateReviewedContentItem(item).blockers);
}

export function getReviewedContentIntegrationWarnings(
  items: TeoyubeReviewedContentItem[]
): TeoyubeReviewedContentIntegrationWarning[] {
  return items.flatMap((item) => validateReviewedContentItem(item).warnings);
}

export function createReviewedContentIntegrationDecision(
  items: TeoyubeReviewedContentItem[]
): TeoyubeReviewedContentIntegrationDecision {
  const blockers = getReviewedContentIntegrationBlockers(items);
  const warnings = getReviewedContentIntegrationWarnings(items);
  if (!items.length) return "empty";
  if (blockers.length) return "blocked";
  if (items.some((item) => !isReviewedContentProductionEligible(item))) return "needs_review";
  return warnings.length ? "ready_with_warnings" : "ready_for_future_integration";
}

export function createReviewedContentIntegrationGateReport(
  items: TeoyubeReviewedContentItem[] = createDefaultReviewedContentItems()
): TeoyubeReviewedContentIntegrationReport {
  const gate = createReviewedContentIntegrationGate({ items });
  const blockers = getReviewedContentIntegrationBlockers(items);
  const warnings = getReviewedContentIntegrationWarnings(items);
  return {
    valid: blockers.length === 0,
    decision: createReviewedContentIntegrationDecision(items),
    gate,
    items,
    eligibleItems: items.filter(isReviewedContentProductionEligible),
    blockedItems: items.filter((item) => validateReviewedContentItem(item).blockers.length > 0),
    deferredItems: items.filter((item) => ["deferred", "needs_scripture_review", "needs_theology_review", "needs_owner_review"].includes(item.status)),
    blockers,
    warnings,
    reviewOnlyDraftsBlocked: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
