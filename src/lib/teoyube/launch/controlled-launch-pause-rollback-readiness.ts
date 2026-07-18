import type { TeoyubeControlledLaunchActivationBlocker, TeoyubeControlledLaunchActivationWarning, TeoyubeControlledLaunchPauseRollbackStatus } from "./controlled-launch-activation-contracts";

export function getControlledLaunchPauseCriteria(): string[] {
  return [
    "App does not load",
    "Scripture anchors missing",
    "Explanation paths missing",
    "Unsafe fallback behavior",
    "Consent controls missing",
    "Debug payload exposed",
    "Critical mobile blocker",
    "Critical accessibility blocker",
    "Privacy concern",
    "Accidental analytics sending",
    "Accidental persistence enablement",
    "Accidental live AI orchestration",
    "Confusing or unsafe spiritual guidance"
  ];
}

export function getControlledLaunchRollbackCriteria(): string[] {
  return getControlledLaunchPauseCriteria().map((entry) => `${entry} remains unresolved after owner review`);
}

function blocker(id: string, reason: string): TeoyubeControlledLaunchActivationBlocker {
  return { id, label: id.replace(/_/g, " "), phase: "pause_rollback_readiness", severity: "critical", reason, requiredAction: "Fix pause/rollback readiness before manual activation." };
}

export function createControlledLaunchPauseRollbackPlan(input: Partial<TeoyubeControlledLaunchPauseRollbackStatus> = {}): TeoyubeControlledLaunchPauseRollbackStatus {
  return {
    id: input.id || "controlled_launch_pause_rollback_4_1",
    label: input.label || "Controlled Launch Pause and Rollback Readiness",
    pauseCriteria: input.pauseCriteria || getControlledLaunchPauseCriteria(),
    rollbackCriteria: input.rollbackCriteria || getControlledLaunchRollbackCriteria(),
    rollbackPerformed: false,
    providerCommandsExecuted: false,
    manualDecisionOnly: true,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledLaunchPauseRollbackBlockers(plan: TeoyubeControlledLaunchPauseRollbackStatus): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    plan.pauseCriteria.length === 0 ? blocker("controlled_launch_pause_criteria_missing", "Pause criteria must exist.") : undefined,
    plan.rollbackCriteria.length === 0 ? blocker("controlled_launch_rollback_criteria_missing", "Rollback criteria must exist.") : undefined,
    plan.rollbackPerformed ? blocker("controlled_launch_rollback_performed", "This module must not perform rollback.") : undefined,
    plan.providerCommandsExecuted ? blocker("controlled_launch_provider_commands_executed", "This module must not execute provider commands.") : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getControlledLaunchPauseRollbackWarnings(): TeoyubeControlledLaunchActivationWarning[] {
  return [{ id: "pause_rollback_manual_only", label: "Pause/rollback is manual only", phase: "pause_rollback_readiness", severity: "medium", message: "Readiness criteria exist, but no rollback is performed by code.", recommendedAction: "Owner should make pause or rollback decisions manually." }];
}

export function validateControlledLaunchPauseRollbackReadiness(plan: TeoyubeControlledLaunchPauseRollbackStatus) {
  const blockers = getControlledLaunchPauseRollbackBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getControlledLaunchPauseRollbackWarnings() };
}

export function createControlledLaunchPauseRollbackReport(plan: TeoyubeControlledLaunchPauseRollbackStatus = createControlledLaunchPauseRollbackPlan()) {
  const validation = validateControlledLaunchPauseRollbackReadiness(plan);
  return { valid: validation.valid, ready: validation.valid, plan, pauseCriteria: plan.pauseCriteria, rollbackCriteria: plan.rollbackCriteria, blockers: validation.blockers, warnings: validation.warnings, noRollbackPerformed: true, noProviderCommandsExecuted: true, generatedAt: new Date().toISOString() };
}
