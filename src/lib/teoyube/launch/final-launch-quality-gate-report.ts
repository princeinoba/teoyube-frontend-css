import type {
  TeoyubeFinalLaunchDecision,
  TeoyubeFinalLaunchPreparationWarning,
  TeoyubeFinalLaunchQualityGateStatus
} from "./final-launch-preparation-contracts";
import { createFinalLaunchSafetyCertificationReport } from "./final-launch-safety-certification";
import { createFinalLaunchSurfaceCertificationReport } from "./final-launch-surface-certification";
import { runFinalLaunchPreparationAudit } from "./final-launch-preparation-audit";
import { createAccessibilityAuditReport } from "./launch-accessibility-audit";
import { createLaunchQaReadinessReport } from "./launch-qa-checklist";
import { createLaunchSafetyReviewReport } from "./launch-safety-review";
import { createMobileQaReport } from "./launch-mobile-qa";
import { createPredeploymentSafetyGateReport } from "./predeployment-safety-gates";
import { runPreviewDeploymentExecutionAudit } from "./preview-deployment-execution-audit";
import { runPreviewDeploymentReadinessAudit } from "./preview-deployment-readiness-audit";
import { runPreviewReviewSoftLaunchAudit } from "./preview-review-soft-launch-audit";
import { runSoftLaunchRunbookAudit } from "./soft-launch-runbook-audit";
import { createSoftLaunchFeedbackIntakeReport, createSoftLaunchFeedbackLog } from "./soft-launch-feedback-intake";

export type TeoyubeFinalLaunchQualityGateReport = {
  status: "ready" | "ready_with_warnings" | "blocked";
  ready: boolean;
  decision: TeoyubeFinalLaunchDecision;
  gateCount: number;
  passedGateCount: number;
  gates: TeoyubeFinalLaunchQualityGateStatus[];
  blockers: TeoyubeFinalLaunchQualityGateStatus[];
  warnings: TeoyubeFinalLaunchPreparationWarning[];
  generatedAt: string;
};

function gate(
  id: string,
  label: string,
  passed: boolean,
  details: string,
  category: TeoyubeFinalLaunchQualityGateStatus["category"],
  required = true
): TeoyubeFinalLaunchQualityGateStatus {
  return {
    id,
    label,
    status: passed ? "ready" : "needs_review",
    required,
    passed,
    riskLevel: passed ? "low" : required ? "high" : "medium",
    details,
    category,
    nextAction: passed ? undefined : "Resolve or document this final launch quality gate."
  };
}

function warning(id: string, message: string): TeoyubeFinalLaunchPreparationWarning {
  return {
    id,
    label: id.replace(/_/g, " "),
    category: "final_quality",
    riskLevel: "medium",
    message,
    recommendedAction: "Document this item in the final manual preview deployment checklist."
  };
}

export function getFinalLaunchQualityGates(): TeoyubeFinalLaunchQualityGateStatus[] {
  const audit = runFinalLaunchPreparationAudit();
  const safety = createLaunchSafetyReviewReport();
  const qa = createLaunchQaReadinessReport();
  const accessibility = createAccessibilityAuditReport();
  const mobile = createMobileQaReport();
  const predeployment = createPredeploymentSafetyGateReport();
  const previewReadiness = runPreviewDeploymentReadinessAudit();
  const previewExecution = runPreviewDeploymentExecutionAudit();
  const previewReview = runPreviewReviewSoftLaunchAudit();
  const runbook = runSoftLaunchRunbookAudit();
  const feedback = createSoftLaunchFeedbackIntakeReport(createSoftLaunchFeedbackLog());
  const finalSafety = createFinalLaunchSafetyCertificationReport();
  const finalSurface = createFinalLaunchSurfaceCertificationReport();

  return [
    gate("final_typecheck_status", "Typecheck status documented", true, "Final operator checks must run npm run typecheck when available or document the missing script.", "cli", false),
    gate("final_lint_status", "Lint status documented", true, "Final operator checks must run npm run lint when available or document the missing script.", "cli", false),
    gate("final_build_status", "Build status documented", true, "Final operator checks must run npm run build before manual preview deployment.", "cli", false),
    gate("final_test_smoke_status", "Test or smoke status documented", true, "Final operator checks must run npm run test when available and launch smoke checks.", "cli", false),
    gate("final_launch_readiness_audit", "Final launch preparation audit", audit.ready && audit.completionPercentage === 100, "Final audit returns 100% structural readiness.", "readiness"),
    gate("launch_safety_review", "Launch safety review", safety.valid, "Launch safety review passes.", "safety"),
    gate("launch_qa_status", "Launch QA status", qa.valid && qa.blockerCount === 0, "Launch QA checklist has no default blockers.", "qa"),
    gate("accessibility_qa_status", "Accessibility QA status", accessibility.valid && accessibility.blockerCount === 0, "Accessibility QA has no default blockers.", "qa"),
    gate("mobile_qa_status", "Mobile QA status", mobile.valid && mobile.blockerCount === 0, "Mobile QA has no default blockers.", "qa"),
    gate("predeployment_safety_gates", "Predeployment safety gates", predeployment.valid, "Predeployment safety gates pass.", "safety"),
    gate("preview_deployment_readiness", "Preview deployment readiness", previewReadiness.complete && previewReadiness.completionPercentage === 100, "Preview deployment readiness audit is complete.", "readiness"),
    gate("preview_execution_readiness", "Preview execution readiness", previewExecution.complete && previewExecution.completionPercentage === 100, "Preview execution audit is complete.", "readiness"),
    gate("soft_launch_runbook_readiness", "Soft launch runbook readiness", runbook.complete && runbook.completionPercentage === 100, "Soft launch runbook audit is complete.", "soft_launch"),
    gate("feedback_intake_readiness", "Feedback intake readiness", feedback.valid && feedback.inMemoryOnly, "Feedback intake remains manual and in-memory.", "soft_launch"),
    gate("preview_review_soft_launch_readiness", "Preview review soft launch readiness", previewReview.complete && previewReview.completionPercentage === 100, "Preview review soft launch audit is complete.", "readiness"),
    gate("final_safety_certification", "Final safety certification", finalSafety.valid, "Final safety certification passes.", "final"),
    gate("final_surface_certification", "Final surface certification", finalSurface.ready, "Final surface certification passes.", "final")
  ];
}

export function getFinalLaunchQualityGateBlockers(): TeoyubeFinalLaunchQualityGateStatus[] {
  return getFinalLaunchQualityGates().filter((gateToCheck) => gateToCheck.required && !gateToCheck.passed);
}

export function getFinalLaunchQualityGateWarnings(): TeoyubeFinalLaunchPreparationWarning[] {
  return [
    warning("cli_checks_are_operator_run", "Typecheck, lint, build, and test/smoke status gates are documented by this module but must be run from the CLI before real preview deployment."),
    warning("final_gate_report_does_not_deploy", "Final quality gates do not deploy, contact users, write files, or connect providers.")
  ];
}

export function createFinalLaunchQualityGateDecision(): TeoyubeFinalLaunchDecision {
  const blockers = getFinalLaunchQualityGateBlockers();

  if (blockers.some((entry) => entry.category === "safety")) return "needs_safety_fix";
  if (blockers.some((entry) => entry.category === "qa")) return "needs_qa_fix";
  if (blockers.length > 0) return "blocked";
  return "ready_for_manual_preview_deployment";
}

export function validateFinalLaunchQualityGates(): TeoyubeFinalLaunchQualityGateReport {
  return createFinalLaunchQualityGateReport();
}

export function createFinalLaunchQualityGateReport(): TeoyubeFinalLaunchQualityGateReport {
  const gates = getFinalLaunchQualityGates();
  const blockers = getFinalLaunchQualityGateBlockers();
  const warnings = getFinalLaunchQualityGateWarnings();
  const decision = createFinalLaunchQualityGateDecision();

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0,
    decision,
    gateCount: gates.length,
    passedGateCount: gates.filter((entry) => entry.passed).length,
    gates,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}
