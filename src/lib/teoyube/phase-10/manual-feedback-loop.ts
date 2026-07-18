import type {
  TeoyubeManualFeedbackLoopBlocker,
  TeoyubeManualFeedbackLoopCadence,
  TeoyubeManualFeedbackLoopCategory,
  TeoyubeManualFeedbackLoopDecision,
  TeoyubeManualFeedbackLoopItem,
  TeoyubeManualFeedbackLoopReport,
  TeoyubeManualFeedbackLoopReview,
  TeoyubeManualFeedbackLoopSource,
  TeoyubeManualFeedbackLoopStatus,
  TeoyubeManualFeedbackLoopWarning
} from "./manual-feedback-loop-contracts";
import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeManualFeedbackLoopInput = Partial<{
  items: TeoyubeManualFeedbackLoopItem[];
  feedbackSourceManual: boolean;
  noAutomaticFeedbackCollectionIntroduced: boolean;
  noSensitivePersonalDataStoredInCode: boolean;
  feedbackCategorized: boolean;
  repeatedIssuesFlagged: boolean;
  spiritualSafetyConcernsEscalated: boolean;
  routePageConcernsLinked: boolean;
  safeFixCandidatesPreserveBoundaries: boolean;
  futureEnhancementsSeparated: boolean;
  noVanityMetricsOrHiddenTracking: boolean;
}>;

export type TeoyubeManualFeedbackLoopItemInput = Partial<{
  id: string;
  source: TeoyubeManualFeedbackLoopSource;
  cadence: TeoyubeManualFeedbackLoopCadence;
  category: TeoyubeManualFeedbackLoopCategory;
  status: TeoyubeManualFeedbackLoopStatus;
  summary: string;
  affectedArea: string;
  issueSeverity: TeoyubeFirstDayIssueSeverity;
  repeatedIssue: boolean;
  containsSensitivePersonalData: boolean;
  spiritualSafetyConcern: boolean;
  notes: string[];
}>;

function checklistItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, details };
}

export function createManualFeedbackLoopChecklist(input: TeoyubeManualFeedbackLoopInput = {}) {
  return [
    checklistItem("manual_source", "Feedback source is manual", input.feedbackSourceManual === true, "Feedback remains manually reviewed and is not collected by code."),
    checklistItem("no_auto_collection", "No automatic feedback collection introduced", input.noAutomaticFeedbackCollectionIntroduced === true, "No feedback pipeline, webhook, telemetry, or form storage is added."),
    checklistItem("no_sensitive_storage", "No sensitive personal data stored in code", input.noSensitivePersonalDataStoredInCode === true, "Sensitive personal data must stay out of source files and fixtures."),
    checklistItem("categorized", "Feedback is categorized", input.feedbackCategorized === true, "Manual feedback should be categorized before issue pattern review."),
    checklistItem("repeated_flagged", "Repeated issues are flagged", input.repeatedIssuesFlagged === true, "Repeated manual reports should be grouped."),
    checklistItem("spiritual_escalation", "Spiritual safety concerns escalated", input.spiritualSafetyConcernsEscalated === true, "Spiritual safety feedback must receive owner review."),
    checklistItem("route_linked", "Route/page concerns linked to affected area", input.routePageConcernsLinked === true, "Affected route or surface should be recorded."),
    checklistItem("safe_fix_boundaries", "Safe-fix candidates preserve all boundaries", input.safeFixCandidatesPreserveBoundaries === true, "Safe fixes must preserve Scripture, explanation, fallback, confidence, privacy, and service-disabled state."),
    checklistItem("enhancements_separated", "Future enhancements separated from blockers", input.futureEnhancementsSeparated === true, "Enhancements should not be treated as release blockers."),
    checklistItem("no_vanity_tracking", "Expansion is not based on vanity metrics or hidden tracking", input.noVanityMetricsOrHiddenTracking === true, "Controlled expansion decisions must not require analytics or hidden tracking.")
  ];
}

export function createManualFeedbackLoopItem(input: TeoyubeManualFeedbackLoopItemInput = {}): TeoyubeManualFeedbackLoopItem {
  return {
    id: input.id || `manual_feedback_loop_${Date.now()}`,
    source: input.source || "unknown",
    cadence: input.cadence || "unknown",
    category: input.category || "unknown",
    status: input.status || "new",
    summary: input.summary || "Manual feedback loop item requires owner review.",
    affectedArea: input.affectedArea || "manual_owner_required",
    issueSeverity: input.issueSeverity,
    repeatedIssue: input.repeatedIssue ?? false,
    containsSensitivePersonalData: input.containsSensitivePersonalData ?? false,
    spiritualSafetyConcern: input.spiritualSafetyConcern ?? false,
    notes: input.notes || []
  };
}

export function reviewManualFeedbackLoopItem(input: TeoyubeManualFeedbackLoopItemInput = {}): TeoyubeManualFeedbackLoopReview {
  const feedback = createManualFeedbackLoopItem(input);
  let decision: TeoyubeManualFeedbackLoopDecision = "watch";
  if (feedback.containsSensitivePersonalData) decision = "triage_as_issue";
  if (feedback.spiritualSafetyConcern || feedback.category === "spiritual_safety") decision = "pause_release";
  if (feedback.issueSeverity === "severity_1_critical") decision = "rollback_required";
  if (feedback.issueSeverity === "severity_2_high" || feedback.issueSeverity === "severity_3_medium") decision = "safe_fix_candidate";
  if (feedback.category === "feature_request") decision = "defer_to_backlog";
  if (feedback.category === "encouragement") decision = "no_action";
  return {
    feedback: { ...feedback, status: "reviewing" },
    decision,
    rationale: decision === "rollback_required"
      ? "Critical first-week feedback requires rollback review."
      : decision === "pause_release"
        ? "Spiritual safety or high-risk feedback requires pausing promotion for review."
        : decision === "safe_fix_candidate"
          ? "Feedback can enter safe-fix batch review if safety boundaries remain intact."
          : decision === "defer_to_backlog"
            ? "Feedback is a future enhancement, not a release blocker."
            : "Feedback is logged for first-week watch.",
    safeFixCandidate: decision === "safe_fix_candidate",
    repeatedPatternCandidate: feedback.repeatedIssue
  };
}

export function recordManualFeedbackLoopReview(results: TeoyubeManualFeedbackLoopReview[], review: TeoyubeManualFeedbackLoopReview): TeoyubeManualFeedbackLoopReview[] {
  return [...results.filter((entry) => entry.feedback.id !== review.feedback.id), review];
}

export function getManualFeedbackLoopBlockers(input: TeoyubeManualFeedbackLoopInput = {}): TeoyubeManualFeedbackLoopBlocker[] {
  return (input.items || [])
    .filter((entry) => entry.issueSeverity === "severity_1_critical" || entry.containsSensitivePersonalData || entry.spiritualSafetyConcern)
    .map((entry) => ({ id: `${entry.id}_blocker`, feedbackId: entry.id, message: entry.summary }));
}

export function getManualFeedbackLoopWarnings(input: TeoyubeManualFeedbackLoopInput = {}): TeoyubeManualFeedbackLoopWarning[] {
  const warnings = createManualFeedbackLoopChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, feedbackId: "checklist", message: entry.details }));
  (input.items || [])
    .filter((entry) => entry.issueSeverity === "severity_2_high" || entry.issueSeverity === "severity_3_medium" || entry.repeatedIssue)
    .forEach((entry) => warnings.push({ id: `${entry.id}_warning`, feedbackId: entry.id, message: entry.summary }));
  return warnings;
}

export function createManualFeedbackLoopDecision(input: TeoyubeManualFeedbackLoopInput = {}): TeoyubeManualFeedbackLoopDecision {
  if (getManualFeedbackLoopBlockers(input).some((entry) => entry.message)) {
    return (input.items || []).some((entry) => entry.issueSeverity === "severity_1_critical") ? "rollback_required" : "pause_release";
  }
  if ((input.items || []).some((entry) => entry.issueSeverity === "severity_2_high" || entry.issueSeverity === "severity_3_medium")) return "safe_fix_candidate";
  if ((input.items || []).some((entry) => entry.repeatedIssue)) return "triage_as_issue";
  if ((input.items || []).some((entry) => entry.category === "feature_request")) return "defer_to_backlog";
  return (input.items || []).length ? "watch" : "unknown";
}

export function createManualFeedbackLoopReport(input: TeoyubeManualFeedbackLoopInput = {}): TeoyubeManualFeedbackLoopReport {
  const blockers = getManualFeedbackLoopBlockers(input);
  const items = input.items || [];
  return {
    valid: blockers.length === 0,
    checklist: createManualFeedbackLoopChecklist(input),
    reviews: items.map((entry) => reviewManualFeedbackLoopItem(entry)),
    blockers,
    warnings: getManualFeedbackLoopWarnings(input),
    decision: createManualFeedbackLoopDecision(input),
    noAutomaticFeedbackCollection: true,
    noSensitiveDataStoredInCode: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
