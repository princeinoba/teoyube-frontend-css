import type { TeoyubeSoftLaunchFixQueue } from "./soft-launch-fix-queue-contracts";
import type { TeoyubeSoftLaunchFixQueueItem } from "./soft-launch-feedback-triage-contracts";

export function getRegressionChecksForSoftLaunchFix(item: TeoyubeSoftLaunchFixQueueItem): string[] {
  const map: Record<string, string[]> = {
    scripture_anchor: ["Scripture/explanation verification", "Owner theology review"],
    explanation_path: ["TIG production QA", "Explanation path review"],
    fallback: ["Fallback/offline verification", "Safety review"],
    consent: ["Consent/privacy verification"],
    privacy: ["Consent/privacy verification", "Feedback privacy review"],
    mobile_ui: ["Mobile/accessibility verification"],
    accessibility: ["Accessibility audit"],
    debug_safety: ["Safety review", "Debug payload review"],
    performance: ["Performance/mobile review"],
    content_clarity: ["Owner/content review"]
  };
  return map[item.category] || ["Owner review"];
}

export function createSoftLaunchFixRegressionPlan(queue: TeoyubeSoftLaunchFixQueue) {
  return queue.items.map((item) => ({
    itemId: item.id,
    title: item.title,
    checks: getRegressionChecksForSoftLaunchFix(item),
    launchCritical: item.launchCritical
  }));
}

export function getCriticalSoftLaunchFixRegressionChecks(queue: TeoyubeSoftLaunchFixQueue): string[] {
  return Array.from(new Set(createSoftLaunchFixRegressionPlan(queue).filter((entry) => entry.launchCritical).flatMap((entry) => entry.checks)));
}

export function createSoftLaunchFixRegressionReport(queue: TeoyubeSoftLaunchFixQueue) {
  const plan = createSoftLaunchFixRegressionPlan(queue);
  return {
    valid: true,
    plan,
    itemCount: queue.items.length,
    criticalChecks: getCriticalSoftLaunchFixRegressionChecks(queue),
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
