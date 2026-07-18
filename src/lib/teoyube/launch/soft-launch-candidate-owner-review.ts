export type TeoyubeSoftLaunchCandidateOwnerReviewRecord = {
  id: string;
  previewRecheckReviewed: boolean;
  resolvedIssuesReviewed: boolean;
  regressionResultsReviewed: boolean;
  scriptureAnchoringReviewed: boolean;
  explanationPathsReviewed: boolean;
  fallbackSafetyReviewed: boolean;
  consentPrivacyReviewed: boolean;
  mobileAccessibilityReviewed: boolean;
  knownLimitationsAccepted: boolean;
  feedbackIntakePlanAccepted: boolean;
  rollbackCriteriaAccepted: boolean;
  softLaunchCandidateDecisionAccepted: boolean;
  reviewerName?: string;
  notes?: string;
  createdAt: string;
};

export type TeoyubeSoftLaunchCandidateOwnerReviewInput = Partial<Omit<TeoyubeSoftLaunchCandidateOwnerReviewRecord, "id" | "createdAt">>;

export function createSoftLaunchCandidateOwnerReviewChecklist() {
  return [
    "preview_recheck_reviewed",
    "resolved_issues_reviewed",
    "regression_results_reviewed",
    "scripture_anchoring_reviewed",
    "explanation_paths_reviewed",
    "fallback_safety_reviewed",
    "consent_privacy_reviewed",
    "mobile_accessibility_reviewed",
    "known_limitations_accepted",
    "feedback_intake_plan_accepted",
    "rollback_criteria_accepted",
    "soft_launch_candidate_decision_accepted"
  ].map((id) => ({
    id,
    label: id.replace(/_/g, " "),
    required: true
  }));
}

export function createSoftLaunchCandidateOwnerReviewRecord(
  input: TeoyubeSoftLaunchCandidateOwnerReviewInput = {}
): TeoyubeSoftLaunchCandidateOwnerReviewRecord {
  return {
    id: "soft_launch_candidate_owner_review",
    previewRecheckReviewed: input.previewRecheckReviewed === true,
    resolvedIssuesReviewed: input.resolvedIssuesReviewed === true,
    regressionResultsReviewed: input.regressionResultsReviewed === true,
    scriptureAnchoringReviewed: input.scriptureAnchoringReviewed === true,
    explanationPathsReviewed: input.explanationPathsReviewed === true,
    fallbackSafetyReviewed: input.fallbackSafetyReviewed === true,
    consentPrivacyReviewed: input.consentPrivacyReviewed === true,
    mobileAccessibilityReviewed: input.mobileAccessibilityReviewed === true,
    knownLimitationsAccepted: input.knownLimitationsAccepted === true,
    feedbackIntakePlanAccepted: input.feedbackIntakePlanAccepted === true,
    rollbackCriteriaAccepted: input.rollbackCriteriaAccepted === true,
    softLaunchCandidateDecisionAccepted: input.softLaunchCandidateDecisionAccepted === true,
    reviewerName: input.reviewerName,
    notes: input.notes,
    createdAt: new Date().toISOString()
  };
}

export function getSoftLaunchCandidateOwnerReviewWarnings(record: TeoyubeSoftLaunchCandidateOwnerReviewRecord): string[] {
  return [
    record.previewRecheckReviewed ? "" : "Preview re-check has not been reviewed.",
    record.resolvedIssuesReviewed ? "" : "Resolved issues have not been reviewed.",
    record.regressionResultsReviewed ? "" : "Regression results have not been reviewed.",
    record.scriptureAnchoringReviewed ? "" : "Scripture anchoring has not been reviewed.",
    record.explanationPathsReviewed ? "" : "Explanation paths have not been reviewed.",
    record.fallbackSafetyReviewed ? "" : "Fallback safety has not been reviewed.",
    record.consentPrivacyReviewed ? "" : "Consent/privacy has not been reviewed.",
    record.mobileAccessibilityReviewed ? "" : "Mobile/accessibility has not been reviewed.",
    record.knownLimitationsAccepted ? "" : "Known limitations have not been accepted.",
    record.feedbackIntakePlanAccepted ? "" : "Feedback intake plan has not been accepted.",
    record.rollbackCriteriaAccepted ? "" : "Rollback criteria have not been accepted.",
    record.softLaunchCandidateDecisionAccepted ? "" : "Soft launch candidate decision has not been accepted."
  ].filter(Boolean);
}

export function validateSoftLaunchCandidateOwnerReview(record: TeoyubeSoftLaunchCandidateOwnerReviewRecord) {
  const warnings = getSoftLaunchCandidateOwnerReviewWarnings(record);

  return {
    valid: warnings.length === 0,
    warnings
  };
}

export function createSoftLaunchCandidateOwnerReviewReport(record: TeoyubeSoftLaunchCandidateOwnerReviewRecord) {
  const validation = validateSoftLaunchCandidateOwnerReview(record);

  return {
    ...validation,
    record,
    checklist: createSoftLaunchCandidateOwnerReviewChecklist(),
    signatureRequired: false,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
