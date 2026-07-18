import type {
  TeoyubeWeeklyImprovementLoopArea,
  TeoyubeWeeklyImprovementLoopBlocker,
  TeoyubeWeeklyImprovementLoopCadence,
  TeoyubeWeeklyImprovementLoopDecision,
  TeoyubeWeeklyImprovementLoopItem,
  TeoyubeWeeklyImprovementLoopReport,
  TeoyubeWeeklyImprovementLoopReview,
  TeoyubeWeeklyImprovementLoopStatus,
  TeoyubeWeeklyImprovementLoopWarning
} from "./weekly-improvement-loop-contracts";
import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeWeeklyImprovementLoopInput = Partial<{
  items: TeoyubeWeeklyImprovementLoopItem[];
  reviewIsManual: boolean;
  noAutomaticFeedbackCollectionIntroduced: boolean;
  noSensitivePersonalDataStoredInCode: boolean;
  feedbackThemesCategorized: boolean;
  repeatedIssuesFlagged: boolean;
  knownIssuesUpdated: boolean;
  safeFixCandidatesPreserveBoundaries: boolean;
  futureEnhancementsSeparated: boolean;
  roadmapChangesDocumented: boolean;
  ownerDecisionRecorded: boolean;
}>;

export type TeoyubeWeeklyImprovementLoopItemInput = Partial<{
  id: string;
  cadence: TeoyubeWeeklyImprovementLoopCadence;
  area: TeoyubeWeeklyImprovementLoopArea;
  status: TeoyubeWeeklyImprovementLoopStatus;
  summary: string;
  issueSeverity: TeoyubeFirstDayIssueSeverity;
  repeatedIssue: boolean;
  affectsSafetyBoundary: boolean;
  roadmapChangeNeeded: boolean;
  notes: string[];
}>;

function checklistItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, details };
}

export function createWeeklyImprovementLoopChecklist(input: TeoyubeWeeklyImprovementLoopInput = {}) {
  return [
    checklistItem("manual_review", "Review is manual", input.reviewIsManual === true, "Weekly review must remain manual."),
    checklistItem("no_auto_collection", "No automatic feedback collection introduced", input.noAutomaticFeedbackCollectionIntroduced === true, "No automatic feedback pipeline is added."),
    checklistItem("no_sensitive_storage", "No sensitive personal data stored in code", input.noSensitivePersonalDataStoredInCode === true, "Sensitive personal data must not be stored in code."),
    checklistItem("categorized", "Feedback themes are categorized", input.feedbackThemesCategorized === true, "Feedback themes should be categorized."),
    checklistItem("repeated_flagged", "Repeated issues are flagged", input.repeatedIssuesFlagged === true, "Repeated issues should be flagged."),
    checklistItem("known_issues_updated", "Known issues are updated", input.knownIssuesUpdated === true, "Known issues should be updated."),
    checklistItem("safe_fix_boundaries", "Safe-fix candidates preserve boundaries", input.safeFixCandidatesPreserveBoundaries === true, "Safe fixes must preserve Scripture, explanation, fallback, confidence, privacy, known limitations, and service-disabled state."),
    checklistItem("enhancements_separated", "Future enhancements separated from blockers", input.futureEnhancementsSeparated === true, "Future enhancements should be separated from launch blockers."),
    checklistItem("roadmap_documented", "Roadmap changes documented", input.roadmapChangesDocumented === true, "Roadmap changes should be documented."),
    checklistItem("owner_decision", "Owner decision recorded", input.ownerDecisionRecorded === true, "Owner decision must be recorded.")
  ];
}

export function createWeeklyImprovementLoopItem(input: TeoyubeWeeklyImprovementLoopItemInput = {}): TeoyubeWeeklyImprovementLoopItem {
  return {
    id: input.id || `weekly_improvement_item_${Date.now()}`,
    cadence: input.cadence || "weekly",
    area: input.area || "unknown",
    status: input.status || "new",
    summary: input.summary || "Weekly improvement item requires owner review.",
    issueSeverity: input.issueSeverity,
    repeatedIssue: input.repeatedIssue ?? false,
    affectsSafetyBoundary: input.affectsSafetyBoundary ?? false,
    roadmapChangeNeeded: input.roadmapChangeNeeded ?? false,
    notes: input.notes || []
  };
}

export function reviewWeeklyImprovementLoopItem(input: TeoyubeWeeklyImprovementLoopItemInput = {}): TeoyubeWeeklyImprovementLoopReview {
  const item = createWeeklyImprovementLoopItem(input);
  let decision: TeoyubeWeeklyImprovementLoopDecision = "watch";
  if (item.issueSeverity === "severity_1_critical") decision = "rollback_required";
  else if (item.affectsSafetyBoundary || item.area === "spiritual_safety") decision = "pause_release";
  else if (item.issueSeverity === "severity_2_high" || item.issueSeverity === "severity_3_medium") decision = "safe_fix_candidate";
  else if (item.roadmapChangeNeeded) decision = "prioritize_next_cycle";
  else if (item.area === "roadmap" || item.area === "documentation") decision = "add_to_backlog";
  return {
    item: { ...item, status: "reviewing" },
    decision,
    rationale: decision === "rollback_required"
      ? "Critical weekly issue requires rollback review."
      : decision === "pause_release"
        ? "Safety-boundary issue requires pause review."
        : decision === "safe_fix_candidate"
          ? "Item can enter safe-fix review if boundaries remain intact."
          : decision === "prioritize_next_cycle"
            ? "Roadmap-impacting item should be prioritized for the next cycle."
            : "Item remains on weekly watch."
  };
}

export function recordWeeklyImprovementLoopReview(results: TeoyubeWeeklyImprovementLoopReview[], review: TeoyubeWeeklyImprovementLoopReview): TeoyubeWeeklyImprovementLoopReview[] {
  return [...results.filter((entry) => entry.item.id !== review.item.id), review];
}

export function getWeeklyImprovementLoopBlockers(input: TeoyubeWeeklyImprovementLoopInput = {}): TeoyubeWeeklyImprovementLoopBlocker[] {
  return (input.items || [])
    .filter((entry) => entry.issueSeverity === "severity_1_critical" || entry.affectsSafetyBoundary)
    .map((entry) => ({ id: `${entry.id}_blocker`, itemId: entry.id, message: entry.summary }));
}

export function getWeeklyImprovementLoopWarnings(input: TeoyubeWeeklyImprovementLoopInput = {}): TeoyubeWeeklyImprovementLoopWarning[] {
  const warnings = createWeeklyImprovementLoopChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, itemId: "checklist", message: entry.details }));
  (input.items || [])
    .filter((entry) => entry.repeatedIssue || entry.roadmapChangeNeeded)
    .forEach((entry) => warnings.push({ id: `${entry.id}_warning`, itemId: entry.id, message: entry.summary }));
  return warnings;
}

export function createWeeklyImprovementLoopDecision(input: TeoyubeWeeklyImprovementLoopInput = {}): TeoyubeWeeklyImprovementLoopDecision {
  if (getWeeklyImprovementLoopBlockers(input).length) {
    return (input.items || []).some((entry) => entry.issueSeverity === "severity_1_critical") ? "rollback_required" : "pause_release";
  }
  if ((input.items || []).some((entry) => entry.issueSeverity === "severity_2_high" || entry.issueSeverity === "severity_3_medium")) return "safe_fix_candidate";
  if ((input.items || []).some((entry) => entry.roadmapChangeNeeded)) return "prioritize_next_cycle";
  return (input.items || []).length ? "watch" : "unknown";
}

export function createWeeklyImprovementLoopReport(input: TeoyubeWeeklyImprovementLoopInput = {}): TeoyubeWeeklyImprovementLoopReport {
  const blockers = getWeeklyImprovementLoopBlockers(input);
  const items = input.items || [];
  return {
    valid: blockers.length === 0,
    checklist: createWeeklyImprovementLoopChecklist(input),
    reviews: items.map((entry) => reviewWeeklyImprovementLoopItem(entry)),
    blockers,
    warnings: getWeeklyImprovementLoopWarnings(input),
    decision: createWeeklyImprovementLoopDecision(input),
    noAutomaticFeedbackCollection: true,
    noSensitiveDataStoredInCode: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
