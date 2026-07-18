export type TeoyubePrayerCallingReviewKind = "prayer" | "calling";

export type TeoyubePrayerCallingContentReviewItem = {
  id: string;
  kind: TeoyubePrayerCallingReviewKind;
  title: string;
  scriptureAnchors: string[];
  explanationPath: string[];
  fallbackMessage?: string;
  ownerReviewed: boolean;
  scriptureReviewed: boolean;
  theologyReviewed: boolean;
  copyReviewed: boolean;
  productionReady: false;
  notes: string[];
};

export type TeoyubePrayerCallingContentReviewReport = {
  valid: boolean;
  items: TeoyubePrayerCallingContentReviewItem[];
  blockers: string[];
  warnings: string[];
  noProductionContentCreated: true;
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

const UNSAFE_LANGUAGE = ["god told", "must be your calling", "will definitely", "medical advice", "legal advice", "financial advice"];

function createReviewItem(
  kind: TeoyubePrayerCallingReviewKind,
  input: Partial<TeoyubePrayerCallingContentReviewItem> & { id: string; title: string }
): TeoyubePrayerCallingContentReviewItem {
  return {
    id: input.id,
    kind,
    title: input.title,
    scriptureAnchors: input.scriptureAnchors || [],
    explanationPath: input.explanationPath || [],
    fallbackMessage: input.fallbackMessage,
    ownerReviewed: input.ownerReviewed ?? false,
    scriptureReviewed: input.scriptureReviewed ?? false,
    theologyReviewed: input.theologyReviewed ?? false,
    copyReviewed: input.copyReviewed ?? false,
    productionReady: false,
    notes: input.notes || []
  };
}

export function createPrayerCallingContentReviewWorkflow() {
  return {
    id: "prayer_calling_content_review_workflow",
    steps: [
      "Draft prayer or calling content outside production flows.",
      "Verify Scripture support where applicable.",
      "Review devotional language boundaries.",
      "Review calling guidance for humility and non-certainty.",
      "Confirm explanation path and fallback safety.",
      "Require owner/content review before production use."
    ],
    noProductionContentCreated: true as const,
    inMemoryOnly: true as const
  };
}

export function createPrayerContentReviewItem(
  input: Partial<TeoyubePrayerCallingContentReviewItem> & { id: string; title: string }
): TeoyubePrayerCallingContentReviewItem {
  return createReviewItem("prayer", input);
}

export function createCallingContentReviewItem(
  input: Partial<TeoyubePrayerCallingContentReviewItem> & { id: string; title: string }
): TeoyubePrayerCallingContentReviewItem {
  return createReviewItem("calling", input);
}

function validateItem(item: TeoyubePrayerCallingContentReviewItem) {
  const text = [item.title, item.fallbackMessage || "", ...item.notes].join(" ").toLowerCase();
  const unsafeMatches = UNSAFE_LANGUAGE.filter((phrase) => text.includes(phrase));
  const blockers = [
    unsafeMatches.length ? `${item.id} contains unsafe or over-certain language: ${unsafeMatches.join(", ")}.` : "",
    item.productionReady ? `${item.id} must not be marked production-ready in Phase 4.2.` : ""
  ].filter(Boolean);
  const warnings = [
    item.scriptureAnchors.length === 0 ? `${item.id} should receive Scripture support review before future production use.` : "",
    item.explanationPath.length === 0 ? `${item.id} needs explanation path review.` : "",
    !item.fallbackMessage ? `${item.id} needs fallback safety copy review.` : "",
    !item.scriptureReviewed ? `${item.id} needs Scripture review.` : "",
    !item.theologyReviewed ? `${item.id} needs theology review.` : "",
    !item.copyReviewed ? `${item.id} needs copy review.` : "",
    !item.ownerReviewed ? `${item.id} needs owner/content review.` : ""
  ].filter(Boolean);

  return { valid: blockers.length === 0, blockers, warnings };
}

export function validatePrayerContentReviewItem(item: TeoyubePrayerCallingContentReviewItem) {
  return validateItem({ ...item, kind: "prayer" });
}

export function validateCallingContentReviewItem(item: TeoyubePrayerCallingContentReviewItem) {
  return validateItem({ ...item, kind: "calling" });
}

export function createPrayerCallingContentReviewReport(
  items: TeoyubePrayerCallingContentReviewItem[] = [
    createPrayerContentReviewItem({
      id: "phase_4_2_sample_prayer_review_item",
      title: "Sample PrayerCompanion expansion review item",
      scriptureAnchors: ["Romans 8:28"],
      explanationPath: ["Drafted for backlog only.", "Review required before future release."],
      fallbackMessage: "Use safe Scripture-grounded encouragement when content is incomplete."
    }),
    createCallingContentReviewItem({
      id: "phase_4_2_sample_calling_review_item",
      title: "Sample Calling Compass expansion review item",
      scriptureAnchors: ["Romans 8:28"],
      explanationPath: ["Drafted for backlog only.", "Humility and owner review required before future release."],
      fallbackMessage: "Offer reflective guidance without claiming certainty."
    })
  ]
): TeoyubePrayerCallingContentReviewReport {
  const results = items.map(validateItem);
  const blockers = results.flatMap((entry) => entry.blockers);
  const warnings = results.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    items,
    blockers,
    warnings,
    noProductionContentCreated: true,
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
