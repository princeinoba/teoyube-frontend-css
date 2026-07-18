import { createControlledBetaOperationsLockReport } from "./controlled-beta-operations-lock";
import { createFinalBetaServiceDisabledLockReport } from "./final-beta-service-disabled-lock";
import { createPhase6EvidenceArchiveReport } from "./phase-6-evidence-archive";
import { createPhase6FeatureInventoryReport } from "./phase-6-feature-inventory";
import { createPhase6RemainingRiskRegister, createPhase6RemainingRiskRegisterReport } from "./phase-6-remaining-risk-register";
import { runPhase61Audit } from "./phase-6-1-audit";
import { runPhase62Audit } from "./phase-6-2-audit";
import { runPhase63Audit } from "./phase-6-3-audit";
import { createPhase7RoadmapReport } from "./phase-7-roadmap-builder";
import type {
  TeoyubePhase6CompletionArea,
  TeoyubePhase6CompletionBlocker,
  TeoyubePhase6CompletionCheck,
  TeoyubePhase6CompletionDecision,
  TeoyubePhase6CompletionReport,
  TeoyubePhase6CompletionStatus,
  TeoyubePhase6CompletionWarning,
  TeoyubePhase6LockedOperationsItem
} from "./phase-6-completion-contracts";

export type TeoyubePhase6CompletionReviewInput = Partial<{
  ownerReviewed: boolean;
  betaLaunchPerformed: boolean;
  usersContacted: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlsFetchedAutomatically: boolean;
  externalServicesRequired: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  adminAuthAdded: boolean;
  cmsConnected: boolean;
  userAccountsAdded: boolean;
  liveAiOrchestrationEnabled: boolean;
  browserPersistenceRequired: boolean;
}>;

function blocker(id: string, area: TeoyubePhase6CompletionArea, message: string, requiredAction = "Resolve before marking Phase 6 complete."): TeoyubePhase6CompletionBlocker {
  return { id, area, message, requiredAction };
}

function warning(id: string, area: TeoyubePhase6CompletionArea, message: string, recommendedAction = "Carry into owner review or Phase 7 planning."): TeoyubePhase6CompletionWarning {
  return { id, area, message, recommendedAction };
}

function check(
  id: string,
  area: TeoyubePhase6CompletionArea,
  label: string,
  passed: boolean,
  details: string,
  warnings: TeoyubePhase6CompletionWarning[] = []
): TeoyubePhase6CompletionCheck {
  return {
    id,
    area,
    label,
    passed,
    details,
    blockers: passed ? [] : [blocker(`${id}_blocker`, area, `${label} is incomplete.`)],
    warnings
  };
}

function mapWarnings(area: TeoyubePhase6CompletionArea, messages: string[], prefix: string): TeoyubePhase6CompletionWarning[] {
  return messages.map((message, index) => warning(`${prefix}_warning_${index + 1}`, area, message));
}

function auditItemComplete(audit: { checklist: { id: string; complete: boolean }[] }, id: string): boolean {
  return audit.checklist.some((entry) => entry.id === id && entry.complete);
}

function lockedItems(input: TeoyubePhase6CompletionReviewInput = {}): TeoyubePhase6LockedOperationsItem[] {
  return createControlledBetaOperationsLockReport({ ownerReviewed: input.ownerReviewed ?? true }).lockedItems.map((entry) => ({
    id: entry.id,
    area:
      entry.area === "manual_execution_only" ? "controlled_beta_execution_plan"
      : entry.area === "participant_workflow" ? "manual_participant_workflow"
      : entry.area === "communication_boundaries" ? "communication_boundaries"
      : entry.area === "feedback_boundaries" ? "feedback_boundaries"
      : entry.area === "issue_intake" ? "issue_intake"
      : entry.area === "pause_rollback" ? "operations_checklist"
      : entry.area === "service_disabled_state" ? "service_disabled_boundaries"
      : entry.area === "privacy_consent" ? "privacy_consent_boundaries"
      : entry.area === "scripture_anchor" || entry.area === "explanation_trace" || entry.area === "fallback" || entry.area === "confidence_label" ? "safety_theology_boundaries"
      : entry.area === "mobile_accessibility" ? "regression_qa"
      : entry.area === "known_limitations" ? "operations_readiness"
      : entry.area === "owner_review" ? "owner_review"
      : "operations_readiness",
    label: entry.label,
    locked: entry.locked,
    rules: [entry.details],
    sourceFiles: entry.sourceFiles
  }));
}

export function createPhase6CompletionChecklist(input: TeoyubePhase6CompletionReviewInput = {}): TeoyubePhase6CompletionCheck[] {
  const phase61 = runPhase61Audit();
  const phase62 = runPhase62Audit();
  const phase63 = runPhase63Audit();
  const operationsLock = createControlledBetaOperationsLockReport({ ...input, ownerReviewed: input.ownerReviewed ?? true });
  const serviceLock = createFinalBetaServiceDisabledLockReport();
  const evidenceArchive = createPhase6EvidenceArchiveReport();
  const featureInventory = createPhase6FeatureInventoryReport();
  const riskRegister = createPhase6RemainingRiskRegisterReport(createPhase6RemainingRiskRegister());
  const phase7Roadmap = createPhase7RoadmapReport();

  return [
    check("phase_6_1_complete", "controlled_beta_execution_plan", "Phase 6.1 is complete", phase61.complete && phase61.completionPercentage === 100, `Phase 6.1 completion: ${phase61.completionPercentage}%.`, mapWarnings("controlled_beta_execution_plan", phase61.warnings, "phase61")),
    check("phase_6_2_complete", "manual_beta_dry_run", "Phase 6.2 is complete", phase62.complete && phase62.completionPercentage === 100, `Phase 6.2 completion: ${phase62.completionPercentage}%.`, mapWarnings("manual_beta_dry_run", phase62.warnings, "phase62")),
    check("phase_6_3_complete", "stabilization", "Phase 6.3 is complete", phase63.complete && phase63.completionPercentage === 100, `Phase 6.3 completion: ${phase63.completionPercentage}%.`, mapWarnings("stabilization", phase63.warnings, "phase63")),
    check("controlled_beta_execution_plan_exists", "controlled_beta_execution_plan", "Controlled beta execution plan exists", auditItemComplete(phase61, "controlled_beta_execution_plan"), "Phase 6.1 controlled beta execution plan exists."),
    check("manual_participant_workflow_exists", "manual_participant_workflow", "Manual participant workflow exists", auditItemComplete(phase61, "participant_workflow"), "Phase 6.1 manual participant workflow exists."),
    check("communication_boundaries_exist", "communication_boundaries", "Communication boundaries exist", auditItemComplete(phase61, "manual_communication_boundaries"), "Phase 6.1 manual communication boundaries exist."),
    check("feedback_boundaries_exist", "feedback_boundaries", "Feedback boundaries exist", auditItemComplete(phase61, "manual_feedback_boundaries"), "Phase 6.1 manual feedback boundaries exist."),
    check("issue_intake_exists", "issue_intake", "Issue intake exists", auditItemComplete(phase61, "controlled_beta_issue_intake"), "Phase 6.1 controlled beta issue intake exists."),
    check("operations_checklist_exists", "operations_checklist", "Beta operations checklist exists", auditItemComplete(phase61, "beta_operations_checklist"), "Phase 6.1 beta operations checklist exists."),
    check("safety_theology_boundaries_exist", "safety_theology_boundaries", "Safety/theology boundaries exist", auditItemComplete(phase61, "safety_theology_boundaries"), "Phase 6.1 safety/theology boundaries exist."),
    check("privacy_consent_boundaries_exist", "privacy_consent_boundaries", "Privacy/consent boundaries exist", auditItemComplete(phase61, "privacy_consent_boundaries"), "Phase 6.1 privacy/consent boundaries exist."),
    check("service_disabled_boundaries_exist", "service_disabled_boundaries", "Service-disabled boundaries exist", auditItemComplete(phase61, "service_disabled_boundaries"), "Phase 6.1 service-disabled boundaries exist."),
    check("dry_run_scenarios_exist", "manual_beta_dry_run", "Dry-run scenarios exist", auditItemComplete(phase62, "dry_run_scenarios"), "Phase 6.2 dry-run scenarios exist."),
    check("dry_run_runner_exists", "manual_beta_dry_run", "Dry-run runner exists", auditItemComplete(phase62, "dry_run_runner"), "Phase 6.2 dry-run runner exists."),
    check("simulated_participant_session_exists", "simulated_participant_session", "Simulated participant session exists", auditItemComplete(phase62, "simulated_participant_session"), "Phase 6.2 simulated participant session exists."),
    check("feedback_intake_simulation_exists", "feedback_intake_simulation", "Feedback intake simulation exists", auditItemComplete(phase62, "feedback_intake_simulation"), "Phase 6.2 feedback intake simulation exists."),
    check("dry_run_issue_triage_exists", "dry_run_issue_triage", "Dry-run issue triage exists", auditItemComplete(phase62, "issue_triage"), "Phase 6.2 dry-run issue triage exists."),
    check("dry_run_fix_queue_exists", "dry_run_fix_queue", "Dry-run fix queue exists", auditItemComplete(phase63, "dry_run_fix_queue_manager"), "Phase 6.3 dry-run fix queue exists."),
    check("stabilization_planner_exists", "stabilization", "Stabilization planner exists", auditItemComplete(phase63, "dry_run_stabilization_planner"), "Phase 6.3 stabilization planner exists."),
    check("operations_readiness_review_exists", "operations_readiness", "Operations readiness review exists", auditItemComplete(phase63, "operations_readiness_review"), "Phase 6.3 operations readiness review exists."),
    check("regression_qa_exists", "regression_qa", "Regression QA exists", auditItemComplete(phase63, "dry_run_regression_qa_runner"), "Phase 6.3 dry-run regression QA exists."),
    check("readiness_scoring_exists", "readiness_score", "Readiness scoring exists", auditItemComplete(phase62, "readiness_score") && auditItemComplete(phase63, "post_stabilization_score"), "Phase 6.2 and Phase 6.3 readiness scoring exist."),
    check("owner_review_exists", "owner_review", "Owner review exists", auditItemComplete(phase61, "owner_review") && auditItemComplete(phase62, "owner_review") && auditItemComplete(phase63, "owner_review"), "Owner review structures exist for Phase 6.1, 6.2, and 6.3."),
    check("operations_lock_exists", "operations_readiness", "Controlled beta operations lock exists", operationsLock.valid && operationsLock.inMemoryOnly, `Operations lock decision: ${operationsLock.decision}.`, operationsLock.warnings.map((entry) => warning(entry.id, "operations_readiness", entry.message, entry.recommendedAction))),
    check("final_service_disabled_lock_exists", "service_disabled_boundaries", "Final beta service-disabled lock exists", serviceLock.valid, `${serviceLock.lock.items.length} service decision(s) locked.`, mapWarnings("service_disabled_boundaries", serviceLock.warnings, "final_beta_service_lock")),
    check("evidence_archive_exists", "documentation", "Phase 6 evidence archive exists", evidenceArchive.valid, `${evidenceArchive.archive.items.length} evidence item(s) archived in memory.`, mapWarnings("documentation", evidenceArchive.warnings, "evidence_archive")),
    check("feature_inventory_exists", "documentation", "Phase 6 feature inventory exists", featureInventory.valid, `${featureInventory.inventory.length} inventory item(s) represented.`, mapWarnings("documentation", featureInventory.warnings, "feature_inventory")),
    check("remaining_risk_register_exists", "roadmap", "Remaining risk register exists", riskRegister.valid, `${riskRegister.summary.total} remaining risk(s) represented.`, mapWarnings("roadmap", riskRegister.warnings, "remaining_risk")),
    check("phase_7_roadmap_exists", "roadmap", "Phase 7 roadmap exists", phase7Roadmap.valid, `${phase7Roadmap.items.length} Phase 7 roadmap item(s) represented.`, mapWarnings("roadmap", phase7Roadmap.warnings, "phase7")),
    check("no_beta_launch_by_code", "controlled_beta_execution_plan", "No beta launch is performed by code", !input.betaLaunchPerformed, "Phase 6.4 does not launch beta."),
    check("no_users_contacted_by_code", "communication_boundaries", "No users are contacted by code", !input.usersContacted, "Phase 6.4 does not contact users."),
    check("no_automatic_feedback_collection", "feedback_boundaries", "No feedback is collected automatically", !input.feedbackCollectedAutomatically, "Phase 6.4 does not collect feedback automatically."),
    check("no_public_urls_fetched", "operations_checklist", "No public URLs are fetched automatically", !input.publicUrlsFetchedAutomatically, "Phase 6.4 does not fetch public URLs."),
    check("no_external_services_required", "service_disabled_boundaries", "No external services are required", !input.externalServicesRequired, "Phase 6.4 requires no external services."),
    check("no_persistence_analytics_monitoring_auth_cms_accounts_live_ai", "service_disabled_boundaries", "No disabled services are enabled", !input.databasePersistenceEnabled && !input.analyticsEnabled && !input.monitoringProviderConnected && !input.adminAuthAdded && !input.cmsConnected && !input.userAccountsAdded && !input.liveAiOrchestrationEnabled, "Database persistence, analytics, monitoring provider, admin auth, CMS, user accounts, and live AI remain disabled."),
    check("no_browser_persistence_required", "privacy_consent_boundaries", "No browser persistence is required", !input.browserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
}

export function runPhase6CompletionReview(input: TeoyubePhase6CompletionReviewInput = {}): TeoyubePhase6CompletionCheck[] {
  return createPhase6CompletionChecklist(input);
}

export function getPhase6CompletionBlockers(input: TeoyubePhase6CompletionReviewInput = {}): TeoyubePhase6CompletionBlocker[] {
  return createPhase6CompletionChecklist(input).flatMap((entry) => entry.blockers);
}

export function getPhase6CompletionWarnings(input: TeoyubePhase6CompletionReviewInput = {}): TeoyubePhase6CompletionWarning[] {
  return createPhase6CompletionChecklist(input).flatMap((entry) => entry.warnings);
}

export function createPhase6CompletionDecision(input: TeoyubePhase6CompletionReviewInput = {}): TeoyubePhase6CompletionDecision {
  const blockers = getPhase6CompletionBlockers(input);
  const warnings = getPhase6CompletionWarnings(input);
  if (blockers.some((entry) => entry.area === "owner_review")) return "needs_owner_review";
  if (blockers.some((entry) => entry.area === "service_disabled_boundaries")) return "needs_service_boundary_fix";
  if (blockers.some((entry) => entry.area === "documentation" || entry.area === "roadmap")) return "needs_documentation_fix";
  if (blockers.some((entry) => ["operations_checklist", "operations_readiness", "manual_participant_workflow", "communication_boundaries", "feedback_boundaries", "issue_intake"].includes(entry.area))) return "needs_operations_fix";
  if (blockers.length) return "blocked";
  return warnings.length ? "phase_6_complete_with_warnings" : "phase_6_complete";
}

function statusFromDecision(decision: TeoyubePhase6CompletionDecision, warningCount: number): TeoyubePhase6CompletionStatus {
  if (decision === "phase_6_complete") return "complete";
  if (decision === "phase_6_complete_with_warnings" || warningCount) return "complete_with_warnings";
  if (decision === "needs_owner_review") return "needs_review";
  if (decision === "blocked" || decision === "needs_operations_fix" || decision === "needs_service_boundary_fix" || decision === "needs_documentation_fix") return "blocked";
  return "unknown";
}

export function createPhase6CompletionReport(input: TeoyubePhase6CompletionReviewInput = {}): TeoyubePhase6CompletionReport {
  const checks = createPhase6CompletionChecklist(input);
  const blockers = getPhase6CompletionBlockers(input);
  const warnings = getPhase6CompletionWarnings(input);
  const decision = createPhase6CompletionDecision(input);
  const riskRegister = createPhase6RemainingRiskRegister();
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision, warnings.length),
    decision,
    checks,
    blockers,
    warnings,
    completionPercentage: checks.length ? Math.round((checks.filter((entry) => entry.passed).length / checks.length) * 100) : 0,
    lockedOperationsItems: lockedItems(input),
    remainingRisks: riskRegister.risks,
    phase7RoadmapItems: createPhase7RoadmapReport().items,
    nextMilestone: "TEOYUBE Phase 7 - Controlled Beta Operations, Manual Feedback Review & Product Stabilization",
    nextStep: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow",
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
    noUserAccountsAdded: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
