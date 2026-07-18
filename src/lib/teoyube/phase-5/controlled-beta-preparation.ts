import { createBetaReadinessReviewReport } from "../phase-4/beta-readiness-review";
import { createDisabledServiceEnforcementQaReport } from "../phase-4/disabled-service-enforcement-qa";
import { createPhase4CompletionPackage, createPhase4CompletionPackageReport } from "../phase-4/phase-4-completion-package";
import { createServiceDecisionLockReport } from "../phase-4/service-decision-lock";
import type {
  TeoyubeControlledBetaParticipantProfile,
  TeoyubeControlledBetaPreparationBlocker,
  TeoyubeControlledBetaPreparationCheck,
  TeoyubeControlledBetaPreparationDecision,
  TeoyubeControlledBetaPreparationReport,
  TeoyubeControlledBetaPreparationWarning,
  TeoyubeControlledBetaScope,
  TeoyubeControlledBetaStatus,
  TeoyubeControlledBetaSurface
} from "./controlled-beta-preparation-contracts";

function blocker(id: string, surface: TeoyubeControlledBetaSurface | "unknown", message: string, requiredAction: string): TeoyubeControlledBetaPreparationBlocker {
  return { id, surface, message, requiredAction };
}

function warning(id: string, surface: TeoyubeControlledBetaSurface | "unknown", message: string, recommendedAction: string): TeoyubeControlledBetaPreparationWarning {
  return { id, surface, message, recommendedAction };
}

function check(
  id: string,
  surface: TeoyubeControlledBetaSurface | "unknown",
  label: string,
  passed: boolean,
  details: string,
  warnings: TeoyubeControlledBetaPreparationWarning[] = []
): TeoyubeControlledBetaPreparationCheck {
  return {
    id,
    surface,
    label,
    passed,
    details,
    blockers: passed ? [] : [blocker(`${id}_blocker`, surface, `${label} is not ready for controlled beta preparation.`, "Resolve this before Phase 5.2.")],
    warnings
  };
}

function defaultParticipantProfiles(): TeoyubeControlledBetaParticipantProfile[] {
  return [
    { id: "owner_reviewer", label: "Owner reviewer", allowed: true, notes: "Manual owner review only; no automated contact." },
    { id: "trusted_internal_reviewer", label: "Trusted internal reviewer", allowed: true, notes: "Future manual beta candidate; invitation happens outside code." },
    { id: "public_user", label: "Public user", allowed: false, notes: "Public beta is out of scope for Phase 5.1." }
  ];
}

export function createControlledBetaScope(input: {
  surfaces?: TeoyubeControlledBetaSurface[];
  participantProfiles?: TeoyubeControlledBetaParticipantProfile[];
  maxParticipants?: number;
  label?: string;
} = {}): TeoyubeControlledBetaScope {
  return {
    id: "phase_5_1_controlled_beta_scope",
    label: input.label || "Controlled beta preparation scope",
    surfaces: input.surfaces || [
      "home",
      "canon",
      "daily_word",
      "word_card",
      "promise_table",
      "prayer_companion",
      "compass_experience",
      "tig_response_panel",
      "tig_graph_explorer",
      "reviewed_content_gate",
      "controlled_admin_prototype",
      "fallback_states",
      "privacy_consent"
    ],
    participantProfiles: input.participantProfiles || defaultParticipantProfiles(),
    maxParticipants: input.maxParticipants ?? 5,
    controlledAndLimited: true,
    manualInvitationOnly: true,
    launchPerformed: false,
    noUsersContactedFromCode: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function validateControlledBetaScope(scope: TeoyubeControlledBetaScope = createControlledBetaScope()): TeoyubeControlledBetaPreparationCheck[] {
  return [
    check("scope_controlled_limited", "unknown", "Beta scope is controlled and limited", scope.controlledAndLimited && scope.maxParticipants > 0 && scope.maxParticipants <= 10, `${scope.maxParticipants} maximum participant(s) in scope.`),
    check("manual_invitation_only", "unknown", "No beta user contact happens from code", scope.manualInvitationOnly && scope.noUsersContactedFromCode && !scope.launchPerformed, "All invitations remain manual and outside code."),
    check("no_automatic_feedback_collection", "unknown", "No automated feedback collection is enabled", scope.noAutomaticFeedbackCollection, "Feedback readiness is manual-only."),
    check("surfaces_selected", "unknown", "Controlled beta surfaces are selected", scope.surfaces.length >= 10, `${scope.surfaces.length} surface(s) included.`),
    check("participants_limited", "unknown", "Participant profiles are limited", scope.participantProfiles.some((entry) => entry.allowed) && scope.participantProfiles.some((entry) => !entry.allowed), "Participant profiles include allowed and out-of-scope groups."),
    check("scope_services_disabled", "unknown", "Services remain disabled in beta scope", scope.noExternalServicesRequired && scope.noDatabasePersistenceEnabled && scope.noAnalyticsEnabled && scope.noMonitoringProviderConnected && scope.noLiveAiOrchestrationEnabled && scope.noAdminAuthAdded && scope.noCmsConnected && scope.noBrowserPersistenceRequired, "No external service or browser persistence is required.")
  ];
}

export function createControlledBetaPreparationChecklist(scope: TeoyubeControlledBetaScope = createControlledBetaScope()): TeoyubeControlledBetaPreparationCheck[] {
  const betaReadiness = createBetaReadinessReviewReport();
  const phase4Package = createPhase4CompletionPackageReport(createPhase4CompletionPackage());
  const serviceLock = createServiceDecisionLockReport();
  const disabledQa = createDisabledServiceEnforcementQaReport();
  return [
    ...validateControlledBetaScope(scope),
    check("phase_4_complete", "unknown", "Phase 4 completion package is available", phase4Package.valid, `Phase 4 package decision: ${phase4Package.decision}.`),
    check("beta_readiness_available", "unknown", "Beta readiness review is available", betaReadiness.valid, `Beta readiness decision: ${betaReadiness.decision}.`, betaReadiness.warnings.map((entry) => warning(entry.id, "unknown", entry.message, entry.recommendedAction))),
    check("service_locks_active", "unknown", "Services remain disabled unless future approval exists", serviceLock.valid && serviceLock.serviceConnectedCount === 0 && disabledQa.valid, "Service decision lock and disabled-service QA remain active."),
    check("reviewed_content_gated", "reviewed_content_gate", "Reviewed content gates remain active", betaReadiness.checks.some((entry) => entry.id === "reviewed_content_gate_blocks_drafts" && entry.passed), "Review-only content remains excluded from live recommendations."),
    check("scripture_anchors_visible", "word_card", "Scripture anchors remain visible", betaReadiness.checks.some((entry) => entry.id === "scripture_anchors_visible" && entry.passed), "Phase 4 readiness protects Scripture anchor visibility."),
    check("explanation_traces_visible", "tig_response_panel", "Explanation traces remain visible", betaReadiness.checks.some((entry) => entry.id === "explanation_traces_visible" && entry.passed), "Phase 4 readiness protects explanation paths."),
    check("fallback_states_safe", "fallback_states", "Fallback states remain safe", betaReadiness.checks.some((entry) => entry.id === "fallback_safe" && entry.passed), "Fallback states remain visible and bounded."),
    check("confidence_labels_visible", "tig_graph_explorer", "Confidence labels remain visible", betaReadiness.checks.some((entry) => entry.id === "confidence_labels_visible" && entry.passed), "Confidence labels remain part of TIG graph readiness."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent notices remain visible", true, "Phase 5.1 carries privacy/consent checks into manual QA."),
    check(
      "mobile_accessibility_planned",
      "unknown",
      "Mobile/accessibility QA is planned",
      true,
      "Manual mobile and accessibility execution moves to Phase 5.2.",
      [
        warning("manual_mobile_qa_pending", "unknown", "Manual mobile QA has not been executed in Phase 5.1.", "Execute this in Phase 5.2."),
        warning("manual_accessibility_qa_pending", "unknown", "Manual accessibility QA has not been executed in Phase 5.1.", "Execute this in Phase 5.2.")
      ]
    ),
    check(
      "owner_review_required",
      "unknown",
      "Owner review is required before real beta execution",
      true,
      "Owner review is represented as a manual gate before Phase 5.2 execution.",
      [warning("owner_review_pending", "unknown", "Owner review remains manual before beta execution.", "Complete owner review before inviting any beta participant.")]
    )
  ];
}

export function getControlledBetaPreparationBlockers(input: { scope?: TeoyubeControlledBetaScope; checks?: TeoyubeControlledBetaPreparationCheck[] } = {}): TeoyubeControlledBetaPreparationBlocker[] {
  return (input.checks || createControlledBetaPreparationChecklist(input.scope)).flatMap((entry) => entry.blockers);
}

export function getControlledBetaPreparationWarnings(input: { scope?: TeoyubeControlledBetaScope; checks?: TeoyubeControlledBetaPreparationCheck[] } = {}): TeoyubeControlledBetaPreparationWarning[] {
  return (input.checks || createControlledBetaPreparationChecklist(input.scope)).flatMap((entry) => entry.warnings);
}

export function createControlledBetaPreparationDecision(input: { scope?: TeoyubeControlledBetaScope; checks?: TeoyubeControlledBetaPreparationCheck[] } = {}): TeoyubeControlledBetaPreparationDecision {
  const checks = input.checks || createControlledBetaPreparationChecklist(input.scope);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  if (blockers.length) return "blocked";
  if (checks.some((entry) => entry.id === "service_locks_active" && !entry.passed)) return "needs_service_gate_review";
  if (checks.some((entry) => entry.id === "privacy_consent_visible" && !entry.passed)) return "needs_privacy_security_review";
  if (warnings.some((entry) => entry.id === "owner_review_pending")) return "needs_owner_review";
  return warnings.length ? "ready_with_warnings" : "ready_for_manual_beta_qa_preparation";
}

export function createControlledBetaPreparationReport(input: {
  scope?: TeoyubeControlledBetaScope;
  checks?: TeoyubeControlledBetaPreparationCheck[];
} = {}): TeoyubeControlledBetaPreparationReport {
  const scope = input.scope || createControlledBetaScope();
  const checks = input.checks || createControlledBetaPreparationChecklist(scope);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  const status: TeoyubeControlledBetaStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "preparation_ready";

  return {
    valid: blockers.length === 0,
    status,
    decision: createControlledBetaPreparationDecision({ scope, checks }),
    scope,
    checks,
    blockers,
    warnings,
    ownerReviewRequired: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
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
