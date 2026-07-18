import { runPhase51Audit } from "./phase-5-1-audit";
import { runPhase52Audit } from "./phase-5-2-audit";
import { runPhase53Audit } from "./phase-5-3-audit";
import { runPhase54Audit } from "./phase-5-4-audit";
import { createBetaReadinessLockReport } from "./beta-readiness-lock";
import { createFinalDisabledServiceLockReport } from "./final-disabled-service-lock";
import { createBetaReadinessEvidenceArchiveReport } from "./beta-readiness-evidence-archive";
import { createPhase5RemainingRiskRegister, createPhase5RemainingRiskRegisterReport } from "./phase-5-remaining-risk-register";
import { createPhase6RoadmapReport } from "./phase-6-roadmap-builder";
import type {
  TeoyubePhase5CompletionArea,
  TeoyubePhase5CompletionBlocker,
  TeoyubePhase5CompletionCheck,
  TeoyubePhase5CompletionDecision,
  TeoyubePhase5CompletionReport,
  TeoyubePhase5CompletionStatus,
  TeoyubePhase5CompletionWarning,
  TeoyubePhase5LockedReadinessItem
} from "./phase-5-completion-contracts";

export type TeoyubePhase5CompletionReviewInput = {
  ownerReviewComplete?: boolean;
};

function blocker(id: string, area: TeoyubePhase5CompletionArea, message: string, requiredAction = "Resolve before marking Phase 5 complete."): TeoyubePhase5CompletionBlocker {
  return { id, area, message, requiredAction };
}

function warning(id: string, area: TeoyubePhase5CompletionArea, message: string, recommendedAction = "Carry into owner review or Phase 6 planning."): TeoyubePhase5CompletionWarning {
  return { id, area, message, recommendedAction };
}

function check(
  id: string,
  area: TeoyubePhase5CompletionArea,
  label: string,
  passed: boolean,
  details: string,
  warnings: TeoyubePhase5CompletionWarning[] = []
): TeoyubePhase5CompletionCheck {
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

function mapWarnings(area: TeoyubePhase5CompletionArea, messages: string[], prefix: string): TeoyubePhase5CompletionWarning[] {
  return messages.map((message, index) => warning(`${prefix}_warning_${index + 1}`, area, message));
}

function lockedItems(): TeoyubePhase5LockedReadinessItem[] {
  return createBetaReadinessLockReport().lockedItems.map((entry) => ({
    id: entry.id,
    area: entry.area === "service_disabled_state" ? "service_gate_review" : entry.area === "mobile_accessibility" ? "manual_beta_qa" : "go_no_go",
    label: entry.label,
    locked: entry.locked,
    rules: entry.rules.map((ruleEntry) => ruleEntry.label),
    sourceFiles: entry.sourceFiles
  }));
}

export function createPhase5CompletionChecklist(_input: TeoyubePhase5CompletionReviewInput = {}): TeoyubePhase5CompletionCheck[] {
  const phase51 = runPhase51Audit();
  const phase52 = runPhase52Audit();
  const phase53 = runPhase53Audit();
  const phase54 = runPhase54Audit();
  const readinessLock = createBetaReadinessLockReport();
  const serviceLock = createFinalDisabledServiceLockReport();
  const evidenceArchive = createBetaReadinessEvidenceArchiveReport();
  const riskRegister = createPhase5RemainingRiskRegisterReport(createPhase5RemainingRiskRegister());
  const phase6Roadmap = createPhase6RoadmapReport();

  return [
    check("phase_5_1_complete", "controlled_beta_preparation", "Phase 5.1 is complete", phase51.complete && phase51.completionPercentage === 100, `Phase 5.1 completion: ${phase51.completionPercentage}%.`, mapWarnings("controlled_beta_preparation", phase51.warnings, "phase51")),
    check("phase_5_2_complete", "beta_qa_execution", "Phase 5.2 is complete", phase52.complete && phase52.completionPercentage === 100, `Phase 5.2 completion: ${phase52.completionPercentage}%.`, mapWarnings("beta_qa_execution", phase52.warnings, "phase52")),
    check("phase_5_3_complete", "remediation", "Phase 5.3 is complete", phase53.complete && phase53.completionPercentage === 100, `Phase 5.3 completion: ${phase53.completionPercentage}%.`, mapWarnings("remediation", phase53.warnings, "phase53")),
    check("phase_5_4_complete", "go_no_go", "Phase 5.4 is complete", phase54.complete && phase54.completionPercentage === 100, `Phase 5.4 completion: ${phase54.completionPercentage}%.`, mapWarnings("go_no_go", phase54.warnings, "phase54")),
    check("controlled_beta_preparation_exists", "controlled_beta_preparation", "Controlled beta preparation exists", phase51.checklist.some((entry) => entry.id === "controlled_beta_preparation" && entry.complete), "Phase 5.1 controlled beta preparation audit item exists."),
    check("manual_qa_execution_plan_exists", "manual_beta_qa", "Manual QA execution plan exists", phase51.checklist.some((entry) => entry.id === "manual_beta_qa_execution_plan" && entry.complete), "Phase 5.1 manual QA plan exists."),
    check("service_gate_review_exists", "service_gate_review", "Service gate review exists", phase51.checklist.some((entry) => entry.id === "service_gate_review" && entry.complete), "Phase 5.1 service gate review exists."),
    check("privacy_security_readiness_exists", "privacy_security_readiness", "Privacy/security readiness exists", phase51.checklist.some((entry) => entry.id === "privacy_security_readiness" && entry.complete), "Phase 5.1 privacy/security readiness exists."),
    check("issue_intake_plan_exists", "issue_intake", "Issue intake plan exists", phase51.checklist.some((entry) => entry.id === "beta_issue_intake_plan" && entry.complete), "Phase 5.1 issue intake plan exists."),
    check("feedback_readiness_exists", "feedback_readiness", "Feedback readiness plan exists", phase51.checklist.some((entry) => entry.id === "beta_feedback_readiness_plan" && entry.complete), "Phase 5.1 feedback readiness plan exists."),
    check("operational_readiness_exists", "operational_readiness", "Beta operational readiness exists", phase51.checklist.some((entry) => entry.id === "beta_operational_readiness" && entry.complete), "Phase 5.1 operational readiness exists."),
    check("manual_beta_qa_execution_exists", "beta_qa_execution", "Manual beta QA execution structures exist", phase52.checklist.some((entry) => entry.id === "manual_beta_qa_execution_runner" && entry.complete), "Phase 5.2 manual beta QA execution runner exists."),
    check("beta_issue_triage_exists", "issue_triage", "Beta issue triage exists", phase52.checklist.some((entry) => entry.id === "beta_issue_triage_execution" && entry.complete), "Phase 5.2 beta issue triage exists."),
    check("readiness_scoring_exists", "readiness_score", "Readiness scoring exists", phase52.checklist.some((entry) => entry.id === "beta_readiness_score" && entry.complete) && phase53.checklist.some((entry) => entry.id === "post_remediation_readiness_score" && entry.complete), "Phase 5.2 and post-remediation readiness scoring exist."),
    check("beta_fix_queue_exists", "fix_queue", "Beta fix queue exists", phase53.checklist.some((entry) => entry.id === "beta_fix_queue_manager" && entry.complete), "Phase 5.3 beta fix queue exists."),
    check("remediation_planner_exists", "remediation", "Remediation planner exists", phase53.checklist.some((entry) => entry.id === "readiness_remediation_planner" && entry.complete), "Phase 5.3 remediation planner exists."),
    check("regression_qa_exists", "regression_qa", "Regression QA exists", phase53.checklist.some((entry) => entry.id === "beta_regression_qa_runner" && entry.complete), "Phase 5.3 regression QA exists."),
    check("controlled_beta_go_no_go_exists", "go_no_go", "Controlled beta go/no-go exists", phase54.checklist.some((entry) => entry.id === "controlled_beta_go_no_go_module" && entry.complete), "Phase 5.4 go/no-go module exists."),
    check("launch_boundary_validator_exists", "launch_boundary", "Beta launch boundary validator exists", phase54.checklist.some((entry) => entry.id === "beta_launch_boundary_validator" && entry.complete), "Phase 5.4 launch boundary validator exists."),
    check("owner_approval_exists", "owner_approval", "Owner approval exists", phase54.checklist.some((entry) => entry.id === "controlled_beta_owner_approval_module" && entry.complete), "Phase 5.4 owner approval module exists."),
    check("operational_handoff_exists", "operational_handoff", "Operational handoff exists", phase54.checklist.some((entry) => entry.id === "beta_operational_handoff_module" && entry.complete), "Phase 5.4 operational handoff exists."),
    check("pause_rollback_exists", "operational_handoff", "Pause/rollback criteria exist", phase54.checklist.some((entry) => entry.id === "beta_pause_rollback_criteria" && entry.complete), "Phase 5.4 pause/rollback criteria exist."),
    check("known_limitations_exists", "known_limitations", "Known limitations exist", phase54.checklist.some((entry) => entry.id === "beta_known_limitations" && entry.complete), "Phase 5.4 known limitations exist."),
    check("beta_readiness_lock", "launch_boundary", "Beta readiness lock exists", readinessLock.valid, `Readiness lock decision: ${readinessLock.decision}.`, readinessLock.warnings.map((entry) => warning(entry.id, "launch_boundary", entry.message, entry.recommendedAction))),
    check("final_disabled_service_lock", "service_gate_review", "Final disabled service lock exists", serviceLock.valid, `${serviceLock.lock.items.length} service decision(s) locked.`, mapWarnings("service_gate_review", serviceLock.warnings, "final_service_lock")),
    check("evidence_archive", "documentation", "Beta readiness evidence archive exists", evidenceArchive.valid, `${evidenceArchive.archive.items.length} evidence item(s) archived in memory.`, mapWarnings("documentation", evidenceArchive.warnings, "evidence_archive")),
    check("remaining_risk_register", "roadmap", "Remaining risk register exists", riskRegister.valid, `${riskRegister.summary.total} remaining risk(s) represented.`, mapWarnings("roadmap", riskRegister.warnings, "remaining_risk")),
    check("phase_6_roadmap", "roadmap", "Phase 6 roadmap exists", phase6Roadmap.valid, `${phase6Roadmap.items.length} Phase 6 roadmap item(s) represented.`, mapWarnings("roadmap", phase6Roadmap.warnings, "phase6"))
  ];
}

export function runPhase5CompletionReview(input: TeoyubePhase5CompletionReviewInput = {}): TeoyubePhase5CompletionCheck[] {
  return createPhase5CompletionChecklist(input);
}

export function getPhase5CompletionBlockers(input: TeoyubePhase5CompletionReviewInput = {}): TeoyubePhase5CompletionBlocker[] {
  return createPhase5CompletionChecklist(input).flatMap((entry) => entry.blockers);
}

export function getPhase5CompletionWarnings(input: TeoyubePhase5CompletionReviewInput = {}): TeoyubePhase5CompletionWarning[] {
  return createPhase5CompletionChecklist(input).flatMap((entry) => entry.warnings);
}

export function createPhase5CompletionDecision(input: TeoyubePhase5CompletionReviewInput = {}): TeoyubePhase5CompletionDecision {
  const blockers = getPhase5CompletionBlockers(input);
  const warnings = getPhase5CompletionWarnings(input);
  if (blockers.some((entry) => entry.area === "service_gate_review")) return "needs_service_gate_fix";
  if (blockers.some((entry) => entry.area === "documentation")) return "needs_documentation_fix";
  if (blockers.some((entry) => ["readiness_score", "fix_queue", "remediation", "regression_qa", "go_no_go", "launch_boundary"].includes(entry.area))) return "needs_beta_readiness_fix";
  if (blockers.some((entry) => entry.area === "owner_approval")) return "needs_owner_review";
  if (blockers.length) return "blocked";
  return warnings.length ? "phase_5_complete_with_warnings" : "phase_5_complete";
}

function statusFromDecision(decision: TeoyubePhase5CompletionDecision, warningCount: number): TeoyubePhase5CompletionStatus {
  if (decision === "phase_5_complete") return "complete";
  if (decision === "phase_5_complete_with_warnings" || warningCount) return "complete_with_warnings";
  if (decision === "needs_owner_review") return "needs_review";
  if (decision === "blocked" || decision === "needs_beta_readiness_fix" || decision === "needs_service_gate_fix" || decision === "needs_documentation_fix") return "blocked";
  return "unknown";
}

export function createPhase5CompletionReport(input: TeoyubePhase5CompletionReviewInput = {}): TeoyubePhase5CompletionReport {
  const checks = createPhase5CompletionChecklist(input);
  const blockers = getPhase5CompletionBlockers(input);
  const warnings = getPhase5CompletionWarnings(input);
  const decision = createPhase5CompletionDecision(input);
  const riskRegister = createPhase5RemainingRiskRegister();
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision, warnings.length),
    decision,
    checks,
    blockers,
    warnings,
    completionPercentage: checks.length ? Math.round((checks.filter((entry) => entry.passed).length / checks.length) * 100) : 0,
    lockedReadinessItems: lockedItems(),
    remainingRisks: riskRegister.risks,
    phase6RoadmapItems: createPhase6RoadmapReport().items,
    nextMilestone: "TEOYUBE Phase 6 - Controlled Beta Execution Planning, Manual Feedback Loop & Operational Stabilization",
    nextStep: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries",
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
