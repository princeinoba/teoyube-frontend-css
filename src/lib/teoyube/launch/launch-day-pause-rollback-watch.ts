import type { TeoyubeLaunchDayMonitoringBlocker, TeoyubeLaunchDayMonitoringDecision, TeoyubeLaunchDayMonitoringWarning, TeoyubeLaunchDayPauseRollbackWatchStatus } from "./launch-day-monitoring-contracts";

export type TeoyubeLaunchDayPauseRollbackInput = Partial<TeoyubeLaunchDayPauseRollbackWatchStatus> & {
  appDoesNotLoad?: boolean;
  scriptureAnchorsMissing?: boolean;
  explanationPathsMissing?: boolean;
  unsafeFallbackBehavior?: boolean;
  consentControlsMissing?: boolean;
  debugPayloadExposed?: boolean;
  criticalMobileBlocker?: boolean;
  criticalAccessibilityBlocker?: boolean;
  privacyConcern?: boolean;
  accidentalAnalyticsSending?: boolean;
  accidentalPersistenceEnablement?: boolean;
  accidentalLiveAiOrchestration?: boolean;
  confusingOrUnsafeSpiritualGuidance?: boolean;
};

export function getLaunchDayPauseWatchChecklist(): string[] {
  return ["App does not load", "Scripture anchors missing", "Explanation paths missing", "Unsafe fallback behavior", "Consent controls missing", "Debug payload exposed", "Critical mobile blocker", "Critical accessibility blocker", "Privacy concern", "Accidental analytics sending", "Accidental persistence enablement", "Accidental live AI orchestration", "Confusing or unsafe spiritual guidance"];
}

export function getLaunchDayRollbackWatchChecklist(): string[] {
  return getLaunchDayPauseWatchChecklist().map((entry) => `${entry} remains unresolved after owner review`);
}

function reasons(input: TeoyubeLaunchDayPauseRollbackInput): string[] {
  return [
    input.appDoesNotLoad ? "App does not load" : undefined,
    input.scriptureAnchorsMissing ? "Scripture anchors missing" : undefined,
    input.explanationPathsMissing ? "Explanation paths missing" : undefined,
    input.unsafeFallbackBehavior ? "Unsafe fallback behavior" : undefined,
    input.consentControlsMissing ? "Consent controls missing" : undefined,
    input.debugPayloadExposed ? "Debug payload exposed" : undefined,
    input.criticalMobileBlocker ? "Critical mobile blocker" : undefined,
    input.criticalAccessibilityBlocker ? "Critical accessibility blocker" : undefined,
    input.privacyConcern ? "Privacy concern" : undefined,
    input.accidentalAnalyticsSending ? "Accidental analytics sending" : undefined,
    input.accidentalPersistenceEnablement ? "Accidental persistence enablement" : undefined,
    input.accidentalLiveAiOrchestration ? "Accidental live AI orchestration" : undefined,
    input.confusingOrUnsafeSpiritualGuidance ? "Confusing or unsafe spiritual guidance" : undefined
  ].filter(Boolean) as string[];
}

export function evaluateLaunchDayPauseCriteria(input: TeoyubeLaunchDayPauseRollbackInput = {}): boolean {
  return reasons(input).length > 0;
}

export function evaluateLaunchDayRollbackCriteria(input: TeoyubeLaunchDayPauseRollbackInput = {}): boolean {
  return Boolean(input.appDoesNotLoad || input.accidentalAnalyticsSending || input.accidentalPersistenceEnablement || input.accidentalLiveAiOrchestration || input.unsafeFallbackBehavior || input.confusingOrUnsafeSpiritualGuidance);
}

export function getLaunchDayPauseRollbackBlockers(input: TeoyubeLaunchDayPauseRollbackInput = {}): TeoyubeLaunchDayMonitoringBlocker[] {
  return [
    input.rollbackPerformed ? { id: "launch_day_rollback_performed", label: "Rollback performed by code", phase: "pause_rollback_review", severity: "critical", reason: "Pause/rollback watch must not perform rollback.", requiredAction: "Keep rollback as manual decision support only." } : undefined,
    input.providerCommandsExecuted ? { id: "launch_day_provider_commands_executed", label: "Provider commands executed", phase: "pause_rollback_review", severity: "critical", reason: "Pause/rollback watch must not execute provider commands.", requiredAction: "Remove provider command execution." } : undefined
  ].filter(Boolean) as TeoyubeLaunchDayMonitoringBlocker[];
}

export function getLaunchDayPauseRollbackWarnings(input: TeoyubeLaunchDayPauseRollbackInput = {}): TeoyubeLaunchDayMonitoringWarning[] {
  return reasons(input).map((reason) => ({
    id: `launch_day_pause_watch_${reason.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    label: reason,
    phase: "pause_rollback_review",
    severity: "high",
    message: reason,
    recommendedAction: "Pause for manual owner review and evaluate rollback criteria."
  }));
}

export function createLaunchDayPauseRollbackDecision(input: TeoyubeLaunchDayPauseRollbackInput = {}): TeoyubeLaunchDayMonitoringDecision {
  if (getLaunchDayPauseRollbackBlockers(input).length > 0) return "blocked";
  if (evaluateLaunchDayRollbackCriteria(input)) return "rollback_recommended";
  if (evaluateLaunchDayPauseCriteria(input)) return "pause_for_review";
  return "continue_soft_launch";
}

export function createLaunchDayPauseRollbackWatchReport(input: TeoyubeLaunchDayPauseRollbackInput = {}) {
  const watch: TeoyubeLaunchDayPauseRollbackWatchStatus = {
    id: input.id || "launch_day_pause_rollback_watch_4_2",
    pauseRecommended: evaluateLaunchDayPauseCriteria(input),
    rollbackRecommended: evaluateLaunchDayRollbackCriteria(input),
    rollbackPerformed: false,
    providerCommandsExecuted: false,
    manualDecisionOnly: true,
    reasons: reasons(input)
  };
  const blockers = getLaunchDayPauseRollbackBlockers(input);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createLaunchDayPauseRollbackDecision(input),
    watch,
    pauseChecklist: getLaunchDayPauseWatchChecklist(),
    rollbackChecklist: getLaunchDayRollbackWatchChecklist(),
    blockers,
    warnings: getLaunchDayPauseRollbackWarnings(input),
    noRollbackPerformed: true,
    noProviderCommandsExecuted: true,
    generatedAt: new Date().toISOString()
  };
}
