import { createFinalSoftLaunchGoNoGoReport } from "./final-soft-launch-go-no-go";
import type {
  TeoyubeControlledLaunchActivationBlocker,
  TeoyubeControlledLaunchActivationCheck,
  TeoyubeControlledLaunchActivationChecklist,
  TeoyubeControlledLaunchActivationDecision,
  TeoyubeControlledLaunchActivationPhase,
  TeoyubeControlledLaunchActivationReport,
  TeoyubeControlledLaunchActivationWarning
} from "./controlled-launch-activation-contracts";

export type TeoyubeControlledLaunchActivationState = {
  checks?: TeoyubeControlledLaunchActivationCheck[];
};

function check(
  id: string,
  label: string,
  phase: TeoyubeControlledLaunchActivationPhase,
  details: string,
  launchCritical = true,
  complete = true
): TeoyubeControlledLaunchActivationCheck {
  return { id, label, phase, required: true, complete, launchCritical, details };
}

function blocker(entry: TeoyubeControlledLaunchActivationCheck): TeoyubeControlledLaunchActivationBlocker {
  return {
    id: `controlled_launch_${entry.id}`,
    label: entry.label,
    phase: entry.phase,
    severity: entry.launchCritical ? "critical" : "high",
    reason: entry.details,
    requiredAction: entry.nextAction || "Complete this controlled activation item before manual launch activation."
  };
}

export function getControlledLaunchActivationChecklist(): TeoyubeControlledLaunchActivationChecklist {
  const finalGoNoGo = createFinalSoftLaunchGoNoGoReport();

  return {
    id: "controlled_launch_activation_checklist_4_1",
    label: "Limited Soft Launch Execution 4.1 Controlled Launch Activation Checklist",
    manualOnly: true,
    checks: [
      check("final_soft_launch_go_no_go_acceptable", "Final soft launch go/no-go is acceptable", "pre_activation_review", "Final go/no-go must be ready for limited soft launch execution.", true, finalGoNoGo.ready),
      check("owner_approval_ready", "Owner approval is ready", "owner_approval", "Structured owner approval must be complete before manual activation."),
      check("soft_launch_scope_documented", "Soft launch scope is documented", "pre_activation_review", "Limited scope must be documented and accepted."),
      check("known_limitations_documented", "Known limitations are documented", "pre_activation_review", "Known limitations must be visible before inviting participants."),
      check("participant_access_plan_documented", "Participant access plan is documented", "participant_access_confirmation", "Access remains limited, private, and manual."),
      check("communication_packet_draft_only", "Communication packet is ready as draft only", "communication_readiness", "Communication guidance must exist but send nothing from code."),
      check("feedback_intake_workflow_ready", "Feedback intake workflow is ready", "feedback_intake_readiness", "Feedback intake remains manual and privacy-protective."),
      check("issue_triage_workflow_ready", "Issue triage workflow is ready", "feedback_intake_readiness", "Issue triage must classify launch-critical safety, Scripture, fallback, consent, mobile, and accessibility concerns."),
      check("support_response_plan_ready", "Support response plan is ready", "first_hour_monitoring_readiness", "Support response ownership and escalation notes must exist."),
      check("pause_criteria_ready", "Pause criteria are ready", "pause_rollback_readiness", "Pause criteria must be explicit before manual activation."),
      check("rollback_criteria_ready", "Rollback criteria are ready", "pause_rollback_readiness", "Rollback criteria must be explicit and manual-only."),
      check("daily_review_template_ready", "Daily review template is ready", "feedback_intake_readiness", "Daily review must be ready for manual feedback synthesis."),
      check("no_external_analytics_enabled", "No external analytics are enabled", "environment_confirmation", "External analytics remain disconnected."),
      check("production_persistence_disabled", "Production persistence is disabled", "environment_confirmation", "Production persistence remains disconnected."),
      check("live_ai_orchestration_disabled", "Live AI orchestration is disabled", "environment_confirmation", "Live AI orchestration remains disabled."),
      check("scripture_anchoring_required", "Scripture anchoring is required", "surface_confirmation", "Every launch-critical spiritual guidance surface must preserve Scripture anchoring."),
      check("explanation_paths_required", "Explanation paths are required", "surface_confirmation", "Explanation paths must remain visible and inspectable."),
      check("fallback_path_enabled", "Fallback path is enabled", "surface_confirmation", "Fallback behavior must remain safe and available."),
      check("consent_controls_enabled", "Consent controls are enabled", "surface_confirmation", "Consent and privacy controls must remain enabled."),
      check("debug_ui_hidden", "Debug UI is hidden from normal users", "surface_confirmation", "Normal participants must not see debug payloads.")
    ]
  };
}

export function getControlledLaunchCriticalActivationChecks(): TeoyubeControlledLaunchActivationCheck[] {
  return getControlledLaunchActivationChecklist().checks.filter((entry) => entry.launchCritical);
}

export function getControlledLaunchActivationChecksByPhase(
  phase: TeoyubeControlledLaunchActivationPhase
): TeoyubeControlledLaunchActivationCheck[] {
  return getControlledLaunchActivationChecklist().checks.filter((entry) => entry.phase === phase);
}

function checksFromState(state: TeoyubeControlledLaunchActivationState = {}): TeoyubeControlledLaunchActivationCheck[] {
  return state.checks || getControlledLaunchActivationChecklist().checks;
}

export function getControlledLaunchActivationBlockers(
  state: TeoyubeControlledLaunchActivationState = {}
): TeoyubeControlledLaunchActivationBlocker[] {
  return checksFromState(state)
    .filter((entry) => entry.required && !entry.complete)
    .map(blocker);
}

export function getControlledLaunchActivationWarnings(
  state: TeoyubeControlledLaunchActivationState = {}
): TeoyubeControlledLaunchActivationWarning[] {
  const checks = checksFromState(state);

  return [
    {
      id: "controlled_launch_manual_activation_only",
      label: "Manual activation only",
      phase: "activation_decision",
      severity: "medium",
      message: "This checklist prepares activation controls but does not launch Teoyube.",
      recommendedAction: "Use the checklist for owner-led manual activation only."
    },
    checks.some((entry) => entry.id === "debug_ui_hidden" && entry.complete)
      ? undefined
      : {
          id: "controlled_launch_debug_review_needed",
          label: "Debug visibility review needed",
          phase: "surface_confirmation",
          severity: "high",
          message: "Debug UI visibility must be reviewed before launch participants receive access.",
          recommendedAction: "Confirm normal users cannot see debug payloads."
        }
  ].filter(Boolean) as TeoyubeControlledLaunchActivationWarning[];
}

export function createControlledLaunchActivationDecision(
  state: TeoyubeControlledLaunchActivationState = {}
): TeoyubeControlledLaunchActivationDecision {
  const blockers = getControlledLaunchActivationBlockers(state);

  if (blockers.some((entry) => /analytics|persistence|live ai|environment/i.test(`${entry.label} ${entry.reason}`))) return "needs_environment_review";
  if (blockers.some((entry) => /scripture|explanation|fallback|consent|privacy|safety/i.test(`${entry.label} ${entry.reason}`))) return "needs_safety_review";
  if (blockers.some((entry) => /surface|mobile|accessibility|debug/i.test(`${entry.label} ${entry.reason}`))) return "needs_surface_review";
  if (blockers.some((entry) => /feedback|triage|daily review/i.test(`${entry.label} ${entry.reason}`))) return "needs_feedback_workflow_review";
  if (blockers.some((entry) => /owner/i.test(`${entry.label} ${entry.reason}`))) return "ready_after_owner_review";
  if (blockers.length > 0) return "blocked";
  return "ready_for_manual_controlled_activation";
}

export function createControlledLaunchActivationReport(
  state: TeoyubeControlledLaunchActivationState = {}
): TeoyubeControlledLaunchActivationReport {
  const checklist = { ...getControlledLaunchActivationChecklist(), checks: checksFromState(state) };
  const blockers = getControlledLaunchActivationBlockers(state);
  const warnings = getControlledLaunchActivationWarnings(state);
  const decision = createControlledLaunchActivationDecision(state);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0 && decision === "ready_for_manual_controlled_activation",
    decision,
    checklist,
    checklistCount: checklist.checks.length,
    completedChecklistCount: checklist.checks.filter((entry) => entry.complete).length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
