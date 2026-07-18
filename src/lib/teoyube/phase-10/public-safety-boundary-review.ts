export type TeoyubePublicSafetyBoundaryReviewDecision =
  | "safety_ready"
  | "safety_ready_with_conditions"
  | "block_expansion"
  | "rollback_required";

export type TeoyubePublicSafetyBoundaryReviewRecord = {
  id: string;
  checks: Array<{ id: string; label: string; passed: boolean; critical: boolean; details: string }>;
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubePublicSafetyBoundaryReviewInput = Partial<{
  releaseOwner: string;
  notes: string[];
  scriptureAnchorsPreserved: boolean;
  explanationTracesPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelsVisible: boolean;
  privacyConsentNoticesPreserved: boolean;
  knownLimitationsVisible: boolean;
  noHiddenPersonalization: boolean;
  noDivineCertaintyClaim: boolean;
  noAuthoritativeProfessionalAdvice: boolean;
  noExternalServicesWithoutReview: boolean;
  noAnalyticsTrackingWithoutReview: boolean;
  noDatabasePersistenceWithoutReview: boolean;
  noUnreviewedTheologicalProductionContent: boolean;
}>;

function safetyItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, critical: true, details };
}

export function createPublicSafetyBoundaryReviewChecklist(input: TeoyubePublicSafetyBoundaryReviewInput = {}) {
  return [
    safetyItem("scripture_anchors", "Scripture anchors preserved", input.scriptureAnchorsPreserved === true, "Scripture anchors are removed."),
    safetyItem("explanation_traces", "Explanation traces preserved", input.explanationTracesPreserved === true, "Explanation traces are removed."),
    safetyItem("fallback_safety", "Fallback safety preserved", input.fallbackSafetyPreserved === true, "Fallback safety is weakened."),
    safetyItem("confidence_labels", "Confidence labels visible", input.confidenceLabelsVisible === true, "Confidence labels are hidden."),
    safetyItem("privacy_consent", "Privacy/consent notices preserved", input.privacyConsentNoticesPreserved === true, "Privacy/consent notices are bypassed."),
    safetyItem("known_limitations", "Known limitations visible", input.knownLimitationsVisible === true, "Known limitations are hidden."),
    safetyItem("no_hidden_personalization", "No hidden personalization", input.noHiddenPersonalization === true, "Hidden personalization is introduced."),
    safetyItem("no_divine_certainty", "No divine certainty claim", input.noDivineCertaintyClaim === true, "Divine certainty is claimed."),
    safetyItem("no_authoritative_professional_advice", "No authoritative professional advice", input.noAuthoritativeProfessionalAdvice === true, "Medical, legal, financial, emergency, or professional counseling advice is provided as authoritative."),
    safetyItem("no_external_services", "No external services without review", input.noExternalServicesWithoutReview === true, "External services are added without review."),
    safetyItem("no_analytics_tracking", "No analytics/tracking without review", input.noAnalyticsTrackingWithoutReview === true, "Analytics or tracking is introduced without review."),
    safetyItem("no_database_persistence", "No database persistence without review", input.noDatabasePersistenceWithoutReview === true, "Database persistence is introduced without review."),
    safetyItem("no_unreviewed_theology_content", "No unreviewed theological production content", input.noUnreviewedTheologicalProductionContent === true, "Unreviewed theological production content is added.")
  ];
}

export function createPublicSafetyBoundaryReviewRecord(input: TeoyubePublicSafetyBoundaryReviewInput = {}): TeoyubePublicSafetyBoundaryReviewRecord {
  return {
    id: "phase_10_6_public_safety_boundary_review",
    checks: createPublicSafetyBoundaryReviewChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getPublicSafetyBoundaryReviewBlockers(record: TeoyubePublicSafetyBoundaryReviewRecord): string[] {
  return record.checks.filter((entry) => entry.critical && !entry.passed).map((entry) => entry.details);
}

export function getPublicSafetyBoundaryReviewWarnings(record: TeoyubePublicSafetyBoundaryReviewRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  warnings.push("Public safety boundary review is local-only and does not expand access automatically.");
  return warnings;
}

export function validatePublicSafetyBoundaryReview(record: TeoyubePublicSafetyBoundaryReviewRecord): boolean {
  return getPublicSafetyBoundaryReviewBlockers(record).length === 0;
}

export function createPublicSafetyBoundaryReviewDecision(record: TeoyubePublicSafetyBoundaryReviewRecord): TeoyubePublicSafetyBoundaryReviewDecision {
  const blockers = getPublicSafetyBoundaryReviewBlockers(record);
  if (blockers.some((entry) => entry.includes("Divine certainty") || entry.includes("authoritative") || entry.includes("Privacy"))) return "rollback_required";
  return blockers.length ? "block_expansion" : getPublicSafetyBoundaryReviewWarnings(record).length ? "safety_ready_with_conditions" : "safety_ready";
}

export function createPublicSafetyBoundaryReviewReport(record: TeoyubePublicSafetyBoundaryReviewRecord) {
  const blockers = getPublicSafetyBoundaryReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPublicSafetyBoundaryReviewDecision(record),
    record,
    blockers,
    warnings: getPublicSafetyBoundaryReviewWarnings(record),
    noAutomaticPublicExpansion: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
