import { createLaunchDecision } from "../launch-decision-helper";
import { createLaunchEnvironmentReport } from "../launch-environment-checklist";
import { createLaunchQualityGateReport } from "../launch-quality-gates";
import { createLaunchSafetyReviewReport } from "../launch-safety-review";
import { createLaunchSurfaceReadinessReport } from "../launch-surface-readiness-report";
import { runProductionLaunchReadinessAudit } from "../production-launch-readiness-audit";

export type ProductionLaunchReadinessSmokeCheckResult = {
  valid: boolean;
  errors: string[];
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runProductionLaunchReadinessSmokeCheck(): ProductionLaunchReadinessSmokeCheckResult {
  const audit = runProductionLaunchReadinessAudit();
  const environment = createLaunchEnvironmentReport();
  const safety = createLaunchSafetyReviewReport();
  const surfaces = createLaunchSurfaceReadinessReport();
  const gates = createLaunchQualityGateReport();
  const decision = createLaunchDecision(audit);
  const errors = clean([
    audit.stage === "pre_launch_audit" ? "" : "Audit should run in pre_launch_audit stage.",
    audit.blockers.length === 0 ? "" : "Audit should not have critical blockers.",
    audit.safetyStatus.scriptureAnchoring ? "" : "Scripture anchoring should pass.",
    audit.safetyStatus.explanationPaths ? "" : "Explanation paths should pass.",
    audit.safetyStatus.fallbackSafety ? "" : "Fallback safety should pass.",
    audit.safetyStatus.noExternalSending ? "" : "External sending should be disabled.",
    environment.status !== "blocked" ? "" : "Environment should not be blocked.",
    safety.valid ? "" : "Launch safety review should pass.",
    surfaces.surfaceCount >= 12 ? "" : "Surface readiness should cover launch surfaces.",
    gates.gateCount > 0 ? "" : "Quality gates should exist.",
    [
      "ready_for_launch_preparation",
      "ready_for_deployment_dry_run",
      "ready_for_preview_deployment",
      "ready_for_preview_manual_review",
      "ready_for_preview_deployment_execution",
      "go_for_preview_deployment",
      "go_after_manual_review",
      "ready_for_soft_launch_candidate",
      "ready_after_manual_review",
      "ready_for_soft_launch_runbook_review",
      "ready_for_final_launch_preparation_audit",
      "ready_for_manual_preview_deployment",
      "ready_for_manual_provider_deployment",
      "ready_after_environment_review",
      "ready_for_postdeployment_qa",
      "ready_for_preview_issue_triage",
      "ready_for_safe_fix_implementation",
      "ready_for_preview_recheck",
      "ready_for_soft_launch_preparation",
      "ready_for_soft_launch_dry_run_review",
      "ready_for_final_soft_launch_readiness_package",
      "go_for_limited_soft_launch_execution",
      "ready_after_owner_review"
    ].includes(decision.label)
      ? ""
      : "Decision should be ready for launch preparation, deployment dry run, preview deployment, preview execution, manual review, soft-launch candidacy, soft launch preparation, soft launch dry run review, or final soft launch readiness package."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    generatedAt: new Date().toISOString()
  };
}
