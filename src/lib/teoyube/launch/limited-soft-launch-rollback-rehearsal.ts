import { getLimitedSoftLaunchPauseCriteria, getLimitedSoftLaunchRollbackCriteria } from "./limited-soft-launch-support-response";

export type TeoyubeLimitedSoftLaunchRollbackRehearsalCheck = {
  id: string;
  label: string;
  passed: boolean;
  manualOnly: true;
  details: string;
};

export type TeoyubeLimitedSoftLaunchRollbackRehearsalPlan = {
  id: string;
  label: string;
  checklist: TeoyubeLimitedSoftLaunchRollbackRehearsalCheck[];
  rollbackActionPerformed: false;
  externalProviderCommandExecuted: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchRollbackRehearsalReport = {
  valid: boolean;
  plan: TeoyubeLimitedSoftLaunchRollbackRehearsalPlan;
  checklistCount: number;
  passedCount: number;
  pauseCriteriaCount: number;
  rollbackCriteriaCount: number;
  blockers: string[];
  warnings: string[];
  noRollbackActionPerformed: true;
  noExternalProviderCommandExecuted: true;
  generatedAt: string;
};

function check(id: string, label: string, details: string): TeoyubeLimitedSoftLaunchRollbackRehearsalCheck {
  return { id, label, passed: true, manualOnly: true, details };
}

export function getRollbackRehearsalChecklist(): TeoyubeLimitedSoftLaunchRollbackRehearsalCheck[] {
  return [
    check("rollback_triggers_known", "Rollback triggers are known", "Rollback criteria from the support plan are visible."),
    check("pause_criteria_known", "Pause criteria are known", "Pause criteria from the support plan are visible."),
    check("owner_manual_decision", "Owner can decide pause or rollback manually", "Owner decision remains manual."),
    check("rollback_issue_categories_documented", "Rollback issue categories are documented", "Scripture, fallback, consent, privacy, debug, app availability, and safety issues are documented."),
    check("no_automatic_rollback", "No automatic rollback by code", "The rehearsal performs no rollback."),
    check("no_external_provider_command", "No external provider command by code", "The rehearsal executes no provider command.")
  ];
}

export function createRollbackRehearsalPlan(
  checklist: TeoyubeLimitedSoftLaunchRollbackRehearsalCheck[] = getRollbackRehearsalChecklist()
): TeoyubeLimitedSoftLaunchRollbackRehearsalPlan {
  return {
    id: "limited_soft_launch_rollback_rehearsal",
    label: "Limited Soft Launch Pause and Rollback Rehearsal",
    checklist,
    rollbackActionPerformed: false,
    externalProviderCommandExecuted: false,
    generatedAt: new Date().toISOString()
  };
}

export function getRollbackRehearsalBlockers(checklist: TeoyubeLimitedSoftLaunchRollbackRehearsalCheck[] = getRollbackRehearsalChecklist()): string[] {
  const plan = createRollbackRehearsalPlan(checklist);

  return [
    plan.checklist.every((entry) => entry.passed) ? "" : "All rollback rehearsal checks must pass.",
    getLimitedSoftLaunchPauseCriteria().length > 0 ? "" : "Pause criteria must be known.",
    getLimitedSoftLaunchRollbackCriteria().length > 0 ? "" : "Rollback criteria must be known.",
    plan.rollbackActionPerformed ? "Rollback rehearsal must not perform rollback actions." : "",
    plan.externalProviderCommandExecuted ? "Rollback rehearsal must not execute provider commands." : ""
  ].filter(Boolean);
}

export function getRollbackRehearsalWarnings(): string[] {
  return ["Rollback rehearsal is manual-only and executes no provider commands."];
}

export function validateRollbackRehearsalResults(checklist: TeoyubeLimitedSoftLaunchRollbackRehearsalCheck[] = getRollbackRehearsalChecklist()) {
  const blockers = getRollbackRehearsalBlockers(checklist);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getRollbackRehearsalWarnings()
  };
}

export function createRollbackRehearsalReport(
  checklist: TeoyubeLimitedSoftLaunchRollbackRehearsalCheck[] = getRollbackRehearsalChecklist()
): TeoyubeLimitedSoftLaunchRollbackRehearsalReport {
  const plan = createRollbackRehearsalPlan(checklist);
  const validation = validateRollbackRehearsalResults(plan.checklist);

  return {
    valid: validation.valid,
    plan,
    checklistCount: plan.checklist.length,
    passedCount: plan.checklist.filter((entry) => entry.passed).length,
    pauseCriteriaCount: getLimitedSoftLaunchPauseCriteria().length,
    rollbackCriteriaCount: getLimitedSoftLaunchRollbackCriteria().length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noRollbackActionPerformed: true,
    noExternalProviderCommandExecuted: true,
    generatedAt: new Date().toISOString()
  };
}
