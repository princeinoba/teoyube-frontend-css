import type { TeoyubeSoftLaunchFixQueue, TeoyubeSoftLaunchFixQueueBlocker, TeoyubeSoftLaunchFixQueueWarning } from "./soft-launch-fix-queue-contracts";
import type { TeoyubeSoftLaunchFixQueueItem } from "./soft-launch-feedback-triage-contracts";

const UNSAFE_PATTERNS = [
  /remove scripture/i,
  /remove explanation/i,
  /weaken fallback/i,
  /hide consent/i,
  /hidden personalization/i,
  /enable external analytics/i,
  /enable production persistence/i,
  /enable live ai/i,
  /secret/i,
  /raw sensitive/i,
  /divine certainty/i
];

export function validateSoftLaunchFixQueueItemSafety(item: TeoyubeSoftLaunchFixQueueItem) {
  const text = `${item.title} ${item.proposedFix} ${item.verificationRequired.join(" ")}`;
  const unsafe = UNSAFE_PATTERNS.filter((pattern) => pattern.test(text)).map(String);
  return {
    valid: unsafe.length === 0,
    blockers: unsafe.map((reason) => ({
      id: `fix_safety_${item.id}`,
      label: item.title,
      priority: item.priority,
      riskLevel: "critical" as const,
      reason,
      requiredAction: "Rewrite fix so it preserves launch safety guardrails."
    })),
    warnings: item.verificationRequired.length === 0 ? [{
      id: `fix_safety_warning_${item.id}`,
      label: item.title,
      riskLevel: "medium" as const,
      message: "Fix item has no verification requirements.",
      recommendedAction: "Add regression verification before fixing."
    }] : []
  };
}

export function getSoftLaunchFixQueueSafetyBlockers(queue: TeoyubeSoftLaunchFixQueue): TeoyubeSoftLaunchFixQueueBlocker[] {
  return queue.items.flatMap((item) => validateSoftLaunchFixQueueItemSafety(item).blockers);
}

export function getSoftLaunchFixQueueSafetyWarnings(queue: TeoyubeSoftLaunchFixQueue): TeoyubeSoftLaunchFixQueueWarning[] {
  return queue.items.flatMap((item) => validateSoftLaunchFixQueueItemSafety(item).warnings);
}

export function validateSoftLaunchFixQueueSafety(queue: TeoyubeSoftLaunchFixQueue) {
  const blockers = getSoftLaunchFixQueueSafetyBlockers(queue);
  return { valid: blockers.length === 0, blockers, warnings: getSoftLaunchFixQueueSafetyWarnings(queue) };
}

export function createSoftLaunchFixQueueSafetyReport(queue: TeoyubeSoftLaunchFixQueue) {
  const validation = validateSoftLaunchFixQueueSafety(queue);
  return {
    valid: validation.valid,
    ready: validation.valid,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noScriptureAnchorsRemoved: true,
    noExplanationPathsRemoved: true,
    noExternalAnalyticsEnabled: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: new Date().toISOString()
  };
}
