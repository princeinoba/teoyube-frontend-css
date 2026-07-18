import type { TeoyubeLimitedSoftLaunchDryRunStep } from "./limited-soft-launch-dry-run-contracts";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";

export type TeoyubeLimitedSoftLaunchDayRehearsalResult = {
  id: string;
  stepId: string;
  passed: boolean;
  summary: string;
  manualOnly: true;
};

export type TeoyubeLimitedSoftLaunchDayRehearsalPlan = {
  id: string;
  label: string;
  checklist: TeoyubeLimitedSoftLaunchDryRunStep[];
  results: TeoyubeLimitedSoftLaunchDayRehearsalResult[];
  actualLaunchPerformed: false;
  usersContacted: false;
  previewUrlFetched: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchDayRehearsalReport = {
  valid: boolean;
  plan: TeoyubeLimitedSoftLaunchDayRehearsalPlan;
  checklistCount: number;
  passedCount: number;
  blockers: string[];
  warnings: string[];
  noActualLaunchPerformed: true;
  noUsersContacted: true;
  noPreviewUrlFetched: true;
  generatedAt: string;
};

function step(id: string, label: string, details: string): TeoyubeLimitedSoftLaunchDryRunStep {
  return {
    id,
    label,
    phase: "launch_day_rehearsal",
    required: true,
    complete: true,
    manualOnly: true,
    details
  };
}

export function getLimitedSoftLaunchDayRehearsalChecklist(): TeoyubeLimitedSoftLaunchDryRunStep[] {
  return [
    step("runbook_exists", "Launch day runbook exists", "The 3.1 launch day runbook is available."),
    step("preview_url_manual_only", "Preview URL review remains manual", "Code does not fetch preview URLs."),
    step("surface_checks_ready", "Surface checks are ready", "Required soft launch surfaces have manual review coverage."),
    step("feedback_workflow_ready", "Feedback workflow is ready", "Manual feedback workflow is prepared."),
    step("issue_triage_ready", "Issue triage workflow is ready", "Triage routes launch-critical issues to owner review."),
    step("rollback_criteria_visible", "Rollback criteria are visible", "Pause and rollback criteria are documented."),
    step("owner_review_ready", "Owner review is ready", "Owner review checklist is available."),
    step("no_users_contacted_by_code", "No users contacted by code", "The rehearsal sends no invitations."),
    step("no_launch_action_by_code", "No launch action by code", "The rehearsal performs no launch action.")
  ];
}

export function createLaunchDayRehearsalPlan(
  results?: TeoyubeLimitedSoftLaunchDayRehearsalResult[]
): TeoyubeLimitedSoftLaunchDayRehearsalPlan {
  const checklist = getLimitedSoftLaunchDayRehearsalChecklist();

  return {
    id: "limited_soft_launch_day_rehearsal",
    label: "Limited Soft Launch Day Rehearsal",
    checklist,
    results: results || checklist.map((entry) => ({
      id: `${entry.id}_result`,
      stepId: entry.id,
      passed: true,
      summary: `${entry.label} rehearsed manually.`,
      manualOnly: true
    })),
    actualLaunchPerformed: false,
    usersContacted: false,
    previewUrlFetched: false,
    generatedAt: new Date().toISOString()
  };
}

export function getLaunchDayRehearsalBlockers(results: TeoyubeLimitedSoftLaunchDayRehearsalResult[] = []): string[] {
  const plan = createLaunchDayRehearsalPlan(results.length ? results : undefined);
  const runbookReport = createLimitedSoftLaunchDayRunbookReport();

  return [
    runbookReport.valid ? "" : "Launch day runbook must be valid.",
    plan.results.every((entry) => entry.passed) ? "" : "All launch day rehearsal checks must pass.",
    plan.actualLaunchPerformed ? "Launch day rehearsal must not perform launch actions." : "",
    plan.usersContacted ? "Launch day rehearsal must not contact users." : "",
    plan.previewUrlFetched ? "Launch day rehearsal must not fetch preview URLs from code." : ""
  ].filter(Boolean);
}

export function getLaunchDayRehearsalWarnings(results: TeoyubeLimitedSoftLaunchDayRehearsalResult[] = []): string[] {
  return [
    results.length === 0 ? "Default rehearsal results are structural and should be replaced with owner-reviewed manual notes in 3.3." : "",
    "Launch-day rehearsal is manual-only and performs no launch actions."
  ].filter(Boolean);
}

export function validateLaunchDayRehearsalResults(results: TeoyubeLimitedSoftLaunchDayRehearsalResult[] = []) {
  const blockers = getLaunchDayRehearsalBlockers(results);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getLaunchDayRehearsalWarnings(results)
  };
}

export function createLaunchDayRehearsalReport(
  results: TeoyubeLimitedSoftLaunchDayRehearsalResult[] = []
): TeoyubeLimitedSoftLaunchDayRehearsalReport {
  const plan = createLaunchDayRehearsalPlan(results.length ? results : undefined);
  const validation = validateLaunchDayRehearsalResults(plan.results);

  return {
    valid: validation.valid,
    plan,
    checklistCount: plan.checklist.length,
    passedCount: plan.results.filter((entry) => entry.passed).length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noPreviewUrlFetched: true,
    generatedAt: new Date().toISOString()
  };
}
