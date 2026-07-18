import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import { createPredeploymentSafetyGateReport } from "./predeployment-safety-gates";
import { createPreviewDeploymentIssueLog, type TeoyubePreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import { createPreviewDeploymentReviewReport } from "./preview-deployment-review";
import { createPreviewIssueTriageReport } from "./preview-issue-triage";
import { createDefaultPreviewQaReviewRun, createPreviewQaResultReport, type TeoyubePreviewQaReviewRun } from "./preview-qa-result-collector";
import { createPreviewSafetyReviewReport, type TeoyubePreviewSafetyReviewInput } from "./preview-safety-review";
import { createReleaseCandidateReport } from "./release-candidate-report";
import { createPreviewRollbackReport, type TeoyubePreviewRollbackState } from "./preview-rollback-execution-checklist";
import { createSoftLaunchManualApprovalRecord, type TeoyubeSoftLaunchManualApprovalInput } from "./soft-launch-manual-approval";
import type {
  TeoyubePreviewDeploymentReviewInput,
  TeoyubeSoftLaunchBlocker,
  TeoyubeSoftLaunchGoNoGoDecision,
  TeoyubeSoftLaunchWarning
} from "./preview-deployment-review-contracts";

export type TeoyubeSoftLaunchGoNoGoInput = {
  review?: TeoyubePreviewDeploymentReviewInput;
  qaRun?: TeoyubePreviewQaReviewRun;
  safety?: TeoyubePreviewSafetyReviewInput;
  issueLog?: TeoyubePreviewDeploymentIssueLog;
  rollback?: TeoyubePreviewRollbackState;
  manualApproval?: TeoyubeSoftLaunchManualApprovalInput;
};

function blocker(id: string, reason: string, requiredAction: string): TeoyubeSoftLaunchBlocker {
  return { id, reason, requiredAction };
}

function warning(id: string, message: string, recommendedAction: string): TeoyubeSoftLaunchWarning {
  return { id, message, recommendedAction };
}

export function createSoftLaunchGoNoGoChecklist(input: TeoyubeSoftLaunchGoNoGoInput = {}) {
  const review = createPreviewDeploymentReviewReport(input.review);
  const qa = createPreviewQaResultReport(input.qaRun || createDefaultPreviewQaReviewRun());
  const safety = createPreviewSafetyReviewReport(input.safety);
  const issueLog = input.issueLog || createPreviewDeploymentIssueLog();
  const triage = createPreviewIssueTriageReport(issueLog);
  const rollback = createPreviewRollbackReport(input.rollback);
  const surfaces = createLaunchSurfaceReadinessReport();
  const predeployment = createPredeploymentSafetyGateReport();
  const gates = {
    readyForLaunchPreparation: predeployment.valid && surfaces.blockers.length === 0,
    status: predeployment.valid && surfaces.blockers.length === 0 ? "ready_to_begin" : "needs_review"
  };
  const releaseCandidate = createReleaseCandidateReport();
  const approval = createSoftLaunchManualApprovalRecord(input.manualApproval);

  return [
    { id: "preview_review", label: "Preview deployment review", passed: review.valid, details: review.decision },
    { id: "preview_qa", label: "Preview QA result", passed: qa.valid, details: `${qa.blockerCount} blocker(s)` },
    { id: "preview_safety", label: "Preview safety review", passed: safety.valid, details: safety.status },
    { id: "issue_triage", label: "Issue triage", passed: triage.valid, details: `${triage.criticalIssues.length} critical issue(s)` },
    { id: "rollback", label: "Rollback readiness", passed: rollback.checklistCount > 0, details: "Rollback checklist exists" },
    { id: "surfaces", label: "Surface readiness", passed: surfaces.blockers.length === 0, details: `${surfaces.surfaceCount} surface(s)` },
    { id: "quality_gates", label: "Launch quality gates", passed: gates.readyForLaunchPreparation, details: gates.status },
    { id: "predeployment_safety", label: "Predeployment safety gates", passed: predeployment.valid, details: predeployment.status },
    { id: "release_candidate", label: "Release candidate report", passed: Boolean(releaseCandidate.status), details: releaseCandidate.status },
    { id: "manual_approval", label: "Manual approval status", passed: approval.approved, details: approval.approved ? "approved" : "pending" }
  ];
}

export function getSoftLaunchGoNoGoBlockers(input: TeoyubeSoftLaunchGoNoGoInput = {}): TeoyubeSoftLaunchBlocker[] {
  return createSoftLaunchGoNoGoChecklist(input)
    .filter((item) => !item.passed && item.id !== "manual_approval")
    .map((item) => blocker(item.id, `${item.label} is not ready: ${item.details}.`, "Resolve this item before soft-launch candidacy."));
}

export function getSoftLaunchGoNoGoWarnings(input: TeoyubeSoftLaunchGoNoGoInput = {}): TeoyubeSoftLaunchWarning[] {
  return createSoftLaunchGoNoGoChecklist(input)
    .filter((item) => !item.passed && item.id === "manual_approval")
    .map((item) => warning(item.id, `${item.label} is pending.`, "Complete manual approval before an actual soft launch."));
}

export function evaluateSoftLaunchGoNoGo(input: TeoyubeSoftLaunchGoNoGoInput = {}): TeoyubeSoftLaunchGoNoGoDecision {
  const blockers = getSoftLaunchGoNoGoBlockers(input);
  const warnings = getSoftLaunchGoNoGoWarnings(input);

  if (blockers.some((entry) => entry.id === "preview_safety")) {
    return "needs_safety_fix";
  }
  if (blockers.some((entry) => entry.id === "preview_qa" || entry.id === "surfaces")) {
    return "needs_qa_fix";
  }
  if (blockers.some((entry) => entry.id === "preview_review" || entry.id === "issue_triage")) {
    return "needs_preview_fix";
  }
  if (blockers.length > 0) {
    return "no_go_blocked";
  }

  return warnings.length > 0 ? "go_after_manual_review" : "go_for_soft_launch_candidate";
}

export function getSoftLaunchGoNoGoReasons(input: TeoyubeSoftLaunchGoNoGoInput = {}): string[] {
  return createSoftLaunchGoNoGoChecklist(input).map((item) =>
    item.passed ? `${item.label} passed: ${item.details}.` : `${item.label} needs review: ${item.details}.`
  );
}

export function getSoftLaunchGoNoGoNextActions(input: TeoyubeSoftLaunchGoNoGoInput = {}): string[] {
  const decision = evaluateSoftLaunchGoNoGo(input);

  if (decision === "go_for_soft_launch_candidate") {
    return ["Proceed to Production Launch Preparation 1.9 - Final Launch Preparation Audit."];
  }
  if (decision === "go_after_manual_review") {
    return ["Complete manual approval and final owner review before soft-launch candidacy."];
  }
  return ["Resolve preview, QA, safety, issue, or rollback blockers before proceeding."];
}

export function createSoftLaunchGoNoGoReport(input: TeoyubeSoftLaunchGoNoGoInput = {}) {
  const blockers = getSoftLaunchGoNoGoBlockers(input);
  const warnings = getSoftLaunchGoNoGoWarnings(input);
  const decision = evaluateSoftLaunchGoNoGo(input);
  const issueLog = input.issueLog || createPreviewDeploymentIssueLog();

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision,
    ready: decision === "go_for_soft_launch_candidate" || decision === "go_after_manual_review",
    blockers,
    warnings,
    reasons: getSoftLaunchGoNoGoReasons(input),
    nextActions: getSoftLaunchGoNoGoNextActions(input),
    relatedIssues: issueLog.issues,
    manualApproval: createSoftLaunchManualApprovalRecord(input.manualApproval),
    actualSoftLaunchPerformed: false,
    generatedAt: new Date().toISOString()
  };
}
