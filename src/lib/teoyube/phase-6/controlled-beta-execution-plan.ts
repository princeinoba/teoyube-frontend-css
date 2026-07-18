import { createBetaReadinessLockReport } from "../phase-5/beta-readiness-lock";
import { createFinalDisabledServiceLockReport } from "../phase-5/final-disabled-service-lock";
import type {
  TeoyubeControlledBetaExecutionBlocker,
  TeoyubeControlledBetaExecutionCheck,
  TeoyubeControlledBetaExecutionDecision,
  TeoyubeControlledBetaExecutionPlan,
  TeoyubeControlledBetaExecutionReport,
  TeoyubeControlledBetaExecutionScope,
  TeoyubeControlledBetaExecutionStatus,
  TeoyubeControlledBetaExecutionSurface,
  TeoyubeControlledBetaExecutionWarning,
  TeoyubeControlledBetaExecutionWindow
} from "./controlled-beta-execution-plan-contracts";

export type TeoyubeControlledBetaExecutionPlanInput = Partial<{
  surfaces: TeoyubeControlledBetaExecutionSurface[];
  participantLimit: number;
  plannedStart: string;
  plannedEnd: string;
  ownerApprovalRequired: boolean;
  automaticUserContactEnabled: boolean;
  automaticFeedbackCollectionEnabled: boolean;
  publicUrlFetchingEnabled: boolean;
  externalServicesRequired: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  liveAiOrchestrationEnabled: boolean;
  adminAuthAdded: boolean;
  cmsConnected: boolean;
  reviewedContentGateActive: boolean;
  reviewOnlyContentExcluded: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  fallbackStatesSafe: boolean;
  confidenceLabelsVisible: boolean;
  privacyConsentNoticesVisible: boolean;
  knownLimitationsAvailable: boolean;
  pauseRollbackCriteriaAvailable: boolean;
}>;

function now(): string {
  return new Date().toISOString();
}

function check(id: string, label: string, surface: TeoyubeControlledBetaExecutionSurface, passed: boolean, details: string): TeoyubeControlledBetaExecutionCheck {
  return { id, label, surface, passed, details };
}

export function createControlledBetaExecutionScope(input: TeoyubeControlledBetaExecutionPlanInput = {}): TeoyubeControlledBetaExecutionScope {
  return {
    id: "phase_6_1_controlled_beta_execution_scope",
    label: "Controlled beta execution planning scope",
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
    participantLimit: input.participantLimit ?? 12,
    manualOnly: true,
    ownerApprovalRequired: input.ownerApprovalRequired !== false,
    exclusions: [
      "No code-launched beta",
      "No automatic invitation or user contact",
      "No automatic feedback collection",
      "No public URL fetching",
      "No service connection or persistence"
    ]
  };
}

export function createControlledBetaExecutionWindow(input: TeoyubeControlledBetaExecutionPlanInput = {}): TeoyubeControlledBetaExecutionWindow {
  return {
    id: "phase_6_1_controlled_beta_execution_window",
    label: "Manual dry-run planning window",
    plannedStart: input.plannedStart,
    plannedEnd: input.plannedEnd,
    manualDryRunOnly: true,
    noAutomaticActivation: true,
    ownerApprovalRequired: input.ownerApprovalRequired !== false
  };
}

function createPlanChecks(input: TeoyubeControlledBetaExecutionPlanInput = {}): TeoyubeControlledBetaExecutionCheck[] {
  const readiness = createBetaReadinessLockReport();
  const service = createFinalDisabledServiceLockReport();
  return [
    check("controlled_manual_scope", "Beta remains controlled and manual", "unknown", true, "Phase 6.1 creates planning support only."),
    check("owner_approval_required", "Owner approval is required before real execution", "unknown", input.ownerApprovalRequired !== false, "No future beta execution can proceed without manual owner approval."),
    check("no_automatic_user_contact", "No automatic user contact occurs", "unknown", !input.automaticUserContactEnabled, "Invitations and participant contact remain outside code."),
    check("no_automatic_feedback_collection", "No automatic feedback collection occurs", "unknown", !input.automaticFeedbackCollectionEnabled, "Feedback routes remain manual and not automatically collected."),
    check("no_public_url_fetching", "No public URL fetching occurs", "unknown", !input.publicUrlFetchingEnabled, "Phase 6.1 does not fetch public URLs."),
    check("no_external_services_required", "No external services are required", "unknown", !input.externalServicesRequired && readiness.noExternalServicesRequired, "Planning package stays local and in memory."),
    check("services_remain_disabled", "Services remain disabled unless future approval exists", "unknown", service.valid && !input.databasePersistenceEnabled && !input.analyticsEnabled && !input.monitoringProviderConnected && !input.liveAiOrchestrationEnabled && !input.adminAuthAdded && !input.cmsConnected, "Database, analytics, monitoring, auth, CMS, live AI, and email remain disabled."),
    check("reviewed_content_gate_active", "Reviewed content gates remain active", "reviewed_content_gate", input.reviewedContentGateActive !== false, "Review-only content is not published automatically."),
    check("review_only_content_excluded", "Review-only content remains excluded", "reviewed_content_gate", input.reviewOnlyContentExcluded !== false, "Review-only content must not be written into production JSON automatically."),
    check("scripture_anchors_visible", "Scripture anchors remain visible", "unknown", input.scriptureAnchorsVisible !== false, "Scripture anchors stay visible where available."),
    check("explanation_traces_visible", "Explanation traces remain visible", "unknown", input.explanationTracesVisible !== false, "Explanation traces stay visible on explanation-bearing surfaces."),
    check("fallback_states_safe", "Fallback states remain safe", "fallback_states", input.fallbackStatesSafe !== false, "Fallback states remain humble, non-empty, and bounded."),
    check("confidence_labels_visible", "Confidence labels remain visible", "unknown", input.confidenceLabelsVisible !== false, "Confidence labels remain visible where required."),
    check("privacy_consent_visible", "Privacy/consent notices remain visible", "privacy_consent", input.privacyConsentNoticesVisible !== false, "Consent and privacy reminders remain required."),
    check("known_limitations_available", "Known limitations are available", "unknown", input.knownLimitationsAvailable !== false, "Known limitations are part of the planning package."),
    check("pause_rollback_available", "Pause/rollback criteria are available", "fallback_states", input.pauseRollbackCriteriaAvailable !== false, "Pause/rollback criteria remain decision support only.")
  ];
}

export function createControlledBetaExecutionPlan(input: TeoyubeControlledBetaExecutionPlanInput = {}): TeoyubeControlledBetaExecutionPlan {
  const checks = createPlanChecks(input);
  const blockers = checks.filter((entry) => !entry.passed);
  return {
    id: "phase_6_1_controlled_beta_execution_plan",
    status: blockers.length ? "blocked" : "planning_only",
    scope: createControlledBetaExecutionScope(input),
    window: createControlledBetaExecutionWindow(input),
    checks,
    ownerApprovalRequired: true,
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
    generatedAt: now()
  };
}

export function getControlledBetaExecutionBlockers(plan: TeoyubeControlledBetaExecutionPlan): TeoyubeControlledBetaExecutionBlocker[] {
  return plan.checks
    .filter((entry) => !entry.passed)
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      surface: entry.surface,
      message: `${entry.label} is not satisfied.`,
      requiredAction: entry.details
    }));
}

export function getControlledBetaExecutionWarnings(plan: TeoyubeControlledBetaExecutionPlan): TeoyubeControlledBetaExecutionWarning[] {
  return [
    ...(!plan.window.plannedStart || !plan.window.plannedEnd ? [{
      id: "manual_window_not_scheduled",
      surface: "unknown" as const,
      message: "Manual dry-run dates are not scheduled.",
      recommendedAction: "Add dates only during manual Phase 6.2 dry-run planning."
    }] : []),
    ...(!plan.scope.participantLimit ? [{
      id: "participant_limit_missing",
      surface: "unknown" as const,
      message: "Participant limit is not defined.",
      recommendedAction: "Keep the controlled beta participant count explicitly limited."
    }] : [])
  ];
}

export function createControlledBetaExecutionDecision(plan: TeoyubeControlledBetaExecutionPlan): TeoyubeControlledBetaExecutionDecision {
  const blockers = getControlledBetaExecutionBlockers(plan);
  const warnings = getControlledBetaExecutionWarnings(plan);
  if (blockers.some((entry) => entry.id.includes("services_remain_disabled"))) return "needs_service_gate_review";
  if (blockers.some((entry) => entry.id.includes("privacy_consent"))) return "needs_privacy_review";
  if (blockers.some((entry) => entry.id.includes("owner_approval"))) return "needs_owner_review";
  if (blockers.length) return "blocked";
  return warnings.length ? "ready_with_warnings" : "ready_for_manual_beta_dry_run_planning";
}

function statusFromDecision(decision: TeoyubeControlledBetaExecutionDecision): TeoyubeControlledBetaExecutionStatus {
  if (decision === "ready_for_manual_beta_dry_run_planning") return "manual_ready";
  if (decision === "ready_with_warnings") return "ready_with_warnings";
  if (decision === "needs_owner_review") return "owner_review_required";
  if (decision === "blocked" || decision === "needs_privacy_review" || decision === "needs_service_gate_review") return "blocked";
  return "unknown";
}

export function validateControlledBetaExecutionPlan(plan: TeoyubeControlledBetaExecutionPlan): TeoyubeControlledBetaExecutionReport {
  return createControlledBetaExecutionReport(plan);
}

export function createControlledBetaExecutionReport(plan: TeoyubeControlledBetaExecutionPlan): TeoyubeControlledBetaExecutionReport {
  const blockers = getControlledBetaExecutionBlockers(plan);
  const warnings = getControlledBetaExecutionWarnings(plan);
  const decision = createControlledBetaExecutionDecision(plan);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    plan,
    blockers,
    warnings,
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
    generatedAt: now()
  };
}

