import type {
  TeoyubeFinalLaunchDecision,
  TeoyubeFinalLaunchPreparationBlocker,
  TeoyubeFinalLaunchPreparationCheck,
  TeoyubeFinalLaunchPreparationReport,
  TeoyubeFinalLaunchPreparationWarning
} from "./final-launch-preparation-contracts";

function check(
  id: string,
  label: string,
  stage: TeoyubeFinalLaunchPreparationCheck["stage"],
  complete = true,
  details = "Module exists and is exportable."
): TeoyubeFinalLaunchPreparationCheck {
  return {
    id,
    label,
    stage,
    required: true,
    complete,
    status: complete ? "ready" : "incomplete",
    riskLevel: complete ? "low" : "critical",
    details,
    nextAction: complete ? undefined : "Restore this launch preparation module before manual preview deployment."
  };
}

function warning(id: string, message: string, recommendedAction: string): TeoyubeFinalLaunchPreparationWarning {
  return {
    id,
    label: id.replace(/_/g, " "),
    category: "final_launch_preparation",
    riskLevel: "medium",
    message,
    recommendedAction
  };
}

export function getFinalLaunchPreparationChecklist(): TeoyubeFinalLaunchPreparationCheck[] {
  return [
    check("production_launch_contracts", "Production launch contracts", "launch_1_1"),
    check("production_launch_readiness_audit", "Production launch readiness audit", "launch_1_1"),
    check("launch_environment_checklist", "Launch environment checklist", "launch_1_1"),
    check("launch_qa_checklist", "Launch QA checklist", "launch_1_1"),
    check("launch_safety_review", "Launch safety review", "launch_1_1"),
    check("launch_surface_readiness_report", "Launch surface readiness report", "launch_1_1"),
    check("launch_quality_gates", "Launch quality gates", "launch_1_1"),
    check("launch_decision_helper", "Launch decision helper", "launch_1_1"),

    check("launch_environment_contracts", "Launch environment contracts", "launch_1_2"),
    check("launch_feature_flags", "Launch feature flags", "launch_1_2"),
    check("launch_environment_registry", "Launch environment registry", "launch_1_2"),
    check("launch_environment_validator", "Launch environment validator", "launch_1_2"),
    check("deployment_target_selection", "Deployment target selection", "launch_1_2"),
    check("launch_env_template", "Launch env template", "launch_1_2"),
    check("launch_config_profiles", "Launch config profiles", "launch_1_2"),
    check("launch_environment_safety_audit", "Launch environment safety audit", "launch_1_2"),

    check("launch_qa_contracts", "Launch QA contracts", "launch_1_3"),
    check("launch_surface_test_matrix", "Launch surface test matrix", "launch_1_3"),
    check("launch_accessibility_audit", "Launch accessibility audit", "launch_1_3"),
    check("launch_mobile_qa", "Launch mobile QA", "launch_1_3"),
    check("launch_tig_production_qa", "Launch TIG production QA", "launch_1_3"),
    check("launch_personalization_qa", "Launch personalization QA", "launch_1_3"),
    check("launch_manual_qa_runner", "Launch manual QA runner", "launch_1_3"),

    check("build_verification_contracts", "Build verification contracts", "launch_1_4"),
    check("build_command_registry", "Build command registry", "launch_1_4"),
    check("build_verification_runner", "Build verification runner", "launch_1_4"),
    check("route_build_readiness", "Route build readiness", "launch_1_4"),
    check("build_artifact_readiness", "Build artifact readiness", "launch_1_4"),
    check("deployment_dry_run_contracts", "Deployment dry-run contracts", "launch_1_4"),
    check("deployment_dry_run_planner", "Deployment dry-run planner", "launch_1_4"),
    check("deployment_target_dry_run_profiles", "Deployment target dry-run profiles", "launch_1_4"),
    check("release_candidate_report", "Release candidate report", "launch_1_4"),
    check("predeployment_safety_gates", "Predeployment safety gates", "launch_1_4"),

    check("preview_deployment_contracts", "Preview deployment contracts", "launch_1_5"),
    check("preview_deployment_readiness", "Preview deployment readiness", "launch_1_5"),
    check("preview_environment_package", "Preview environment package", "launch_1_5"),
    check("soft_launch_candidate_contracts", "Soft launch candidate contracts", "launch_1_5"),
    check("soft_launch_candidate_planner", "Soft launch candidate planner", "launch_1_5"),
    check("preview_surface_launch_report", "Preview surface launch report", "launch_1_5"),
    check("preview_release_notes", "Preview release notes", "launch_1_5"),
    check("preview_rollback_manual_review", "Preview rollback/manual review plan", "launch_1_5"),
    check("preview_deployment_command_guide", "Preview deployment command guide", "launch_1_5"),
    check("preview_deployment_readiness_audit", "Preview deployment readiness audit", "launch_1_5"),

    check("preview_deployment_execution_contracts", "Preview deployment execution contracts", "launch_1_6"),
    check("preview_deployment_execution_checklist", "Preview deployment execution checklist", "launch_1_6"),
    check("preview_deployment_preflight", "Preview deployment preflight", "launch_1_6"),
    check("preview_deployment_postcheck", "Preview deployment post-check", "launch_1_6"),
    check("preview_url_verification_plan", "Preview URL verification plan", "launch_1_6"),
    check("preview_deployment_issue_log", "Preview deployment issue log", "launch_1_6"),
    check("preview_rollback_execution_checklist", "Preview rollback execution checklist", "launch_1_6"),
    check("preview_deployment_go_no_go", "Preview deployment go/no-go", "launch_1_6"),
    check("preview_deployment_runbook", "Preview deployment runbook", "launch_1_6"),
    check("preview_deployment_execution_audit", "Preview deployment execution audit", "launch_1_6"),

    check("preview_deployment_review_contracts", "Preview deployment review contracts", "launch_1_7"),
    check("preview_deployment_review", "Preview deployment review", "launch_1_7"),
    check("preview_qa_result_collector", "Preview QA result collector", "launch_1_7"),
    check("preview_issue_triage", "Preview issue triage", "launch_1_7"),
    check("preview_safety_review", "Preview safety review", "launch_1_7"),
    check("soft_launch_go_no_go", "Soft launch go/no-go", "launch_1_7"),
    check("soft_launch_manual_approval", "Soft launch manual approval", "launch_1_7"),
    check("soft_launch_scope_confirmation", "Soft launch scope confirmation", "launch_1_7"),
    check("soft_launch_readiness_package", "Soft launch readiness package", "launch_1_7"),
    check("preview_review_soft_launch_audit", "Preview review soft launch audit", "launch_1_7"),

    check("soft_launch_runbook_contracts", "Soft launch runbook contracts", "launch_1_8"),
    check("soft_launch_runbook", "Soft launch runbook", "launch_1_8"),
    check("soft_launch_feedback_contracts", "Soft launch feedback contracts", "launch_1_8"),
    check("soft_launch_feedback_intake", "Soft launch feedback intake", "launch_1_8"),
    check("soft_launch_feedback_safety", "Soft launch feedback safety", "launch_1_8"),
    check("soft_launch_feedback_triage", "Soft launch feedback triage", "launch_1_8"),
    check("soft_launch_issue_response_plan", "Soft launch issue response plan", "launch_1_8"),
    check("soft_launch_communication_guidance", "Soft launch communication guidance", "launch_1_8"),
    check("soft_launch_daily_review", "Soft launch daily review", "launch_1_8"),
    check("soft_launch_completion_criteria", "Soft launch completion criteria", "launch_1_8"),
    check("soft_launch_runbook_audit", "Soft launch runbook audit", "launch_1_8"),

    check("final_launch_preparation_contracts", "Final launch preparation contracts", "launch_1_9"),
    check("final_launch_preparation_audit", "Final launch preparation audit", "launch_1_9"),
    check("final_launch_safety_certification", "Final launch safety certification", "launch_1_9"),
    check("final_launch_quality_gate_report", "Final launch quality gate report", "launch_1_9"),
    check("final_launch_surface_certification", "Final launch surface certification", "launch_1_9"),
    check("final_launch_blocker_register", "Final launch blocker register", "launch_1_9"),
    check("final_launch_readiness_package", "Final launch readiness package", "launch_1_9"),
    check("final_launch_owner_review", "Final launch owner review", "launch_1_9"),
    check("final_launch_preparation_summary", "Final launch preparation summary", "launch_1_9"),
    check("launch_1_9_smoke_check", "Production Launch Preparation 1.9 smoke check", "launch_1_9")
  ];
}

export function getFinalLaunchPreparationMissingItems(): string[] {
  return getFinalLaunchPreparationChecklist()
    .filter((item) => item.required && !item.complete)
    .map((item) => item.id);
}

export function getFinalLaunchPreparationWarnings(): TeoyubeFinalLaunchPreparationWarning[] {
  return [
    warning(
      "manual_preview_deployment_not_performed",
      "This final audit confirms readiness only; it does not deploy Teoyube.",
      "Use the next manual preview deployment execution stage before any real deployment."
    ),
    warning(
      "providers_disconnected",
      "Production database persistence, external analytics, live AI orchestration, service workers, native mobile builds, and paid infrastructure remain disconnected.",
      "Connect providers only through a later guarded launch step."
    )
  ];
}

export function getFinalLaunchPreparationBlockers(): TeoyubeFinalLaunchPreparationBlocker[] {
  return getFinalLaunchPreparationChecklist()
    .filter((item) => item.required && !item.complete)
    .map((item) => ({
      id: item.id,
      label: item.label,
      category: item.stage,
      riskLevel: "critical",
      reason: item.details,
      requiredAction: item.nextAction || "Resolve this final launch preparation item."
    }));
}

export function getFinalLaunchPreparationPercentage(): number {
  const checklist = getFinalLaunchPreparationChecklist();
  const required = checklist.filter((item) => item.required);
  const completed = required.filter((item) => item.complete);

  return Math.round((completed.length / Math.max(1, required.length)) * 100);
}

export function createFinalLaunchPreparationDecision(): TeoyubeFinalLaunchDecision {
  const blockers = getFinalLaunchPreparationBlockers();
  const percentage = getFinalLaunchPreparationPercentage();

  if (blockers.some((item) => item.category.includes("safety"))) return "needs_safety_fix";
  if (blockers.some((item) => item.category.includes("qa"))) return "needs_qa_fix";
  if (blockers.some((item) => item.category.includes("environment"))) return "needs_environment_fix";
  if (blockers.length > 0) return "blocked";
  return percentage === 100 ? "ready_for_manual_preview_deployment" : "needs_qa_fix";
}

export function createFinalLaunchPreparationReport(): TeoyubeFinalLaunchPreparationReport {
  const checks = getFinalLaunchPreparationChecklist();
  const missingItems = getFinalLaunchPreparationMissingItems();
  const blockers = getFinalLaunchPreparationBlockers();
  const warnings = getFinalLaunchPreparationWarnings();
  const completionPercentage = getFinalLaunchPreparationPercentage();
  const decision = createFinalLaunchPreparationDecision();

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    decision,
    checks,
    completedItems: checks.filter((item) => item.complete).map((item) => item.id),
    missingItems,
    blockers,
    warnings,
    nextRecommendedStep: "Manual Preview Deployment Execution",
    generatedAt: new Date().toISOString()
  };
}

export function runFinalLaunchPreparationAudit(): TeoyubeFinalLaunchPreparationReport {
  return createFinalLaunchPreparationReport();
}
