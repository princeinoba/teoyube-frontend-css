import { createDryRunIssueTriageReport, isDryRunBlockingIssue } from "./dry-run-issue-triage";
import type { TeoyubeDryRunIssue, TeoyubeDryRunIssueCategory } from "./dry-run-issue-triage-contracts";

export type TeoyubeDryRunPauseRollbackDecision =
  | "continue_dry_run"
  | "pause_dry_run"
  | "rollback_dry_run"
  | "owner_review_required";

export type TeoyubeDryRunPauseRollbackCriterion = {
  id: string;
  label: string;
  category: TeoyubeDryRunIssueCategory;
  action: "pause" | "rollback" | "owner_review";
  required: true;
  details: string;
};

export type TeoyubeDryRunPauseRollbackSimulation = {
  id: string;
  issues: TeoyubeDryRunIssue[];
  pauseCriteria: TeoyubeDryRunPauseRollbackCriterion[];
  rollbackCriteria: TeoyubeDryRunPauseRollbackCriterion[];
  decision: TeoyubeDryRunPauseRollbackDecision;
  matchedCriteria: TeoyubeDryRunPauseRollbackCriterion[];
  simulatedOnly: true;
  manualOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noExternalSend: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeDryRunPauseRollbackReport = {
  valid: boolean;
  simulation: TeoyubeDryRunPauseRollbackSimulation;
  blockers: string[];
  warnings: string[];
  decision: TeoyubeDryRunPauseRollbackDecision;
  simulatedOnly: true;
  manualOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noExternalSend: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

function criterion(
  id: string,
  label: string,
  category: TeoyubeDryRunIssueCategory,
  action: TeoyubeDryRunPauseRollbackCriterion["action"],
  details: string
): TeoyubeDryRunPauseRollbackCriterion {
  return { id, label, category, action, required: true, details };
}

export function getDryRunPauseCriteria(): TeoyubeDryRunPauseRollbackCriterion[] {
  return [
    criterion("privacy_consent_pause", "Privacy or consent issue appears", "privacy_consent_issue", "pause", "Pause until privacy/consent copy or workflow is corrected."),
    criterion("scripture_anchor_pause", "Scripture anchor is missing", "scripture_anchor_missing", "pause", "Pause the affected surface until Scripture support is visible or clearly flagged."),
    criterion("explanation_trace_pause", "Explanation trace is missing", "explanation_trace_missing", "pause", "Pause the affected flow until the explanation path is visible."),
    criterion("confidence_label_pause", "Confidence label is missing", "confidence_label_missing", "pause", "Pause the affected recommendation flow until humble confidence labeling is visible."),
    criterion("mobile_accessibility_pause", "Mobile or accessibility blocker appears", "mobile_issue", "pause", "Pause the affected scenario until mobile-safe access is restored.")
  ];
}

export function getDryRunRollbackCriteria(): TeoyubeDryRunPauseRollbackCriterion[] {
  return [
    criterion("unsafe_fallback_rollback", "Unsafe fallback appears", "unsafe_fallback", "rollback", "Rollback the affected dry-run change until safe fallback behavior is restored."),
    criterion("review_only_content_rollback", "Review-only content is visible", "review_only_content_visible", "rollback", "Rollback the affected surface until review-only content is hidden from live flows."),
    criterion("disabled_service_rollback", "Disabled service is active", "disabled_service_issue", "rollback", "Rollback the affected change until disabled services are confirmed off."),
    criterion("debug_payload_rollback", "Debug payload is visible", "debug_payload_visible", "rollback", "Rollback the affected surface until internal payloads are hidden."),
    criterion("divine_certainty_rollback", "Divine-certainty language appears", "divine_certainty_language", "rollback", "Rollback copy until devotional humility and no-divine-certainty language is restored."),
    criterion("professional_advice_rollback", "Professional-advice language appears", "professional_advice_language", "rollback", "Rollback copy until medical, legal, financial, and counseling advice boundaries are restored.")
  ];
}

function criteriaForIssues(issues: TeoyubeDryRunIssue[]): TeoyubeDryRunPauseRollbackCriterion[] {
  const criteria = [...getDryRunPauseCriteria(), ...getDryRunRollbackCriteria()];
  return criteria.filter((entry) => issues.some((issue) => issue.category === entry.category && issue.status !== "resolved"));
}

export function simulateDryRunRollbackDecision(issues: TeoyubeDryRunIssue[] = []): TeoyubeDryRunPauseRollbackDecision {
  const triage = createDryRunIssueTriageReport(issues);
  const rollbackCategories = new Set(getDryRunRollbackCriteria().map((entry) => entry.category));
  return triage.issues.some((issue) => rollbackCategories.has(issue.category) && isDryRunBlockingIssue(issue))
    ? "rollback_dry_run"
    : "continue_dry_run";
}

export function simulateDryRunPauseDecision(issues: TeoyubeDryRunIssue[] = []): TeoyubeDryRunPauseRollbackDecision {
  if (simulateDryRunRollbackDecision(issues) === "rollback_dry_run") return "rollback_dry_run";
  const triage = createDryRunIssueTriageReport(issues);
  const pauseCategories = new Set(getDryRunPauseCriteria().map((entry) => entry.category));
  if (triage.issues.some((issue) => pauseCategories.has(issue.category) && isDryRunBlockingIssue(issue))) return "pause_dry_run";
  if (triage.warnings.length) return "owner_review_required";
  return "continue_dry_run";
}

export function createDryRunPauseRollbackSimulation(issues: TeoyubeDryRunIssue[] = []): TeoyubeDryRunPauseRollbackSimulation {
  const triagedIssues = createDryRunIssueTriageReport(issues).issues;
  const matchedCriteria = criteriaForIssues(triagedIssues);
  return {
    id: "phase_6_2_dry_run_pause_rollback_simulation",
    issues: triagedIssues,
    pauseCriteria: getDryRunPauseCriteria(),
    rollbackCriteria: getDryRunRollbackCriteria(),
    decision: simulateDryRunPauseDecision(triagedIssues),
    matchedCriteria,
    simulatedOnly: true,
    manualOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noExternalSend: true,
    inMemoryOnly: true,
    createdAt: now()
  };
}

export function createDryRunPauseRollbackReport(issues: TeoyubeDryRunIssue[] = []): TeoyubeDryRunPauseRollbackReport {
  const simulation = createDryRunPauseRollbackSimulation(issues);
  const blockers = simulation.decision === "rollback_dry_run" || simulation.decision === "pause_dry_run"
    ? simulation.matchedCriteria.map((entry) => `${entry.label}: ${entry.details}`)
    : [];
  return {
    valid: blockers.length === 0,
    simulation,
    blockers,
    warnings: simulation.decision === "owner_review_required" ? ["Dry-run issue warnings require manual owner review before proceeding."] : [],
    decision: simulation.decision,
    simulatedOnly: true,
    manualOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
