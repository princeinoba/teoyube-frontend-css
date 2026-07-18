import type {
  TeoyubeSupportDeskBlocker,
  TeoyubeSupportDeskStatus,
  TeoyubeSupportDeskWarning,
  TeoyubeWeeklyImprovementDecision,
  TeoyubeWeeklyImprovementItem,
  TeoyubeWeeklyImprovementReport
} from "./support-desk-contracts";

export type TeoyubeWeeklyImprovementPlanInput = {
  id?: string;
  label?: string;
  items?: Partial<TeoyubeWeeklyImprovementItem>[];
};

const PRIORITY_RANK = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  defer: 4
};

const UNSAFE_IMPROVEMENT_PATTERNS = [
  /remove scripture|hide scripture|delete scripture/i,
  /remove explanation|hide explanation|delete explanation/i,
  /disable fallback|remove fallback|weaken fallback/i,
  /hide consent|remove consent|disable consent/i,
  /hidden personalization|silent personalization/i,
  /enable analytics|send analytics|connect analytics/i,
  /enable database|connect database|production persistence|write to database/i,
  /enable live ai|live ai orchestration|call openai/i,
  /secret|api key|token|credential/i,
  /divine certainty|guaranteed calling|god certainly/i
];

export function createWeeklyImprovementPlan(input: TeoyubeWeeklyImprovementPlanInput = {}) {
  const items = (input.items || []).map((item, index): TeoyubeWeeklyImprovementItem => ({
    id: item.id || `weekly_improvement_${index + 1}`,
    title: item.title || "Manual weekly improvement item",
    category: item.category || "content_clarity",
    priority: item.priority || "medium",
    sourceIds: item.sourceIds || [],
    rationale: item.rationale || "Reviewed from manual support and feedback notes.",
    verificationRequired: item.verificationRequired || ["Owner review", "Manual regression check"],
    ownerReviewRequired: item.ownerReviewRequired ?? true,
    preservesScriptureAnchors: item.preservesScriptureAnchors ?? true,
    preservesExplanationPaths: item.preservesExplanationPaths ?? true,
    preservesFallbackSafety: item.preservesFallbackSafety ?? true,
    preservesConsentControls: item.preservesConsentControls ?? true,
    noHiddenPersonalization: item.noHiddenPersonalization ?? true,
    noUnapprovedAnalytics: item.noUnapprovedAnalytics ?? true,
    noUnapprovedPersistence: item.noUnapprovedPersistence ?? true,
    noLiveAiOrchestration: item.noLiveAiOrchestration ?? true,
    noSecretsExposed: item.noSecretsExposed ?? true,
    noDivineCertaintyClaimed: item.noDivineCertaintyClaimed ?? true,
    generatedAt: item.generatedAt || new Date().toISOString()
  }));

  return {
    id: input.id || "post_launch_7_2_weekly_improvement_plan",
    label: input.label || "Post-Launch Operations 7.2 Weekly Improvement Plan",
    items: prioritizeWeeklyImprovements(items),
    manualOnly: true,
    inMemoryOnly: true
  };
}

export function prioritizeWeeklyImprovements(items: TeoyubeWeeklyImprovementItem[]): TeoyubeWeeklyImprovementItem[] {
  return [...items].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.title.localeCompare(b.title));
}

function unsafeImprovementText(item: TeoyubeWeeklyImprovementItem): string {
  return `${item.title} ${item.category} ${item.rationale} ${item.verificationRequired.join(" ")}`;
}

export function getWeeklyImprovementBlockers(items: TeoyubeWeeklyImprovementItem[]): TeoyubeSupportDeskBlocker[] {
  return items.flatMap((item) => {
    const blockers: TeoyubeSupportDeskBlocker[] = [];
    const unsafePattern = UNSAFE_IMPROVEMENT_PATTERNS.find((pattern) => pattern.test(unsafeImprovementText(item)));
    if (unsafePattern || !item.preservesScriptureAnchors || !item.preservesExplanationPaths || !item.preservesFallbackSafety || !item.preservesConsentControls || !item.noHiddenPersonalization || !item.noUnapprovedAnalytics || !item.noUnapprovedPersistence || !item.noLiveAiOrchestration || !item.noSecretsExposed || !item.noDivineCertaintyClaimed) {
      blockers.push({
        id: `${item.id}_unsafe_improvement`,
        label: item.title,
        category: item.category === "feedback_consent_clarity" ? "privacy_terms_consent" : "feedback",
        severity: "critical",
        reason: "Improvement item would weaken a required Scripture, explanation, fallback, consent, privacy, personalization, provider, secret, or divine-certainty guardrail.",
        requiredAction: "Rewrite or reject the improvement before weekly owner review."
      });
    }
    return blockers;
  });
}

export function getWeeklyImprovementWarnings(items: TeoyubeWeeklyImprovementItem[]): TeoyubeSupportDeskWarning[] {
  return items.flatMap((item) => {
    const warnings: TeoyubeSupportDeskWarning[] = [];
    if (item.verificationRequired.length === 0) warnings.push({ id: `${item.id}_missing_verification`, label: item.title, category: "feedback", severity: "medium", message: "Improvement item has no verification requirements.", recommendedAction: "Add owner review and regression verification before scheduling." });
    if (item.priority === "critical" || item.priority === "high") warnings.push({ id: `${item.id}_owner_review_required`, label: item.title, category: "feedback", severity: "high", message: "High-priority weekly improvement requires explicit owner review.", recommendedAction: "Review before implementation." });
    return warnings;
  });
}

export function createWeeklyImprovementDecision(items: TeoyubeWeeklyImprovementItem[]): TeoyubeWeeklyImprovementDecision {
  if (getWeeklyImprovementBlockers(items).length > 0) return "blocked";
  if (items.length === 0) return "defer";
  if (getWeeklyImprovementWarnings(items).length > 0) return "ready_with_warnings";
  return "ready_for_owner_review";
}

export function createWeeklyImprovementReport(items: TeoyubeWeeklyImprovementItem[] = []): TeoyubeWeeklyImprovementReport {
  const prioritizedItems = prioritizeWeeklyImprovements(items);
  const blockers = getWeeklyImprovementBlockers(prioritizedItems);
  const warnings = getWeeklyImprovementWarnings(prioritizedItems);
  const status: TeoyubeSupportDeskStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : prioritizedItems.length ? "ready" : "empty";
  return {
    status,
    ready: blockers.length === 0,
    decision: createWeeklyImprovementDecision(prioritizedItems),
    itemCount: prioritizedItems.length,
    prioritizedItems,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noExternalWrite: true,
    noAutomaticUserContact: true,
    noAutomaticFeedbackCollection: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    noLiveAiOrchestrationEnabled: true,
    generatedAt: new Date().toISOString()
  };
}
