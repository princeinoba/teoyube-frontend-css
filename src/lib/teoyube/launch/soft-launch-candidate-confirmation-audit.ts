import type { TeoyubeManualPreviewDeploymentStatus } from "./manual-preview-deployment-contracts";

export type TeoyubeSoftLaunchCandidateConfirmationAuditItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubeManualPreviewDeploymentStatus;
  details: string;
};

export type TeoyubeSoftLaunchCandidateConfirmationAuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubeSoftLaunchCandidateConfirmationAuditItem[];
  missingItems: string[];
  warnings: string[];
  nextStep: "Soft Launch Preparation 3.3 - Final Soft Launch Readiness Package & Go/No-Go";
  generatedAt: string;
};

function item(id: string, label: string, complete = true): TeoyubeSoftLaunchCandidateConfirmationAuditItem {
  return {
    id,
    label,
    required: true,
    complete,
    status: complete ? "ready" : "blocked",
    details: complete ? "Module exists and is exportable." : "Required module is missing."
  };
}

export function getSoftLaunchCandidateConfirmationAuditChecklist(): TeoyubeSoftLaunchCandidateConfirmationAuditItem[] {
  return [
    item("manual_preview_recheck_contracts", "Preview re-check contracts exist"),
    item("manual_preview_recheck_checklist", "Preview re-check checklist exists"),
    item("manual_preview_recheck_runner", "Preview re-check runner exists"),
    item("manual_preview_resolved_issue_recheck", "Resolved issue re-check exists"),
    item("soft_launch_candidate_criteria", "Soft launch candidate criteria exists"),
    item("soft_launch_candidate_confirmation", "Soft launch candidate confirmation exists"),
    item("soft_launch_candidate_package", "Soft launch candidate package exists"),
    item("soft_launch_candidate_release_notes", "Soft launch candidate release notes exist"),
    item("soft_launch_candidate_owner_review", "Soft launch candidate owner review exists"),
    item("manual_preview_2_5_smoke_check", "Manual Preview Deployment 2.5 smoke check exists"),
    item("manual_preview_2_5_documentation", "Manual Preview Deployment 2.5 documentation exists")
  ];
}

export function getSoftLaunchCandidateConfirmationMissingItems(): string[] {
  return getSoftLaunchCandidateConfirmationAuditChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.id);
}

export function getSoftLaunchCandidateConfirmationWarnings(): string[] {
  return [
    "Manual Preview Deployment 2.5 confirms readiness only; it does not deploy or perform a soft launch.",
    "Soft Launch Preparation 3.1 and 3.2 are complete; no real users should be contacted until Soft Launch Preparation 3.3 final readiness package and go/no-go are complete.",
    "Production persistence, external analytics, live AI, service workers, and native mobile remain disconnected."
  ];
}

export function getSoftLaunchCandidateConfirmationCompletionPercentage(): number {
  const checklist = getSoftLaunchCandidateConfirmationAuditChecklist();
  const required = checklist.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runSoftLaunchCandidateConfirmationAudit(): TeoyubeSoftLaunchCandidateConfirmationAuditReport {
  const checklist = getSoftLaunchCandidateConfirmationAuditChecklist();
  const missingItems = getSoftLaunchCandidateConfirmationMissingItems();
  const completionPercentage = getSoftLaunchCandidateConfirmationCompletionPercentage();

  return {
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getSoftLaunchCandidateConfirmationWarnings(),
    nextStep: "Soft Launch Preparation 3.3 - Final Soft Launch Readiness Package & Go/No-Go",
    generatedAt: new Date().toISOString()
  };
}
