import { createControlledBetaOperationsFinalLockReport } from "./controlled-beta-operations-final-lock";
import { createFinalPhase7ServiceDisabledLockReport } from "./final-phase-7-service-disabled-lock";
import { createPhase7EvidenceArchiveReport } from "./phase-7-evidence-archive";
import { createPhase7FeatureInventoryReport } from "./phase-7-feature-inventory";
import { createPhase7RemainingRiskRegister, createPhase7RemainingRiskRegisterReport } from "./phase-7-remaining-risk-register";
import { runPhase71Audit } from "./phase-7-1-audit";
import { runPhase72Audit } from "./phase-7-2-audit";
import { runPhase73Audit } from "./phase-7-3-audit";
import { createPhase8RoadmapReport } from "./phase-8-roadmap-builder";
import type {
  TeoyubePhase7CompletionArea,
  TeoyubePhase7CompletionBlocker,
  TeoyubePhase7CompletionCheck,
  TeoyubePhase7CompletionDecision,
  TeoyubePhase7CompletionReport,
  TeoyubePhase7CompletionStatus,
  TeoyubePhase7CompletionWarning,
  TeoyubePhase7LockedOperationsItem
} from "./phase-7-completion-contracts";

export type TeoyubePhase7CompletionReviewInput = Partial<{
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

function blocker(id: string, area: TeoyubePhase7CompletionArea, message: string, requiredAction = "Resolve before marking Phase 7 complete."): TeoyubePhase7CompletionBlocker {
  return { id, area, message, requiredAction };
}

function warning(id: string, area: TeoyubePhase7CompletionArea, message: string, recommendedAction = "Carry into owner review or Phase 8 planning."): TeoyubePhase7CompletionWarning {
  return { id, area, message, recommendedAction };
}

function check(
  id: string,
  area: TeoyubePhase7CompletionArea,
  label: string,
  passed: boolean,
  details: string,
  warnings: TeoyubePhase7CompletionWarning[] = []
): TeoyubePhase7CompletionCheck {
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

function mapWarnings(area: TeoyubePhase7CompletionArea, messages: string[], prefix: string): TeoyubePhase7CompletionWarning[] {
  return messages.map((message, index) => warning(`${prefix}_warning_${index + 1}`, area, message));
}

function auditItemComplete(audit: { checklist: { id: string; complete: boolean }[] }, id: string): boolean {
  return audit.checklist.some((entry) => entry.id === id && entry.complete);
}

function lockedItems(input: TeoyubePhase7CompletionReviewInput = {}): TeoyubePhase7LockedOperationsItem[] {
  return createControlledBetaOperationsFinalLockReport({ ownerReviewed: input.ownerReviewed ?? true }).lockedItems.map((entry) => ({
    id: entry.id,
    area:
      entry.area === "manual_operations_only" ? "controlled_beta_operations_runbook"
      : entry.area === "manual_feedback_review" ? "manual_feedback_review"
      : entry.area === "manual_support_workflow" ? "beta_support_workflow"
      : entry.area === "manual_issue_triage" ? "support_issue_triage"
      : entry.area === "manual_monitoring" ? "manual_operational_monitoring"
      : entry.area === "product_stabilization" ? "product_stabilization_pass"
      : entry.area === "pause_rollback" ? "pause_rollback_review"
      : entry.area === "service_disabled_state" ? "service_disabled_state"
      : entry.area === "privacy_consent" ? "privacy_consent"
      : entry.area === "scripture_anchor" ? "scripture_anchor"
      : entry.area === "explanation_trace" ? "explanation_trace"
      : entry.area === "fallback" ? "fallback"
      : entry.area === "confidence_label" ? "confidence_label"
      : entry.area === "mobile_accessibility" ? "mobile_accessibility"
      : entry.area === "known_limitations" ? "known_limitations"
      : entry.area === "owner_review" ? "owner_review"
      : "service_disabled_state",
    label: entry.label,
    locked: entry.locked,
    rules: [entry.details],
    sourceFiles: entry.sourceFiles
  }));
}

export function createPhase7CompletionChecklist(input: TeoyubePhase7CompletionReviewInput = {}): TeoyubePhase7CompletionCheck[] {
  const phase71 = runPhase71Audit();
  const phase72 = runPhase72Audit();
  const phase73 = runPhase73Audit();
  const finalLock = createControlledBetaOperationsFinalLockReport({ ...input, ownerReviewed: input.ownerReviewed ?? true });
  const serviceLock = createFinalPhase7ServiceDisabledLockReport();
  const evidenceArchive = createPhase7EvidenceArchiveReport();
  const featureInventory = createPhase7FeatureInventoryReport();
  const riskRegister = createPhase7RemainingRiskRegisterReport(createPhase7RemainingRiskRegister());
  const phase8Roadmap = createPhase8RoadmapReport();

  return [
    check("phase_7_1_complete", "controlled_beta_operations_runbook", "Phase 7.1 is complete", phase71.complete && phase71.completionPercentage === 100, `Phase 7.1 completion: ${phase71.completionPercentage}%.`, mapWarnings("controlled_beta_operations_runbook", phase71.warnings, "phase71")),
    check("phase_7_2_complete", "support_issue_triage", "Phase 7.2 is complete", phase72.complete && phase72.completionPercentage === 100, `Phase 7.2 completion: ${phase72.completionPercentage}%.`, mapWarnings("support_issue_triage", phase72.warnings, "phase72")),
    check("phase_7_3_complete", "product_stabilization_pass", "Phase 7.3 is complete", phase73.complete && phase73.completionPercentage === 100, `Phase 7.3 completion: ${phase73.completionPercentage}%.`, mapWarnings("product_stabilization_pass", phase73.warnings, "phase73")),
    check("operations_runbook_exists", "controlled_beta_operations_runbook", "Controlled beta operations runbook exists", auditItemComplete(phase71, "operations_runbook"), "Phase 7.1 operations runbook exists."),
    check("manual_feedback_review_exists", "manual_feedback_review", "Manual feedback review exists", auditItemComplete(phase71, "manual_feedback_review"), "Manual feedback review exists and remains in memory."),
    check("beta_support_workflow_exists", "beta_support_workflow", "Beta support workflow exists", auditItemComplete(phase71, "support_workflow"), "Support workflow exists and sends no automatic contact."),
    check("manual_operational_monitoring_exists", "manual_operational_monitoring", "Manual operational monitoring exists", auditItemComplete(phase71, "manual_monitoring"), "Manual operational monitoring exists."),
    check("issue_escalation_exists", "issue_escalation", "Issue escalation exists", auditItemComplete(phase71, "issue_escalation"), "Issue escalation workflow exists."),
    check("support_to_issue_conversion_exists", "support_to_issue_conversion", "Support-to-issue conversion exists", auditItemComplete(phase71, "support_to_issue_converter"), "Support-to-issue conversion exists."),
    check("pause_rollback_review_exists", "pause_rollback_review", "Pause/rollback review exists", auditItemComplete(phase71, "pause_rollback_review"), "Pause/rollback review exists."),
    check("known_limitations_exist", "known_limitations", "Known limitations exist", auditItemComplete(phase71, "known_limitations"), "Known limitations exist."),
    check("feedback_review_simulation_exists", "feedback_review_simulation", "Feedback review simulation exists", auditItemComplete(phase72, "manual_feedback_review_simulation"), "Feedback review simulation exists."),
    check("support_issue_triage_exists", "support_issue_triage", "Support issue triage exists", auditItemComplete(phase72, "support_issue_triage"), "Support issue triage exists."),
    check("product_stabilization_queue_exists", "product_stabilization_queue", "Product stabilization queue exists", auditItemComplete(phase72, "product_stabilization_queue_manager"), "Product stabilization queue exists."),
    check("stabilization_safety_exists", "stabilization_safety", "Stabilization safety validator exists", auditItemComplete(phase72, "product_stabilization_safety_validator"), "Stabilization safety validator exists."),
    check("stabilization_planner_exists", "stabilization_planner", "Stabilization planner exists", auditItemComplete(phase72, "product_stabilization_planner"), "Stabilization planner exists."),
    check("product_stabilization_pass_exists", "product_stabilization_pass", "Product stabilization pass exists", auditItemComplete(phase73, "product_stabilization_pass_runner"), "Product stabilization pass exists."),
    check("stabilization_regression_qa_exists", "regression_qa", "Stabilization regression QA exists", auditItemComplete(phase73, "stabilization_regression_qa_runner"), "Stabilization regression QA exists."),
    check("service_disabled_regression_exists", "service_disabled_state", "Service-disabled operations regression exists", auditItemComplete(phase73, "service_disabled_operations_regression"), "Service-disabled regression exists."),
    check("scripture_explanation_fallback_regression_exists", "scripture_anchor", "Scripture/explanation/fallback regression exists", auditItemComplete(phase73, "scripture_explanation_fallback_operations_regression"), "Scripture, explanation, fallback, confidence, privacy, and consent regression exists."),
    check("reviewed_content_admin_regression_exists", "service_disabled_state", "Reviewed content/admin regression exists", auditItemComplete(phase73, "reviewed_content_admin_operations_regression"), "Reviewed content/admin regression exists."),
    check("feedback_support_regression_exists", "manual_feedback_review", "Feedback/support regression exists", auditItemComplete(phase73, "feedback_support_operations_regression"), "Feedback/support regression exists."),
    check("mobile_accessibility_regression_exists", "mobile_accessibility", "Mobile/accessibility regression exists", auditItemComplete(phase73, "mobile_accessibility_operations_regression"), "Mobile/accessibility regression exists."),
    check("beta_operations_readiness_score_exists", "beta_operations_readiness_score", "Beta operations readiness score exists", auditItemComplete(phase73, "beta_operations_readiness_score"), `Readiness score band: ${phase73.readinessScoreBand}.`),
    check("owner_review_exists", "owner_review", "Owner review exists", auditItemComplete(phase71, "owner_review") && auditItemComplete(phase72, "owner_review") && auditItemComplete(phase73, "owner_review"), "Owner review structures exist for Phase 7.1, 7.2, and 7.3."),
    check("final_operations_lock_exists", "service_disabled_state", "Final operations lock exists", finalLock.valid && finalLock.inMemoryOnly, `Final operations lock decision: ${finalLock.decision}.`, finalLock.warnings.map((entry) => warning(entry.id, "service_disabled_state", entry.message, entry.recommendedAction))),
    check("final_service_disabled_lock_exists", "service_disabled_state", "Final service-disabled lock exists", serviceLock.valid, `${serviceLock.lock.items.length} service decision(s) locked.`, mapWarnings("service_disabled_state", serviceLock.warnings, "final_phase7_service_lock")),
    check("phase_7_evidence_archive_exists", "documentation", "Phase 7 evidence archive exists", evidenceArchive.valid, `${evidenceArchive.archive.items.length} evidence item(s) archived in memory.`, mapWarnings("documentation", evidenceArchive.warnings, "evidence_archive")),
    check("phase_7_feature_inventory_exists", "documentation", "Phase 7 feature inventory exists", featureInventory.valid, `${featureInventory.inventory.length} inventory item(s) represented.`, mapWarnings("documentation", featureInventory.warnings, "feature_inventory")),
    check("phase_7_remaining_risk_register_exists", "roadmap", "Remaining risk register exists", riskRegister.valid, `${riskRegister.summary.total} remaining risk(s) represented.`, mapWarnings("roadmap", riskRegister.warnings, "remaining_risk")),
    check("phase_8_roadmap_exists", "roadmap", "Phase 8 roadmap exists", phase8Roadmap.valid, `${phase8Roadmap.items.length} Phase 8 roadmap item(s) represented.`, mapWarnings("roadmap", phase8Roadmap.warnings, "phase8")),
    check("no_beta_launch_by_code", "controlled_beta_operations_runbook", "No beta launch is performed by code", !input.betaLaunchPerformed, "Phase 7.4 does not launch beta."),
    check("no_users_contacted_by_code", "beta_support_workflow", "No users are contacted by code", !input.usersContacted, "Phase 7.4 does not contact users."),
    check("no_automatic_feedback_collection", "manual_feedback_review", "No feedback is collected automatically", !input.feedbackCollectedAutomatically, "Phase 7.4 does not collect feedback automatically."),
    check("no_public_urls_fetched", "controlled_beta_operations_runbook", "No public URLs are fetched automatically", !input.publicUrlsFetchedAutomatically, "Phase 7.4 does not fetch public URLs."),
    check("no_external_services_required", "service_disabled_state", "No external services are required", !input.externalServicesRequired, "Phase 7.4 requires no external services."),
    check("no_persistence_analytics_monitoring_auth_cms_accounts_live_ai", "service_disabled_state", "No disabled services are enabled", !input.databasePersistenceEnabled && !input.analyticsEnabled && !input.monitoringProviderConnected && !input.adminAuthAdded && !input.cmsConnected && !input.userAccountsAdded && !input.liveAiOrchestrationEnabled, "Database persistence, analytics, monitoring provider, admin auth, CMS, user accounts, and live AI remain disabled."),
    check("no_browser_persistence_required", "privacy_consent", "No browser persistence is required", !input.browserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
}

export function runPhase7CompletionReview(input: TeoyubePhase7CompletionReviewInput = {}): TeoyubePhase7CompletionCheck[] {
  return createPhase7CompletionChecklist(input);
}

export function getPhase7CompletionBlockers(input: TeoyubePhase7CompletionReviewInput = {}): TeoyubePhase7CompletionBlocker[] {
  return createPhase7CompletionChecklist(input).flatMap((entry) => entry.blockers);
}

export function getPhase7CompletionWarnings(input: TeoyubePhase7CompletionReviewInput = {}): TeoyubePhase7CompletionWarning[] {
  return createPhase7CompletionChecklist(input).flatMap((entry) => entry.warnings);
}

export function createPhase7CompletionDecision(input: TeoyubePhase7CompletionReviewInput = {}): TeoyubePhase7CompletionDecision {
  const blockers = getPhase7CompletionBlockers(input);
  const warnings = getPhase7CompletionWarnings(input);
  if (blockers.some((entry) => entry.area === "owner_review")) return "needs_owner_review";
  if (blockers.some((entry) => entry.area === "documentation" || entry.area === "roadmap")) return "needs_documentation_fix";
  if (blockers.some((entry) => ["product_stabilization_queue", "stabilization_safety", "stabilization_planner", "product_stabilization_pass", "regression_qa", "beta_operations_readiness_score"].includes(entry.area))) return "needs_stabilization_fix";
  if (blockers.some((entry) => ["controlled_beta_operations_runbook", "manual_feedback_review", "beta_support_workflow", "manual_operational_monitoring", "support_issue_triage", "service_disabled_state"].includes(entry.area))) return "needs_operations_fix";
  if (blockers.length) return "blocked";
  return warnings.length ? "phase_7_complete_with_warnings" : "phase_7_complete";
}

function statusFromDecision(decision: TeoyubePhase7CompletionDecision, warningCount: number): TeoyubePhase7CompletionStatus {
  if (decision === "phase_7_complete") return "complete";
  if (decision === "phase_7_complete_with_warnings" || warningCount) return "complete_with_warnings";
  if (decision === "needs_owner_review") return "needs_review";
  if (decision === "blocked" || decision === "needs_operations_fix" || decision === "needs_stabilization_fix" || decision === "needs_documentation_fix") return "blocked";
  return "unknown";
}

export function createPhase7CompletionReport(input: TeoyubePhase7CompletionReviewInput = {}): TeoyubePhase7CompletionReport {
  const checks = createPhase7CompletionChecklist(input);
  const blockers = getPhase7CompletionBlockers(input);
  const warnings = getPhase7CompletionWarnings(input);
  const decision = createPhase7CompletionDecision(input);
  const riskRegister = createPhase7RemainingRiskRegister();
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
    phase8RoadmapItems: createPhase8RoadmapReport().items,
    nextMilestone: "TEOYUBE Phase 8 - Post-Beta Readiness, Product Hardening & Controlled Service Reassessment",
    nextStep: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate",
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
    noReviewedContentAutoPublished: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
