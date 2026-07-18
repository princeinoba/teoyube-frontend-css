import type {
  TeoyubeSoftLaunchFeedbackTriageBlocker,
  TeoyubeSoftLaunchFeedbackTriageCategory,
  TeoyubeSoftLaunchFeedbackTriageDecision,
  TeoyubeSoftLaunchFeedbackTriageItem,
  TeoyubeSoftLaunchFeedbackTriageReport,
  TeoyubeSoftLaunchFeedbackTriageResult,
  TeoyubeSoftLaunchFeedbackTriageSeverity,
  TeoyubeSoftLaunchFeedbackTriageWarning
} from "./soft-launch-feedback-triage-contracts";

const CRITICAL_TERMS = [
  "missing scripture",
  "scripture anchor missing",
  "missing explanation",
  "explanation path missing",
  "unsafe fallback",
  "empty fallback",
  "consent controls missing",
  "privacy concern",
  "raw sensitive",
  "debug payload",
  "app not loading",
  "critical mobile",
  "critical accessibility",
  "external analytics",
  "production persistence",
  "live ai",
  "unsafe spiritual"
];

function text(item: TeoyubeSoftLaunchFeedbackTriageItem): string {
  return `${item.category} ${item.surface} ${item.summary} ${item.redactedNotes.join(" ")}`.toLowerCase();
}

export function classifySoftLaunchFeedbackItem(item: TeoyubeSoftLaunchFeedbackTriageItem): TeoyubeSoftLaunchFeedbackTriageCategory {
  const value = text(item);
  if (/scripture/.test(value)) return "scripture_anchor";
  if (/explanation/.test(value)) return "explanation_path";
  if (/fallback/.test(value)) return "fallback";
  if (/confidence|certainty/.test(value)) return "confidence";
  if (/consent/.test(value)) return "consent";
  if (/privacy|sensitive/.test(value)) return "privacy";
  if (/mobile/.test(value)) return "mobile_ui";
  if (/accessibility|keyboard|screen reader/.test(value)) return "accessibility";
  if (/debug/.test(value)) return "debug_safety";
  if (/performance|slow/.test(value)) return "performance";
  if (/ai companion/.test(value)) return "ai_companion";
  if (/personalization/.test(value)) return "personalization_preview";
  if (/offline/.test(value)) return "offline_fallback";
  if (/promise/.test(value)) return "promise_cluster";
  if (/prayer/.test(value)) return "prayer_sequence";
  if (/feature|request/.test(value)) return "feature_request";
  if (/good|helpful|positive|clear/.test(value)) return "positive_feedback";
  return item.category || "unknown";
}

export function isLaunchCriticalSoftLaunchFeedback(item: TeoyubeSoftLaunchFeedbackTriageItem): boolean {
  const value = text(item);
  return item.launchCritical || CRITICAL_TERMS.some((term) => value.includes(term));
}

export function isSafetyCriticalSoftLaunchFeedback(item: TeoyubeSoftLaunchFeedbackTriageItem): boolean {
  const value = text(item);
  return item.safetyCritical || /scripture|explanation|fallback|consent|privacy|sensitive|debug|analytics|persistence|live ai|unsafe spiritual|divine certainty/.test(value);
}

export function getSoftLaunchFeedbackTriageSeverity(item: TeoyubeSoftLaunchFeedbackTriageItem): TeoyubeSoftLaunchFeedbackTriageSeverity {
  if (isLaunchCriticalSoftLaunchFeedback(item)) return "critical";
  if (isSafetyCriticalSoftLaunchFeedback(item)) return "high";
  if (item.severity && item.severity !== "unknown") return item.severity;
  if (item.category === "feature_request" || item.category === "positive_feedback") return "low";
  return "medium";
}

export function triageSoftLaunchFeedbackItems(items: TeoyubeSoftLaunchFeedbackTriageItem[]): TeoyubeSoftLaunchFeedbackTriageResult[] {
  return items.map((item) => {
    const category = classifySoftLaunchFeedbackItem(item);
    const severity = getSoftLaunchFeedbackTriageSeverity({ ...item, category });
    const launchCritical = isLaunchCriticalSoftLaunchFeedback({ ...item, category });
    const safetyCritical = isSafetyCriticalSoftLaunchFeedback({ ...item, category });

    return {
      item: { ...item, category, severity, launchCritical, safetyCritical },
      category,
      severity,
      launchCritical,
      safetyCritical,
      recommendedAction: launchCritical ? "Convert to issue and review before continuing expansion." : "Document for daily review."
    };
  });
}

export function getSoftLaunchFeedbackTriageBlockers(items: TeoyubeSoftLaunchFeedbackTriageItem[]): TeoyubeSoftLaunchFeedbackTriageBlocker[] {
  return triageSoftLaunchFeedbackItems(items)
    .filter((entry) => entry.launchCritical || entry.severity === "critical")
    .map((entry) => ({
      id: `feedback_triage_${entry.item.id}`,
      label: entry.item.summary,
      category: entry.category,
      severity: "critical",
      reason: entry.item.redactedNotes.join(" ") || entry.item.summary,
      requiredAction: "Convert this feedback into a launch-critical issue and review with owner."
    }));
}

export function getSoftLaunchFeedbackTriageWarnings(items: TeoyubeSoftLaunchFeedbackTriageItem[]): TeoyubeSoftLaunchFeedbackTriageWarning[] {
  return triageSoftLaunchFeedbackItems(items)
    .filter((entry) => !entry.launchCritical && ["high", "medium"].includes(entry.severity))
    .map((entry) => ({
      id: `feedback_triage_warning_${entry.item.id}`,
      label: entry.item.summary,
      category: entry.category,
      severity: entry.severity === "high" ? "high" : "medium",
      message: entry.item.redactedNotes.join(" ") || entry.item.summary,
      recommendedAction: "Review during daily feedback triage."
    }));
}

export function createSoftLaunchFeedbackTriageDecision(items: TeoyubeSoftLaunchFeedbackTriageItem[]): TeoyubeSoftLaunchFeedbackTriageDecision {
  const blockers = getSoftLaunchFeedbackTriageBlockers(items);
  if (blockers.some((entry) => /analytics|persistence|live ai|unsafe|app not loading/i.test(`${entry.label} ${entry.reason}`))) return "prepare_rollback";
  if (blockers.length > 0) return "pause_for_review";
  if (getSoftLaunchFeedbackTriageWarnings(items).length > 0) return "continue_with_warnings";
  return "continue_soft_launch";
}

export function createSoftLaunchFeedbackTriageReport(items: TeoyubeSoftLaunchFeedbackTriageItem[] = []): TeoyubeSoftLaunchFeedbackTriageReport {
  const results = triageSoftLaunchFeedbackItems(items);
  const blockers = getSoftLaunchFeedbackTriageBlockers(items);
  const warnings = getSoftLaunchFeedbackTriageWarnings(items);
  const decision = createSoftLaunchFeedbackTriageDecision(items);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0,
    decision,
    itemCount: items.length,
    launchCriticalCount: results.filter((entry) => entry.launchCritical).length,
    safetyCriticalCount: results.filter((entry) => entry.safetyCritical).length,
    results,
    blockers,
    warnings,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
