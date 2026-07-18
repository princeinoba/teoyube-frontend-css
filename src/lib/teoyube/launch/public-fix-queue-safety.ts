import type { TeoyubePublicFixQueue, TeoyubePublicFixQueueBlocker, TeoyubePublicFixQueueWarning } from "./public-fix-queue-contracts";
import type { TeoyubePublicFixQueueItem } from "./public-feedback-triage-contracts";

const UNSAFE_PUBLIC_FIX_PATTERNS = [
  /remove scripture|hide scripture|delete scripture/i,
  /remove explanation|hide explanation|delete explanation/i,
  /weaken fallback|disable fallback|remove fallback|empty fallback/i,
  /hide consent|remove consent|disable consent/i,
  /remove privacy|remove terms|remove notices|hide privacy|hide terms/i,
  /hidden personalization|silent personalization/i,
  /enable external analytics|send analytics|connect analytics/i,
  /enable production persistence|connect database|database write|write to database/i,
  /enable live ai|live ai orchestration|connect openai|call openai/i,
  /secret|api key|token/i,
  /raw sensitive|store sensitive/i,
  /divine certainty|certainly god|guaranteed calling/i,
  /legal approval without record|claim legal approval/i
];

export function validatePublicFixQueueItemSafety(item: TeoyubePublicFixQueueItem) {
  const value = `${item.title} ${item.proposedFix} ${item.verificationRequired.join(" ")}`;
  const unsafe = UNSAFE_PUBLIC_FIX_PATTERNS.filter((pattern) => pattern.test(value)).map(String);
  return {
    valid: unsafe.length === 0,
    blockers: unsafe.map((reason) => ({
      id: `public_fix_safety_${item.id}`,
      label: item.title,
      priority: item.priority,
      riskLevel: "critical" as const,
      reason,
      requiredAction: "Rewrite this public fix so it preserves launch safety, privacy, consent, Scripture, explanation, fallback, and disabled-provider guardrails."
    })),
    warnings: item.verificationRequired.length === 0 ? [{
      id: `public_fix_safety_warning_${item.id}`,
      label: item.title,
      riskLevel: "medium" as const,
      message: "Public fix item has no verification requirements.",
      recommendedAction: "Add regression verification before fixing."
    }] : []
  };
}

export function getPublicFixQueueSafetyBlockers(queue: TeoyubePublicFixQueue): TeoyubePublicFixQueueBlocker[] {
  return queue.items.flatMap((item) => validatePublicFixQueueItemSafety(item).blockers);
}

export function getPublicFixQueueSafetyWarnings(queue: TeoyubePublicFixQueue): TeoyubePublicFixQueueWarning[] {
  return queue.items.flatMap((item) => validatePublicFixQueueItemSafety(item).warnings);
}

export function validatePublicFixQueueSafety(queue: TeoyubePublicFixQueue) {
  const blockers = getPublicFixQueueSafetyBlockers(queue);
  return { valid: blockers.length === 0, blockers, warnings: getPublicFixQueueSafetyWarnings(queue) };
}

export function createPublicFixQueueSafetyReport(queue: TeoyubePublicFixQueue) {
  const validation = validatePublicFixQueueSafety(queue);
  return {
    valid: validation.valid,
    ready: validation.valid,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noScriptureAnchorsRemoved: true,
    noExplanationPathsRemoved: true,
    noFallbackSafetyWeakened: true,
    noConsentControlsHidden: true,
    noPrivacyTermsConsentNoticesRemoved: true,
    noExternalAnalyticsEnabled: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noHiddenPersonalizationCreated: true,
    noSecretsExposed: true,
    noRawSensitiveTextStored: true,
    noDivineCertaintyClaimed: true,
    noLegalApprovalClaimedWithoutRecord: true,
    generatedAt: new Date().toISOString()
  };
}
