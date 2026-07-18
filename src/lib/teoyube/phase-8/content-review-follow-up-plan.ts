export type TeoyubeContentReviewFollowUpItem = {
  id: string;
  area: "promise_cluster" | "scripture_anchor" | "prayer_content" | "calling_content" | "tig_relationship" | "surface_copy";
  label: string;
  details: string;
  ownerReviewRequired: true;
  scriptureReviewRequired: boolean;
  theologyReviewRequired: boolean;
  productionEligible: false;
};

export type TeoyubeContentReviewFollowUpReport = {
  valid: boolean;
  items: TeoyubeContentReviewFollowUpItem[];
  blockers: string[];
  warnings: string[];
  reviewOnlyDraftsGated: true;
  noUnsupportedScriptureInvented: true;
  noUnsupportedPromiseInvented: true;
  noProductionJsonWrite: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeContentReviewFollowUpInput = Partial<{
  items: TeoyubeContentReviewFollowUpItem[];
}>;

function item(id: string, area: TeoyubeContentReviewFollowUpItem["area"], label: string, details: string, scriptureReviewRequired = true, theologyReviewRequired = true): TeoyubeContentReviewFollowUpItem {
  return { id, area, label, details, ownerReviewRequired: true, scriptureReviewRequired, theologyReviewRequired, productionEligible: false };
}

export function getPromiseClusterReviewFollowUpItems(): TeoyubeContentReviewFollowUpItem[] {
  return [item("promise_cluster_coverage_review", "promise_cluster", "Promise Cluster coverage review", "Review cluster coverage and keep drafts out of production until eligible.")];
}

export function getScriptureAnchorReviewFollowUpItems(): TeoyubeContentReviewFollowUpItem[] {
  return [item("scripture_anchor_coverage_review", "scripture_anchor", "Scripture anchor coverage review", "Review missing or weak anchors without inventing unsupported references.")];
}

export function getPrayerContentReviewFollowUpItems(): TeoyubeContentReviewFollowUpItem[] {
  return [item("prayer_content_boundary_review", "prayer_content", "Prayer content boundary review", "Review prayer copy for devotional boundaries and no professional advice.")];
}

export function getCallingContentReviewFollowUpItems(): TeoyubeContentReviewFollowUpItem[] {
  return [item("calling_content_confidence_review", "calling_content", "Calling content confidence review", "Review calling copy for humility, confidence labels, and no divine-certainty claims.")];
}

export function getTigRelationshipReviewFollowUpItems(): TeoyubeContentReviewFollowUpItem[] {
  return [item("tig_relationship_review", "tig_relationship", "TIG relationship review", "Review TIG relationships for explanation traces and Scripture grounding.")];
}

export function getSurfaceCopyReviewFollowUpItems(): TeoyubeContentReviewFollowUpItem[] {
  return [item("surface_copy_review", "surface_copy", "Surface copy review", "Review UI copy for clarity, fallback safety, confidence labels, and consent/privacy boundaries.", false, true)];
}

export function createContentReviewFollowUpPlan(input: TeoyubeContentReviewFollowUpInput = {}): TeoyubeContentReviewFollowUpItem[] {
  return input.items || [
    ...getPromiseClusterReviewFollowUpItems(),
    ...getScriptureAnchorReviewFollowUpItems(),
    ...getPrayerContentReviewFollowUpItems(),
    ...getCallingContentReviewFollowUpItems(),
    ...getTigRelationshipReviewFollowUpItems(),
    ...getSurfaceCopyReviewFollowUpItems()
  ];
}

export function createContentReviewFollowUpReport(input: TeoyubeContentReviewFollowUpInput = {}): TeoyubeContentReviewFollowUpReport {
  const items = createContentReviewFollowUpPlan(input);
  return {
    valid: items.length > 0,
    items,
    blockers: items.some((entry) => entry.productionEligible) ? ["Review-only follow-up item must not be production eligible by default."] : [],
    warnings: ["Content review follow-up is review-only and must not generate unsupported Scripture, promises, prayer, calling, or TIG relationship content."],
    reviewOnlyDraftsGated: true,
    noUnsupportedScriptureInvented: true,
    noUnsupportedPromiseInvented: true,
    noProductionJsonWrite: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
