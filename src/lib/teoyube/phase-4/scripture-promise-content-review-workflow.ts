export type TeoyubeScripturePromiseReviewItem = {
  id: string;
  title: string;
  scriptureAnchors: string[];
  promiseClaim?: string;
  explanationPath: string[];
  ownerReviewed: boolean;
  scriptureReviewed: boolean;
  theologyReviewed: boolean;
  copyReviewed: boolean;
  notes: string[];
  productionReady: false;
};

export type TeoyubeScripturePromiseReviewWorkflow = {
  id: string;
  steps: string[];
  safetyRules: string[];
  noProductionContentCreated: true;
  inMemoryOnly: true;
};

export type TeoyubeScripturePromiseReviewReport = {
  valid: boolean;
  items: TeoyubeScripturePromiseReviewItem[];
  blockers: string[];
  warnings: string[];
  noUnsupportedScriptureInvented: true;
  noUnsupportedPromisesInvented: true;
  noDivineCertaintyClaimsAllowed: true;
  noProfessionalAdviceClaimsAllowed: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

const UNSAFE_CLAIMS = [
  "god told",
  "god guarantees",
  "will definitely",
  "must be your calling",
  "medical advice",
  "legal advice",
  "financial advice"
];

export function createScripturePromiseContentReviewWorkflow(): TeoyubeScripturePromiseReviewWorkflow {
  return {
    id: "scripture_promise_content_review_workflow",
    steps: [
      "Create draft candidate outside production flows.",
      "Verify every Scripture anchor against existing canon data.",
      "Review promise interpretation and avoid unsupported promise claims.",
      "Review theology boundaries and devotional humility.",
      "Review copy for clarity, fallback safety, and confidence-aware language.",
      "Owner/content review must approve before future production use."
    ],
    safetyRules: [
      "No invented Scripture references.",
      "No unsupported promises.",
      "No divine-certainty language.",
      "No professional advice claims.",
      "No production publishing before owner/content review."
    ],
    noProductionContentCreated: true,
    inMemoryOnly: true
  };
}

export function createScripturePromiseReviewItem(input: Partial<TeoyubeScripturePromiseReviewItem> & {
  id: string;
  title: string;
}): TeoyubeScripturePromiseReviewItem {
  return {
    id: input.id,
    title: input.title,
    scriptureAnchors: input.scriptureAnchors || [],
    promiseClaim: input.promiseClaim,
    explanationPath: input.explanationPath || [],
    ownerReviewed: input.ownerReviewed ?? false,
    scriptureReviewed: input.scriptureReviewed ?? false,
    theologyReviewed: input.theologyReviewed ?? false,
    copyReviewed: input.copyReviewed ?? false,
    notes: input.notes || [],
    productionReady: false
  };
}

export function validateScripturePromiseReviewItem(item: TeoyubeScripturePromiseReviewItem) {
  const text = [item.title, item.promiseClaim || "", ...item.notes].join(" ").toLowerCase();
  const unsafeMatches = UNSAFE_CLAIMS.filter((claim) => text.includes(claim));
  const blockers = [
    item.scriptureAnchors.length === 0 ? `${item.id} has no Scripture anchors.` : "",
    unsafeMatches.length ? `${item.id} contains unsupported or unsafe claim language: ${unsafeMatches.join(", ")}.` : "",
    item.productionReady ? `${item.id} must not be marked production-ready in Phase 4.2.` : ""
  ].filter(Boolean);
  const warnings = [
    !item.scriptureReviewed ? `${item.id} needs Scripture anchor verification.` : "",
    !item.theologyReviewed ? `${item.id} needs theology boundary review.` : "",
    !item.copyReviewed ? `${item.id} needs copy review.` : "",
    !item.ownerReviewed ? `${item.id} needs owner/content review before future production use.` : "",
    item.explanationPath.length === 0 ? `${item.id} needs an explanation path before future production use.` : ""
  ].filter(Boolean);

  return { valid: blockers.length === 0, blockers, warnings };
}

export function getScripturePromiseReviewBlockers(items: TeoyubeScripturePromiseReviewItem[]): string[] {
  return items.flatMap((item) => validateScripturePromiseReviewItem(item).blockers);
}

export function getScripturePromiseReviewWarnings(items: TeoyubeScripturePromiseReviewItem[]): string[] {
  return items.flatMap((item) => validateScripturePromiseReviewItem(item).warnings);
}

export function createScripturePromiseReviewReport(
  items: TeoyubeScripturePromiseReviewItem[] = [
    createScripturePromiseReviewItem({
      id: "phase_4_2_sample_scripture_promise_review_item",
      title: "Sample Promise Cluster expansion review item",
      scriptureAnchors: ["Romans 8:28"],
      promiseClaim: "Draft promise wording requires Scripture and theology review before use.",
      explanationPath: ["Draft created as backlog only.", "Owner review required before future release."]
    })
  ]
): TeoyubeScripturePromiseReviewReport {
  const blockers = getScripturePromiseReviewBlockers(items);
  const warnings = getScripturePromiseReviewWarnings(items);

  return {
    valid: blockers.length === 0,
    items,
    blockers,
    warnings,
    noUnsupportedScriptureInvented: true,
    noUnsupportedPromisesInvented: true,
    noDivineCertaintyClaimsAllowed: true,
    noProfessionalAdviceClaimsAllowed: true,
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
