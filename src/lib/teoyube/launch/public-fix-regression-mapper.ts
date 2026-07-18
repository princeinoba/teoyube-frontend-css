import type { TeoyubePublicFixQueue } from "./public-fix-queue-contracts";
import type { TeoyubePublicFixQueueItem } from "./public-feedback-triage-contracts";

export function getRegressionChecksForPublicFix(item: TeoyubePublicFixQueueItem): string[] {
  const map: Record<string, string[]> = {
    privacy: ["Privacy/consent QA", "Public copy QA"],
    terms: ["Privacy/consent QA", "Public copy QA", "Owner/legal review"],
    consent: ["Consent/privacy verification", "Privacy/consent QA"],
    scripture_anchor: ["Scripture/explanation verification", "Owner theology review"],
    explanation_path: ["TIG production QA", "Explanation path review"],
    fallback: ["Fallback/offline verification", "Safety review"],
    confidence: ["TIG production QA", "Confidence label review"],
    mobile_ui: ["Mobile/accessibility verification"],
    accessibility: ["Accessibility audit"],
    debug_safety: ["Safety review", "Debug payload review"],
    performance: ["Performance/mobile review"],
    content_clarity: ["Owner/content review"],
    public_copy: ["Owner/legal review", "Public copy QA"],
    ai_companion: ["TIG production QA", "Owner/content review"],
    personalization_preview: ["Consent/privacy verification", "Personalization QA"],
    offline_fallback: ["Fallback/offline verification"]
  };
  return map[item.category] || ["Owner review"];
}

export function createPublicFixRegressionPlan(queue: TeoyubePublicFixQueue) {
  return queue.items.map((item) => ({
    itemId: item.id,
    title: item.title,
    checks: getRegressionChecksForPublicFix(item),
    publicLaunchCritical: item.publicLaunchCritical
  }));
}

export function getCriticalPublicFixRegressionChecks(queue: TeoyubePublicFixQueue): string[] {
  return Array.from(new Set(createPublicFixRegressionPlan(queue).filter((entry) => entry.publicLaunchCritical).flatMap((entry) => entry.checks)));
}

export function createPublicFixRegressionReport(queue: TeoyubePublicFixQueue) {
  const plan = createPublicFixRegressionPlan(queue);
  return {
    valid: true,
    plan,
    itemCount: queue.items.length,
    criticalChecks: getCriticalPublicFixRegressionChecks(queue),
    noExternalWrite: true,
    noDatabaseWrites: true,
    noAnalyticsSent: true,
    generatedAt: new Date().toISOString()
  };
}
