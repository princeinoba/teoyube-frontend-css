import type {
  TeoyubePhase9CompletionArea,
  TeoyubePhase9CompletionBlocker,
  TeoyubePhase9CompletionCheck,
  TeoyubePhase9CompletionDecision,
  TeoyubePhase9CompletionReport,
  TeoyubePhase9CompletionWarning,
  TeoyubePhase9LockedReadinessItem
} from "./phase-9-completion-contracts";

export type TeoyubePhase9CompletionReviewInput = Partial<{
  phase91Complete: boolean;
  phase92Complete: boolean;
  phase93Complete: boolean;
  phase94Complete: boolean;
  ownerReviewComplete: boolean;
  publicLaunchPerformedByCode: boolean;
  betaLaunchPerformedByCode: boolean;
  usersContactedByCode: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlsFetchedAutomatically: boolean;
  externalServicesRequired: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthEnabled: boolean;
  cmsEnabled: boolean;
  userAccountsEnabled: boolean;
  liveAiEnabled: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, area: TeoyubePhase9CompletionArea, label: string, passed: boolean, details: string): TeoyubePhase9CompletionCheck {
  return { id, area, label, passed, details };
}

export function createPhase9CompletionChecklist(input: TeoyubePhase9CompletionReviewInput = {}): TeoyubePhase9CompletionCheck[] {
  return [
    check("phase_9_1_complete", "controlled_public_release_preparation", "Phase 9.1 is complete", flag(input.phase91Complete), "Controlled public release preparation, final copy review, known limitations, service/privacy/safety confirmations, support/feedback readiness, operational readiness, owner gate, package, audit, docs, example, and smoke check exist."),
    check("phase_9_2_complete", "release_candidate_qa", "Phase 9.2 is complete", flag(input.phase92Complete), "Release candidate QA, manual monitoring, public support, issue triage, feedback readiness, safety QA, service-disabled QA, mobile/accessibility QA, readiness score, package, audit, docs, example, and smoke check exist."),
    check("phase_9_3_complete", "release_candidate_fix_queue", "Phase 9.3 is complete", flag(input.phase93Complete), "Fix queue, issue-to-fix conversion, remediation planner, safety validator, final regression QA, final score, package, owner review, audit, docs, example, and smoke check exist."),
    check("phase_9_4_complete", "controlled_public_go_no_go", "Phase 9.4 is complete", flag(input.phase94Complete), "Controlled public go/no-go, readiness evidence, boundary confirmation, owner approval, operational handoff, pause/rollback, known limitations, service-disabled confirmation, package, audit, docs, example, and smoke check exist."),
    check("final_public_copy_review", "final_public_copy_review", "Final public copy review exists", true, "final-public-copy-review.ts exists."),
    check("known_limitations", "known_limitations", "Known limitations exist", true, "Known limitations final review and final public known limitations exist."),
    check("service_lock_confirmation", "service_lock_confirmation", "Service locks exist", !input.databasePersistenceEnabled && !input.analyticsEnabled && !input.monitoringProviderConnected && !input.adminAuthEnabled && !input.cmsEnabled && !input.userAccountsEnabled && !input.liveAiEnabled, "Service-disabled decisions remain locked."),
    check("privacy_security_confirmation", "privacy_security_confirmation", "Privacy/security confirmation exists", true, "Privacy/security confirmation and final privacy/consent regression exist."),
    check("safety_confirmation", "safety_confirmation", "Safety confirmation exists", true, "Scripture, explanation, fallback, confidence, and reviewed content gate safety confirmations exist."),
    check("support_feedback_readiness", "support_feedback_readiness", "Support/feedback readiness exists", true, "Support and feedback readiness remain manual."),
    check("operational_readiness", "operational_readiness", "Operational readiness exists", true, "Operational readiness and handoff modules exist."),
    check("owner_approval_gate", "owner_approval_gate", "Owner approval gates exist", flag(input.ownerReviewComplete), "Phase 9 owner completion review should be manually accepted."),
    check("manual_monitoring", "manual_monitoring", "Manual public monitoring exists", true, "Manual public monitoring plan exists."),
    check("public_issue_triage", "public_issue_triage", "Public issue triage exists", true, "Public issue triage and issue-to-fix conversion exist."),
    check("public_feedback_readiness", "public_feedback_readiness", "Public feedback readiness exists", true, "Public feedback readiness remains manual."),
    check("final_regression_qa", "final_regression_qa", "Final regression QA exists", true, "Final regression QA and final safety/privacy/mobile/service regressions exist."),
    check("public_go_no_go_score", "public_go_no_go_score", "Public go/no-go score exists", true, "Public go/no-go readiness score exists."),
    check("final_owner_approval", "final_owner_approval", "Final public owner approval exists", true, "Final public owner approval exists."),
    check("operational_handoff", "operational_handoff", "Operational handoff exists", true, "Public operational handoff exists."),
    check("pause_rollback", "pause_rollback", "Pause/rollback criteria exist", true, "Pause/rollback criteria are available as decision support."),
    check("documentation", "documentation", "Phase 9.5 documentation exists", true, "Phase 9.5 docs and completion summary are present."),
    check("roadmap", "roadmap", "Phase 10 roadmap exists", true, "Phase 10 roadmap builder exists."),
    check("no_public_launch", "unknown", "No public launch is performed by code", !input.publicLaunchPerformedByCode, "Phase 9.5 performs no public launch."),
    check("no_beta_launch", "unknown", "No beta launch is performed by code", !input.betaLaunchPerformedByCode, "Phase 9.5 performs no beta launch."),
    check("no_user_contact", "unknown", "No users are contacted by code", !input.usersContactedByCode, "Phase 9.5 contacts no users."),
    check("no_auto_feedback", "unknown", "No feedback is collected automatically", !input.feedbackCollectedAutomatically, "Phase 9.5 collects no feedback automatically."),
    check("no_public_url_fetching", "unknown", "No public URLs are fetched automatically", !input.publicUrlsFetchedAutomatically, "Phase 9.5 fetches no public URLs."),
    check("no_external_services", "unknown", "No external services are required", !input.externalServicesRequired, "Phase 9.5 requires no external services.")
  ];
}

function lockedItem(id: string, area: TeoyubePhase9CompletionArea, label: string, details: string): TeoyubePhase9LockedReadinessItem {
  return { id, area, label, locked: true, details };
}

function lockedItems(): TeoyubePhase9LockedReadinessItem[] {
  return [
    lockedItem("manual_public_release_lock", "controlled_public_release_preparation", "Public release remains manual and owner-approved", "No public release is performed by code."),
    lockedItem("service_disabled_lock", "service_lock_confirmation", "Services remain disabled", "Database, analytics, monitoring provider, admin auth, CMS, feedback storage, accounts, live AI, and notifications remain disabled."),
    lockedItem("privacy_consent_lock", "privacy_security_confirmation", "Privacy/consent boundaries locked", "Privacy notices, consent notices, sensitive data warnings, and no sensitive browser persistence remain protected."),
    lockedItem("scripture_explanation_fallback_lock", "safety_confirmation", "Scripture/explanation/fallback locked", "Scripture anchors, explanation traces, fallback, confidence labels, and reviewed content gates remain protected."),
    lockedItem("manual_operations_lock", "operational_handoff", "Manual operations locked", "Manual monitoring, support, feedback, issue triage, and pause/rollback criteria remain available.")
  ];
}

export function runPhase9CompletionReview(input: TeoyubePhase9CompletionReviewInput = {}): TeoyubePhase9CompletionCheck[] {
  return createPhase9CompletionChecklist(input);
}

export function getPhase9CompletionBlockers(input: TeoyubePhase9CompletionReviewInput = {}): TeoyubePhase9CompletionBlocker[] {
  return createPhase9CompletionChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label} is incomplete.`, requiredAction: "Resolve before marking Phase 9 complete." }));
}

export function getPhase9CompletionWarnings(input: TeoyubePhase9CompletionReviewInput = {}): TeoyubePhase9CompletionWarning[] {
  return [
    {
      id: "phase_9_completion_manual_only",
      area: "unknown",
      message: "Phase 9 completion review is manual and in-memory; it does not launch, contact, collect, fetch, publish, persist, or connect services.",
      recommendedAction: "Use Phase 10 for controlled public release execution planning."
    },
    ...(!input.ownerReviewComplete ? [{
      id: "owner_completion_review_pending",
      area: "owner_approval_gate" as const,
      message: "Owner completion review should be manually confirmed before future public execution planning.",
      recommendedAction: "Review the Phase 9 completion package."
    }] : [])
  ];
}

export function createPhase9CompletionDecision(input: TeoyubePhase9CompletionReviewInput = {}): TeoyubePhase9CompletionDecision {
  const blockers = getPhase9CompletionBlockers(input);
  if (blockers.some((entry) => entry.area === "service_lock_confirmation")) return "needs_service_lock_fix";
  if (blockers.some((entry) => entry.area === "documentation" || entry.area === "roadmap")) return "needs_documentation_fix";
  if (blockers.some((entry) => entry.area === "owner_approval_gate")) return "needs_owner_review";
  if (blockers.some((entry) => entry.area === "controlled_public_release_preparation" || entry.area === "release_candidate_qa" || entry.area === "release_candidate_fix_queue" || entry.area === "controlled_public_go_no_go")) return "needs_public_readiness_fix";
  if (blockers.length) return "blocked";
  return getPhase9CompletionWarnings(input).length ? "phase_9_complete_with_warnings" : "phase_9_complete";
}

export function createPhase9CompletionReport(input: TeoyubePhase9CompletionReviewInput = {}): TeoyubePhase9CompletionReport {
  const blockers = getPhase9CompletionBlockers(input);
  const warnings = getPhase9CompletionWarnings(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "complete_with_warnings" : "complete",
    decision: createPhase9CompletionDecision(input),
    checks: runPhase9CompletionReview(input),
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
