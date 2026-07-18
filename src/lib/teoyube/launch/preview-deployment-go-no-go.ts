import { createLaunchEnvironmentSafetyReport } from "./launch-environment-safety-audit";
import { createLaunchQaReadinessReport } from "./launch-qa-checklist";
import { createLaunchQualityGateReport } from "./launch-quality-gates";
import { createPredeploymentSafetyGateReport } from "./predeployment-safety-gates";
import type { TeoyubePreviewDeploymentGoNoGoDecision } from "./preview-deployment-execution-contracts";
import { createPreviewDeploymentIssueLog, getPreviewDeploymentBlockingIssues, type TeoyubePreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import { runPreviewDeploymentExecutionAudit } from "./preview-deployment-execution-audit";
import { createPreviewDeploymentPreflightReport, type TeoyubePreviewDeploymentPreflightState } from "./preview-deployment-preflight";
import { createPreviewRollbackReport, type TeoyubePreviewRollbackState } from "./preview-rollback-execution-checklist";

export type TeoyubePreviewDeploymentGoNoGoState = {
  preflight?: TeoyubePreviewDeploymentPreflightState;
  issueLog?: TeoyubePreviewDeploymentIssueLog;
  rollback?: TeoyubePreviewRollbackState;
  buildVerificationPassed?: boolean;
  manualReviewCompleted?: boolean;
};

export function createPreviewDeploymentGoNoGoChecklist(state: TeoyubePreviewDeploymentGoNoGoState = {}) {
  const preflight = createPreviewDeploymentPreflightReport(state.preflight);
  const gates = createLaunchQualityGateReport();
  const safety = createPredeploymentSafetyGateReport();
  const audit = runPreviewDeploymentExecutionAudit();
  const qa = createLaunchQaReadinessReport();
  const environment = createLaunchEnvironmentSafetyReport();
  const issueLog = state.issueLog || createPreviewDeploymentIssueLog();
  const rollback = createPreviewRollbackReport(state.rollback);

  return [
    { id: "preflight", label: "Preflight result", passed: preflight.valid, details: preflight.decision },
    { id: "build_verification", label: "Build verification status", passed: state.buildVerificationPassed !== false, details: "Build must pass or be documented before manual deployment." },
    { id: "launch_quality_gates", label: "Launch quality gates", passed: gates.readyForLaunchPreparation, details: gates.status },
    { id: "predeployment_safety", label: "Predeployment safety gates", passed: safety.valid, details: safety.status },
    { id: "preview_execution_audit", label: "Preview execution audit", passed: audit.complete, details: `${audit.completionPercentage}% complete` },
    { id: "qa_readiness", label: "QA readiness", passed: qa.valid, details: `${qa.checkCount} QA checks defined` },
    { id: "environment_safety", label: "Environment safety audit", passed: environment.valid, details: `${environment.errors.length} errors` },
    { id: "issue_log", label: "Issue log blocking items", passed: getPreviewDeploymentBlockingIssues(issueLog).length === 0, details: `${issueLog.issues.length} issue(s) recorded` },
    { id: "rollback_plan", label: "Rollback plan", passed: rollback.checklistCount > 0, details: "Rollback checklist exists" }
  ];
}

export function getPreviewDeploymentGoNoGoReasons(state: TeoyubePreviewDeploymentGoNoGoState = {}): string[] {
  return createPreviewDeploymentGoNoGoChecklist(state).map((item) =>
    item.passed ? `${item.label} passed: ${item.details}.` : `${item.label} needs review: ${item.details}.`
  );
}

export function evaluatePreviewDeploymentGoNoGo(
  state: TeoyubePreviewDeploymentGoNoGoState = {}
): TeoyubePreviewDeploymentGoNoGoDecision {
  const checklist = createPreviewDeploymentGoNoGoChecklist(state);
  const failed = checklist.filter((item) => !item.passed);

  if (failed.some((item) => item.id === "preflight" && item.details === "blocked")) {
    return "no_go_blocked";
  }
  if (failed.some((item) => item.id === "build_verification")) {
    return "needs_build_fix";
  }
  if (failed.some((item) => item.id === "environment_safety")) {
    return "needs_environment_fix";
  }
  if (failed.some((item) => item.id === "qa_readiness" || item.id === "launch_quality_gates")) {
    return "needs_qa_fix";
  }
  if (failed.length > 0 || !state.manualReviewCompleted) {
    return "go_after_manual_review";
  }

  return "go_for_preview_deployment";
}

export function getPreviewDeploymentGoNoGoNextActions(state: TeoyubePreviewDeploymentGoNoGoState = {}): string[] {
  const decision = evaluatePreviewDeploymentGoNoGo(state);

  if (decision === "go_for_preview_deployment") {
    return ["Execute the preview deployment manually using the approved execution checklist."];
  }

  if (decision === "go_after_manual_review") {
    return ["Complete manual review, record build/smoke outcomes, and confirm rollback readiness before preview deployment."];
  }

  return ["Resolve blocking build, environment, QA, safety, or issue-log items before preview deployment."];
}

export function createPreviewDeploymentGoNoGoReport(state: TeoyubePreviewDeploymentGoNoGoState = {}) {
  const checklist = createPreviewDeploymentGoNoGoChecklist(state);
  const decision = evaluatePreviewDeploymentGoNoGo(state);

  return {
    decision,
    ready: decision === "go_for_preview_deployment" || decision === "go_after_manual_review",
    checklist,
    passedCount: checklist.filter((item) => item.passed).length,
    checklistCount: checklist.length,
    reasons: getPreviewDeploymentGoNoGoReasons(state),
    nextActions: getPreviewDeploymentGoNoGoNextActions(state),
    actualDeploymentCompleted: false,
    generatedAt: new Date().toISOString()
  };
}

