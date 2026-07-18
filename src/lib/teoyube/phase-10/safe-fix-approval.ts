import type { TeoyubeLaunchIssueSeverity } from "./launch-issue-classification-contracts";

export type TeoyubeSafeFixApprovalRequest = {
  id: string;
  issueSummary: string;
  issueSeverity: TeoyubeLaunchIssueSeverity;
  affectedRouteComponentOrDataFile: string;
  proposedFix: string;
  riskOfFix: "low" | "medium" | "high" | "unknown";
  rollbackImpact: string;
  ownerApproved: boolean;
  scriptureAnchorsPreserved: boolean;
  explanationTracesPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelsPreserved: boolean;
  privacyConsentBoundariesPreserved: boolean;
  serviceDisabledStatePreserved: boolean;
  hiddenPersonalizationIntroduced: boolean;
  externalServicesAdded: boolean;
  analyticsOrTrackingAdded: boolean;
  databasePersistenceAdded: boolean;
  productionContentChangedWithoutReview: boolean;
  notes: string[];
};

export function createSafeFixApprovalChecklist(request: TeoyubeSafeFixApprovalRequest) {
  return [
    { id: "owner_approved", label: "Owner approval recorded", passed: request.ownerApproved },
    { id: "scripture_anchors", label: "Scripture anchors preserved", passed: request.scriptureAnchorsPreserved },
    { id: "explanation_traces", label: "Explanation traces preserved", passed: request.explanationTracesPreserved },
    { id: "fallback_safety", label: "Fallback safety preserved", passed: request.fallbackSafetyPreserved },
    { id: "confidence_labels", label: "Confidence labels preserved", passed: request.confidenceLabelsPreserved },
    { id: "privacy_consent", label: "Privacy/consent boundaries preserved", passed: request.privacyConsentBoundariesPreserved },
    { id: "service_disabled", label: "Service-disabled state preserved", passed: request.serviceDisabledStatePreserved },
    { id: "no_hidden_personalization", label: "No hidden personalization introduced", passed: !request.hiddenPersonalizationIntroduced },
    { id: "no_external_services", label: "No external services added", passed: !request.externalServicesAdded },
    { id: "no_analytics", label: "No analytics or tracking added", passed: !request.analyticsOrTrackingAdded },
    { id: "no_database_persistence", label: "No database persistence added", passed: !request.databasePersistenceAdded },
    { id: "no_unreviewed_content", label: "No production content changed without review", passed: !request.productionContentChangedWithoutReview }
  ];
}

export function createSafeFixApprovalRequest(input: Partial<TeoyubeSafeFixApprovalRequest> = {}): TeoyubeSafeFixApprovalRequest {
  return {
    id: input.id || `safe_fix_${Date.now()}`,
    issueSummary: input.issueSummary || "Manual safe-fix request placeholder.",
    issueSeverity: input.issueSeverity || "severity_4_low",
    affectedRouteComponentOrDataFile: input.affectedRouteComponentOrDataFile || "manual_owner_required",
    proposedFix: input.proposedFix || "No automated fix proposed.",
    riskOfFix: input.riskOfFix || "unknown",
    rollbackImpact: input.rollbackImpact || "Owner must assess rollback impact manually.",
    ownerApproved: input.ownerApproved ?? false,
    scriptureAnchorsPreserved: input.scriptureAnchorsPreserved ?? true,
    explanationTracesPreserved: input.explanationTracesPreserved ?? true,
    fallbackSafetyPreserved: input.fallbackSafetyPreserved ?? true,
    confidenceLabelsPreserved: input.confidenceLabelsPreserved ?? true,
    privacyConsentBoundariesPreserved: input.privacyConsentBoundariesPreserved ?? true,
    serviceDisabledStatePreserved: input.serviceDisabledStatePreserved ?? true,
    hiddenPersonalizationIntroduced: input.hiddenPersonalizationIntroduced ?? false,
    externalServicesAdded: input.externalServicesAdded ?? false,
    analyticsOrTrackingAdded: input.analyticsOrTrackingAdded ?? false,
    databasePersistenceAdded: input.databasePersistenceAdded ?? false,
    productionContentChangedWithoutReview: input.productionContentChangedWithoutReview ?? false,
    notes: input.notes || []
  };
}

export function getSafeFixApprovalBlockers(request: TeoyubeSafeFixApprovalRequest): string[] {
  return createSafeFixApprovalChecklist(request)
    .filter((entry) => !entry.passed)
    .map((entry) => `${entry.id}: ${entry.label}`);
}

export function getSafeFixApprovalWarnings(request: TeoyubeSafeFixApprovalRequest): string[] {
  const warnings = request.notes.length ? [...request.notes] : [];
  if (request.riskOfFix === "high" || request.riskOfFix === "unknown") warnings.push("Fix risk needs owner review before release continuation.");
  return warnings;
}

export function validateSafeFixApprovalRequest(request: TeoyubeSafeFixApprovalRequest): boolean {
  return getSafeFixApprovalBlockers(request).length === 0;
}

export function createSafeFixApprovalDecision(request: TeoyubeSafeFixApprovalRequest): "safe_fix_approved" | "safe_fix_rejected" | "needs_owner_review" {
  if (!request.ownerApproved) return "needs_owner_review";
  return validateSafeFixApprovalRequest(request) ? "safe_fix_approved" : "safe_fix_rejected";
}

export function createSafeFixApprovalReport(request: TeoyubeSafeFixApprovalRequest) {
  const blockers = getSafeFixApprovalBlockers(request);
  return {
    valid: blockers.length === 0,
    decision: createSafeFixApprovalDecision(request),
    checklist: createSafeFixApprovalChecklist(request),
    request,
    blockers,
    warnings: getSafeFixApprovalWarnings(request),
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noDatabasePersistenceEnabled: true,
    noProductionContentAutoPublished: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
