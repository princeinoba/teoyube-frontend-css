export type TeoyubePrayerCallingActionDraftKind = "prayer" | "calling" | "action_step";

export type TeoyubePrayerCallingActionDraftReviewItem = {
  id: string;
  kind: TeoyubePrayerCallingActionDraftKind;
  title: string;
  draftText: string;
  scriptureAnchors: string[];
  explanationPath: string[];
  fallbackMessage: string;
  devotionalEncouragementOnly: boolean;
  humbleNonDeterministicGuidance: boolean;
  safeGeneralNonProfessionalAdvice: boolean;
  scriptureReviewRequired: true;
  theologyReviewRequired: true;
  copyReviewRequired: true;
  ownerReviewRequired: true;
  scriptureReviewed: boolean;
  theologyReviewed: boolean;
  copyReviewed: boolean;
  ownerReviewed: boolean;
  reviewOnly: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
};

export type TeoyubePrayerCallingActionDraftReviewReport = {
  valid: boolean;
  items: TeoyubePrayerCallingActionDraftReviewItem[];
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

const UNSAFE_LANGUAGE = [
  "god told",
  "must be your calling",
  "will definitely",
  "medical advice",
  "legal advice",
  "financial advice",
  "emergency advice"
];

function createItem(
  kind: TeoyubePrayerCallingActionDraftKind,
  input: Partial<TeoyubePrayerCallingActionDraftReviewItem> & { id: string; title: string }
): TeoyubePrayerCallingActionDraftReviewItem {
  return {
    id: input.id,
    kind,
    title: input.title,
    draftText: input.draftText || "Review-only draft placeholder; owner/content review required before future use.",
    scriptureAnchors: input.scriptureAnchors || [],
    explanationPath: input.explanationPath || ["Draft created for manual review only.", "Keep outside live recommendation flows until reviewed."],
    fallbackMessage: input.fallbackMessage || "Use safe, Scripture-aware fallback encouragement when reviewed content is not available.",
    devotionalEncouragementOnly: input.devotionalEncouragementOnly ?? true,
    humbleNonDeterministicGuidance: input.humbleNonDeterministicGuidance ?? true,
    safeGeneralNonProfessionalAdvice: input.safeGeneralNonProfessionalAdvice ?? true,
    scriptureReviewRequired: true,
    theologyReviewRequired: true,
    copyReviewRequired: true,
    ownerReviewRequired: true,
    scriptureReviewed: input.scriptureReviewed ?? false,
    theologyReviewed: input.theologyReviewed ?? false,
    copyReviewed: input.copyReviewed ?? false,
    ownerReviewed: input.ownerReviewed ?? false,
    reviewOnly: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true
  };
}

export function createPrayerDraftReviewItem(
  input: Partial<TeoyubePrayerCallingActionDraftReviewItem> & { id: string; title: string }
): TeoyubePrayerCallingActionDraftReviewItem {
  return createItem("prayer", input);
}

export function createCallingDraftReviewItem(
  input: Partial<TeoyubePrayerCallingActionDraftReviewItem> & { id: string; title: string }
): TeoyubePrayerCallingActionDraftReviewItem {
  return createItem("calling", input);
}

export function createActionStepDraftReviewItem(
  input: Partial<TeoyubePrayerCallingActionDraftReviewItem> & { id: string; title: string }
): TeoyubePrayerCallingActionDraftReviewItem {
  return createItem("action_step", input);
}

function validateItem(item: TeoyubePrayerCallingActionDraftReviewItem) {
  const text = [item.title, item.draftText, item.fallbackMessage, ...item.explanationPath].join(" ").toLowerCase();
  const unsafeMatches = UNSAFE_LANGUAGE.filter((phrase) => text.includes(phrase));
  const blockers = [
    unsafeMatches.length ? `${item.id} contains unsafe, professional-advice, or over-certain language: ${unsafeMatches.join(", ")}.` : "",
    !item.devotionalEncouragementOnly && item.kind === "prayer" ? `${item.id} prayer draft must remain devotional encouragement only.` : "",
    !item.humbleNonDeterministicGuidance && item.kind === "calling" ? `${item.id} calling draft must be humble and non-deterministic.` : "",
    !item.safeGeneralNonProfessionalAdvice && item.kind === "action_step" ? `${item.id} action step draft must stay general and non-professional.` : "",
    item.scriptureAnchors.length === 0 && item.explanationPath.length === 0 ? `${item.id} needs Scripture support or an explanation path.` : "",
    item.productionEligible ? `${item.id} must not be production eligible in Phase 4.3.` : "",
    !item.excludedFromLiveRecommendations ? `${item.id} must be excluded from live recommendation flows.` : ""
  ].filter(Boolean);
  const warnings = [
    item.scriptureAnchors.length === 0 ? `${item.id} needs Scripture support review before future release.` : "",
    !item.scriptureReviewed ? `${item.id} needs Scripture review.` : "",
    !item.theologyReviewed ? `${item.id} needs theology review.` : "",
    !item.copyReviewed ? `${item.id} needs copy review.` : "",
    !item.ownerReviewed ? `${item.id} needs owner/content review.` : ""
  ].filter(Boolean);

  return { valid: blockers.length === 0, blockers, warnings };
}

export function validatePrayerDraftReviewItem(item: TeoyubePrayerCallingActionDraftReviewItem) {
  return validateItem({ ...item, kind: "prayer" });
}

export function validateCallingDraftReviewItem(item: TeoyubePrayerCallingActionDraftReviewItem) {
  return validateItem({ ...item, kind: "calling" });
}

export function validateActionStepDraftReviewItem(item: TeoyubePrayerCallingActionDraftReviewItem) {
  return validateItem({ ...item, kind: "action_step" });
}

export function createPrayerCallingActionDraftReviewReport(
  items: TeoyubePrayerCallingActionDraftReviewItem[] = [
    createPrayerDraftReviewItem({
      id: "phase_4_3_prayer_review_draft",
      title: "PrayerCompanion review-only depth draft",
      scriptureAnchors: ["Romans 8:28"]
    }),
    createCallingDraftReviewItem({
      id: "phase_4_3_calling_review_draft",
      title: "Calling Compass review-only depth draft",
      scriptureAnchors: ["Romans 8:28"]
    }),
    createActionStepDraftReviewItem({
      id: "phase_4_3_action_review_draft",
      title: "Action step review-only depth draft",
      scriptureAnchors: ["Romans 8:28"]
    })
  ]
): TeoyubePrayerCallingActionDraftReviewReport {
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
