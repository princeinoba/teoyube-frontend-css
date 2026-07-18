import type {
  TeoyubePhase8CompletionArea,
  TeoyubePhase8CompletionBlocker,
  TeoyubePhase8CompletionCheck,
  TeoyubePhase8CompletionDecision,
  TeoyubePhase8CompletionReport,
  TeoyubePhase8CompletionWarning,
  TeoyubePhase8LockedReadinessItem
} from "./phase-8-completion-contracts";

export type TeoyubePhase8CompletionReviewInput = Partial<{
  phase81Complete: boolean;
  phase82Complete: boolean;
  phase83Complete: boolean;
  publicReleaseCandidatePlannerExists: boolean;
  finalPublicReadinessReviewExists: boolean;
  finalPrivacySecurityLockExists: boolean;
  finalControlledServiceDecisionLockExists: boolean;
  finalPublicReleaseBoundaryLockExists: boolean;
  publicLaunchPerformedByCode: boolean;
  betaLaunchPerformedByCode: boolean;
  usersContactedByCode: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlsFetchedAutomatically: boolean;
  servicesRemainDisabledOrFutureReviewOnly: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackSafe: boolean;
  confidenceLabelsVisible: boolean;
  privacyConsentNoticeAvailableOrPlanned: boolean;
  knownLimitationsAvailable: boolean;
  phase9RoadmapExists: boolean;
  ownerReviewComplete: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, area: TeoyubePhase8CompletionArea, label: string, passed: boolean, details: string): TeoyubePhase8CompletionCheck {
  return { id, area, label, passed, details };
}

export function createPhase8CompletionChecklist(input: TeoyubePhase8CompletionReviewInput = {}): TeoyubePhase8CompletionCheck[] {
  return [
    check("phase_8_1_complete", "post_beta_readiness_audit", "Phase 8.1 is complete", flag(input.phase81Complete), "Post-beta readiness audit, hardening plan, and service reassessment gate are complete."),
    check("phase_8_2_complete", "product_hardening_execution", "Phase 8.2 is complete", flag(input.phase82Complete), "Product hardening execution, mobile/accessibility pass, and performance review are complete."),
    check("phase_8_3_complete", "privacy_security_review", "Phase 8.3 is complete", flag(input.phase83Complete), "Privacy/security review, controlled service decision package, and public release readiness gate are complete."),
    check("public_release_candidate_planner", "public_release_candidate_plan", "Public release candidate planner exists", flag(input.publicReleaseCandidatePlannerExists), "Phase 8.4 public release candidate planner exists."),
    check("final_public_readiness_review", "final_readiness_review", "Final public readiness review exists", flag(input.finalPublicReadinessReviewExists), "Final public readiness review exists."),
    check("final_privacy_security_lock", "final_privacy_security_lock", "Final privacy/security lock exists", flag(input.finalPrivacySecurityLockExists), "Final privacy/security lock exists."),
    check("final_service_decision_lock", "final_service_decision_lock", "Final service decision lock exists", flag(input.finalControlledServiceDecisionLockExists), "Final controlled service decision lock exists."),
    check("final_boundary_lock", "final_boundary_lock", "Final public release boundary lock exists", flag(input.finalPublicReleaseBoundaryLockExists), "Final public release boundary lock exists."),
    check("no_public_launch", "unknown", "Public release is not launched by code", !input.publicLaunchPerformedByCode, "No public launch is performed by Phase 8.4 code."),
    check("no_beta_launch", "unknown", "Beta is not launched by code", !input.betaLaunchPerformedByCode, "No beta launch is performed by Phase 8.4 code."),
    check("no_user_contact", "unknown", "No users are contacted by code", !input.usersContactedByCode, "No users are contacted by Phase 8.4 code."),
    check("no_auto_feedback", "unknown", "No feedback is collected automatically", !input.feedbackCollectedAutomatically, "Feedback is not collected automatically."),
    check("no_public_url_fetching", "unknown", "No public URLs are fetched automatically", !input.publicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    check("service_decisions_locked", "controlled_service_decision_package", "Services remain disabled or future-review-only", flag(input.servicesRemainDisabledOrFutureReviewOnly), "Services remain disabled, plan-only, or future-review-only."),
    check("scripture_anchor", "unknown", "Scripture anchors remain visible", flag(input.scriptureAnchorsVisible), "Scripture anchors remain visible."),
    check("explanation_trace", "unknown", "Explanation traces remain visible", flag(input.explanationTracesVisible), "Explanation traces remain visible."),
    check("fallback_safe", "unknown", "Fallback remains safe", flag(input.fallbackSafe), "Fallback remains safe."),
    check("confidence_label", "unknown", "Confidence labels remain visible", flag(input.confidenceLabelsVisible), "Confidence labels remain visible."),
    check("privacy_consent_notice", "final_privacy_security_lock", "Privacy/consent notices remain available or planned", flag(input.privacyConsentNoticeAvailableOrPlanned), "Privacy and consent notices remain available or explicitly planned."),
    check("known_limitations", "documentation", "Known limitations remain available", flag(input.knownLimitationsAvailable), "Known limitations remain available."),
    check("phase_9_roadmap", "roadmap", "Phase 9 roadmap exists", flag(input.phase9RoadmapExists), "Phase 9 roadmap exists.")
  ];
}

function lockedItem(id: string, area: TeoyubePhase8CompletionArea, label: string, details: string): TeoyubePhase8LockedReadinessItem {
  return { id, area, label, locked: true, details };
}

function lockedItems(): TeoyubePhase8LockedReadinessItem[] {
  return [
    lockedItem("service_disabled_lock", "final_service_decision_lock", "Services disabled or future-review-only", "Database persistence, analytics, monitoring, admin auth, CMS, feedback storage, user accounts, live AI, and notifications remain disabled or future-review-only."),
    lockedItem("privacy_security_lock", "final_privacy_security_lock", "Privacy/security boundaries locked", "Privacy/consent notices, sensitive data boundaries, no hidden personalization, no browser persistence, and no secrets exposure are locked."),
    lockedItem("public_release_boundary_lock", "final_boundary_lock", "Public release boundaries locked", "No public launch, beta launch, user contact, automatic feedback collection, public URL fetching, or service connection is performed."),
    lockedItem("safety_surface_lock", "final_readiness_review", "Safety surfaces locked", "Scripture anchors, explanation traces, fallback, confidence labels, and reviewed content gates remain protected.")
  ];
}

export function runPhase8CompletionReview(input: TeoyubePhase8CompletionReviewInput = {}): TeoyubePhase8CompletionCheck[] {
  return createPhase8CompletionChecklist(input);
}

export function getPhase8CompletionBlockers(input: TeoyubePhase8CompletionReviewInput = {}): TeoyubePhase8CompletionBlocker[] {
  return createPhase8CompletionChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label} is incomplete.`, requiredAction: "Resolve before marking Phase 8 complete." }));
}

export function getPhase8CompletionWarnings(input: TeoyubePhase8CompletionReviewInput = {}): TeoyubePhase8CompletionWarning[] {
  return [
    {
      id: "phase_8_completion_manual_only",
      area: "unknown",
      message: "Phase 8 completion review is manual and in-memory; it does not launch, contact, collect, fetch, publish, persist, or connect services.",
      recommendedAction: "Use Phase 9 for controlled public release preparation and owner approval."
    },
    ...(!input.ownerReviewComplete ? [{
      id: "owner_completion_review_pending",
      area: "owner_review" as const,
      message: "Owner completion review should be manually confirmed before Phase 9 release decisions.",
      recommendedAction: "Review the Phase 8 completion package."
    }] : [])
  ];
}

export function createPhase8CompletionDecision(input: TeoyubePhase8CompletionReviewInput = {}): TeoyubePhase8CompletionDecision {
  const blockers = getPhase8CompletionBlockers(input);
  if (blockers.some((entry) => entry.area === "final_privacy_security_lock" || entry.area === "privacy_security_review")) return "needs_privacy_security_fix";
  if (blockers.some((entry) => entry.area === "final_service_decision_lock" || entry.area === "controlled_service_decision_package")) return "needs_service_decision_fix";
  if (blockers.some((entry) => entry.area === "documentation" || entry.area === "roadmap")) return "needs_documentation_fix";
  if (blockers.some((entry) => entry.area === "owner_review")) return "needs_owner_review";
  if (blockers.length) return "blocked";
  return getPhase8CompletionWarnings(input).length ? "phase_8_complete_with_warnings" : "phase_8_complete";
}

export function createPhase8CompletionReport(input: TeoyubePhase8CompletionReviewInput = {}): TeoyubePhase8CompletionReport {
  const blockers = getPhase8CompletionBlockers(input);
  const warnings = getPhase8CompletionWarnings(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "complete_with_warnings" : "complete",
    decision: createPhase8CompletionDecision(input),
    checks: runPhase8CompletionReview(input),
    blockers,
    warnings,
    lockedReadinessItems: lockedItems(),
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
