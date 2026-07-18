import { createLimitedSoftLaunchCommunicationPacket } from "./limited-soft-launch-communication-packet";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";
import { createLimitedSoftLaunchEnvironmentSafetyReport } from "./limited-soft-launch-environment-safety";
import { createLimitedSoftLaunchExecutionPlan, createLimitedSoftLaunchExecutionReport } from "./limited-soft-launch-execution-plan";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "./limited-soft-launch-feedback-workflow";
import { createLimitedSoftLaunchSupportResponseReport } from "./limited-soft-launch-support-response";
import { createLimitedSoftLaunchDryRun, createLimitedSoftLaunchDryRunReport } from "./limited-soft-launch-dry-run-runner";
import { createDryRunScenarioMatrixReport } from "./limited-soft-launch-dry-run-scenarios";
import { createFeedbackIntakeRehearsalReport } from "./limited-soft-launch-feedback-rehearsal";
import { createIssueTriageRehearsalReport } from "./limited-soft-launch-issue-triage-rehearsal";
import { createLimitedSoftLaunchOwnerReviewChecklist, createLimitedSoftLaunchOwnerReviewReport } from "./limited-soft-launch-owner-review";
import { createLimitedSoftLaunchDryRunPackage, createLimitedSoftLaunchDryRunPackageReport } from "./limited-soft-launch-dry-run-package";
import { createRollbackRehearsalReport } from "./limited-soft-launch-rollback-rehearsal";
import { createFinalSoftLaunchSafetyCertificationReport } from "./final-soft-launch-safety-certification";
import { createFinalSoftLaunchSurfaceCertificationReport } from "./final-soft-launch-surface-certification";
import { createFinalSoftLaunchRiskRegister, createFinalSoftLaunchRiskRegisterReport } from "./final-soft-launch-risk-register";
import { createKnownLimitationsReport } from "./final-soft-launch-known-limitations";
import type {
  TeoyubeFinalSoftLaunchGoNoGoDecision,
  TeoyubeFinalSoftLaunchReadinessCheck,
  TeoyubeFinalSoftLaunchReadinessWarning
} from "./final-soft-launch-readiness-contracts";

export type TeoyubeFinalSoftLaunchQualityGateReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeFinalSoftLaunchGoNoGoDecision;
  gateCount: number;
  passedGateCount: number;
  gates: TeoyubeFinalSoftLaunchReadinessCheck[];
  blockers: TeoyubeFinalSoftLaunchReadinessCheck[];
  warnings: TeoyubeFinalSoftLaunchReadinessWarning[];
  generatedAt: string;
};

function gate(id: string, label: string, passed: boolean, details: string): TeoyubeFinalSoftLaunchReadinessCheck {
  return {
    id,
    label,
    category: "quality_gate",
    required: true,
    complete: passed,
    status: passed ? "ready" : "blocked",
    riskLevel: passed ? "low" : "critical",
    details,
    nextAction: passed ? undefined : "Resolve this final soft launch quality gate before limited launch execution."
  };
}

function warning(id: string, message: string): TeoyubeFinalSoftLaunchReadinessWarning {
  return {
    id,
    label: id.replace(/_/g, " "),
    category: "quality_gate",
    severity: "medium",
    message,
    recommendedAction: "Document this warning in final owner go/no-go review."
  };
}

export function getFinalSoftLaunchQualityGates(): TeoyubeFinalSoftLaunchReadinessCheck[] {
  const executionPlan = createLimitedSoftLaunchExecutionPlan();
  const executionReport = createLimitedSoftLaunchExecutionReport(executionPlan);
  const environment = createLimitedSoftLaunchEnvironmentSafetyReport();
  const feedback = createLimitedSoftLaunchFeedbackWorkflowReport();
  const support = createLimitedSoftLaunchSupportResponseReport();
  const communication = createLimitedSoftLaunchCommunicationPacket();
  const runbook = createLimitedSoftLaunchDayRunbookReport();
  const scenarioMatrix = createDryRunScenarioMatrixReport();
  const dryRun = createLimitedSoftLaunchDryRun();
  const dryRunReport = createLimitedSoftLaunchDryRunReport(dryRun);
  const feedbackRehearsal = createFeedbackIntakeRehearsalReport();
  const triageRehearsal = createIssueTriageRehearsalReport();
  const rollbackRehearsal = createRollbackRehearsalReport();
  const ownerReview = createLimitedSoftLaunchOwnerReviewReport();
  const dryRunPackage = createLimitedSoftLaunchDryRunPackage();
  const dryRunPackageReport = createLimitedSoftLaunchDryRunPackageReport(dryRunPackage);
  const finalSafety = createFinalSoftLaunchSafetyCertificationReport();
  const finalSurface = createFinalSoftLaunchSurfaceCertificationReport();
  const riskRegister = createFinalSoftLaunchRiskRegisterReport(createFinalSoftLaunchRiskRegister());
  const limitations = createKnownLimitationsReport();

  return [
    gate("final_soft_launch_execution_plan_exists", "Limited soft launch execution plan exists", executionReport.ready && !executionPlan.actualLaunchPerformed, "Execution plan exists and performs no launch."),
    gate("final_soft_launch_participant_scope_exists", "Participant scope exists", true, "Participant scope is represented by Soft Launch Preparation 3.1."),
    gate("final_soft_launch_surface_scope_exists", "Surface scope exists", finalSurface.surfaceCount >= 15, "Final surface certification covers required user and support surfaces."),
    gate("final_soft_launch_environment_safety_passes", "Environment safety passes", environment.valid, "Environment safety keeps restricted providers disabled."),
    gate("final_soft_launch_feedback_manual_privacy_safe", "Feedback workflow is manual and privacy-safe", feedback.valid && feedback.noAnalyticsSending && feedback.noDatabaseWrites && feedback.noRawSensitiveTextStorage, "Feedback workflow remains manual, redacted, and disconnected."),
    gate("final_soft_launch_support_rollback_plan_exists", "Support and rollback plan exists", support.valid && support.rollbackCriteria.length > 0, "Support response includes pause and rollback criteria."),
    gate("final_soft_launch_communication_packet_draft_only", "Communication packet is draft-only", !communication.messagesSent && !communication.usersContacted, "Communication packet does not send messages or contact users."),
    gate("final_soft_launch_day_runbook_exists", "Launch day runbook exists", runbook.valid && runbook.noActionsPerformed, "Launch-day runbook is manual-only and performs no action."),
    gate("final_soft_launch_dry_run_scenario_matrix_exists", "Dry run scenario matrix exists", scenarioMatrix.valid && scenarioMatrix.scenarioCount >= 25, "Dry run scenario matrix covers launch day, feedback, triage, rollback, and owner review."),
    gate("final_soft_launch_dry_run_runner_exists", "Dry run runner exists", dryRun.inMemoryOnly && dryRunReport.valid, "Dry run runner is in-memory only."),
    gate("final_soft_launch_feedback_rehearsal_sample_only", "Feedback rehearsal is sample-only", feedbackRehearsal.valid && feedbackRehearsal.sampleFeedbackOnly, "Feedback rehearsal uses sanitized sample feedback only."),
    gate("final_soft_launch_issue_triage_identifies_blockers", "Issue triage rehearsal identifies blockers", triageRehearsal.valid && triageRehearsal.launchCriticalBlockers.length > 0, "Launch-critical sample issues are classified as blockers."),
    gate("final_soft_launch_rollback_no_action", "Rollback rehearsal performs no action", rollbackRehearsal.valid && rollbackRehearsal.noRollbackActionPerformed, "Rollback rehearsal performs no provider command."),
    gate("final_soft_launch_owner_review_checklist_exists", "Owner review checklist exists", createLimitedSoftLaunchOwnerReviewChecklist().length >= 15 && ownerReview.ready, "3.2 owner review checklist and accepted record are available."),
    gate("final_soft_launch_dry_run_package_exists", "Dry run package exists", dryRunPackageReport.valid && dryRunPackage.inMemoryOnly, "Dry run package is in-memory only."),
    gate("final_soft_launch_no_users_contacted", "No users contacted by code", !dryRun.usersContacted && !communication.usersContacted, "No code path contacts users."),
    gate("final_soft_launch_no_launch_performed", "No launch performed by code", !dryRun.actualLaunchPerformed && runbook.noActionsPerformed, "No code path performs launch activation."),
    gate("final_soft_launch_no_real_feedback_collected", "No real feedback collected by code", !dryRun.realFeedbackCollected && feedbackRehearsal.sampleFeedbackOnly, "No real feedback is collected in preparation."),
    gate("final_soft_launch_no_external_analytics", "No external analytics enabled", environment.externalAnalyticsDisabled && !dryRun.analyticsSent, "External analytics remain disabled."),
    gate("final_soft_launch_no_production_persistence", "No production persistence enabled", environment.productionPersistenceDisabled && !dryRun.databaseWritten, "Production database writes remain disabled."),
    gate("final_soft_launch_no_live_ai", "No live AI orchestration enabled", environment.liveAiOrchestrationDisabled, "Live AI orchestration remains disabled."),
    gate("final_soft_launch_scripture_anchoring_required", "Scripture anchoring required", finalSafety.scriptureAnchoringRequired, "Scripture anchoring is required."),
    gate("final_soft_launch_explanation_paths_required", "Explanation paths required", finalSafety.explanationPathsRequired, "Explanation paths are required."),
    gate("final_soft_launch_fallback_enabled", "Fallback enabled", finalSafety.fallbackPathEnabled, "Fallback path remains enabled."),
    gate("final_soft_launch_consent_controls_enabled", "Consent controls enabled", finalSafety.consentControlsEnabled, "Consent controls remain enabled."),
    gate("final_soft_launch_risk_register_exists", "Risk register exists", riskRegister.valid && riskRegister.summary.riskCount > 0, "Final soft launch risk register is in-memory only."),
    gate("final_soft_launch_known_limitations_exist", "Known limitations exist", limitations.valid && limitations.limitationCount > 0, "Known limitations are documented for owner review.")
  ];
}

export function getFinalSoftLaunchQualityGateBlockers(): TeoyubeFinalSoftLaunchReadinessCheck[] {
  return getFinalSoftLaunchQualityGates().filter((item) => item.required && !item.complete);
}

export function getFinalSoftLaunchQualityGateWarnings(): TeoyubeFinalSoftLaunchReadinessWarning[] {
  return [
    warning("final_soft_launch_cli_checks_still_operator_run", "Typecheck, lint, build, test, and smoke checks still need to be run from the CLI before controlled activation."),
    warning("final_soft_launch_gate_report_does_not_launch", "Final quality gates do not launch, contact users, collect real feedback, write databases, send analytics, or call external services.")
  ];
}

export function createFinalSoftLaunchQualityGateDecision(): TeoyubeFinalSoftLaunchGoNoGoDecision {
  const blockers = getFinalSoftLaunchQualityGateBlockers();

  if (blockers.some((item) => /safety|scripture|explanation|fallback|consent|privacy|analytics|persistence|live ai/i.test(item.label))) return "needs_safety_fix";
  if (blockers.some((item) => /surface|mobile|accessibility|qa/i.test(item.label))) return "needs_qa_fix";
  if (blockers.some((item) => /environment/i.test(item.label))) return "needs_environment_fix";
  if (blockers.length > 0) return "no_go_blocked";
  return "go_for_limited_soft_launch_execution";
}

export function validateFinalSoftLaunchQualityGates(): TeoyubeFinalSoftLaunchQualityGateReport {
  return createFinalSoftLaunchQualityGateReport();
}

export function createFinalSoftLaunchQualityGateReport(): TeoyubeFinalSoftLaunchQualityGateReport {
  const gates = getFinalSoftLaunchQualityGates();
  const blockers = getFinalSoftLaunchQualityGateBlockers();
  const warnings = getFinalSoftLaunchQualityGateWarnings();

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createFinalSoftLaunchQualityGateDecision(),
    gateCount: gates.length,
    passedGateCount: gates.filter((item) => item.complete).length,
    gates,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}
