import type {
  TeoyubeSupportDeskBlocker,
  TeoyubeSupportDeskStatus,
  TeoyubeSupportDeskWarning,
  TeoyubeWeeklyFeedbackItem,
  TeoyubeWeeklyFeedbackReviewReport,
  TeoyubeWeeklyFeedbackSummary,
  TeoyubeWeeklyFeedbackTheme
} from "./support-desk-contracts";

export type TeoyubeWeeklyFeedbackInput = Partial<Omit<TeoyubeWeeklyFeedbackItem, "manuallyEntered" | "manualOnly">>;

const THEMES: TeoyubeWeeklyFeedbackTheme[] = [
  "scripture_clarity",
  "promise_relevance",
  "prayer_usefulness",
  "calling_compass_clarity",
  "ai_companion_clarity",
  "mobile_usability",
  "accessibility",
  "consent_privacy_clarity",
  "fallback_quality",
  "content_clarity",
  "feature_requests",
  "unknown"
];

function text(item: Pick<TeoyubeWeeklyFeedbackItem, "theme" | "summary" | "redactedNotes">): string {
  return `${item.theme} ${item.summary} ${item.redactedNotes.join(" ")}`;
}

export function classifyWeeklyFeedbackItem(item: Pick<TeoyubeWeeklyFeedbackItem, "theme" | "summary" | "redactedNotes">): TeoyubeWeeklyFeedbackTheme {
  const value = text(item);
  if (/scripture|verse|anchor/i.test(value)) return "scripture_clarity";
  if (/promise|cluster|relevance/i.test(value)) return "promise_relevance";
  if (/prayer|pray/i.test(value)) return "prayer_usefulness";
  if (/calling compass|calling|vocation|purpose/i.test(value)) return "calling_compass_clarity";
  if (/ai companion|companion|chat/i.test(value)) return "ai_companion_clarity";
  if (/mobile|layout|responsive/i.test(value)) return "mobile_usability";
  if (/accessibility|screen reader|keyboard|contrast|focus/i.test(value)) return "accessibility";
  if (/privacy|terms|consent|notice/i.test(value)) return "consent_privacy_clarity";
  if (/fallback|offline|empty/i.test(value)) return "fallback_quality";
  if (/feature|request|would like/i.test(value)) return "feature_requests";
  if (/copy|clear|confusing|content|wording/i.test(value)) return "content_clarity";
  return item.theme || "unknown";
}

export function createWeeklyFeedbackReview(input: TeoyubeWeeklyFeedbackInput[] = []): TeoyubeWeeklyFeedbackItem[] {
  return input.map((item, index) => {
    const redactedNotes = item.redactedNotes || [];
    const theme = classifyWeeklyFeedbackItem({
      theme: item.theme || "unknown",
      summary: item.summary || "Manual weekly feedback item.",
      redactedNotes
    });
    return {
      id: item.id || `weekly_feedback_${index + 1}`,
      theme,
      summary: item.summary || "Manual weekly feedback item.",
      redactedNotes,
      severity: item.severity || (["scripture_clarity", "fallback_quality", "consent_privacy_clarity"].includes(theme) ? "medium" : "low"),
      source: item.source || "manual_feedback",
      manuallyEntered: true,
      manualOnly: true,
      sanitized: item.sanitized ?? true,
      automaticCollectionEnabled: Boolean(item.automaticCollectionEnabled),
      rawSensitiveTextStored: Boolean(item.rawSensitiveTextStored),
      usersContacted: Boolean(item.usersContacted),
      publicUrlFetched: Boolean(item.publicUrlFetched),
      databaseWritten: Boolean(item.databaseWritten),
      analyticsSent: Boolean(item.analyticsSent),
      externalServicesCalled: Boolean(item.externalServicesCalled),
      liveAiOrchestrationEnabled: Boolean(item.liveAiOrchestrationEnabled),
      hiddenPersonalizationCreated: Boolean(item.hiddenPersonalizationCreated),
      generatedAt: item.generatedAt || new Date().toISOString()
    };
  });
}

export function getWeeklyFeedbackThemes(feedback: TeoyubeWeeklyFeedbackItem[]): TeoyubeWeeklyFeedbackTheme[] {
  return THEMES.filter((theme) => feedback.some((item) => item.theme === theme));
}

export function summarizeWeeklyFeedback(feedback: TeoyubeWeeklyFeedbackItem[]): TeoyubeWeeklyFeedbackSummary {
  const themeCounts = THEMES.reduce((acc, theme) => ({ ...acc, [theme]: feedback.filter((item) => item.theme === theme).length }), {} as Record<TeoyubeWeeklyFeedbackTheme, number>);
  return {
    itemCount: feedback.length,
    themeCounts,
    highOrCriticalCount: feedback.filter((item) => item.severity === "high" || item.severity === "critical").length,
    manuallyEnteredCount: feedback.filter((item) => item.manuallyEntered).length
  };
}

export function getWeeklyFeedbackBlockers(feedback: TeoyubeWeeklyFeedbackItem[]): TeoyubeSupportDeskBlocker[] {
  return feedback.flatMap((item) => {
    const blockers: TeoyubeSupportDeskBlocker[] = [];
    if (item.automaticCollectionEnabled || item.rawSensitiveTextStored || item.usersContacted || item.publicUrlFetched || item.databaseWritten || item.analyticsSent || item.externalServicesCalled || item.liveAiOrchestrationEnabled) {
      blockers.push({
        id: `${item.id}_feedback_side_effect`,
        label: item.summary,
        category: "feedback",
        severity: "critical",
        reason: "Weekly feedback review must not collect feedback automatically, contact users, fetch URLs, persist records, send analytics, call providers, or enable live AI.",
        requiredAction: "Keep feedback review manual, sanitized, in-memory, and owner-controlled."
      });
    }
    if (item.hiddenPersonalizationCreated) {
      blockers.push({
        id: `${item.id}_hidden_personalization`,
        label: item.summary,
        category: "personalization",
        severity: "critical",
        reason: "Weekly feedback review must not create hidden personalization.",
        requiredAction: "Keep personalization visible and consent-aware."
      });
    }
    return blockers;
  });
}

export function getWeeklyFeedbackWarnings(feedback: TeoyubeWeeklyFeedbackItem[]): TeoyubeSupportDeskWarning[] {
  return feedback.flatMap((item) => {
    const warnings: TeoyubeSupportDeskWarning[] = [];
    if (item.theme === "unknown") warnings.push({ id: `${item.id}_unknown_theme`, label: item.summary, category: "feedback", severity: "medium", message: "Feedback theme is unknown.", recommendedAction: "Assign the closest weekly feedback theme during manual review." });
    if (!item.sanitized) warnings.push({ id: `${item.id}_unsanitized`, label: item.summary, category: "feedback", severity: "medium", message: "Feedback item is not marked sanitized.", recommendedAction: "Redact the feedback note before weekly review." });
    if (item.severity === "high" || item.severity === "critical") warnings.push({ id: `${item.id}_high_severity`, label: item.summary, category: "feedback", severity: item.severity === "critical" ? "high" : "high", message: "High-severity feedback should remain visible to the owner.", recommendedAction: "Review before choosing weekly priorities." });
    return warnings;
  });
}

export function createWeeklyFeedbackReviewReport(feedback: TeoyubeWeeklyFeedbackItem[] = []): TeoyubeWeeklyFeedbackReviewReport {
  const blockers = getWeeklyFeedbackBlockers(feedback);
  const warnings = getWeeklyFeedbackWarnings(feedback);
  const status: TeoyubeSupportDeskStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : feedback.length ? "ready" : "empty";
  return {
    status,
    ready: blockers.length === 0,
    summary: summarizeWeeklyFeedback(feedback),
    themes: getWeeklyFeedbackThemes(feedback),
    feedback,
    blockers,
    warnings,
    manualOnly: true,
    sanitizedOnly: feedback.every((item) => item.sanitized && !item.rawSensitiveTextStored),
    noAutomaticFeedbackCollection: true,
    noUsersContacted: true,
    noPublicUrlFetched: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
