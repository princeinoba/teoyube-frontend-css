import type {
  TeoyubeControlledPublicReleaseExecutionArea,
  TeoyubeControlledPublicReleaseExecutionBlocker,
  TeoyubeControlledPublicReleaseExecutionCheck,
  TeoyubeControlledPublicReleaseExecutionDecision,
  TeoyubeControlledPublicReleaseExecutionPlan,
  TeoyubeControlledPublicReleaseExecutionRequirement,
  TeoyubeControlledPublicReleaseExecutionRisk,
  TeoyubeControlledPublicReleaseExecutionWarning,
  TeoyubeControlledPublicReleaseExecutionReport
} from "./controlled-public-release-execution-plan-contracts";

export type TeoyubeControlledPublicReleaseExecutionPlanInput = Partial<{
  publicReleaseFromCode: boolean;
  ownerApprovalMissing: boolean;
  buildValidationMissing: boolean;
  routeRenderingMissing: boolean;
  realDataLoadingMissing: boolean;
  wordCardMissing: boolean;
  prayerCompanionMissing: boolean;
  compassExperienceMissing: boolean;
  tigResponsePanelMissing: boolean;
  tigGraphExplorerMissing: boolean;
  scriptureAnchorsMissing: boolean;
  explanationTracesMissing: boolean;
  fallbackUnsafe: boolean;
  confidenceLabelsMissing: boolean;
  privacyConsentMissing: boolean;
  knownLimitationsMissing: boolean;
  reviewedContentGateInactive: boolean;
  servicesEnabled: boolean;
  supportFeedbackNotManual: boolean;
  pauseRollbackCriteriaMissing: boolean;
}>;

function ok(value: boolean | undefined): boolean {
  return !value;
}

function requirement(id: string, area: TeoyubeControlledPublicReleaseExecutionArea, label: string, satisfied: boolean, details: string): TeoyubeControlledPublicReleaseExecutionRequirement {
  return { id, area, label, required: true, satisfied, details };
}

function check(id: string, area: TeoyubeControlledPublicReleaseExecutionArea, label: string, passed: boolean, details: string): TeoyubeControlledPublicReleaseExecutionCheck {
  return { id, area, label, passed, details };
}

function risk(id: string, area: TeoyubeControlledPublicReleaseExecutionArea, severity: TeoyubeControlledPublicReleaseExecutionRisk["severity"], message: string, mitigation: string): TeoyubeControlledPublicReleaseExecutionRisk {
  return { id, area, severity, message, mitigation };
}

export function getControlledPublicReleaseExecutionChecklist(input: TeoyubeControlledPublicReleaseExecutionPlanInput = {}): TeoyubeControlledPublicReleaseExecutionCheck[] {
  return [
    check("manual_execution_only", "pre_launch_manual_check", "Public release execution remains manual", ok(input.publicReleaseFromCode), "Planning does not launch publicly from code."),
    check("owner_approval_required", "owner_approval", "Owner approval is required", ok(input.ownerApprovalMissing), "Any real public action remains owner-approved."),
    check("actual_app_build_passes", "build_validation", "Actual app build must pass", ok(input.buildValidationMissing), "Phase 10.2 must verify the real build before launch."),
    check("actual_routes_render", "route_rendering", "Actual routes must render", ok(input.routeRenderingMissing), "Phase 10.2 must verify route rendering."),
    check("real_data_files_load", "real_data_loading", "Real data files must load", ok(input.realDataLoadingMissing), "Core vocabulary, promise clusters, and Scripture canon must load."),
    check("word_card_renders", "real_data_loading", "WordCard must render", ok(input.wordCardMissing), "WordCard needs real data and safe fallback verification."),
    check("prayer_companion_renders", "real_data_loading", "PrayerCompanion must render", ok(input.prayerCompanionMissing), "PrayerCompanion needs real data, Scripture, and privacy-safe fallback verification."),
    check("compass_experience_renders", "real_data_loading", "CompassExperience must render", ok(input.compassExperienceMissing), "CompassExperience needs real calling context and fallback verification."),
    check("tig_response_panel_renders", "real_data_loading", "TIGResponsePanel must render", ok(input.tigResponsePanelMissing), "TIGResponsePanel needs confidence, explanation, and fallback verification."),
    check("tig_graph_explorer_renders_or_falls_back", "real_data_loading", "TIGGraphExplorer must render or fall back safely", ok(input.tigGraphExplorerMissing), "Graph explorer may use list fallback if graph data is incomplete."),
    check("scripture_anchors_visible", "scripture_anchor", "Scripture anchors remain visible", ok(input.scriptureAnchorsMissing), "Scripture anchors must not be hidden."),
    check("explanation_traces_visible", "explanation_trace", "Explanation traces remain visible", ok(input.explanationTracesMissing), "Explanation traces must remain visible in recommendation flows."),
    check("fallback_states_safe", "fallback", "Fallback states remain safe", ok(input.fallbackUnsafe), "Fallback must avoid unsupported promises and overclaiming."),
    check("confidence_labels_visible", "confidence_label", "Confidence labels remain visible", ok(input.confidenceLabelsMissing), "Confidence labels must remain visible and humble."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent notices remain visible", ok(input.privacyConsentMissing), "Privacy, consent, and sensitive data boundaries stay visible."),
    check("known_limitations_visible", "known_limitations", "Known limitations remain visible", ok(input.knownLimitationsMissing), "Known limitations stay available before any real launch."),
    check("reviewed_content_gate_active", "reviewed_content_gate", "Reviewed content gate remains active", ok(input.reviewedContentGateInactive), "Review-only content is not published automatically."),
    check("services_disabled", "service_disabled_state", "Services remain disabled", ok(input.servicesEnabled), "No database, analytics, monitoring provider, admin auth, CMS, accounts, live AI, or notifications are enabled."),
    check("support_feedback_manual", "manual_feedback", "Support and feedback remain manual", ok(input.supportFeedbackNotManual), "No automatic contact or feedback collection is performed."),
    check("pause_rollback_criteria_exist", "pause_rollback", "Pause/rollback criteria exist", ok(input.pauseRollbackCriteriaMissing), "Pause and rollback are decision support only.")
  ];
}

export function createControlledPublicReleaseExecutionPlan(input: TeoyubeControlledPublicReleaseExecutionPlanInput = {}): TeoyubeControlledPublicReleaseExecutionPlan {
  const checks = getControlledPublicReleaseExecutionChecklist(input);
  const requirements = checks.map((entry) => requirement(entry.id, entry.area, entry.label, entry.passed, entry.details));
  const risks = getControlledPublicReleaseExecutionRisks(input);
  return {
    id: "phase_10_1_controlled_public_release_execution_plan",
    label: "Phase 10.1 controlled public release execution plan",
    status: checks.every((entry) => entry.passed) ? "ready_with_warnings" : "blocked",
    requirements,
    checks,
    risks,
    nextAction: "Phase 10.2 - Real App Runtime Verification, Route QA & Build Stabilization",
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}

export function getControlledPublicReleaseExecutionBlockers(input: TeoyubeControlledPublicReleaseExecutionPlanInput = {}): TeoyubeControlledPublicReleaseExecutionBlocker[] {
  return getControlledPublicReleaseExecutionChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label}: ${entry.details}`, requiredAction: "Resolve this before any real public release execution." }));
}

export function getControlledPublicReleaseExecutionWarnings(input: TeoyubeControlledPublicReleaseExecutionPlanInput = {}): TeoyubeControlledPublicReleaseExecutionWarning[] {
  const warnings: TeoyubeControlledPublicReleaseExecutionWarning[] = [
    { id: "real_app_verification_next", area: "build_validation", message: "Phase 10.1 prepares verification; it does not prove the app build/routes pass.", recommendedAction: "Run Phase 10.2 real app runtime verification next." },
    { id: "manual_execution_boundary", area: "pre_launch_manual_check", message: "Execution planning is manual and in-memory only.", recommendedAction: "Keep all public release actions owner-approved and outside code." }
  ];
  if (input.tigGraphExplorerMissing) {
    warnings.push({ id: "tig_graph_fallback_needed", area: "real_data_loading", message: "TIGGraphExplorer needs safe graph or list fallback verification.", recommendedAction: "Verify graph/list fallback in Phase 10.2." });
  }
  return warnings;
}

export function getControlledPublicReleaseExecutionRisks(_input: TeoyubeControlledPublicReleaseExecutionPlanInput = {}): TeoyubeControlledPublicReleaseExecutionRisk[] {
  return [
    risk("build_route_gap", "build_validation", "high", "Local build and route rendering still need real verification.", "Make Phase 10.2 focus on local runtime, build, route, and component QA."),
    risk("manual_monitoring_capacity", "manual_monitoring", "medium", "Manual monitoring can miss issues if owner cadence is unclear.", "Use a bounded manual monitoring checklist and owner checkpoints."),
    risk("service_boundary_drift", "service_disabled_state", "high", "Future execution work can accidentally enable services.", "Carry service-disabled confirmation into every Phase 10 package.")
  ];
}

export function createControlledPublicReleaseExecutionDecision(input: TeoyubeControlledPublicReleaseExecutionPlanInput = {}): TeoyubeControlledPublicReleaseExecutionDecision {
  const blockers = getControlledPublicReleaseExecutionBlockers(input);
  if (blockers.some((entry) => entry.area === "owner_approval")) return "needs_owner_review";
  if (blockers.some((entry) => entry.area === "build_validation")) return "needs_build_fix";
  if (blockers.some((entry) => entry.area === "route_rendering")) return "needs_route_fix";
  if (blockers.some((entry) => entry.area === "real_data_loading")) return "needs_real_app_verification";
  if (blockers.length) return "blocked";
  return "ready_for_manual_launch_rehearsal";
}

export function createControlledPublicReleaseExecutionReport(input: TeoyubeControlledPublicReleaseExecutionPlanInput = {}): TeoyubeControlledPublicReleaseExecutionReport {
  const blockers = getControlledPublicReleaseExecutionBlockers(input);
  const warnings = getControlledPublicReleaseExecutionWarnings(input);
  const plan = createControlledPublicReleaseExecutionPlan(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : "ready_with_warnings",
    decision: createControlledPublicReleaseExecutionDecision(input),
    plan,
    blockers,
    warnings,
    risks: plan.risks,
    noPublicLaunchPerformed: true,
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
