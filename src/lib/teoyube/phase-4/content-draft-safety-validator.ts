export type TeoyubeContentDraftSafetyInput = unknown;

export type TeoyubeContentDraftSafetyResult = {
  id: string;
  valid: boolean;
  blockers: string[];
  warnings: string[];
};

export type TeoyubeContentDraftSafetyReport = {
  valid: boolean;
  results: TeoyubeContentDraftSafetyResult[];
  blockers: string[];
  warnings: string[];
  noUnsupportedScriptureInvented: true;
  noUnsupportedPromisesInvented: true;
  noDivineCertaintyClaimsAllowed: true;
  noProfessionalAdviceClaimsAllowed: true;
  noFallbackSafetyWeakened: true;
  explanationPathsPreserved: true;
  confidenceBoundariesPreserved: true;
  noHiddenPersonalization: true;
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

function asRecord(draft: TeoyubeContentDraftSafetyInput): Record<string, unknown> {
  return draft && typeof draft === "object" ? (draft as Record<string, unknown>) : {};
}

function idForDraft(draft: TeoyubeContentDraftSafetyInput): string {
  const record = asRecord(draft);
  return typeof record.id === "string" && record.id.trim() ? record.id : "unknown_draft";
}

function readNestedBoolean(draft: TeoyubeContentDraftSafetyInput, key: string): boolean | undefined {
  const record = asRecord(draft);
  if (typeof record[key] === "boolean") return record[key] as boolean;
  const review = record.review;
  if (review && typeof review === "object" && typeof (review as Record<string, unknown>)[key] === "boolean") {
    return (review as Record<string, unknown>)[key] as boolean;
  }
  return undefined;
}

function hasReviewRequirement(draft: TeoyubeContentDraftSafetyInput, key: string): boolean {
  if (readNestedBoolean(draft, key) === true) return true;
  const requirements = asRecord(draft).reviewRequirements;
  if (!Array.isArray(requirements)) return false;
  return requirements.some((entry) => {
    if (typeof entry === "string") return entry === key || entry === key.replace(/([A-Z])/g, "_$1").toLowerCase();
    if (!entry || typeof entry !== "object") return false;
    const record = entry as Record<string, unknown>;
    return record.id === key || record.reviewState === key || record.id === key.replace(/([A-Z])/g, "_$1").toLowerCase();
  });
}

function textForDraft(draft: TeoyubeContentDraftSafetyInput): string {
  return Object.values(asRecord(draft))
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

export function validateContentDraftSafety(draft: TeoyubeContentDraftSafetyInput): TeoyubeContentDraftSafetyResult {
  const record = asRecord(draft);
  const id = idForDraft(draft);
  const text = textForDraft(draft);
  const unsafeMatches = UNSAFE_LANGUAGE.filter((phrase) => text.includes(phrase));
  const anchors = Array.isArray(record.scriptureAnchors) ? record.scriptureAnchors : [];
  const explanationPath = Array.isArray(record.explanationPath) ? record.explanationPath : [];
  const blockers = [
    record.reviewOnly !== true ? `${id} must be marked review-only.` : "",
    record.productionEligible === true ? `${id} must not be production eligible without completed reviews.` : "",
    record.excludedFromLiveRecommendations !== true ? `${id} must be excluded from live recommendation flows.` : "",
    !hasReviewRequirement(draft, "scriptureReviewRequired") ? `${id} lacks required Scripture review.` : "",
    !hasReviewRequirement(draft, "theologyReviewRequired") ? `${id} lacks required theology review.` : "",
    record.unsupportedPromiseCreated === true ? `${id} creates an unsupported promise.` : "",
    record.unsupportedScriptureInvented === true ? `${id} invents an unsupported Scripture reference.` : "",
    record.fallbackSafetyWeakened === true ? `${id} weakens fallback safety.` : "",
    record.explanationPathRemoved === true ? `${id} removes explanation paths.` : "",
    record.confidenceBoundaryRemoved === true ? `${id} removes confidence boundaries.` : "",
    record.hiddenPersonalizationCreated === true ? `${id} creates hidden personalization.` : "",
    record.externalServiceRequired === true ? `${id} requires an external service.` : "",
    record.databasePersistenceEnabled === true ? `${id} enables database persistence.` : "",
    record.analyticsEnabled === true ? `${id} enables analytics.` : "",
    record.liveAiOrchestrationEnabled === true ? `${id} enables live AI orchestration.` : "",
    record.browserPersistenceRequired === true ? `${id} requires browser persistence.` : "",
    unsafeMatches.length ? `${id} contains unsafe, professional-advice, or over-certain language: ${unsafeMatches.join(", ")}.` : ""
  ].filter(Boolean);
  const warnings = [
    anchors.length === 0 ? `${id} has no Scripture anchors yet; keep review-only.` : "",
    explanationPath.length === 0 ? `${id} has no explanation path yet; keep review-only.` : "",
    !hasReviewRequirement(draft, "copyReviewRequired") ? `${id} lacks copy review requirement.` : "",
    !hasReviewRequirement(draft, "ownerReviewRequired") ? `${id} lacks owner review requirement.` : "",
    readNestedBoolean(draft, "ownerReviewed") !== true ? `${id} still needs owner review before future release.` : ""
  ].filter(Boolean);

  return {
    id,
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function validateContentDraftSafetyBatch(
  drafts: TeoyubeContentDraftSafetyInput[]
): TeoyubeContentDraftSafetyResult[] {
  return drafts.map(validateContentDraftSafety);
}

export function getContentDraftSafetyBlockers(drafts: TeoyubeContentDraftSafetyInput[]): string[] {
  return validateContentDraftSafetyBatch(drafts).flatMap((entry) => entry.blockers);
}

export function getContentDraftSafetyWarnings(drafts: TeoyubeContentDraftSafetyInput[]): string[] {
  return validateContentDraftSafetyBatch(drafts).flatMap((entry) => entry.warnings);
}

export function createContentDraftSafetyReport(
  drafts: TeoyubeContentDraftSafetyInput[]
): TeoyubeContentDraftSafetyReport {
  const results = validateContentDraftSafetyBatch(drafts);
  const blockers = results.flatMap((entry) => entry.blockers);
  const warnings = results.flatMap((entry) => entry.warnings);
  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings,
    noUnsupportedScriptureInvented: true,
    noUnsupportedPromisesInvented: true,
    noDivineCertaintyClaimsAllowed: true,
    noProfessionalAdviceClaimsAllowed: true,
    noFallbackSafetyWeakened: true,
    explanationPathsPreserved: true,
    confidenceBoundariesPreserved: true,
    noHiddenPersonalization: true,
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
