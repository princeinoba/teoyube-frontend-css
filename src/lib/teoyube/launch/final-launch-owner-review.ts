import type {
  TeoyubeFinalLaunchDecision,
  TeoyubeFinalLaunchPreparationCheck,
  TeoyubeFinalLaunchPreparationWarning
} from "./final-launch-preparation-contracts";

export type TeoyubeFinalLaunchOwnerReviewInput = Partial<Record<
  | "roadmapReviewed"
  | "launchPreparationStepsReviewed"
  | "scriptureAnchoringReviewed"
  | "explanationPathsReviewed"
  | "fallbackSafetyReviewed"
  | "personalizationConsentReviewed"
  | "mobileReadinessReviewed"
  | "accessibilityReadinessReviewed"
  | "privacyBoundariesReviewed"
  | "noExternalAnalyticsConfirmed"
  | "noProductionPersistenceConfirmed"
  | "noLiveAiOrchestrationConfirmed"
  | "softLaunchRunbookReviewed"
  | "feedbackIntakePlanReviewed"
  | "manualPreviewDeploymentReadinessAccepted",
  boolean
>>;

export type TeoyubeFinalLaunchOwnerReviewRecord = {
  id: string;
  checklist: TeoyubeFinalLaunchPreparationCheck[];
  accepted: boolean;
  decision: TeoyubeFinalLaunchDecision;
  signaturesRequired: false;
  generatedAt: string;
};

function ownerCheck(
  id: keyof TeoyubeFinalLaunchOwnerReviewInput,
  label: string,
  input: TeoyubeFinalLaunchOwnerReviewInput
): TeoyubeFinalLaunchPreparationCheck {
  const complete = input[id] === true;

  return {
    id,
    label,
    stage: "final_owner_review",
    required: true,
    complete,
    status: complete ? "ready" : "needs_review",
    riskLevel: complete ? "low" : "medium",
    details: `${label} should be reviewed manually by the owner before preview deployment execution.`,
    nextAction: complete ? undefined : "Complete owner review for this item."
  };
}

export function createFinalLaunchOwnerReviewChecklist(
  input: TeoyubeFinalLaunchOwnerReviewInput = {}
): TeoyubeFinalLaunchPreparationCheck[] {
  return [
    ownerCheck("roadmapReviewed", "Roadmap reviewed", input),
    ownerCheck("launchPreparationStepsReviewed", "Launch preparation steps reviewed", input),
    ownerCheck("scriptureAnchoringReviewed", "Scripture anchoring reviewed", input),
    ownerCheck("explanationPathsReviewed", "Explanation paths reviewed", input),
    ownerCheck("fallbackSafetyReviewed", "Fallback safety reviewed", input),
    ownerCheck("personalizationConsentReviewed", "Personalization consent reviewed", input),
    ownerCheck("mobileReadinessReviewed", "Mobile readiness reviewed", input),
    ownerCheck("accessibilityReadinessReviewed", "Accessibility readiness reviewed", input),
    ownerCheck("privacyBoundariesReviewed", "Privacy boundaries reviewed", input),
    ownerCheck("noExternalAnalyticsConfirmed", "No external analytics confirmed", input),
    ownerCheck("noProductionPersistenceConfirmed", "No production persistence confirmed", input),
    ownerCheck("noLiveAiOrchestrationConfirmed", "No live AI orchestration confirmed", input),
    ownerCheck("softLaunchRunbookReviewed", "Soft launch runbook reviewed", input),
    ownerCheck("feedbackIntakePlanReviewed", "Feedback intake plan reviewed", input),
    ownerCheck("manualPreviewDeploymentReadinessAccepted", "Manual preview deployment readiness accepted", input)
  ];
}

export function createFinalLaunchOwnerReviewRecord(
  input: TeoyubeFinalLaunchOwnerReviewInput = {}
): TeoyubeFinalLaunchOwnerReviewRecord {
  const checklist = createFinalLaunchOwnerReviewChecklist(input);
  const accepted = checklist.every((item) => item.complete);

  return {
    id: `final_owner_review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    checklist,
    accepted,
    decision: accepted ? "ready_for_manual_preview_deployment" : "ready_after_manual_review",
    signaturesRequired: false,
    generatedAt: new Date().toISOString()
  };
}

export function validateFinalLaunchOwnerReview(record: TeoyubeFinalLaunchOwnerReviewRecord): boolean {
  return record.checklist.every((item) => item.required ? item.complete : true);
}

export function getFinalLaunchOwnerReviewWarnings(record: TeoyubeFinalLaunchOwnerReviewRecord): TeoyubeFinalLaunchPreparationWarning[] {
  return record.checklist
    .filter((item) => !item.complete)
    .map((item) => ({
      id: item.id,
      label: item.label,
      category: "final_owner_review",
      riskLevel: "medium",
      message: `${item.label} is not yet marked complete.`,
      recommendedAction: item.nextAction || "Complete owner review."
    }));
}

export function createFinalLaunchOwnerReviewReport(record: TeoyubeFinalLaunchOwnerReviewRecord) {
  const warnings = getFinalLaunchOwnerReviewWarnings(record);

  return {
    valid: validateFinalLaunchOwnerReview(record),
    status: warnings.length ? "ready_with_warnings" : "ready",
    decision: record.decision,
    checklist: record.checklist,
    warnings,
    signaturesRequired: record.signaturesRequired,
    generatedAt: new Date().toISOString()
  };
}
