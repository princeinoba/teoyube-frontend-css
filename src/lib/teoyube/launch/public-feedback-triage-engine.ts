import type {
  TeoyubePublicFeedbackTriageBlocker,
  TeoyubePublicFeedbackTriageCategory,
  TeoyubePublicFeedbackTriageDecision,
  TeoyubePublicFeedbackTriageItem,
  TeoyubePublicFeedbackTriageReport,
  TeoyubePublicFeedbackTriageResult,
  TeoyubePublicFeedbackTriageSeverity,
  TeoyubePublicFeedbackTriageWarning
} from "./public-feedback-triage-contracts";

const PUBLIC_LAUNCH_CRITICAL_PATTERNS = [
  /missing scripture|scripture anchor missing|scripture missing/i,
  /missing explanation|explanation path missing|explanation missing/i,
  /unsafe fallback|empty fallback|fallback response empty/i,
  /privacy notice missing|terms missing|consent notice missing|consent controls missing/i,
  /privacy concern|raw sensitive|sensitive text exposed/i,
  /debug payload exposed|debug payload/i,
  /app not loading|public app not loading/i,
  /critical mobile|critical accessibility/i,
  /external analytics|analytics sent/i,
  /production persistence|database write|persisted/i,
  /live ai|openai orchestration/i,
  /unsafe spiritual|confusing spiritual/i,
  /legal approval without recorded review|legal approval/i
];

function text(item: TeoyubePublicFeedbackTriageItem): string {
  return `${item.category} ${item.surface} ${item.summary} ${item.redactedNotes.join(" ")}`.toLowerCase();
}

export function classifyPublicFeedbackItem(item: TeoyubePublicFeedbackTriageItem): TeoyubePublicFeedbackTriageCategory {
  const value = text(item);
  if (/privacy|sensitive/.test(value)) return "privacy";
  if (/terms/.test(value)) return "terms";
  if (/consent/.test(value)) return "consent";
  if (/scripture/.test(value)) return "scripture_anchor";
  if (/explanation/.test(value)) return "explanation_path";
  if (/fallback/.test(value)) return "fallback";
  if (/confidence|certainty/.test(value)) return "confidence";
  if (/mobile|layout/.test(value)) return "mobile_ui";
  if (/accessibility|keyboard|screen reader|contrast/.test(value)) return "accessibility";
  if (/debug/.test(value)) return "debug_safety";
  if (/performance|slow|latency/.test(value)) return "performance";
  if (/ai companion|companion/.test(value)) return "ai_companion";
  if (/personalization/.test(value)) return "personalization_preview";
  if (/offline/.test(value)) return "offline_fallback";
  if (/promise/.test(value)) return "promise_cluster";
  if (/prayer/.test(value)) return "prayer_sequence";
  if (/public copy|copy|legal approval/.test(value)) return "public_copy";
  if (/feature|request/.test(value)) return "feature_request";
  if (/good|helpful|positive|clear/.test(value)) return "positive_feedback";
  return item.category || "unknown";
}

export function isPublicLaunchCriticalFeedback(item: TeoyubePublicFeedbackTriageItem): boolean {
  const value = text(item);
  return (
    item.publicLaunchCritical ||
    item.analyticsSent ||
    item.databaseWritten ||
    item.externalServicesCalled ||
    item.liveAiOrchestrationEnabled ||
    item.publicUrlFetched ||
    item.usersContacted ||
    item.legalApprovalClaimedWithoutRecord ||
    PUBLIC_LAUNCH_CRITICAL_PATTERNS.some((pattern) => pattern.test(value))
  );
}

export function isPublicSafetyCriticalFeedback(item: TeoyubePublicFeedbackTriageItem): boolean {
  const value = text(item);
  return (
    item.publicSafetyCritical ||
    item.rawSensitiveTextStored ||
    item.hiddenPersonalizationCreated ||
    /scripture|explanation|fallback|consent|privacy|terms|sensitive|debug|confidence|certainty|unsafe spiritual|legal approval/i.test(value)
  );
}

export function getPublicFeedbackTriageSeverity(item: TeoyubePublicFeedbackTriageItem): TeoyubePublicFeedbackTriageSeverity {
  if (isPublicLaunchCriticalFeedback(item)) return "critical";
  if (isPublicSafetyCriticalFeedback(item)) return "high";
  if (item.severity && item.severity !== "unknown") return item.severity;
  if (item.category === "feature_request" || item.category === "positive_feedback") return "low";
  return "medium";
}

export function triagePublicFeedbackItems(items: TeoyubePublicFeedbackTriageItem[]): TeoyubePublicFeedbackTriageResult[] {
  return items.map((item) => {
    const category = classifyPublicFeedbackItem(item);
    const normalized = { ...item, category };
    const severity = getPublicFeedbackTriageSeverity(normalized);
    const publicLaunchCritical = isPublicLaunchCriticalFeedback(normalized);
    const publicSafetyCritical = isPublicSafetyCriticalFeedback(normalized);

    return {
      item: { ...normalized, severity, publicLaunchCritical, publicSafetyCritical },
      category,
      severity,
      publicLaunchCritical,
      publicSafetyCritical,
      recommendedAction: publicLaunchCritical
        ? "Convert to a public-launch-critical issue and complete owner review before continuing promotion."
        : publicSafetyCritical
          ? "Review with owner before the next public daily review."
          : "Document for public daily review."
    };
  });
}

export function getPublicFeedbackTriageBlockers(items: TeoyubePublicFeedbackTriageItem[]): TeoyubePublicFeedbackTriageBlocker[] {
  return triagePublicFeedbackItems(items)
    .filter((entry) => entry.publicLaunchCritical || entry.severity === "critical")
    .map((entry) => ({
      id: `public_feedback_triage_${entry.item.id}`,
      label: entry.item.summary,
      category: entry.category,
      severity: "critical",
      reason: entry.item.redactedNotes.join(" ") || entry.item.summary,
      requiredAction: "Convert this feedback into a public-launch-critical issue and review with owner."
    }));
}

export function getPublicFeedbackTriageWarnings(items: TeoyubePublicFeedbackTriageItem[]): TeoyubePublicFeedbackTriageWarning[] {
  return triagePublicFeedbackItems(items)
    .filter((entry) => !entry.publicLaunchCritical && ["high", "medium"].includes(entry.severity))
    .map((entry) => ({
      id: `public_feedback_triage_warning_${entry.item.id}`,
      label: entry.item.summary,
      category: entry.category,
      severity: entry.severity === "high" ? "high" : "medium",
      message: entry.item.redactedNotes.join(" ") || entry.item.summary,
      recommendedAction: "Keep this item visible in public daily review."
    }));
}

export function createPublicFeedbackTriageDecision(items: TeoyubePublicFeedbackTriageItem[]): TeoyubePublicFeedbackTriageDecision {
  const blockers = getPublicFeedbackTriageBlockers(items);
  if (blockers.some((entry) => /analytics|persistence|database|live ai|unsafe|app not loading|debug payload/i.test(`${entry.label} ${entry.reason}`))) return "prepare_rollback";
  if (blockers.length > 0) return "pause_for_review";
  if (getPublicFeedbackTriageWarnings(items).length > 0) return "continue_with_warnings";
  return "continue_public_launch";
}

export function createPublicFeedbackTriageReport(items: TeoyubePublicFeedbackTriageItem[] = []): TeoyubePublicFeedbackTriageReport {
  const results = triagePublicFeedbackItems(items);
  const blockers = getPublicFeedbackTriageBlockers(items);
  const warnings = getPublicFeedbackTriageWarnings(items);
  const decision = createPublicFeedbackTriageDecision(items);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0,
    decision,
    itemCount: items.length,
    publicLaunchCriticalCount: results.filter((entry) => entry.publicLaunchCritical).length,
    publicSafetyCriticalCount: results.filter((entry) => entry.publicSafetyCritical).length,
    results,
    blockers,
    warnings,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
