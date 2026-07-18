import type {
  TeoyubeFinalPublicReadinessArea,
  TeoyubeFinalPublicReadinessBlocker,
  TeoyubeFinalPublicReadinessCheck,
  TeoyubeFinalPublicReadinessDecision,
  TeoyubeFinalPublicReadinessEvidence,
  TeoyubeFinalPublicReadinessReport,
  TeoyubeFinalPublicReadinessRisk,
  TeoyubeFinalPublicReadinessWarning
} from "./final-public-readiness-review-contracts";

export type TeoyubeFinalPublicReadinessReviewInput = Partial<{
  phase81Complete: boolean;
  phase82Complete: boolean;
  phase83Complete: boolean;
  postBetaReadinessAuditExists: boolean;
  productHardeningPackageExists: boolean;
  privacySecurityReviewExists: boolean;
  controlledServiceDecisionPackageExists: boolean;
  publicReleaseReadinessGateExists: boolean;
  publicReleaseCandidatePlanExists: boolean;
  publicReleaseBoundaryValidatorExists: boolean;
  knownLimitationsExist: boolean;
  supportFeedbackReadinessExists: boolean;
  safetyReadinessExists: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisible: boolean;
  reviewedContentGateActive: boolean;
  servicesRemainDisabledOrFutureReviewOnly: boolean;
  ownerReviewPathExists: boolean;
  publicLaunchPerformedByCode: boolean;
  usersContactedByCode: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlsFetchedAutomatically: boolean;
  externalServiceRequired: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function evidence(id: string, area: TeoyubeFinalPublicReadinessArea, label: string, details: string): TeoyubeFinalPublicReadinessEvidence {
  return { id, area, label, details };
}

function check(id: string, area: TeoyubeFinalPublicReadinessArea, label: string, passed: boolean, details: string): TeoyubeFinalPublicReadinessCheck {
  return { id, area, label, passed, details, evidence: [evidence(`${id}_evidence`, area, label, details)] };
}

export function createFinalPublicReadinessChecklist(input: TeoyubeFinalPublicReadinessReviewInput = {}): TeoyubeFinalPublicReadinessCheck[] {
  return [
    check("phase_8_1_complete", "phase_8_readiness", "Phase 8.1 complete", flag(input.phase81Complete), "Post-beta readiness audit, hardening plan, and service reassessment gate are complete."),
    check("phase_8_2_complete", "phase_8_readiness", "Phase 8.2 complete", flag(input.phase82Complete), "Product hardening execution, mobile/accessibility pass, and performance review are complete."),
    check("phase_8_3_complete", "phase_8_readiness", "Phase 8.3 complete", flag(input.phase83Complete), "Privacy/security review, service package, and public release readiness gate are complete."),
    check("post_beta_readiness_audit", "phase_8_readiness", "Post-beta readiness audit exists", flag(input.postBetaReadinessAuditExists), "Post-beta readiness evidence exists."),
    check("product_hardening_package", "product_hardening", "Product hardening package exists", flag(input.productHardeningPackageExists), "Product hardening evidence exists."),
    check("privacy_security_review", "privacy_security", "Privacy/security review exists", flag(input.privacySecurityReviewExists), "Privacy/security evidence exists."),
    check("controlled_service_decision_package", "service_decision_locks", "Controlled service decision package exists", flag(input.controlledServiceDecisionPackageExists), "Service decisions are documented."),
    check("public_release_readiness_gate", "public_release_candidate", "Public release readiness gate exists", flag(input.publicReleaseReadinessGateExists), "Readiness gate evidence exists."),
    check("public_release_candidate_plan", "public_release_candidate", "Public release candidate plan exists", flag(input.publicReleaseCandidatePlanExists), "Release candidate plan exists without launch side effects."),
    check("public_release_boundary_validator", "public_release_candidate", "Public release boundary validator exists", flag(input.publicReleaseBoundaryValidatorExists), "Boundary validator exists."),
    check("known_limitations", "known_limitations", "Known limitations exist", flag(input.knownLimitationsExist), "Known limitations are available."),
    check("support_feedback_readiness", "support_feedback", "Support/feedback readiness exists", flag(input.supportFeedbackReadinessExists), "Support and feedback remain manual."),
    check("safety_readiness", "safety_readiness", "Safety readiness exists", flag(input.safetyReadinessExists), "Safety readiness review exists."),
    check("scripture_anchor", "scripture_anchor", "Scripture anchors visible", flag(input.scriptureAnchorsVisible), "Scripture anchors remain visible."),
    check("explanation_trace", "explanation_trace", "Explanation traces visible", flag(input.explanationTracesVisible), "Explanation traces remain visible."),
    check("fallback_safe", "fallback", "Fallback safe", flag(input.fallbackSafe), "Fallback remains safe."),
    check("confidence_label", "confidence_label", "Confidence labels visible", flag(input.confidenceLabelsVisible), "Confidence labels remain visible."),
    check("reviewed_content_gate", "reviewed_content_gate", "Reviewed content gate active", flag(input.reviewedContentGateActive), "Review-only content remains gated."),
    check("services_disabled", "service_disabled_state", "Services remain disabled or future-review-only", flag(input.servicesRemainDisabledOrFutureReviewOnly), "Services remain disabled unless a future phase approves them."),
    check("owner_review", "owner_review", "Owner review path exists", flag(input.ownerReviewPathExists), "Owner review path exists for Phase 9."),
    check("no_public_launch", "unknown", "No public launch from code", !input.publicLaunchPerformedByCode, "No public launch is performed."),
    check("no_user_contact", "unknown", "No users contacted by code", !input.usersContactedByCode, "No users are contacted."),
    check("no_auto_feedback", "support_feedback", "No automatic feedback collection", !input.feedbackCollectedAutomatically, "Feedback is not collected automatically."),
    check("no_public_url_fetching", "unknown", "No automatic public URL fetching", !input.publicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    check("no_external_service_required", "service_disabled_state", "No external services required", !input.externalServiceRequired, "No external services are required.")
  ];
}

export function runFinalPublicReadinessReview(input: TeoyubeFinalPublicReadinessReviewInput = {}): TeoyubeFinalPublicReadinessCheck[] {
  return createFinalPublicReadinessChecklist(input);
}

export function getFinalPublicReadinessBlockers(input: TeoyubeFinalPublicReadinessReviewInput = {}): TeoyubeFinalPublicReadinessBlocker[] {
  return createFinalPublicReadinessChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label} is incomplete.`, requiredAction: "Resolve or keep Phase 9 planning blocked." }));
}

export function getFinalPublicReadinessWarnings(input: TeoyubeFinalPublicReadinessReviewInput = {}): TeoyubeFinalPublicReadinessWarning[] {
  return [
    {
      id: "final_readiness_manual_only",
      area: "unknown",
      message: "Final public readiness review is manual and in-memory; it does not launch or connect services.",
      recommendedAction: "Use it as evidence for owner review before Phase 9."
    },
    ...(!input.ownerReviewPathExists ? [{
      id: "owner_review_pending",
      area: "owner_review" as const,
      message: "Owner review path should be confirmed.",
      recommendedAction: "Complete owner review before public release preparation."
    }] : [])
  ];
}

export function getFinalPublicReadinessRisks(): TeoyubeFinalPublicReadinessRisk[] {
  return [
    { id: "final_privacy_risk", area: "privacy_security", severity: "high", message: "Public release preparation can expose gaps in privacy, consent, and sensitive-data handling.", mitigation: "Keep privacy/security lock active and complete owner/legal review where appropriate." },
    { id: "final_service_lock_risk", area: "service_decision_locks", severity: "high", message: "Future service decisions may be mistaken for service activation approval.", mitigation: "Keep service locks disabled or future-review-only until explicit approval exists." },
    { id: "final_guidance_risk", area: "scripture_anchor", severity: "medium", message: "Guidance can become unsafe if Scripture anchors, explanations, fallback, or confidence labels are removed.", mitigation: "Preserve safety surfaces through Phase 9 QA." }
  ];
}

export function createFinalPublicReadinessDecision(input: TeoyubeFinalPublicReadinessReviewInput = {}): TeoyubeFinalPublicReadinessDecision {
  const blockers = getFinalPublicReadinessBlockers(input);
  if (blockers.some((entry) => entry.area === "privacy_security" || entry.area === "known_limitations")) return "needs_privacy_security_review";
  if (blockers.some((entry) => entry.area === "service_decision_locks" || entry.area === "service_disabled_state")) return "needs_service_lock_review";
  if (blockers.some((entry) => entry.area === "owner_review")) return "needs_owner_review";
  if (blockers.length) return "blocked";
  return getFinalPublicReadinessWarnings(input).length ? "ready_with_warnings" : "ready_for_phase_9_planning";
}

export function createFinalPublicReadinessReport(input: TeoyubeFinalPublicReadinessReviewInput = {}): TeoyubeFinalPublicReadinessReport {
  const blockers = getFinalPublicReadinessBlockers(input);
  const warnings = getFinalPublicReadinessWarnings(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision: createFinalPublicReadinessDecision(input),
    checks: runFinalPublicReadinessReview(input),
    blockers,
    warnings,
    risks: getFinalPublicReadinessRisks(),
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
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
