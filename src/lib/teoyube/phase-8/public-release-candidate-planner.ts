import type {
  TeoyubePublicReleaseCandidateArea,
  TeoyubePublicReleaseCandidateBlocker,
  TeoyubePublicReleaseCandidateCheck,
  TeoyubePublicReleaseCandidateDecision,
  TeoyubePublicReleaseCandidateNextAction,
  TeoyubePublicReleaseCandidatePlan,
  TeoyubePublicReleaseCandidateReport,
  TeoyubePublicReleaseCandidateRequirement,
  TeoyubePublicReleaseCandidateRisk,
  TeoyubePublicReleaseCandidateWarning
} from "./public-release-candidate-contracts";

export type TeoyubePublicReleaseCandidatePlannerInput = Partial<{
  productHardeningPackageExists: boolean;
  mobileAccessibilityPassExists: boolean;
  performanceReviewExists: boolean;
  privacySecurityReviewExists: boolean;
  serviceDecisionPackageExists: boolean;
  serviceLocksValid: boolean;
  publicCopyReviewExists: boolean;
  knownLimitationsExist: boolean;
  supportWorkflowManual: boolean;
  feedbackManual: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisible: boolean;
  reviewedContentGateActive: boolean;
  disabledServiceStateExplicit: boolean;
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

function requirement(id: string, area: TeoyubePublicReleaseCandidateArea, label: string, details: string): TeoyubePublicReleaseCandidateRequirement {
  return { id, area, label, required: true, details };
}

function check(id: string, area: TeoyubePublicReleaseCandidateArea, label: string, passed: boolean, details: string): TeoyubePublicReleaseCandidateCheck {
  return { id, area, label, passed, details, requirements: [requirement(`${id}_requirement`, area, label, details)] };
}

export function getPublicReleaseCandidateChecklist(input: TeoyubePublicReleaseCandidatePlannerInput = {}): TeoyubePublicReleaseCandidateCheck[] {
  return [
    check("product_hardening_package", "product_hardening", "Product hardening package exists", flag(input.productHardeningPackageExists), "Phase 8.2 product hardening package is available."),
    check("mobile_accessibility_pass", "mobile_accessibility", "Mobile/accessibility pass exists", flag(input.mobileAccessibilityPassExists), "Mobile and accessibility hardening evidence is available."),
    check("performance_review", "performance_review", "Performance review exists", flag(input.performanceReviewExists), "Performance review evidence is available."),
    check("privacy_security_review", "privacy_security", "Privacy/security review exists", flag(input.privacySecurityReviewExists), "Phase 8.3 privacy/security review is available."),
    check("service_decision_package", "controlled_service_decisions", "Controlled service decision package exists", flag(input.serviceDecisionPackageExists), "Controlled service decision package is available."),
    check("service_locks_valid", "service_disabled_state", "Service locks are valid", flag(input.serviceLocksValid), "Service locks keep external services disabled or future-review-only."),
    check("public_copy_review", "public_copy", "Public copy review exists", flag(input.publicCopyReviewExists), "Consent and public copy review exists."),
    check("known_limitations", "known_limitations", "Known limitations exist", flag(input.knownLimitationsExist), "Known limitations are documented."),
    check("support_manual", "support_workflow", "Support remains manual", flag(input.supportWorkflowManual), "Support workflow remains manual."),
    check("feedback_manual", "manual_feedback_boundaries", "Feedback remains manual", flag(input.feedbackManual), "Feedback intake remains manual."),
    check("scripture_anchor", "scripture_anchor", "Scripture anchors remain visible", flag(input.scriptureAnchorsVisible), "Scripture anchors are preserved."),
    check("explanation_trace", "explanation_trace", "Explanation traces remain visible", flag(input.explanationTracesVisible), "Explanation paths are preserved."),
    check("fallback_safe", "fallback", "Fallback remains safe", flag(input.fallbackSafe), "Fallback states remain safe and non-empty."),
    check("confidence_label", "confidence_label", "Confidence labels remain visible", flag(input.confidenceLabelsVisible), "Confidence labels remain visible and humble."),
    check("reviewed_content_gate", "reviewed_content_gate", "Reviewed content gate remains active", flag(input.reviewedContentGateActive), "Review-only content remains gated."),
    check("disabled_service_state", "service_disabled_state", "Disabled service state remains explicit", flag(input.disabledServiceStateExplicit), "Disabled services are explicit to future reviewers."),
    check("owner_review_path", "owner_review", "Owner review path exists", flag(input.ownerReviewPathExists), "Owner review path exists before Phase 9."),
    check("no_public_launch", "unknown", "No public launch from code", !input.publicLaunchPerformedByCode, "Phase 8.4 performs no public launch."),
    check("no_user_contact", "unknown", "No users contacted from code", !input.usersContactedByCode, "Phase 8.4 contacts no users."),
    check("no_auto_feedback", "manual_feedback_boundaries", "No automatic feedback collection", !input.feedbackCollectedAutomatically, "Phase 8.4 collects no feedback automatically."),
    check("no_public_url_fetching", "unknown", "No automatic public URL fetching", !input.publicUrlsFetchedAutomatically, "Phase 8.4 fetches no public URLs automatically."),
    check("no_external_service_required", "controlled_service_decisions", "No external service required", !input.externalServiceRequired, "No external service is required for Phase 8.4 planning.")
  ];
}

export function getPublicReleaseCandidateBlockers(input: TeoyubePublicReleaseCandidatePlannerInput = {}): TeoyubePublicReleaseCandidateBlocker[] {
  return getPublicReleaseCandidateChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      area: entry.area,
      message: `${entry.label} is not satisfied.`,
      requiredAction: "Resolve before moving into Phase 9 public release preparation."
    }));
}

export function getPublicReleaseCandidateWarnings(input: TeoyubePublicReleaseCandidatePlannerInput = {}): TeoyubePublicReleaseCandidateWarning[] {
  return [
    {
      id: "phase_8_4_planning_only",
      area: "unknown",
      message: "Public release candidate planning is manual and in-memory; it does not launch, contact, collect, fetch, publish, persist, or connect services.",
      recommendedAction: "Use the resulting package for owner review before Phase 9."
    },
    ...(!input.ownerReviewPathExists ? [{
      id: "owner_review_path_pending",
      area: "owner_review" as const,
      message: "Owner review path should be confirmed before Phase 9.",
      recommendedAction: "Review the final readiness package manually."
    }] : [])
  ];
}

export function getPublicReleaseCandidateRisks(): TeoyubePublicReleaseCandidateRisk[] {
  return [
    { id: "public_release_candidate_privacy_risk", area: "privacy_security", severity: "high", message: "Public release preparation can increase sensitive-data and consent risk.", mitigation: "Keep privacy/consent notices, sensitive warnings, and service locks in place." },
    { id: "future_service_activation_risk", area: "controlled_service_decisions", severity: "high", message: "Future service activation can introduce persistence, analytics, monitoring, account, or AI risks.", mitigation: "Require owner, privacy, security, cost, rollback, and QA gates before implementation." },
    { id: "spiritual_guidance_overclaim_risk", area: "scripture_anchor", severity: "medium", message: "Public-facing guidance can overclaim certainty if anchors and confidence labels are weakened.", mitigation: "Preserve Scripture anchors, explanation traces, fallback safety, and confidence labels." }
  ];
}

export function getPublicReleaseCandidateNextActions(input: TeoyubePublicReleaseCandidatePlannerInput = {}): TeoyubePublicReleaseCandidateNextAction[] {
  const blockers = getPublicReleaseCandidateBlockers(input);
  if (blockers.length) {
    return blockers.map((entry) => ({
      id: `${entry.id}_next_action`,
      area: entry.area,
      priority: "high",
      label: `Resolve ${entry.area} blocker`,
      details: entry.requiredAction,
      ownerReviewRequired: true,
      doesNotLaunchPublicly: true,
      doesNotContactUsers: true,
      doesNotConnectServices: true
    }));
  }

  return [
    {
      id: "phase_9_preparation_next_action",
      area: "owner_review",
      priority: "high",
      label: "Prepare Phase 9 controlled public release readiness review",
      details: "Use the final Phase 8 package for owner review and Phase 9 planning without launching publicly or connecting services.",
      ownerReviewRequired: true,
      doesNotLaunchPublicly: true,
      doesNotContactUsers: true,
      doesNotConnectServices: true
    }
  ];
}

export function createPublicReleaseCandidateDecision(input: TeoyubePublicReleaseCandidatePlannerInput = {}): TeoyubePublicReleaseCandidateDecision {
  const blockers = getPublicReleaseCandidateBlockers(input);
  if (blockers.some((entry) => entry.area === "product_hardening" || entry.area === "mobile_accessibility" || entry.area === "performance_review")) return "needs_product_hardening";
  if (blockers.some((entry) => entry.area === "privacy_security" || entry.area === "public_copy" || entry.area === "known_limitations")) return "needs_privacy_security_review";
  if (blockers.some((entry) => entry.area === "controlled_service_decisions" || entry.area === "service_disabled_state")) return "needs_service_decision_review";
  if (blockers.some((entry) => entry.area === "owner_review")) return "needs_owner_review";
  if (blockers.length) return "blocked";
  return getPublicReleaseCandidateWarnings(input).length ? "ready_with_warnings" : "ready_for_phase_9_public_release_preparation";
}

export function createPublicReleaseCandidatePlan(input: TeoyubePublicReleaseCandidatePlannerInput = {}): TeoyubePublicReleaseCandidatePlan {
  const blockers = getPublicReleaseCandidateBlockers(input);
  const warnings = getPublicReleaseCandidateWarnings(input);
  return {
    id: "phase_8_4_public_release_candidate_plan",
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    checks: getPublicReleaseCandidateChecklist(input),
    risks: getPublicReleaseCandidateRisks(),
    nextActions: getPublicReleaseCandidateNextActions(input),
    blockers,
    warnings,
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

export function createPublicReleaseCandidateReport(input: TeoyubePublicReleaseCandidatePlannerInput = {}): TeoyubePublicReleaseCandidateReport {
  const plan = createPublicReleaseCandidatePlan(input);
  return {
    valid: plan.blockers.length === 0,
    status: plan.status,
    decision: createPublicReleaseCandidateDecision(input),
    plan,
    checks: plan.checks,
    blockers: plan.blockers,
    warnings: plan.warnings,
    risks: plan.risks,
    nextActions: plan.nextActions,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
